import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import signupImage from "../assets/signup.jpg";
import connection from "../config/Connection.config";
import userDefaultAvatar from "../assets/user.png";
import CropperModal from "../Components/Cropper"; // ✅ modal UI
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [userSignup, setUserSignup] = useState({});
  const [avatar, setAvatar] = useState<File>();
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const navigate = useNavigate();
  // Cropper modal states
  const [showCropper, setShowCropper] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserSignup({ ...userSignup, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoUrl(URL.createObjectURL(file));

      setShowCropper(true);
    }
  };

  const handleSaveCropped = async (croppedImage: string) => {
    setAvatarPreview(croppedImage);

    // ✅ convert base64 to File for backend upload
    const res = await fetch(croppedImage);
    const blob = await res.blob();
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

    setAvatar(file);
    setShowCropper(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", (userSignup as any).username || "");
    formData.append("email", (userSignup as any).email || "");
    formData.append("password", (userSignup as any).password || "");
    if (avatar) formData.append("avatar", avatar ? avatar : userDefaultAvatar);

    try {
      const response = await connection.post("/chat/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response);
      (e.target as HTMLFormElement).reset();
      setAvatarPreview("");
      localStorage.setItem("userChatDashboard", JSON.stringify(true));
      navigate("/layout");
    } catch (error) {
      console.log(`Error in signup page ${error}`);
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
              Create an account
            </h1>
            <h1 className="text-[#bababa] text-center">
              Sign up now and unlock exclusive access!
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex justify-center">
              <label htmlFor="avatar">
                <img
                  src={avatarPreview || userDefaultAvatar}
                  alt="avatar"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 cursor-pointer"
                />
              </label>
              <input
                type="file"
                id="avatar"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="text-[#cacaca]">
                UserName:
              </label>
              <div className="bg-[#242c2c] w-96 px-2 py-2 rounded-lg ">
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  className="border-none outline-none w-full text-[#cacaca] "
                  placeholder="Enter your username"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
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
              Signup
            </button>
          </form>
        </div>

        {/* Right-side Image */}
        <div className="hidden sm:flex relative">
          <img
            src={signupImage}
            alt="image"
            className="h-[600px] w-[500px] object-cover rounded-2xl"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-black/30" />
        </div>
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <CropperModal
          photo={photoUrl}
          onCancel={() => setShowCropper(false)}
          onSave={handleSaveCropped}
        />
      )}
    </>
  );
};

export default Signup;
