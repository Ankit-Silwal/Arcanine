import { findUserByEmail } from "../auth.repository.js";
import pool from "../../../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { emailQueue } from "../../../config/queue.js";
import { isStrongPassword } from "../../../utils/strongPassword.js";

export async function emailSignUpStrategy(email: string, password: string)
{
  if (!email || !password)
  {
    return {
      success: false,
      message: "Please provide both email and password"
    };
  }

  if (!isStrongPassword(password))
  {
    return {
      success: false,
      message: "Weak password"
    };
  }

  const client = await pool.connect();

  try
  {
    await client.query("BEGIN");

    const existingUser = await findUserByEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    if (existingUser)
    {
      const accountCheck = await client.query(
        `
        SELECT id FROM accounts
        WHERE user_id = $1 AND provider = $2
        `,
        [existingUser.id, "email"]
      );

      if (accountCheck.rows.length > 0)
      {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: "Email login already exists"
        };
      }

      await client.query(
        `
        INSERT INTO email_verifications (user_id, token, expires_at, password_hash)
        VALUES ($1, $2, $3, $4)
        `,
        [existingUser.id, token, expiresAt, hashedPassword]
      
      );
      await client.query("COMMIT");
      await emailQueue.add("send-verification",{
        email,
        token
      })
      return {
        success: true,
        message: "Verification required to link account",
        token
      };
    }
    const userRes = await client.query(
      `
      INSERT INTO users (email, email_verified)
      VALUES ($1, $2)
      RETURNING id
      `,
      [email, false]
    );

    const userId = userRes.rows[0].id;
    await client.query(
      `
      INSERT INTO email_verifications (user_id, token, expires_at, password_hash)
      VALUES ($1, $2, $3, $4)
      `,
      [userId, token, expiresAt, hashedPassword]
      
    );
    await client.query("COMMIT");
     await emailQueue.add("send-verification",{
      email,
      token
    })
    return {
      success: true,
      message: "Verification email sent",
      token
    };
  }
  catch
  {
    await client.query("ROLLBACK");

    return {
      success: false,
      message: "Something went wrong"
    };
  }
  finally
  {
    client.release();
  }
}
