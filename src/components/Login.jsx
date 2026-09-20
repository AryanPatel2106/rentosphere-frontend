import { IoClose } from "react-icons/io5";
import { FaHouse, FaTriangleExclamation, FaSpinner } from "react-icons/fa6";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorHandler";

function Login({ isOpen, onClose, setShowSignup }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser, getCurrentUser } = useAuth();

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ text: "", isError: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.status === 200) {
        const data = response.data?.data;
        if (data?.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }
        if (data?.user) {
          setUser(data.user);
        } else if (getCurrentUser) {
          await getCurrentUser();
        }
        onClose();
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError(getErrorMessage(err, "Login failed. Please check your credentials and try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setForgotMsg({ text: "Please enter your registered email address.", isError: true });
      return;
    }
    setForgotMsg({ text: "", isError: false });
    setLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.status === 200) {
        setForgotMsg({ text: "Password reset link sent to your email.", isError: false });
      }
    } catch (err) {
      console.error("Error during password reset:", err);
      setForgotMsg({ text: getErrorMessage(err, "Failed to send reset email."), isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-xl text-gray-500 hover:text-black p-1"
          aria-label="Close"
        >
          <IoClose />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="hidden flex-col justify-center bg-gray-50 p-8 md:p-10 md:flex">
            <div className="flex h-16 w-16 items-center justify-center bg-[#009587]">
              <FaHouse className="text-3xl text-white" />
            </div>

            <h2 className="mt-8 text-2xl font-bold text-gray-800">
              Welcome to Rentosphere
            </h2>

            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">✓ 100% Verified Rental Listings</li>
              <li className="flex items-center gap-2">✓ Direct Owner Connect — Zero Brokerage</li>
              <li className="flex items-center gap-2">✓ Instant HRA Tax Rent Receipts</li>
              <li className="flex items-center gap-2">✓ Track Rental Requests & Payments</li>
            </ul>
          </div>

          {forgotPasswordOpen ? (<>
            <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Forgot Password</h2>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                Enter your registered email address to receive a secure password reset link.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleForgotPassword}>
                {forgotMsg.text && (
                  <div
                    className={`flex items-start gap-2 border p-3 text-xs ${
                      forgotMsg.isError
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    <FaTriangleExclamation className="mt-0.5 flex-shrink-0" />
                    <span>{forgotMsg.text}</span>
                  </div>
                )}

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  className="w-full border border-gray-300 px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-[#009587]"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (forgotMsg.text) setForgotMsg({ text: "", isError: false });
                  }}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#009587] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#007d70] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <FaSpinner className="animate-spin text-sm" />}
                  <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                </button>

                <p className="mt-6 text-center text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#009587] hover:underline"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setError("");
                  }}
                >
                  Back to Login
                </button>
              </p>
              </form>
            </div>
          </>) : (<>
            <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Account Login</h2>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                Enter your credentials to access your properties, applications, and payments.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                {error && (
                  <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <FaTriangleExclamation className="mt-0.5 flex-shrink-0 text-red-500" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  className="w-full border border-gray-300 px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-[#009587]"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  required
                />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  className="w-full border border-gray-300 px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-[#009587]"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#009587] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#007d70] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <FaSpinner className="animate-spin text-sm" />}
                  <span>{loading ? "Logging in..." : "Login"}</span>
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Forgot your password?</span>
                <button
                  type="button"
                  className="font-semibold text-[#009587] hover:underline"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Reset Password
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#009587] hover:underline"
                  onClick={() => {
                    onClose();
                    setShowSignup(true);
                  }}
                >
                  Sign up free
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
