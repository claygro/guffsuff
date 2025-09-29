const Requests = ({ onTabClick }) => {
  return (
    <>
      <div className="flex justify-between  items-center">
        <div
          onClick={() => onTabClick("allFriend")}
          className="bg-gray-800 w-fit text-white rounded-full text-sm hover:bg-gray-700 active:bg-gray-900 cursor-pointer mt-2 mb-2  px-3 py-1"
        >
          <h1>All</h1>
        </div>
        <div
          onClick={() => onTabClick("yourRequest")}
          className="bg-gray-800 w-fit text-white rounded-full text-sm whitespace-nowrap hover:bg-gray-700 active:bg-gray-900 cursor-pointer m-2  px-3 py-1"
        >
          <h1>Your Request</h1>
        </div>
        <div
          onClick={() => onTabClick("friendRequest")}
          className="bg-gray-800 w-fit text-white whitespace-nowrap rounded-full text-sm hover:bg-gray-700 active:bg-gray-900 cursor-pointer m-2  px-3 py-1"
        >
          <h1>Friend Request</h1>
        </div>
      </div>
    </>
  );
};

export default Requests;
