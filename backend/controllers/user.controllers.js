import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/user.models.js";
import MessageModels from "../models/message.models.js";
import "dotenv/config";
import FriendRequestModel from "../models/friendRequest.models.js";
class UserControllers {
  async signUp(req, res) {
    const { username, email, password } = req.body;
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : null;
    // Regex: only gmail/yahoo, valid format
    const emailRegex = /^[a-z0-9._%+-]+@(gmail|yahoo)\.com$/i;

    // Regex: at least 8 chars, one special symbol
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    try {
      const userExist = await UserModel.findOne({ username: username });
      const emailExist = await UserModel.findOne({ email: email });
      //checking whether user is already exist or not.
      if (userExist) {
        return res.status(403).json({ message: "Username is already exist" });
      }
      //checking whether email is already exist or not.
      if (emailExist) {
        return res.status(403).json({ message: "Email is already taken" });
      }
      //checking whether email follows emailRegex or not.
      if (!emailRegex.test(email)) {
        return res
          .status(403)
          .json({ message: "Only gmail and yahoo is valid" });
      }
      //checking whether password follows passwordRegex or not.
      if (!passwordRegex.test(password)) {
        return res.status(403).json({
          message:
            "Password must in 8 character and have one special character",
        });
      }
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
          const response = await UserModel.create({
            avatar: avatarUrl,
            username,
            email,
            password: hash,
          });
          const userToken = jwt.sign(
            {
              username: username,
              avatar: avatarUrl,
              email: email,
              userid: response._id,
            },
            process.env.JWT_SECRET_KEY
          );
          res.cookie("userToken", userToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use true for HTTPS
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // "None" for cross-origin
            maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiry time (30 days)
          });
          res.status(200).json(response);
        });
      });
    } catch (error) {
      console.log(`Error in singup ${error}`);
    }
  }
  // getting all the user
  async userLists(req, res) {
    try {
      const response = await UserModel.find({});
      if (!response) {
        return res.status(404).json({ message: "Donot have user" });
      }
      res.status(200).json(response);
    } catch (error) {
      console.log(`Error in getting all the user ${error}`);
    }
  }
  //get user from cookie.
  async user(req, res) {
    try {
      const token = req.cookies.userToken;
      res.status(200).json(token);
    } catch (error) {
      console.log(`Error in user ${error}`);
    }
  }
  //getting message
  async fetchMessage(req, res) {
    const { userid } = req.user;

    const { receiverId } = req.params;
    console.log(userid);
    console.log(receiverId);
    try {
      const messages = await MessageModels.find({
        $or: [
          { senderId: userid, receiverId: receiverId },
          { senderId: receiverId, receiverId: userid },
        ],
      }).sort({ createdAt: 1 });

      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: "Error fetching messages" });
    }
  }
  //message box header.
  async messageHeader(req, res) {
    const { id } = req.params;
    try {
      const response = await UserModel.findById(id);

      if (!response) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(response);
    } catch (error) {
      console.log(`Error in message header ${error}`);
    }
  }
  // searching user.
  async userSearch(req, res) {
    const { username } = req.body;
    console.log(username);
    try {
      const response = await UserModel.find({
        username: { $regex: username, $options: "i" },
      });
      if (!response) {
        return res.status(404).json({ message: "No user found" });
      }
      res.status(200).json(response);
    } catch (error) {
      console.log(`Error in searching user ${error}`);
    }
  }
  // friend request.
  async friendRequest(req, res) {
    const { id } = req.params;
    const { userid } = req.user;
    try {
      //for checking user has already send request or not.
      const existingRequest = await FriendRequestModel.findOne({
        senderId: userid,
        receiverId: id,
      });
      if (existingRequest) {
        return res
          .status(403)
          .json({ message: "You already sent friend request" });
      }
      const newRequest = await FriendRequestModel.create({
        senderId: userid,
        receiverId: id,
      });

      res.status(200).json(newRequest);
    } catch (error) {
      console.log(`Error in friend request ${error}`);
    }
  }
  // fetching sender request.
  async senderRequest(req, res) {
    const { userid } = req.user;
    try {
      const response = await FriendRequestModel.find({
        senderId: userid,
      }).populate("senderId");
      if (!response) {
        return res
          .status(404)
          .json({ message: "You havenot send friend request to other" });
      }
      res.status(200).json(response);
    } catch (error) {
      console.log(`Error in fetching sender request ${error}`);
    }
  }
}
export default UserControllers;
