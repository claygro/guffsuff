import { useEffect, useState } from "react";
import connection from "../config/Connection.config";
import backendUrl from "../config/BackendUrl";

const MessageBoxHeader = ({ receiverId }: { receiverId: string }) => {
  interface UserHeader {
    avatar: string;
    username: string;
  }
  const [headerUser, setHeaderUser] = useState<UserHeader>();

  useEffect(() => {
    async function UserFetchForHeader() {
      try {
        const response = await connection.get(
          `/chat/messageHeader/${receiverId}`
        );

        setHeaderUser(response.data);
      } catch (error) {
        console.log(`Error in user for header ${error}`);
      }
    }
    if (receiverId) {
      UserFetchForHeader();
    }
  }, [receiverId]);
  // console.log(headerUser);
  return (
    <>
      <div className="flex gap-3 items-center bg-gray-800  px-3 py-4">
        {headerUser?.avatar ? (
          <img
            className="w-12 h-12 rounded-full"
            src={`${backendUrl}${headerUser?.avatar}`}
            alt=""
          />
        ) : (
          <div className="w-4 h-4  border-t-white border-2 rounded-full  border-black animate-spin"></div>
        )}
        <h1 className="text-white text-lg">{headerUser?.username}</h1>
      </div>
    </>
  );
};

export default MessageBoxHeader;
