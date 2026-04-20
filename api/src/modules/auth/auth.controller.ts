
import type { Request, Response } from "express";

type SignUpBody = {
    provider: 'email' | 'google' | 'github'
    email?: string,
    password?: string,
    oauthToken?: string
}
export async function signUpController(
  req:Request<{},{},SignUpBody>,
  res:Response
){
  
}