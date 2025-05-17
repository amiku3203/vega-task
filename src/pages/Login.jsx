import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import bgimage from "../assets/bgimage.jpg";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && !profileImage) {
      toast.error("Profile image is required.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password,
        });

        toast.success("Login successful!");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = "/dashboard";
      } else {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("profileImage", profileImage);

        const res = await axios.post(`${API_BASE_URL}/auth/signup`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Signup successful! You can now login.");
        setIsLogin(true);
        setProfileImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex items-center justify-center h-screen">
        <img
          src={bgimage}
          alt="Background"
          className="object-cover fixed z-[-1] w-full h-full"
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col p-8 bg-black bg-opacity-60 rounded-2xl shadow-2xl w-[90%] max-w-[420px] border border-white"
        >
          <h2 className="text-white text-2xl font-bold mb-6 text-center">
            {isLogin ? "Login" : "Create an Account"}
          </h2>

          {!isLogin && (
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-28 h-28 rounded-full border-2 border-white object-cover shadow-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <label className="text-white text-xs font-medium cursor-pointer">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-white text-black rounded-full p-[6px] hover:bg-red-600 hover:text-white transition"
                    >
                      <FaTimes size={10} />
                    </button>
                  </>
                ) : (
                  <label className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-white rounded-full text-white text-sm cursor-pointer hover:bg-white hover:text-black transition">
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-white text-sm font-semibold mb-2">
              Email
            </label>
            <input
              className="pl-3 py-2 border-2 border-white text-white rounded-md w-full bg-transparent placeholder-white focus:outline-none"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                className="pl-10 py-2 border-2 border-white text-white rounded-md w-full bg-transparent placeholder-white focus:outline-none"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className={`bg-white text-black font-bold py-2 rounded-md mt-2 transition flex justify-center items-center ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-opacity-80"
            }`}
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : isLogin ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setProfileImage(null);
              setImagePreview(null);
            }}
            className="mt-4 text-sm text-white underline text-center cursor-pointer"
            disabled={loading}
          >
            {isLogin ? "New here? Sign Up" : "Already registered? Login"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
