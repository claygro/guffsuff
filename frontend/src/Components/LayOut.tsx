import { Outlet } from "react-router-dom";
import UserList from "./UserList";

const LayOut = () => {
  return (
    <div className="flex h-screen  bg-[#131e1e]">
      <div className="w-[400px]  bg-[#242b2b]">
        <UserList />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default LayOut;
