import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

// Configures the PostgreSQL connection pool used by the application.
// Configura el pool de conexión a PostgreSQL usado por la aplicación.
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  connectionTimeoutMillis: 5000
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error.message);
});

export async function testDatabaseConnection() {
  const result = await pool.query("SELECT NOW() AS current_time");
  console.log("PostgreSQL connected:", result.rows[0].current_time);
}

export async function ensureDefaultAdminUser() {
  const email = String(process.env.ADMIN_EMAIL || "admin@mentor.test").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "123456";
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
      INSERT INTO users (
        clan_id,
        first_name,
        last_name,
        email,
        password_hash,
        role,
        biography
      )
      VALUES (
        NULL,
        'System',
        'Administrator',
        $1,
        $2,
        'ADMIN',
        'Administrator account for reviewing users and mentorship requests.'
      )
      ON CONFLICT (email) DO UPDATE
      SET
        role = 'ADMIN',
        clan_id = NULL,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        password_hash = EXCLUDED.password_hash,
        biography = EXCLUDED.biography,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, role;
    `,
    [email, passwordHash]
  );

  const adminUser = result.rows[0];
  console.log("Admin user ensured:", adminUser?.email, adminUser?.role);
}
