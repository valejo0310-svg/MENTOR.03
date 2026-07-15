import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pool } from "./db.js";
import { authRouter } from "./routes/authRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { mentorshipRouter } from "./routes/mentorshipRoutes.js";

// Creates the Express application and registers the main API routes.
// Crea la aplicación Express y registra las rutas principales de la API.
export const app = express();

// Enables CORS for the frontend origin and accepts cookies in browser requests.
// Habilita CORS para el origen del frontend y acepta cookies en las peticiones del navegador.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", async (_request, response) => {
  const result = await pool.query("SELECT NOW() AS database_time");

  response.json({
    success: true,
    message: "MENTOR API is working.",
    databaseTime: result.rows[0].database_time
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/mentorships", mentorshipRouter);

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: "Route not found."
  });
});

app.use((error, _request, response, _next) => {
  console.error("Unhandled error:", error);

  response.status(500).json({
    success: false,
    message: "Unexpected server error."
  });
});
