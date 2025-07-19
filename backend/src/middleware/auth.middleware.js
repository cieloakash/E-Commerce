import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }
    // get the token from auhHeader
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }
    // verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: "Inernal Server Error" });
  }
};
