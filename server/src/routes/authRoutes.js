import { Router } from "express";
import {
  getCurrentUser,
  login,
  logout,
  register
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

// Defines the authentication routes exposed by the API.
// Define las rutas de autenticación expuestas por la API.
export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, getCurrentUser);
