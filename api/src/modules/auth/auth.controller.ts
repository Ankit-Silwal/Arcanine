import type { loginBody, signUpBody } from "../types/auth.types.js";
import type { Request,Response } from "express";
import { signUpService,loginService } from "./auth.service.js";
export async function signUpController(
req:Request<{},{},signUpBody>,res:Response)
{
  const input=req.body;
  return await signUpService(input);

}

export async function loginController(req:Request<{},{},loginBody>, res:Response)
{
  try
  {
    const input = req.body;
    const { accessToken, refreshToken } =
      await  loginService(input)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict"
    });

    res.json({ accessToken });
  }
  catch (err: any)
  {
    res.status(400).json({ error: err.message });
  }
}