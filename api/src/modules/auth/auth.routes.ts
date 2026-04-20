import { Router } from "express";
import { signUpController, verifyHandler } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUpController);
authRouter.get("/verify", verifyHandler);

export default authRouter;
