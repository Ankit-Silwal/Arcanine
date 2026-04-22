import pool from "../../config/db.js";

type AddUserInput = {
  email: string;
  email_verified: boolean;
  token_version?: number;
};
export async function addUser(input: AddUserInput)
{
  const { email, email_verified, token_version = 0 } = input;
  const result = await pool.query(
    `
    INSERT INTO users (email, email_verified, token_version)
    VALUES ($1, $2, $3)
    RETURNING id, email, email_verified, token_version, created_at
    `,
    [email, email_verified, token_version]
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string)
{
  const result = await pool.query(
    `
    SELECT id, email, email_verified, token_version, created_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: string)
{
  const result = await pool.query(
    `
    SELECT id, email, email_verified, token_version, created_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}