import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { pool } from "./database/pool.js";
import { CORS_ORIGINS } from "./config/env.js";
import todoRouter from "./routes/toDoRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true, // required for the auth cookie to cross origins
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// 60 requests per minute per IP across the whole API.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many requests, please try again in a minute" },
  })
);

// Rutes
app.use("/api/todos", todoRouter);
app.use("/api/auth", userRouter);

// Health check
app.get("/", (_req, res) => {
  res.send("🚀 API is running");
});

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Without this, Express renders its default HTML error page, which includes the
// stack trace and absolute file paths of the machine running the server.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = (error as { status?: number; statusCode?: number })?.status
    ?? (error as { statusCode?: number })?.statusCode
    ?? 500;

  console.error("Unhandled error:", error);

  if (error instanceof SyntaxError && status === 400) {
    return res.status(400).json({ message: "Malformed JSON body" });
  }

  if (status === 413) {
    return res.status(413).json({ message: "Request body too large" });
  }

  const safeStatus = status >= 400 && status < 600 ? status : 500;
  res.status(safeStatus).json({
    message: safeStatus === 500 ? "Internal server error" : "Request could not be processed",
  });
});

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected");
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error);
    process.exit(1);
  }
};

startServer();
