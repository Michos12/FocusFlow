import express from "express";
import { registerUser, loginUser, getMe, updateMe, deleteMe } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Public
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Everything below requires a valid token and only ever acts on that user.
userRouter.use(authenticate);

userRouter.get("/me", getMe);
userRouter.patch("/me", updateMe);
userRouter.delete("/me", deleteMe);

export default userRouter;
