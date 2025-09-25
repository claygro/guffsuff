import jwt from "jsonwebtoken";
import "dotenv/config";
import UserModel from "../models/user.models.js";
async function AuthToken(req, res, next) {
  try {
    const token = req.cookies.userToken;
    if (!token) {
      return res.status(200).json({ message: "Login please" });
    }
    const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(data.userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = data;
    console.log(data);
    next();
  } catch (error) {
    console.log(`Error in middleware ${error}`);
    res.status(200).json({ message: "Invalid token" });
  }
}
export default AuthToken;
