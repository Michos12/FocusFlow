import { Request, Response } from "express";
import * as userService from "../services/userService.js";
import { hashPassword } from "../services/authService.js";
import { AuthRequest } from "../interface/authRequest.js";
import { COOKIE_MAX_AGE_MS, IS_PRODUCTION } from "../config/env.js";
import { validateEmail, validatePassword } from "../utils/validation.js";

// httpOnly keeps the token out of reach of page scripts, so an XSS cannot read
// the session. sameSite "lax" still covers localhost:5173 -> localhost:4000,
// which are different origins but the same site.
const AUTH_COOKIE = "token";
const cookieOptions = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax" as const,
  maxAge: COOKIE_MAX_AGE_MS,
  path: "/",
};

export async function registerUser (req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Hash before touching the database and let the UNIQUE constraint decide.
    // Checking first would answer faster for addresses that already exist,
    // which is an enumeration oracle of its own.
    const hashed = await hashPassword(password);

    try {
      const userId = await userService.createUser(email, hashed);
      return res.status(201).json({ id: userId, email });
    } catch (error) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
        // Deliberately does not confirm whether the address is registered.
        return res.status(400).json({
          message: "We could not create the account with those details",
        });
      }
      throw error;
    }
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
    res.clearCookie(AUTH_COOKIE, cookieOptions);
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

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    try {
      await userService.updateUser(userId, email, await hashPassword(password));
    } catch (error) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "We could not update the account with those details",
        });
      }
      throw error;
    }

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

    // The token goes in the cookie only; it is never handed to page scripts.
    res.cookie(AUTH_COOKIE, user.token, cookieOptions);
    res.status(200).json({ message: "Login successful", email: user.email });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function logoutUser (_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.status(204).send();
};
