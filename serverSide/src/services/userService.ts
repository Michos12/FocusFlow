import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../database/pool.js"
import { User } from "../interface/userInterface.js";
import { generateToken, comparePassword } from "./authService.js";

export async function createUser ( email: string, hashedPassword: string): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashedPassword]
  );
  return result.insertId;
};

export async function findUserByEmail ( email: string): Promise<User | null> {
  const [rows] = await pool.execute<User[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows.length ? rows[0] : null;
};

export async function findUserById ( id: number): Promise<User | null> {
  const [rows] = await pool.execute<User[]>(
    "SELECT id, email, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows.length ? rows[0] : null;
};

export async function getAllUsers (): Promise<User[]> {
  const [rows] = await pool.execute<User[]>(
    "SELECT id, email, created_at FROM users ORDER BY created_at DESC"
  );
  return rows;
}

export async function deleteUser ( id: number): Promise<void> {
  await pool.execute(
    "DELETE FROM users WHERE id = ?",
    [id]
  );
}

export async function updateUser( id: number, email: string, password: string): Promise<void> {
  await pool.execute(
    "UPDATE users SET email = ?, password = ? WHERE id = ?",
    [email, password, id]
  );
}

export async function loginUser ( email: string, password: string): Promise<User | null> {
  const [rows] = await pool.execute<User[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  
  if (!rows.length) {
    return null; 
  } 
  const user = rows[0];
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    return null; 
  }
  const token = await generateToken(user.id, user.email);
  return { ...user, token };
}