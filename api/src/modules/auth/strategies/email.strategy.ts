import type { SignupStrategy } from "./signUpStrategy.js";
import type { SignUpBody } from "../auth.controller.js";
import pool from "../../../config/db.js";
import bcrypt from "bcrypt";
import { PG_ERRORS } from "../../../constants/dbError.js";
import crypto from "crypto";

export class EmailSignupStrategy implements SignupStrategy {
  async signup(body: SignUpBody): Promise<void> {
    if (!body.email || !body.password) {
      throw new Error("Email and password are required");
    }
    const email = body.email.toLowerCase().trim();
    const password = body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userResult = await client.query(
        `INSERT INTO users (email) VALUES ($1) RETURNING id`,
        [email]
      );
      const userId = userResult.rows[0].id;
      await client.query(
        `INSERT INTO accounts (user_id, provider, password_hash) VALUES ($1, 'email', $2)`,
        [userId, hashedPassword]
      );
      await client.query(
        `INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)`,
        [userId, token, expires_at]
      );

      await client.query("COMMIT");
      console.log("Email signup successful");
      // later gonna use bullMQ for this
      console.log(
        `Verify here: http://localhost:3000/verify?token=${token}`
      );

    } catch (err: any) {
      await client.query("ROLLBACK");
      if (err.code === PG_ERRORS.UNIQUE_VIOLATION) {
        throw new Error("User already exists");
      }

      throw err;
    } finally {
      client.release();
    }
  }
}