import mongoose from "mongoose";
const friendRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      enum: ["pending", "Accepted", "Rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const FriendRequestModel = mongoose.model("friendRequest", friendRequestSchema);
export default FriendRequestModel;
