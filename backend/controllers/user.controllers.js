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
            "Password must be 8 characters long and 1 special character.",
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
      }).populate("receiverId");
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
  //receiver request.
  async receiverRequest(req, res) {
    const { id } = req.params;
    // console.log(id);
    try {
      const response = await FriendRequestModel.find({
        receiverId: id,
      }).populate("senderId");
      if (!response) {
        return res.status(404).json({ message: "No request" });
      }
      res.status(200).json(response);
    } catch (error) {
      console.log(`Error in receiver request ${error}`);
    }
  }
  // request reject.
  async requestReject(req, res) {
    const { userid } = req.user;

    try {
      const response = await FriendRequestModel.findOneAndDelete({
        receiverId: userid, // ensures only the receiver can delete
      });

      if (!response) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      res.status(200).json({ message: "Friend request rejected", response });
    } catch (error) {
      console.log(`Error in request reject ${error}`);
      res.status(500).json({ message: "Server error" });
    }
  }
  //accept request.
  async acceptRequest(req, res) {
    const { userid } = req.user;
    try {
      const response = await FriendRequestModel.findOneAndUpdate(
        {
          receiverId: userid,
        },
        { $set: { status: "Accepted" } },
        { new: true }
      );
      if (!response) {
        return res.status(404).json({ message: "No user found" });
      }
      res.status(200).json(response);
    } catch (error) {
      console.log(`Error in accept request ${error}`);
    }
  }
  //all friend
  async allFriend(req, res) {
    const { userid } = req.user;
    try {
      const response = await FriendRequestModel.find({
        status: "Accepted", // make sure case matches your schema
        $or: [{ senderId: userid }, { receiverId: userid }],
      })
        .populate("receiverId")
        .populate("senderId");
      if (!response) {
        res.status(404).json({ message: "No friends" });
      }
      const friends = response.map((req) => {
        if (req.senderId._id == userid) {
          return req.receiverId;
        } else {
          return req.senderId;
        }
      });
      res.status(200).json(friends);
    } catch (error) {
      console.log(`Error in all friend ${error}`);
    }
  }
  //for logout.
  async logout(req, res) {
    try {
      await res.cookie("userToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use true for HTTPS
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // "None" for cross-origin
        maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiry time (30 days)
      });
      res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
      console.log(`Error in logout ${error}`);
    }
  }
  //login
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Something went wrong" });
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
          res.status(200).json({ message: "Welcome" });
        } else {
          res.status(404).json({ message: "Something went wrong" });
        }
      });
      let userToken = jwt.sign(
        {
          username: user.username,
          email: email,
          avatar: user.avatar,
          userid: user._id,
        },
        process.env.JWT_SECRET_KEY
      );
      res.cookie("userToken", userToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use true for HTTPS
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // "None" for cross-origin
        maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiry time (30 days)
      });
    } catch (error) {
      console.log(`Error in login ${error}`);
    }
  }
}
export default UserControllers;
