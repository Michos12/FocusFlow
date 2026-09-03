import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, logoutUser, getMe, updateMe, deleteMe } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Tighter than the global limit: these two endpoints are what a password
// guessing attack would hammer.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many attempts, please try again in a minute" },
});

// Public
userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/login", authLimiter, loginUser);
userRouter.post("/logout", logoutUser);

// Everything below requires a valid token and only ever acts on that user.
userRouter.use(authenticate);

userRouter.get("/me", getMe);
userRouter.patch("/me", updateMe);
userRouter.delete("/me", deleteMe);

export default userRouter;
