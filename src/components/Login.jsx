import { IoClose } from "react-icons/io5";
import { FaHouse } from "react-icons/fa6";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login({ isOpen, onClose, setShowSignup }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.status === 200) {
        onClose();
        setUser(response.data.data);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.status === 200) {
        alert("Password reset link sent to your email.");
        setForgotPasswordOpen(false);
      }
      setForgotPasswordOpen(false);
    } catch (error) {
      console.error("Error during password reset:", error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-3xl overflow-hidden bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-lg text-gray-500 hover:text-black"
        >
          <IoClose />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="hidden flex-col justify-center bg-gray-50 p-10 md:flex">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#009587]">
              <FaHouse className="text-4xl text-white" />
            </div>

            <h2 className="mt-8 text-3xl font-semibold text-gray-800">
              Join Rentosphere
            </h2>

            <ul className="mt-6 space-y-3 text-gray-600">
              <li>✓ Find verified rental properties.</li>

              <li>✓ Contact owners directly.</li>

              <li>✓ Save your favourite properties.</li>

              <li>✓ Zero brokerage.</li>
            </ul>
          </div>

          {forgotPasswordOpen ? (<>
            <div className="flex flex-col justify-center p-8 md:p-10">
              <h2 className="text-3xl font-semibold text-gray-800">Forgot Password</h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter your email to send a password reset link
              </p>

              <form className="mt-8" onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587]"
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  type="submit"
                  className="mt-6 w-full bg-red-500 py-3 font-medium text-white transition hover:bg-red-600"
                >
                  Send Reset Link
                </button>

                <p className="mt-6 text-center text-sm">
                Go back to {" "}
                <button
                  type="button"
                  className="font-semibold text-[#009587] hover:underline"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                  }}
                >
                  Login
                </button>
              </p>
              </form>
            </div>
          </>) : (<>
            <div className="flex flex-col justify-center p-8 md:p-10">
              <h2 className="text-3xl font-semibold text-gray-800">Login</h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter your email and password to login
              </p>

              <form className="mt-8">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587]"
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="mt-4 w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587]"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="submit"
                  className="mt-6 w-full bg-red-500 py-3 font-medium text-white transition hover:bg-red-600"
                  onClick={handleLogin}
                >
                  Login
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-500">
                If you forget your password, click here {" "}
                <button
                  type="button"
                  className="font-semibold text-[#009587] hover:underline"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  forgot password
                </button>
              </p>

              <p className="mt-6 text-center text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#009587] hover:underline"
                  onClick={() => {
                    onClose();
                    setShowSignup(true);
                  }}
                >
                  Sign up
                </button>
              </p>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

export default Login;
