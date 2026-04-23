import type { loginBody, signUpBody } from "../types/auth.types.js";
import type { Request,Response } from "express";
import { signUpService,loginService, refreshToken } from "./auth.service.js";
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
    const result = await loginService(input);
    
    if (!result || 'success' in result) {
      return res.status(400).json(result || { success: false, message: "Login failed" });
    }
    
    const { access_token: accessToken, refresh_token: refreshToken } = result;
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

export async function refreshController(req:Request,res:Response){
  try{
    const token=req.cookies.refreshToken;
    if(!token){
      return res.status(401).json({
        error:"No refresh token"
      })
    }
    const result=await refreshToken(token);
    res.json({
      result
    })
  }catch(err:any){
    res.status(401).json({
      err:err?.message
    })
  }
}