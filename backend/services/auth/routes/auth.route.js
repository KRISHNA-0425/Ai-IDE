import express from 'express'
import { googleLogin, login, logout, register } from '../controller/auth.controller.js';


const authRouter = express.Router();

authRouter.post("/googleLogin", googleLogin);
authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);

export default authRouter;