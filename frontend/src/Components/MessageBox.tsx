import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import connection from "../config/Connection.config";
import { jwtDecode } from "jwt-decode";
import MessageBoxHeader from "./MessageBoxHeader";

const socket = io("http://localhost:8000", { withCredentials: true });

interface Message {
  _id: string;
  senderId: string;
  receiverId: string | undefined;
  text: string;
  createdAt: string;
}

const MessageBox = () => {
  const { id: receiverId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  // Fetch logged-in user and join socket room
  useEffect(() => {
    const fetchUserAndJoinRoom = async () => {
      try {
        const res = await connection.get("/chat/user", {
          withCredentials: true,
        });
        const decodeRes = jwtDecode<{ userid: string }>(res.data);
        setLoggedInUser(decodeRes.userid);
        socket.emit("join", decodeRes.userid);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUserAndJoinRoom();
  }, []);

  // Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!receiverId) return;
      try {
        const res = await connection.get(`/chat/messages/${receiverId}`);

        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, [receiverId]);

  // Listen for new messages
  useEffect(() => {
    socket.on("receiveMessage", (message: Message) => {
      if (
        (message.senderId === loggedInUser &&
          message.receiverId === receiverId) ||
        (message.receiverId === loggedInUser && message.senderId === receiverId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [loggedInUser, receiverId]);

  // Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !loggedInUser) return;

    socket.emit("sendMessage", {
      senderId: loggedInUser,
      receiverId,
      text: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="flex w-full flex-col h-screen bg-[#0f1a1a]">
      {/* Messages */}
      <div>
        <MessageBoxHeader receiverId={receiverId} />
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2">
        {messages.map((msg) => {
          const isSender = msg.senderId === loggedInUser;
          return (
            <div
              key={msg._id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs break-words ${
                  isSender
                    ? "bg-blue-600 text-white self-end"
                    : "bg-gray-700 text-white self-start"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center p-4 bg-[#1d2828] gap-3 rounded-t-xl"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-[#2b3a3a] rounded-full py-2 px-4 text-white text-lg placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Type a message..."
          disabled={!loggedInUser}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition"
          disabled={!loggedInUser}
        >
          <IoSend className="text-white text-xl" />
        </button>
      </form>
    </div>
  );
};

export default MessageBox;
