import pool from "../../config/db.js";

export async function createUser(email: string)
{
  const res = await pool.query(
    "INSERT INTO users (email) VALUES ($1) RETURNING *",
    [email]
  );

  return res.rows[0];
}

export async function findUserByEmail(email: string)
{
  const res = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  return res.rows[0];
}