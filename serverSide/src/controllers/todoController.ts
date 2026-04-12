import { Request, Response } from "express";
import * as todoService from "../services/todoService.js";

// GET /api/todos/:userId
export async function getTodos (req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);

    const todos = await todoService.getTodosByUser(userId);

    if (!todos) {
      return res.status(404).json({ message: "No todos found" });
    }

    res.json(todos);
  } catch (error) {
    console.error("Error in getTodos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/todos
export async function getAllTodos (req: Request, res: Response) {
  try {
      const todos = await todoService.getAllTodos();

    if (!todos) {
      return res.status(404).json({ message: "No todos found" });
    }

    res.json(todos);
  } catch (error) {
    console.error("Error in getTodos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/todos
export async function createTodo (req: Request, res: Response) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const userId = (req as any).user.userId;

    if (!title || !description || !userId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const insertId = await todoService.createTodo(title, description, userId);

    res.status(201).json({ id: insertId, title });
  } catch (error) {
    console.error("Error in createTodo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/todos/:id/status
export async function updateStatus (req: Request, res: Response){
  try {
    const todoId = Number(req.params.id);
    const { completed } = req.body;

    await todoService.updateTodoStatus(todoId, completed);

    res.sendStatus(204);
  } catch (error) {
    console.error("Error in updateStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/todos/:id
export async function deleteTodo (req: Request, res: Response) {
  try {
    const todoId = Number(req.params.id);

    await todoService.deleteTodo(todoId);

    res.sendStatus(204);
  } catch (error) {
    console.error("Error in deleteTodo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function changeDescription (req: Request, res: Response) {
  try {
    const todoId = Number(req.params.id);
    const { description } = req.body;
    const userId = (req as any).user.userId;

    if (!description) {
      return res.status(400).json({ message: "Description required" });
    }

    await todoService.changeDescription(todoId, description);

    res.sendStatus(204);
  } catch (error) {
    console.error("Error updating description:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};