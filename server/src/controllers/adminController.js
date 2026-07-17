import { pool } from "../db.js";

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
      email: row.coder_email,
      clan: row.clan_name || "No clan"
    },

    mentor: row.mentor_id
      ? {
          id: row.mentor_id,
          name: `${row.mentor_first_name} ${row.mentor_last_name}`,
          email: row.mentor_email
        }
      : null
  };
}

function mapUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    biography: row.biography || "",
    clanId: row.clan_id,
    clanName: row.clan_name || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdRequests: [],
    assignedRequests: []
  };
}

export async function getAdminOverview(
  _request,
  response,
  next
) {
  try {
    const [
      usersResult,
      requestsResult
    ] = await Promise.all([
      pool.query(
        `
          SELECT
            users.id,
            users.clan_id,
            users.first_name,
            users.last_name,
            users.email,
            users.role,
            users.biography,
            users.created_at,
            users.updated_at,
            clans.name AS clan_name
          FROM users
          LEFT JOIN clans
            ON clans.id = users.clan_id
          ORDER BY
            CASE users.role
              WHEN 'ADMIN' THEN 0
              WHEN 'MENTOR' THEN 1
              ELSE 2
            END,
            users.first_name,
            users.last_name
        `
      ),

      pool.query(
        `
          SELECT
            mentorship_requests.*,

            coder.first_name
              AS coder_first_name,

            coder.last_name
              AS coder_last_name,

            coder.email
              AS coder_email,

            clans.name
              AS clan_name,

            mentor.first_name
              AS mentor_first_name,

            mentor.last_name
              AS mentor_last_name,

            mentor.email
              AS mentor_email

          FROM mentorship_requests

          INNER JOIN users AS coder
            ON coder.id =
              mentorship_requests.coder_id

          LEFT JOIN clans
            ON clans.id = coder.clan_id

          LEFT JOIN users AS mentor
            ON mentor.id =
              mentorship_requests.mentor_id

          ORDER BY
            mentorship_requests.created_at DESC
        `
      )
    ]);

    const requests =
      requestsResult.rows.map(mapRequest);

    const users =
      usersResult.rows.map(mapUser);

    const usersById = new Map(
      users.map((user) => [
        user.id,
        user
      ])
    );

    for (const mentorship of requests) {
      usersById
        .get(mentorship.coder.id)
        ?.createdRequests
        .push(mentorship);

      if (mentorship.mentor) {
        usersById
          .get(mentorship.mentor.id)
          ?.assignedRequests
          .push(mentorship);
      }
    }

    const mentors = users
      .filter(
        (user) =>
          user.role === "MENTOR"
      )
      .map((mentor) => ({
        ...mentor,
        assignedRequestCount:
          mentor.assignedRequests.length
      }));

    const statusTotals =
      requests.reduce(
        (totals, mentorship) => {
          totals[mentorship.status] =
            (
              totals[mentorship.status]
              || 0
            ) + 1;

          return totals;
        },
        {}
      );

    return response.json({
      success: true,

      data: {
        summary: {
          totalUsers:
            users.length,

          totalCoders:
            users.filter(
              (user) =>
                user.role === "CODER"
            ).length,

          totalMentors:
            mentors.length,

          totalAdmins:
            users.filter(
              (user) =>
                user.role === "ADMIN"
            ).length,

          totalRequests:
            requests.length,

          statusTotals
        },

        users,
        mentors,
        requests
      }
    });
  } catch (error) {
    next(error);
  }
}