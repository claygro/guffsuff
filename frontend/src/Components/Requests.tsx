import connection from "../config/Connection.config";

const Requests = () => {
  const handleYourRequest = async () => {
    try {
      const response = await connection.get("/chat/senderRequest");
      console.log(response.data);
    } catch (error) {
      console.log(`Error in handle your request ${error}`);
    }
  };
  return (
    <>
      <div className="flex justify-between  items-center">
        <div className="bg-gray-800 w-fit text-white rounded-full text-sm hover:bg-gray-700 active:bg-gray-900 cursor-pointer mt-2 mb-2  px-3 py-1">
          <h1>All</h1>
        </div>
        <div
          onClick={handleYourRequest}
          className="bg-gray-800 w-fit text-white rounded-full text-sm whitespace-nowrap hover:bg-gray-700 active:bg-gray-900 cursor-pointer m-2  px-3 py-1"
        >
          <h1>Your Request</h1>
        </div>
        <div className="bg-gray-800 w-fit text-white whitespace-nowrap rounded-full text-sm hover:bg-gray-700 active:bg-gray-900 cursor-pointer m-2  px-3 py-1">
          <h1>Friend Request</h1>
        </div>
      </div>
    </>
  );
};

export default Requests;
