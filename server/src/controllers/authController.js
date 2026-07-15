import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

// Normalizes and validates common auth-related data before processing requests.
// Normaliza y valida datos comunes de autenticación antes de procesar las peticiones.
function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000
  };
}

function publicUser(user) {
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

export async function register(request, response) {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    clanId
  } = request.body;

  const normalizedRole = String(role || "").toUpperCase();
  const normalizedEmail = normalizeEmail(email);

  if (!firstName || !lastName || !normalizedEmail || !password || !normalizedRole) {
    return response.status(400).json({
      success: false,
      message: "Complete all required fields."
    });
  }

  if (!["CODER", "MENTOR"].includes(normalizedRole)) {
    return response.status(400).json({
      success: false,
      message: "The selected role is invalid."
    });
  }

  if (password.length < 6) {
    return response.status(400).json({
      success: false,
      message: "The password must contain at least 6 characters."
    });
  }

  if (normalizedRole === "CODER" && !clanId) {
    return response.status(400).json({
      success: false,
      message: "A Coder must select a clan."
    });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rowCount > 0) {
      return response.status(409).json({
        success: false,
        message: "An account with that email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
        INSERT INTO users (
          clan_id,
          first_name,
          last_name,
          email,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, clan_id, first_name, last_name, email, role, biography
      `,
      [
        normalizedRole === "CODER" ? Number(clanId) : null,
        firstName.trim(),
        lastName.trim(),
        normalizedEmail,
        passwordHash,
        normalizedRole
      ]
    );

    const user = result.rows[0];
    const token = createToken(user);
    const cookieName = process.env.COOKIE_NAME || "mentor_session";

    response.cookie(cookieName, token, cookieOptions());

    return response.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: publicUser(user)
    });
  } catch (error) {
    console.error("Register error:", error);

    return response.status(500).json({
      success: false,
      message: "The account could not be created."
    });
  }
}

export async function login(request, response) {
  const { email, password } = request.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return response.status(400).json({
      success: false,
      message: "Email and password are required."
    });
  }

  try {
    const result = await pool.query(
      `
        SELECT
          users.*,
          clans.name AS clan_name
        FROM users
        LEFT JOIN clans ON clans.id = users.clan_id
        WHERE users.email = $1
      `,
      [normalizedEmail]
    );

    if (result.rowCount === 0) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = createToken(user);
    const cookieName = process.env.COOKIE_NAME || "mentor_session";

    response.cookie(cookieName, token, cookieOptions());

    return response.json({
      success: true,
      message: "Login successful.",
      data: publicUser(user)
    });
  } catch (error) {
    console.error("Login error:", error);

    return response.status(500).json({
      success: false,
      message: "Login could not be completed."
    });
  }
}

export function logout(_request, response) {
  const cookieName = process.env.COOKIE_NAME || "mentor_session";

  response.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response.json({
    success: true,
    message: "Session closed."
  });
}

export async function getCurrentUser(request, response) {
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

    if (result.rowCount === 0) {
      return response.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    return response.json({
      success: true,
      data: publicUser(result.rows[0])
    });
  } catch (error) {
    console.error("Current user error:", error);

    return response.status(500).json({
      success: false,
      message: "The session could not be consulted."
    });
  }
}
