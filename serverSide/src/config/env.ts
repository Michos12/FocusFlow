import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error(
    "JWT_SECRET is not defined. Copy .env.example to .env and set a strong value."
  );
}

export const JWT_SECRET: string = secret;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
