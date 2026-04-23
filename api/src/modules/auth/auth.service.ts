import pool from "../../config/db.js";
import { signAccessToken, verifyRefreshToken } from "../../utils/jwt.js";
import type { loginBody, signUpBody } from "../types/auth.types.js";
import type { jwtpayload, JwtPayloadWithMeta } from "../types/jwt.types.js";
import { emailLoginStrategy, emailSignUpStrategy } from "./strategies/email.strategy.js";
import { githubSignUpStrategy } from "./strategies/github.strategy.js";
import { googleSignUpStrategy } from "./strategies/google.strategy.js";
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
    throw new Error("User wasnt found");
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