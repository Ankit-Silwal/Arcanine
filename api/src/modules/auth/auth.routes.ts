import { Router } from "express";
import { signUpController, loginController, refreshController, logoutController, changePassword, verifyEmailController, forgotPasswordController, verifyForgotPasswordController } from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const authRouter = Router();


authRouter.post("/signup", signUpController);
authRouter.post("/login", loginController);
authRouter.get("/verify-email", verifyEmailController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/reset-password", verifyForgotPasswordController);

authRouter.post("/refresh", authMiddleware, refreshController);
authRouter.post("/logout", authMiddleware, logoutController);
authRouter.post("/change-password", authMiddleware, changePassword);

export default authRouter;
