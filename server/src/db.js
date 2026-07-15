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
