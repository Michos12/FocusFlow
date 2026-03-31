import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./database/pool.js";
import todoRouter from "./routes/toDoRoutes.js";
import userRouter from "./routes/userRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Global Middlewares 
app.use(cors());
app.use(express.json());

// Rutes
app.use("/api/todos", todoRouter);
app.use("/api/auth", userRouter);

// Health check
app.get("/", (_req, res) => {
  res.send("🚀 API is running");
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
