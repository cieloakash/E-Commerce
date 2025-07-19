import express from "express";
import { login, signup } from "../controller/user.controller.js";

const userRoute = express.Router()

userRoute.post("/user/login",login)
userRoute.post("/user/signup",signup)

export default userRoute;
