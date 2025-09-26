import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import connection from "../config/Connection.config";
import backendUrl from "../config/BackendUrl";
import defaultUserAvatar from "../assets/user.png";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import
import Requests from "./Requests";
interface UserListType {
  _id: string;
  avatar?: string;
  username: string;
  email?: string;
}

interface LoggedInUser {
  avatar?: string;
  username: string;
  email: string;
}

interface UserSearchType {
  username: string;
}

const UserList = () => {
  const navigate = useNavigate();
  const { id: activeChatUserId } = useParams(); // Get userId from URL for active chat

  const [userLists, setUserLists] = useState<UserListType[]>([]);
  const [userDetails, setUserDetails] = useState<LoggedInUser | null>(null); //store current user details.
  const [userSearch, setUserSearch] = useState<string>("");

  // Fetch all users
  useEffect(() => {
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

    fetchUsers();
  }, []);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await connection.get("/chat/user", {
          withCredentials: true,
        });
        const decoded: LoggedInUser = jwtDecode<LoggedInUser>(response.data); // ✅ add type
        setUserDetails(decoded);
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    };
    fetchUserDetails();
  }, []);

  if (!userDetails) return null; // Wait until userDetails is loaded

  // Filter out the logged-in user from the list
  const filteredUsers = userLists.filter(
    (user) => user.username !== userDetails.username
  );

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserSearch(e.target.value);
  };

  // Handle form submit (search)
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const requestBody: UserSearchType = { username: userSearch }; // ✅ Use type
      const response = await connection.post("/chat/userSearch", requestBody, {
        withCredentials: true,
      });
      console.log(response.data);
      setUserLists(response.data); // Optional: update the list with search results
    } catch (error) {
      console.log(`Error in searching the user: ${error}`);
    }
  };
  // for friendRequest.

  async function friendRequestSender(id: string) {
    try {
      const response = await connection.get(`/chat/friendRequest/${id}`);
      console.log(response);
    } catch (error) {
      console.log(`Error in friend request ${error}`);
    }
  }

  return (
    <div className="flex flex-col h-screen justify-between bg-[#101818]">
      {/* Users List */}
      <div className="overflow-y-auto p-2">
        <form
          onSubmit={handleSearch}
          className="flex items-center justify-between"
        >
          <div className="bg-[#232929] px-3 py-2 w-full rounded-2xl">
            <input
              onChange={handleChange}
              value={userSearch} // ✅ bind input value
              name="username"
              type="text"
              className="text-white outline-none border-none w-full"
              placeholder="Enter username"
            />
          </div>
        </form>
        <div>
          <Requests />
        </div>
        {filteredUsers.map((user) => {
          const isActive = user._id === activeChatUserId; // Check if this user is active
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
              <button
                type="button"
                onClick={() => friendRequestSender(user._id)}
              >
                Add friend
              </button>
            </div>
          );
        })}
      </div>

      {/* Logged-in User Profile at the Bottom */}
      <div className="p-4 flex justify-center">
        <div className="bg-amber-800 rounded-lg flex gap-5 items-center px-5 py-2">
          <img
            src={
              userDetails.avatar
                ? `${backendUrl}${userDetails.avatar}`
                : defaultUserAvatar
            }
            alt={userDetails.username}
            className="w-12 h-12 rounded-full"
          />
          <div className="text-white">
            <h1 className="font-semibold">{userDetails.username}</h1>
            <h1 className="text-sm">{userDetails.email}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
