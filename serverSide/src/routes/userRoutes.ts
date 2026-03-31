import express from "express";
import { registerUser, getAllUsers, deleteUser, getUserByEmail, getUserById, updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

// POST /api/auth/register
userRouter.post("/register", registerUser);

// GET /api/auth/users
userRouter.get("/users", getAllUsers);

// GET /api/auth/users/:id
userRouter.get("/users/:id", getUserById);

// GET /api/auth/users/:email
userRouter.get("/users/:email", getUserByEmail);

// DELETE /api/auth/users/:id
userRouter.delete("/users/:id", deleteUser);

// PATCH /api/auth/users/:id
userRouter.patch("/users/:id", updateUser);

export default userRouter;