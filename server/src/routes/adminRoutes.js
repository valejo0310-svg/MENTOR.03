import { Router } from "express";

import {
  getAdminOverview
} from "../controllers/adminController.js";

import {
  authenticate,
  requireRole
} from "../middleware/authMiddleware.js";

// Administrative routes are protected
// by authentication and the ADMIN role.
export const adminRouter = Router();

adminRouter.get(
  "/overview",
  authenticate,
  requireRole("ADMIN"),
  getAdminOverview
);