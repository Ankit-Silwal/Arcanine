import pool from "../../../config/db.js";
import { signAccessToken,signRefreshToken } from "../../../utils/jwt.js";
export async function githubSignUpStrategy(code: string)
{
  if (!code)
  {
    throw new Error("GitHub code required");
  }
  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    }
  );
  const tokenData = await tokenRes.json();
  const accessTokenGithub = tokenData.access_token;

  if (!accessTokenGithub)
  {
    throw new Error("Failed to get GitHub access token");
  }
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessTokenGithub}`
    }
  });
  const userData = await userRes.json();
  const githubId = userData.id?.toString();

  if (!githubId)
  {
    throw new Error("Invalid GitHub user");
  }

  let email = userData.email;

  if (!email)
  {
    const emailRes = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessTokenGithub}`
        }
      }
    );

    const emails = await emailRes.json();

    const primary = emails.find(
      (e: any) => e.primary && e.verified
    );

    email = primary?.email;
  }

  if (!email)
  {
    throw new Error("No email from GitHub");
  }
  let dbUserRes = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  let user = dbUserRes.rows[0];
  if (!user)
  {
    const newUser = await pool.query(
      `INSERT INTO users (email, email_verified)
       VALUES ($1, true)
       RETURNING *`,
      [email]
    );

    user = newUser.rows[0];
  }
  const accRes = await pool.query(
    `SELECT * FROM accounts
     WHERE provider = 'github'
     AND provider_account_id = $1`,
    [githubId]
  );
  let account = accRes.rows[0];
  if (!account)
  {
    await pool.query(
      `INSERT INTO accounts (user_id, provider, provider_account_id)
       VALUES ($1, 'github', $2)`,
      [user.id, githubId]
    );
  }
  const payload = {
    userId: user.id,
    token_version: user.token_version
  };

  return {
    success: true,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}