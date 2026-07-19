import "dotenv/config";
import { app } from "./app.js";
import { testDatabaseConnection } from "./db.js";

const port = Number(process.env.API_PORT || 3000);

// Starts the API server after validating the database connection.
// Inicia el servidor API después de validar la conexión a la base de datos.
async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(port, "0.0.0.0", () => {
      console.log(`API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("The server could not start:", error.message);
    process.exit(1);
  }
}

startServer();
