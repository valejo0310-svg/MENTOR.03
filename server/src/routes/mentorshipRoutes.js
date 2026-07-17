import { Router } from "express";
import {
  createMentorship,
  deleteMentorship,
  listMentorships,
  updateMentorship
} from "../controllers/mentorshipController.js";import {authenticate,requireRole} from "../middleware/authMiddleware.js";

// Defines the mentorship request routes for coders and mentors.
// Define las rutas de solicitudes de mentoría para coders y mentors.
export const mentorshipRouter = Router();

mentorshipRouter.get("/", authenticate, listMentorships);
mentorshipRouter.post(
  "/",
  authenticate,
  requireRole("CODER"),
  createMentorship
);
mentorshipRouter.patch("/:id", authenticate, updateMentorship);
mentorshipRouter.delete(
  "/:id",
  authenticate,
  requireRole("CODER"),
  deleteMentorship
);
