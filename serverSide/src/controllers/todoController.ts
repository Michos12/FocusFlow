import { Response } from "express";
import * as todoService from "../services/todoService.js";
import { AuthRequest } from "../interface/authRequest.js";

// Every route below is mounted behind `authenticate`, so req.user is always set.
function requireUserId(req: AuthRequest): number {
  return req.user!.userId;
}

// GET /api/todos
export async function getAllTodos (req: AuthRequest, res: Response) {
  try {
    const todos = await todoService.getTodosByUser(requireUserId(req));

    // MySQL returns TINYINT(1) as 0/1; the API contract says boolean.
    res.json(todos.map((todo) => ({ ...todo, completed: Boolean(todo.completed) })));
  } catch (error) {
    console.error("Error in getAllTodos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/todos
export async function createTodo (req: AuthRequest, res: Response) {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const description = typeof req.body?.description === "string" ? req.body.description : "";

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // The column is VARCHAR(255); without this the insert fails as a 500.
    if (title.length > 255) {
      return res.status(400).json({ message: "Title must be 255 characters or fewer" });
    }

    const insertId = await todoService.createTodo(title, description, requireUserId(req));

    res.status(201).json({ id: insertId, title });
  } catch (error) {
    console.error("Error in createTodo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/todos/:id/status
export async function updateStatus (req: AuthRequest, res: Response){
  try {
    const todoId = Number(req.params.id);
    const { completed } = req.body ?? {};

    if (!Number.isInteger(todoId) || typeof completed !== "boolean") {
      return res.status(400).json({ message: "Invalid id or completed flag" });
    }

    const updated = await todoService.updateTodoStatus(todoId, completed, requireUserId(req));

    if (!updated) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error in updateStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/todos/:id
export async function deleteTodo (req: AuthRequest, res: Response) {
  try {
    const todoId = Number(req.params.id);

    if (!Number.isInteger(todoId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await todoService.deleteTodo(todoId, requireUserId(req));

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error in deleteTodo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/todos/:id/description
export async function changeDescription (req: AuthRequest, res: Response) {
  try {
    const todoId = Number(req.params.id);
    const { description } = req.body ?? {};

    if (!Number.isInteger(todoId) || typeof description !== "string") {
      return res.status(400).json({ message: "Invalid id or description" });
    }

    const updated = await todoService.changeDescription(todoId, description, requireUserId(req));

    if (!updated) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error updating description:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
