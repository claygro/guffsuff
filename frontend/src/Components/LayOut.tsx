import { Outlet, useParams } from "react-router-dom";
import UserList from "./UserList";

const LayOut = () => {
  const { id: activeChatUserId } = useParams(); // the selected friend

  return (
    <div className="flex h-screen bg-[#131e1e]">
      {/* Desktop view */}
      <div className="hidden sm:block md:w-[400px] bg-[#242b2b]">
        <UserList />
      </div>
      <div className="hidden flex-1  md:flex sm:w-full">
        <Outlet />
      </div>

      {/* Mobile view */}
      <div className="flex md:hidden w-full">
        {!activeChatUserId ? (
          // Show UserList first
          <div className="w-full bg-[#242b2b]">
            <UserList />
          </div>
        ) : (
          // Show chat covering full screen
          <div className="w-full">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
};

export default LayOut;
