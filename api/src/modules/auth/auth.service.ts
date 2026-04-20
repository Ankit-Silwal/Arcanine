import type { SignUpBody } from "./auth.controller.js";
import pool from "../../config/db.js";

export async function  signup(body:SignUpBody) {
  let email:string|undefined;
  if(body.provider=="email"){
    

  }
  else if(body.provider==="google"||body.provider==="github"){
    if(!body.oauthToken){
      return new Error("Invalid oauth token sir")
    }
  }
}


export async function verifyUser(token: string) {
  if (!token) {
    throw new Error("Token is required");
  }
  const result = await pool.query(
    `SELECT * FROM email_verifications 
     WHERE token = $1 
     AND expires_at > NOW()`,
    [token]
  );
  if (result.rows.length === 0) {
    throw new Error("Invalid or expired token");
  }
  const { user_id } = result.rows[0];
  await pool.query(
    `UPDATE users 
     SET email_verified = true
     WHERE id = $1`,
    [user_id]
  );
  await pool.query(
    `DELETE FROM email_verifications
     WHERE token = $1`,
    [token]
  );
  return { message: "User verified successfully" };
}