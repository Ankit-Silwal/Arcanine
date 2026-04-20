import pool from "../../config/db.js";

type CreateAccountInput = {
  userId: string;
  provider: string;
  passwordHash?: string;
  providerAccountId?: string;
};
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


export async function createAccount(data: CreateAccountInput)
{
  await pool.query(
    `
    INSERT INTO accounts (user_id, provider, password_hash, provider_account_id)
    VALUES ($1, $2, $3, $4)
    `,
    [
      data.userId,
      data.provider,
      data.passwordHash || null,
      data.providerAccountId || null
    ]
  );
}