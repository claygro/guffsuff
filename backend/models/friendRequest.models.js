import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
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
