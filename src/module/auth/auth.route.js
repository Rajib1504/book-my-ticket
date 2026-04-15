import { Router } from "express";
import * as authController from "./auth.controller.js";
const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

export default authRouter;
