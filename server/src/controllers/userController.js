import { pool } from "../db.js";

// Maps database rows into the response shape used by the frontend.
// Convierte filas de base de datos al formato de respuesta usado por el frontend.
function mapUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    clanId: user.clan_id,
    clanName: user.clan_name || null,
    biography: user.biography || ""
  };
}

export async function getClans(_request, response) {
  try {
    const result = await pool.query(
      "SELECT id, name FROM clans ORDER BY name"
    );

    return response.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Clans error:", error);

    return response.status(500).json({
      success: false,
      message: "The clans could not be loaded."
    });
  }
}

export async function getProfile(request, response) {
  try {
    const result = await pool.query(
      `
        SELECT
          users.id,
          users.clan_id,
          users.first_name,
          users.last_name,
          users.email,
          users.role,
          users.biography,
          clans.name AS clan_name
        FROM users
        LEFT JOIN clans ON clans.id = users.clan_id
        WHERE users.id = $1
      `,
      [request.user.id]
    );

    return response.json({
      success: true,
      data: mapUser(result.rows[0])
    });
  } catch (error) {
    console.error("Profile error:", error);

    return response.status(500).json({
      success: false,
      message: "The profile could not be loaded."
    });
  }
}

export async function updateProfile(request, response) {
  const { firstName, lastName, biography, clanId } = request.body;

  if (!firstName || !lastName) {
    return response.status(400).json({
      success: false,
      message: "First name and last name are required."
    });
  }

  if (request.user.role === "CODER" && !clanId) {
    return response.status(400).json({
      success: false,
      message: "A Coder must belong to a clan."
    });
  }

  try {
    const result = await pool.query(
      `
        UPDATE users
        SET
          first_name = $1,
          last_name = $2,
          biography = $3,
          clan_id = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, clan_id, first_name, last_name, email, role, biography
      `,
      [
        firstName.trim(),
        lastName.trim(),
        String(biography || "").trim(),
        request.user.role === "CODER" ? Number(clanId) : null,
        request.user.id
      ]
    );

    return response.json({
      success: true,
      message: "Profile updated successfully.",
      data: mapUser(result.rows[0])
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return response.status(500).json({
      success: false,
      message: "The profile could not be updated."
    });
  }
}

export async function getMyGoals(request, response, next) {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          title,
          description,
          due_date,
          completed,
          created_at,
          updated_at
        FROM personal_goals
        WHERE user_id = $1
        ORDER BY completed ASC, due_date ASC, id DESC
      `,
      [request.user.id]
    );

    response.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
}

export async function createGoal(request, response, next) {
  try {
    const title = request.body.title?.trim();
    const description = request.body.description?.trim() || "";
    const dueDate = request.body.dueDate;

    if (!title || !dueDate) {
      return response.status(400).json({
        success: false,
        message: "El título y la fecha son obligatorios."
      });
    }

    if (title.length > 150) {
      return response.status(400).json({
        success: false,
        message: "El título no puede superar 150 caracteres."
      });
    }

    const validDate =
      /^\d{4}-\d{2}-\d{2}$/.test(dueDate) &&
      !Number.isNaN(Date.parse(`${dueDate}T00:00:00Z`));

    if (!validDate) {
      return response.status(400).json({
        success: false,
        message: "La fecha no es válida."
      });
    }

    const result = await pool.query(
      `
        INSERT INTO personal_goals (
          user_id,
          title,
          description,
          due_date
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          title,
          description,
          due_date,
          completed,
          created_at,
          updated_at
      `,
      [
        request.user.id,
        title,
        description,
        dueDate
      ]
    );

    response.status(201).json({
      success: true,
      message: "Meta creada correctamente.",
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

export async function updateGoal(request, response, next) {
  try {
    const goalId = Number(request.params.id);

    if (!Number.isInteger(goalId)) {
      return response.status(400).json({
        success: false,
        message: "El identificador de la meta no es válido."
      });
    }

    const { title, description, dueDate, completed } = request.body;

    const normalizedTitle =
      typeof title === "string"
        ? title.trim()
        : null;

    const normalizedDescription =
      typeof description === "string"
        ? description.trim()
        : null;

    const normalizedDate =
      typeof dueDate === "string"
        ? dueDate
        : null;

    const normalizedCompleted =
      typeof completed === "boolean"
        ? completed
        : null;

    if (normalizedTitle === "") {
      return response.status(400).json({
        success: false,
        message: "El título no puede estar vacío."
      });
    }

    const result = await pool.query(
      `
        UPDATE personal_goals
        SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          due_date = COALESCE($3, due_date),
          completed = COALESCE($4, completed),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
          AND user_id = $6
        RETURNING
          id,
          title,
          description,
          due_date,
          completed,
          created_at,
          updated_at
      `,
      [
        normalizedTitle,
        normalizedDescription,
        normalizedDate,
        normalizedCompleted,
        goalId,
        request.user.id
      ]
    );

    if (result.rowCount === 0) {
      return response.status(404).json({
        success: false,
        message: "La meta no existe o no pertenece al usuario."
      });
    }

    response.json({
      success: true,
      message: "Meta actualizada correctamente.",
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}
export async function deleteGoal(request, response, next) {
  try {
    const goalId = Number(request.params.id);

    if (!Number.isInteger(goalId)) {
      return response.status(400).json({
        success: false,
        message: "El identificador de la meta no es válido."
      });
    }

    const result = await pool.query(
      `
        DELETE FROM personal_goals
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [
        goalId,
        request.user.id
      ]
    );

    if (result.rowCount === 0) {
      return response.status(404).json({
        success: false,
        message: "La meta no existe o no pertenece al usuario."
      });
    }

    response.json({
      success: true,
      message: "Meta eliminada correctamente."
    });
  } catch (error) {
    next(error);
  }
}