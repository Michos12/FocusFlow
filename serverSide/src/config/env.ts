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

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Which browser origins may call this API. Comma-separated, no wildcard: the
// auth cookie only travels on credentialed requests, and those require the
// server to name an exact origin.
const origins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (origins.length === 0) {
  throw new Error(
    "CORS_ORIGIN is not defined. Set it to your frontend origin, e.g. http://localhost:5173"
  );
}

export const CORS_ORIGINS: string[] = origins;

// How long the auth cookie lives. Kept in step with the token lifetime so the
// cookie does not outlive the credential it carries.
export const COOKIE_MAX_AGE_MS = 2 * 60 * 60 * 1000;
