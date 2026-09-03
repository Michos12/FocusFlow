import { Request, Response } from "express";
import * as userService from "../services/userService.js";
import { hashPassword } from "../services/authService.js";
import { AuthRequest } from "../interface/authRequest.js";

export async function registerUser (req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
     return res.status(400).json({ message: "Missing fields" });
    }
    // The column is VARCHAR(255); without this the insert fails as a 500.
    if (typeof email !== "string" || email.length > 255) {
      return res.status(400).json({ message: "Email must be 255 characters or fewer" });
    }
    const existingUser = await userService.findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userId = await userService.createUser(email, await hashPassword(password));

    res.status(201).json({ id: userId, email });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/auth/me
export async function getMe (req: AuthRequest, res: Response) {
  try {
    const user = await userService.findUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/auth/me - a user can only delete their own account.
export async function deleteMe (req: AuthRequest, res: Response) {
  try {
    await userService.deleteUser(req.user!.userId);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteMe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PATCH /api/auth/me - a user can only update their own account.
export async function updateMe (req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    await userService.updateUser(userId, email, await hashPassword(password));
    res.status(200).json({ id: userId, email });
  } catch (error) {
    console.error("Error in updateMe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function loginUser (req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }
  try {
    const user = await userService.loginUser(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.header("authorization", `Bearer ${user.token}`).status(200).json({
       message: "Login successful",
       token: user.token,
       email: user.email});
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
