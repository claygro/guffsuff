import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import loginImage from "../assets/signup.jpg";
import connection from "../config/Connection.config";

import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userLogin, setUserLogin] = useState({});
  const [errMsg, setErrMsg] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserLogin({ ...userLogin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await connection.post("/chat/login", userLogin);
      console.log(response);
      (e.target as HTMLFormElement).reset();

      localStorage.setItem("userChatDashboard", JSON.stringify(true));
      navigate("/layout");
    } catch (error: any) {
      console.log(`Error in signup page ${error}`);
      setErrMsg(`${error.response.data.message}`);
    }
  };
  useEffect(() => {
    const userChatDashboard = localStorage.getItem("userChatDashboard");
    if (userChatDashboard && JSON.parse(userChatDashboard) == true) {
      navigate("/layout");
    }
  });

  return (
    <>
      <div className="bg-[#1F2828] h-screen w-screen flex justify-around items-center">
        <div className="flex flex-col gap-10">
          <div>
            <h1 className="text-[#cacaca] text-2xl text-center font-bold">
              Welcome back
            </h1>
            <h1 className="text-[#bababa] text-center">Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            {errMsg == "Something went wrong" ? (
              <h1 className="text-red-400 ">{errMsg}</h1>
            ) : (
              <h1 className="pt-3 pb-3"> </h1>
            )}
            <div>
              <label htmlFor="email" className="text-[#cacaca]">
                Email:
              </label>

              <div className="bg-[#242c2c] w-96 px-2 py-2 rounded-lg ">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="border-none outline-none w-full text-[#cacaca] "
                  placeholder="Enter your email"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-[#cacaca]">
                Password:
              </label>
              <div className="bg-[#242c2c] w-96 px-2 py-2 rounded-lg ">
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="border-none outline-none w-full text-[#cacaca] "
                  placeholder="Enter your password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="bg-[#ADFF00] w-96 px-1 py-2 rounded-lg text-xl font-bold text-black cursor-pointer hover:bg-[#9ee700] active:bg-[#91d400]">
              Login
            </button>
          </form>
          <button
            onClick={() => navigate("/")}
            className="text-blue-200 text-xl cursor-pointer hover:text-blue-400"
          >
            Donot have an account? Singup?
          </button>
        </div>

        {/* Right-side Image */}
        <div className="hidden sm:flex relative">
          <img
            src={loginImage}
            alt="image"
            className="h-[600px] w-[500px] object-cover rounded-2xl"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-black/30" />
        </div>
      </div>
    </>
  );
};

export default Login;
