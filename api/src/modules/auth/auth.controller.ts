import type { changePasswordType, loginBody, signUpBody } from "../types/auth.types.js";
import type { Request,Response } from "express";
import { signUpService,loginService, refreshToken, changePasswordService, verifyEmailService, forgotPasswordService, verifyForgotPasswordService } from "./auth.service.js";
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

export async function logoutController(req:Request,res:Response){
  res.clearCookie("refreshToken",{
    httpOnly:true,
    sameSite:"strict",
    secure:false
  })
  return res.json({
    message:"Successfully logout"
  })
}

export async function changePassword(
  req: Request<{}, {}, changePasswordType>,
  res: Response
)
{
  try
  {
    const userId = (req as any).user?.id;

    if (!userId)
    {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }
    const result = await changePasswordService(userId, req.body);
    return res.json(result);
  }
  catch (err: any)
  {
    return res.status(400).json({
      error: err.message || "Failed to change password"
    });
  }
}

export async function verifyEmailController(req:Request,res:Response){
  const {token}=req.query;
  if(!token){
    return res.status(400).json({
      error:"Token required"
    })
  }
  try{
    const result = await verifyEmailService(token as string);
    return res.json(result);
  }catch(err:any){
    return res.status(400).json({
      error: err?.message || "Failed to verify email"
    })
  }
}

export async function forgotPasswordController(req: Request<{}, {}, { email: string }>, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }
    const result = await forgotPasswordService(email);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to process forgot password" });
  }
}

export async function verifyForgotPasswordController(
  req: Request<{}, {}, { token: string; newPassword: string; confirmPassword: string }>,
  res: Response
) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Token, password, and confirm password required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const result = await verifyForgotPasswordService(token, newPassword);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to reset password" });
  }
}