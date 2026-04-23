import { Router } from "express";
import { signUpController, loginController, refreshController } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUpController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);

export default authRouter;
