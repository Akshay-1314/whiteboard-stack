import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/profile");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center w-80">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome!</h1>
        <p className="text-gray-600 mb-6">Join us now or log in to continue.</p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 mb-3"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-all duration-300"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
