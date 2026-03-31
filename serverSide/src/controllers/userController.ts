import { Request, Response } from "express";
import * as userService from "../services/userService.js";
import { hashPassword } from "../services/authService.js";

export async function getAllUsers (req: Request, res: Response) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function registerUser (req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
     return res.status(400).json({ message: "Missing fields" });
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

export async function getUserById (req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function getUserByEmail (req: Request, res: Response) {
  try {
    const email = String(req.params.email);
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function deleteUser (req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    await userService.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUser (req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    await userService.updateUser(userId, email, await hashPassword(password));
    res.status(200).json({ id: userId, email });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
