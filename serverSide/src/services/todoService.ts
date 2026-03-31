import { ResultSetHeader } from "mysql2";
import { pool } from "../database/pool.js";
import { Todo } from "../interface/toDoInterface.js";

export async function getTodosByUser( userId: number): Promise<Todo[] | false>{
  const [rows] = await pool.execute<Todo[]>(
    "SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};

export async function getAllTodos(): Promise<Todo[]> {
  const [rows] = await pool.execute<Todo[]>(
    "SELECT * FROM todos ORDER BY created_at DESC"
  );
  return rows;
};

export async function createTodo( title: string, userId: number): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO todos (title, user_id) VALUES (?, ?)",
    [title, userId]
  );
  return result.insertId;
};

export async function updateTodoStatus( todoId: number, completed: boolean): Promise<void> {
  await pool.execute(
    "UPDATE todos SET completed = ? WHERE id = ?",
    [completed, todoId]
  );
};

export async function changeDescription( todoId: number, description: string): Promise<void> {
  await pool.execute(
    "UPDATE todos SET description = ? WHERE id = ?",
    [description, todoId]
  );
};

export async function deleteTodo (todoId: number): Promise<void> {
  await pool.execute(
    "DELETE FROM todos WHERE id = ?",
    [todoId]
  );
};
