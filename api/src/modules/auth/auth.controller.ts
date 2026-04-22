import type { signUpBody } from "../types/auth.types.js";
import type { Request,Response } from "express";
import { signUpService } from "./auth.service.js";
export async function signUpController(
req:Request<{},{},signUpBody>,res:Response)
{
  const input=req.body;
  const response=await signUpService(input);
  return response;
}