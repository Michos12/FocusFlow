import { ResultSetHeader } from "mysql2";
import { pool } from "../database/pool.js";
import { Todo } from "../interface/toDoInterface.js";

export async function getTodosByUser( userId: number): Promise<Todo[]>{
  const [rows] = await pool.execute<Todo[]>(
    "SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};

export async function createTodo( title: string, description: string, userId: number): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO todos (title, description, user_id) VALUES (?, ?, ?)",
    [title, description, userId]
  );
  return result.insertId;
};

// The user_id clause is what keeps a user from touching someone else's todo.
export async function updateTodoStatus( todoId: number, completed: boolean, userId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?",
    [completed, todoId, userId]
  );
  return result.affectedRows > 0;
};

export async function changeDescription( todoId: number, description: string, userId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE todos SET description = ? WHERE id = ? AND user_id = ?",
    [description, todoId, userId]
  );
  return result.affectedRows > 0;
};

export async function deleteTodo (todoId: number, userId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM todos WHERE id = ? AND user_id = ?",
    [todoId, userId]
  );
  return result.affectedRows > 0;
};
