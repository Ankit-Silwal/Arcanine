import { OAuth2Client } from "google-auth-library";
import pool from "../../../config/db.js";
import { signAccessToken,signRefreshToken } from "../../../utils/jwt.js";
const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export async function googleSignUpStrategy(oauthToken:string) {
  if(!oauthToken){
    throw new Error("Please pass on the oauth token sir");
  }
  const ticket = await client.verifyIdToken({
    idToken: oauthToken,
    audience: process.env.GOOGLE_CLIENT_ID!
  });
  const payload=ticket.getPayload();
  if(!payload){
    throw new Error("Invalid google token")
  }
  const email = payload.email;
  const googleId = payload.sub;
  const emailVerified = payload.email_verified;
  if (!email || !googleId)
  {
    throw new Error("Invalid Google data");
  }
  let userRes = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  let user = userRes.rows[0];
  if (!user)
  {
    const newUser = await pool.query(
      `INSERT INTO users (email, email_verified)
       VALUES ($1, $2)
       RETURNING *`,
      [email, emailVerified]
    );

    user = newUser.rows[0];
  }

  const accRes = await pool.query(
    `SELECT * FROM accounts
     WHERE provider = 'google'
     AND provider_account_id = $1`,
    [googleId]
  );

  let account = accRes.rows[0];
  if (!account)
  {
    await pool.query(
      `INSERT INTO accounts (user_id, provider, provider_account_id)
       VALUES ($1, 'google', $2)`,
      [user.id, googleId]
    );
  }
  const payloadJwt = {
    userId: user.id,
    token_version: user.token_version
  };

  const accessToken = signAccessToken(payloadJwt);
  const refreshToken = signRefreshToken(payloadJwt);

  return {
    success: true,
    accessToken,
    refreshToken
  };
}