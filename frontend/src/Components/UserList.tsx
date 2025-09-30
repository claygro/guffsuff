import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import connection from "../config/Connection.config";
import backendUrl from "../config/BackendUrl";
import defaultUserAvatar from "../assets/user.png";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Requests from "./Requests";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
interface UserListType {
  _id: string;
  avatar?: string;
  username: string;
  email?: string;
}

interface LoggedInUser {
  userid: string;
  avatar?: string;
  username: string;
  email: string;
}

interface UserSearchType {
  username: string;
}

interface FriendRequestType {
  _id: string;
  senderId: UserListType; // populated from backend
  receiverId: UserListType; // populated from backend
  status: "pending" | "accepted" | "rejected";
}

const UserList = () => {
  const navigate = useNavigate();
  const { id: activeChatUserId } = useParams(); // receiver ID

  const [userLists, setUserLists] = useState<UserListType[]>([]);
  const [userDetails, setUserDetails] = useState<LoggedInUser | null>(null);
  const [userSearch, setUserSearch] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<
    "all" | "yourRequest" | "friendRequest" | "allFriend"
  >("allFriend");
  const [filterRequest, setFilterRequest] = useState<FriendRequestType[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await connection.get("/chat/userLists", {
        withCredentials: true,
      });
      setUserLists(response.data);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  // Fetch logged-in user
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await connection.get("/chat/user", {
          withCredentials: true,
        });
        const decoded: LoggedInUser = jwtDecode<LoggedInUser>(response.data);
        setUserDetails(decoded);
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    };
    fetchUserDetails();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
    handleTabClick("allFriend");
  }, []);

  // Filter out logged-in user
  const filteredUsers = userLists.filter(
    (user) => user.username !== userDetails?.username
  );

  // Search input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setUserSearch(searchValue);
    if (searchValue.length > 0 && currentTab !== "all") setCurrentTab("all");
  };

  // Handle search submit
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userSearch.trim()) {
      await fetchUsers();
      setCurrentTab("all");
      return;
    }
    setCurrentTab("all");
    try {
      const response = await connection.post(
        "/chat/userSearch",
        { username: userSearch },
        { withCredentials: true }
      );
      setUserLists(response.data);
    } catch (error) {
      console.error("Error searching user:", error);
    }
  };

  // Send friend request
  const friendRequestSender = async (id: string) => {
    try {
      const response = await connection.get(`/chat/friendRequest/${id}`);
      console.log(response);
      toast.success("Friend request sent");
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      toast.error(`${error.response.data.message}`);
    }
  };

  // Handle tab click
  const handleTabClick = async (
    tab: "all" | "yourRequest" | "friendRequest" | "allFriend"
  ) => {
    setUserSearch("");
    setCurrentTab(tab);

    try {
      if (tab === "all") {
        await fetchUsers();
      } else if (tab === "yourRequest") {
        const response = await connection.get("/chat/senderRequest");
        setFilterRequest(response.data);
      } else if (tab === "friendRequest") {
        if (!userDetails) return;
        const response = await connection.get(
          `/chat/reciverRequest/${userDetails.userid}`
        );
        setFilterRequest(response.data);
        // console.log(userDetails.userid);
      } else if (tab == "allFriend") {
        const response = await connection.get("/chat/allFriend");

        setFilterRequest(response.data);
        // console.log(response);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const shouldShowUserDiscovery = userSearch.length > 0;
  //for reject.
  const handleReject = async (_id) => {
    try {
      setFilterRequest((prev) => prev.filter((req) => req._id !== _id));
      await connection.get(`/chat/requestReject`);
    } catch (error) {
      console.log(`Error in rejection ${error}`);
    }
  };
  const handleAccept = async (requestid: string, senderId: string) => {
    try {
      // setFilterRequest((prev) => prev.filter((req) => req._id !== _id));
      await connection.put(`/chat/acceptRequest/${requestid}`);
      setFilterRequest((prev) =>
        prev.map((req) =>
          req._id === requestid ? { ...req, status: "accepted" } : req
        )
      );
      setAccepted((prev) => [...prev, senderId]);
      console.log(accepted);
    } catch (error) {
      console.log(`Error in rejection ${error}`);
    }
  };
  // logout.
  const handleLogout = async () => {
    try {
      const logout = await connection.get("/chat/logout");
      if (logout) {
        navigate("/login");
        localStorage.removeItem("userChatDashboard");
        window.location.reload();
      }
    } catch (error) {
      console.log(`Error in logout ${error}`);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between bg-[#101818]">
      <div className="overflow-y-auto p-2">
        {/* Search */}
        <Toaster
          toastOptions={{
            style: { background: "white", color: "black" },
          }}
          position="top-center"
        />
        <form
          onSubmit={handleSearch}
          className="flex items-center justify-between"
        >
          <div className="bg-[#232929] px-3 py-2 w-full rounded-2xl">
            <input
              onChange={handleChange}
              value={userSearch}
              name="username"
              type="text"
              className="text-white outline-none border-none w-full bg-[#232929]"
              placeholder="Search users or start a new chat"
            />
          </div>
        </form>

        {/* Tabs */}

        <Requests onTabClick={handleTabClick} />

        {/* Content */}
        {shouldShowUserDiscovery ? (
          <>
            <h2 className="text-white font-semibold my-2">
              {userSearch ? "Search Results" : "All Users (for discovery)"}
            </h2>
            {filteredUsers.map((user) => {
              const isActive = user._id === activeChatUserId;
              return (
                <div
                  key={user._id}
                  onClick={() => navigate(`/layout/messageBox/${user._id}`)}
                  className={`flex items-center gap-3 p-2 m-2 rounded-xl cursor-pointer hover:bg-[#1f2a2a] ${
                    isActive ? "bg-blue-700" : "bg-[#172121]"
                  }`}
                >
                  <img
                    src={
                      user.avatar
                        ? `${backendUrl}${user.avatar}`
                        : defaultUserAvatar
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <h1 className="text-white text-md">{user.username}</h1>

                  {!accepted.includes(user._id) && (
                    <button
                      type="button"
                      className="ml-auto text-blue-400 text-sm hover:text-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        friendRequestSender(user._id);
                      }}
                    >
                      Add friend
                    </button>
                  )}
                </div>
              );
            })}
          </>
        ) : currentTab === "allFriend" ? (
          <>
            <h2 className="text-white font-semibold my-2">Your Friends</h2>
            {filterRequest.length > 0 ? (
              filterRequest.map(
                (friend) =>
                  friend._id !== userDetails?.userid && (
                    <div
                      key={friend._id}
                      onClick={() =>
                        navigate(`/layout/messageBox/${friend._id}`)
                      }
                      className={`flex items-center  gap-3 p-2 m-2 rounded-xl cursor-pointer hover:bg-[#1f2a2a] ${
                        friend._id === activeChatUserId
                          ? "bg-blue-700"
                          : "bg-[#172121]"
                      }`}
                    >
                      <img
                        src={
                          friend?.avatar
                            ? `${backendUrl}${friend.avatar}`
                            : defaultUserAvatar
                        }
                        alt={friend.username}
                        className="w-12 h-12 rounded-full"
                      />

                      <div className="flex-grow  ">
                        <h1 className="text-white text-2xl">
                          {friend.username}
                        </h1>
                      </div>
                    </div>
                  )
              )
            ) : (
              <h1 className="text-xl text-white">No friends</h1>
            )}
          </>
        ) : (
          <>
            {/* Sent Requests */}
            {currentTab === "yourRequest" && (
              <>
                <h2 className="text-white font-semibold my-2">
                  Your Sent Requests
                </h2>
                {filterRequest.length > 0 ? (
                  filterRequest.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center gap-3 p-2 m-2 rounded-xl bg-[#172121]"
                    >
                      <img
                        src={
                          req.receiverId?.avatar
                            ? `${backendUrl}${req.receiverId.avatar}`
                            : defaultUserAvatar
                        }
                        alt={req.receiverId?.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h1 className="text-white">
                          {req.receiverId?.username}
                        </h1>
                        <span className="text-gray-400 text-sm">
                          Status: {req.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <h1 className="text-xl text-white">No request</h1>
                )}
              </>
            )}

            {/* Incoming Requests */}
            {currentTab === "friendRequest" && (
              <>
                <h2 className="text-white font-semibold my-2">
                  Incoming Friend Requests
                </h2>
                {filterRequest.length > 0 ? (
                  filterRequest.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center gap-3 p-2 m-2 rounded-xl bg-[#172121]"
                    >
                      <img
                        src={
                          req.senderId?.avatar
                            ? `${backendUrl}${req.senderId.avatar}`
                            : defaultUserAvatar
                        }
                        alt={req.senderId?.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-grow">
                        <h1 className="text-white">{req.senderId?.username}</h1>
                        <span className="text-gray-400 text-sm">
                          Status: {req.status}
                        </span>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-green-500 hover:text-green-400 text-sm font-semibold"
                            onClick={() =>
                              handleAccept(req._id, req.senderId?._id)
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-400 text-sm font-semibold"
                            onClick={() => handleReject(req._id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <h1 className="text-xl text-white">No request</h1>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Logged-in User */}
      <div className="p-4 flex   justify-center  ">
        <div className="rounded-lg py-4 px-2 bg-gray-800   gap-5 flex items-center  ">
          <img
            src={
              userDetails?.avatar
                ? `${backendUrl}${userDetails.avatar}`
                : defaultUserAvatar
            }
            alt={userDetails?.username}
            className="w-12  h-12 rounded-full"
          />
          <div className="text-white ">
            <h1 className="font-semibold">{userDetails?.username}</h1>
            <h1 className="text-sm">{userDetails?.email}</h1>
          </div>
          <button
            className="bg-gray-600 mt-2 px-3 py-1 text-xl text-white rounded-lg"
            onClick={handleLogout}
          >
            logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserList;
