import { Router } from "express";
import { signUpController, loginController, refreshController, logoutController } from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signUpController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", authMiddleware, refreshController);
authRouter.post("/logout", authMiddleware, logoutController);

export default authRouter;
