import { Router } from "express";
import {
  getClans,
  getProfile,
  updateProfile
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getMyGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from "../controllers/userController.js";

export const userRouter = Router();

userRouter.get("/clans", getClans);
userRouter.get("/me", authenticate, getProfile);
userRouter.put("/me", authenticate, updateProfile);
userRouter.get("/me/goals", authenticate, getMyGoals);
userRouter.post("/me/goals", authenticate,createGoal);
userRouter.patch("/me/goals/:id",authenticate,updateGoal);
userRouter.delete("/me/goals/:id",authenticate,deleteGoal);