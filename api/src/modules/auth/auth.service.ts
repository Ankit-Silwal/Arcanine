import pool from "../../config/db.js";
import { signAccessToken, verifyRefreshToken } from "../../utils/jwt.js";
import type { changePasswordType, loginBody, signUpBody } from "../types/auth.types.js";
import type { JwtPayloadWithMeta } from "../types/jwt.types.js";
import { emailLoginStrategy, emailSignUpStrategy } from "./strategies/email.strategy.js";
import { githubSignUpStrategy } from "./strategies/github.strategy.js";
import { googleSignUpStrategy } from "./strategies/google.strategy.js";
import bcrypt from "bcrypt";
import { isStrongPassword } from "../../utils/strongPassword.js";
export async function signUpService(input:signUpBody) {
  if(input.provider==="email"){
    return await emailSignUpStrategy(input.email,input.password);
  }
  else if(input.provider==="google"){
    return await googleSignUpStrategy(input.oauthToken)
  }
  else if(input.provider==="github"){
    return await githubSignUpStrategy(input.oauthToken)
  }else{
    return ({
      success:false,
      message:"Pass the both provider and shit"
    })
  }
}


export async function loginService(input:loginBody) {
  if(!input.provider){
    return ({
      success:false,
      message:"Provide the required provider sir"
    })
  }
  if(input.provider==="email"){
    return await emailLoginStrategy(input.email,input.password);
  }
}

export async function refreshToken(refreshToken:string) {
  const decoded:JwtPayloadWithMeta=verifyRefreshToken(refreshToken);
  const userRes=await pool.query(`
    select id,token_version from users where id=$1
    `,[decoded.userId])
  const user=userRes.rows[0];
  if(!user){
    throw new Error("User wasn't found");
  }
  if(user.token_version!=decoded.token_version){
    throw new Error("Invalid refresh token")
  }
  const payload={
    userId:user.id,
    token_version:user.token_version
  }
  const newAccessToken=signAccessToken(payload);
  return {accessToken:newAccessToken}
}

export async function changePasswordService(
  userId: string,
  data: changePasswordType
)
{
  if (data.newPassword !== data.confirmPassword)
  {
    throw new Error("Passwords do not match");
  }

  if (!isStrongPassword(data.newPassword))
  {
    throw new Error("Weak password");
  }

  const client = await pool.connect();

  try
  {
    await client.query("BEGIN");
    const accountRes = await client.query(
      `SELECT id, password_hash 
       FROM accounts 
       WHERE user_id = $1 AND provider = 'email'`,
      [userId]
    );
    const account = accountRes.rows[0];
    if (!account)
    {
      throw new Error("Email login not enabled");
    }
    const isValid = await bcrypt.compare(
      data.oldPassword,
      account.password_hash
    );
    if (!isValid)
    {
      throw new Error("Incorrect old password");
    }
    const isSame = await bcrypt.compare(
      data.newPassword,
      account.password_hash
    );

    if (isSame)
    {
      throw new Error("New password must be different");
    }
    const hashed = await bcrypt.hash(data.newPassword, 10);
    await client.query(
      `UPDATE accounts SET password_hash = $1 WHERE id = $2`,
      [hashed, account.id]
    );
    await client.query(
      `UPDATE users 
       SET token_version = token_version + 1 
       WHERE id = $1`,
      [userId]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Password changed. Please login again."
    };
  }
  catch (err)
  {
    await client.query("ROLLBACK");
    throw err;
  }
  finally
  {
    client.release();
  }
}