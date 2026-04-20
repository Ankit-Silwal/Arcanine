
import type { Request, Response } from "express";
import { verifyUser } from "./auth.service.js";

export type SignUpBody = {
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


export async function verifyHandler(req:Request, res:Response) {
  try {
    const { token } = req.query;
    if (!token) {
      throw new Error("Token missing");
    }
    const result = await verifyUser(token as string);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}