import { pool } from "../db.js";

// Maps mentorship records into a frontend-friendly structure.
// Convierte los registros de mentoría a una estructura amigable para el frontend.
function mapRequest(row) {
  return {
    id: row.id,
    topic: row.topic,
    description: row.description,
    status: row.status,
    scheduledAt: row.scheduled_at,
    observations: row.observations || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    coder: {
      id: row.coder_id,
      name: `${row.coder_first_name} ${row.coder_last_name}`,
      clan: row.clan_name || "No clan"
    },
    mentor: row.mentor_id
      ? {
          id: row.mentor_id,
          name: `${row.mentor_first_name} ${row.mentor_last_name}`
        }
      : null
  };
}

const requestSelect = `
  SELECT
    mentorship_requests.*,
    coder.first_name AS coder_first_name,
    coder.last_name AS coder_last_name,
    clans.name AS clan_name,
    mentor.first_name AS mentor_first_name,
    mentor.last_name AS mentor_last_name
  FROM mentorship_requests
  JOIN users coder ON coder.id = mentorship_requests.coder_id
  LEFT JOIN clans ON clans.id = coder.clan_id
  LEFT JOIN users mentor ON mentor.id = mentorship_requests.mentor_id
`;

export async function listMentorships(request, response) {
  try {
    let result;

    if (request.user.role === "CODER") {
      result = await pool.query(
        `${requestSelect}
         WHERE mentorship_requests.coder_id = $1
         ORDER BY mentorship_requests.created_at DESC`,
        [request.user.id]
      );
    } else {
      result = await pool.query(
        `${requestSelect}
         WHERE mentorship_requests.status = 'PENDING'
            OR mentorship_requests.mentor_id = $1
         ORDER BY
           CASE WHEN mentorship_requests.status = 'PENDING' THEN 0 ELSE 1 END,
           mentorship_requests.created_at DESC`,
        [request.user.id]
      );
    }

    return response.json({
      success: true,
      data: result.rows.map(mapRequest)
    });
  } catch (error) {
    console.error("List mentorships error:", error);

    return response.status(500).json({
      success: false,
      message: "Mentorship requests could not be loaded."
    });
  }
}

export async function createMentorship(request, response) {
  const { topic, description } = request.body;

  if (!topic || !description) {
    return response.status(400).json({
      success: false,
      message: "Topic and description are required."
    });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO mentorship_requests (
          coder_id,
          topic,
          description
        )
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [request.user.id, topic.trim(), description.trim()]
    );

    return response.status(201).json({
      success: true,
      message: "Mentorship request created.",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({
        success: false,
        message: "You already have an active request for that topic."
      });
    }

    console.error("Create mentorship error:", error);

    return response.status(500).json({
      success: false,
      message: "The mentorship request could not be created."
    });
  }
}

export async function updateMentorship(request, response) {
  const requestId = Number(request.params.id);

  try {
    const currentResult = await pool.query(
      "SELECT * FROM mentorship_requests WHERE id = $1",
      [requestId]
    );

    if (currentResult.rowCount === 0) {
      return response.status(404).json({
        success: false,
        message: "Mentorship request not found."
      });
    }

    const current = currentResult.rows[0];

    if (request.user.role === "CODER") {
      if (current.coder_id !== request.user.id) {
        return response.status(403).json({
          success: false,
          message: "You can only edit your own requests."
        });
      }

      if (current.status !== "PENDING") {
        return response.status(409).json({
          success: false,
          message: "Only pending requests can be edited."
        });
      }

      const topic = String(request.body.topic || "").trim();
      const description = String(request.body.description || "").trim();

      if (!topic || !description) {
        return response.status(400).json({
          success: false,
          message: "Topic and description are required."
        });
      }

      await pool.query(
        `
          UPDATE mentorship_requests
          SET topic = $1,
              description = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `,
        [topic, description, requestId]
      );

      return response.json({
        success: true,
        message: "Request updated."
      });
    }

    const status = String(request.body.status || "").toUpperCase();
    const observations = String(request.body.observations || "").trim();
    const scheduledAt = request.body.scheduledAt || null;

    if (!["ACCEPTED", "REJECTED", "COMPLETED"].includes(status)) {
      return response.status(400).json({
        success: false,
        message: "The requested status is invalid."
      });
    }

    if (["ACCEPTED", "REJECTED"].includes(status) && current.status !== "PENDING") {
      return response.status(409).json({
        success: false,
        message: "That request is no longer pending."
      });
    }

    if (status === "ACCEPTED") {
      if (!scheduledAt) {
        return response.status(400).json({
          success: false,
          message: "Assign a date before accepting the mentorship."
        });
      }

      if (new Date(scheduledAt) <= new Date()) {
        return response.status(400).json({
          success: false,
          message: "The mentorship date must be in the future."
        });
      }
    }

    if (status === "COMPLETED") {
      if (current.status !== "ACCEPTED" || current.mentor_id !== request.user.id) {
        return response.status(403).json({
          success: false,
          message: "Only the assigned Mentor can complete this mentorship."
        });
      }
    }

    await pool.query(
      `
        UPDATE mentorship_requests
        SET
          mentor_id = COALESCE(mentor_id, $1),
          status = $2,
          scheduled_at = COALESCE($3, scheduled_at),
          observations = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `,
      [request.user.id, status, scheduledAt, observations, requestId]
    );

    return response.json({
      success: true,
      message: `Request changed to ${status}.`
    });
  } catch (error) {
    console.error("Update mentorship error:", error);

    return response.status(500).json({
      success: false,
      message: "The mentorship request could not be updated."
    });
  }
}

export async function deleteMentorship(request, response) {
  const requestId = Number(request.params.id);

  try {
    const result = await pool.query(
      `
        DELETE FROM mentorship_requests
        WHERE id = $1
          AND coder_id = $2
          AND status = 'PENDING'
        RETURNING id
      `,
      [requestId, request.user.id]
    );

    if (result.rowCount === 0) {
      return response.status(404).json({
        success: false,
        message: "The pending request was not found or cannot be deleted."
      });
    }

    return response.json({
      success: true,
      message: "Request deleted."
    });
  } catch (error) {
    console.error("Delete mentorship error:", error);

    return response.status(500).json({
      success: false,
      message: "The mentorship request could not be deleted."
    });
  }
}
