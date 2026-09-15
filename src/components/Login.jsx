import { IoClose } from "react-icons/io5";
import { FaHouse } from "react-icons/fa6";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function Login({ isOpen, onClose, setShowSignup }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState({ type: "", message: "" });
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.status === 200) {
        setUser(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error("Error during login:", error);
      const msg =
        error.response?.data?.message ||
        "Invalid email or password. Please check your credentials.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setForgotStatus({
        type: "error",
        message: "Please enter your registered email address.",
      });
      return;
    }
    setForgotLoading(true);
    setForgotStatus({ type: "", message: "" });
    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.status === 200) {
        setForgotStatus({
          type: "success",
          message: "Password reset link sent! Check your inbox or spam folder.",
        });
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to send reset link. Please verify your email and try again.";
      setForgotStatus({ type: "error", message: msg });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-black"
        >
          <IoClose className="text-xl" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left Hero Column */}
          <div className="hidden flex-col justify-center bg-gradient-to-br from-teal-50 via-emerald-50/40 to-teal-100/30 p-10 md:flex border-r border-gray-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#009587] shadow-md">
              <FaHouse className="text-3xl text-white" />
            </div>

            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
              Welcome back to Rentosphere
            </h2>

            <ul className="mt-6 space-y-3.5 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-teal-600 text-sm" /> Find verified rental homes
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-teal-600 text-sm" /> Contact owners directly
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-teal-600 text-sm" /> Save your favorite listings
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-teal-600 text-sm" /> 100% Zero Brokerage
              </li>
            </ul>
          </div>

          {/* Right Form Column */}
          {forgotPasswordOpen ? (
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <p className="mt-1.5 text-xs text-gray-500">
                Enter your registered email to receive a secure password reset link.
              </p>

              {forgotStatus.message && (
                <div
                  className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-xs ${
                    forgotStatus.type === "success"
                      ? "bg-teal-50 border border-teal-200 text-teal-800"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {forgotStatus.type === "success" ? (
                    <FaCheckCircle className="text-teal-600 mt-0.5 shrink-0" />
                  ) : (
                    <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0" />
                  )}
                  <span>{forgotStatus.message}</span>
                </div>
              )}

              <form className="mt-6" onSubmit={handleForgotPassword}>
                <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#009587] focus:ring-1 focus:ring-[#009587]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 font-medium text-sm text-white transition hover:bg-red-600 disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {forgotLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <p className="mt-6 text-center text-xs text-gray-600">
                  Remember your password?{" "}
                  <button
                    type="button"
                    className="font-semibold text-[#009587] hover:underline"
                    onClick={() => {
                      setForgotPasswordOpen(false);
                      setForgotStatus({ type: "", message: "" });
                    }}
                  >
                    Back to Login
                  </button>
                </p>
              </form>
            </div>
          ) : (
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
              <p className="mt-1.5 text-xs text-gray-500">
                Enter your credentials to access your account
              </p>

              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <FaExclamationCircle className="text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="mt-6" onSubmit={handleLogin}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#009587] focus:ring-1 focus:ring-[#009587]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-700">Password</label>
                    <button
                      type="button"
                      className="text-xs text-[#009587] hover:underline"
                      onClick={() => {
                        setErrorMsg("");
                        setForgotPasswordOpen(true);
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#009587] focus:ring-1 focus:ring-[#009587]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 font-medium text-sm text-white transition hover:bg-red-600 disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#009587] hover:underline"
                  onClick={() => {
                    onClose();
                    setShowSignup(true);
                  }}
                >
                  Create one now
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
