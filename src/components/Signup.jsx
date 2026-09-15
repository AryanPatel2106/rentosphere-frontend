import { IoClose } from "react-icons/io5";
import { FaHouse } from "react-icons/fa6";
import { useState } from "react";
import api from "../services/api";
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function Signup({ isOpen, onClose, setShowLogin }) {
  const [step, setStep] = useState(1); // 1: Email, 2: Token, 3: Set Password
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/auth/register", { email });
      if (response.status === 200) {
        setStep(2);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "Registration failed. The email might already be registered or invalid."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg("Please enter the verification code sent to your email.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/auth/verify-email", { email, token });
      if (response.status === 200) {
        setStep(3);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "Invalid or expired verification token. Please check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/auth/create-user", {
        token,
        password,
        confirmPassword,
      });
      if (response.status === 201) {
        onClose();
        setShowLogin(true);
      }
    } catch (error) {
      console.error("Error during setting password:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
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
              Join Rentosphere Today
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
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Step {step} of 3
              </span>
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <FaExclamationCircle className="text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 1 && (
              <>
                <p className="mt-1.5 text-xs text-gray-500">
                  Enter your email address to receive a verification code.
                </p>

                <form className="mt-6" onSubmit={handleRegister}>
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
                    disabled={loading}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 font-medium text-sm text-white transition hover:bg-red-600 disabled:opacity-60 cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Sending verification code...</span>
                      </>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <p className="mt-1.5 text-xs text-gray-500">
                  We sent a verification token to <strong className="text-gray-800">{email}</strong>. Enter it below:
                </p>

                <form className="mt-6" onSubmit={handleVerifyEmail}>
                  <label className="block text-xs font-semibold text-gray-700">Verification Token</label>
                  <input
                    type="text"
                    required
                    placeholder="Paste your token from email"
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#009587] focus:ring-1 focus:ring-[#009587]"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 font-medium text-sm text-white transition hover:bg-red-600 disabled:opacity-60 cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      "Verify Token"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMsg("");
                    }}
                    className="mt-3 w-full text-center text-xs text-gray-500 hover:text-gray-700"
                  >
                    Wrong email? Click here to change
                  </button>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <p className="mt-1.5 text-xs text-gray-500">
                  Set a secure password for your new Rentosphere account.
                </p>

                <form className="mt-6" onSubmit={handleSetPassword}>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Password (min 6 characters)</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#009587] focus:ring-1 focus:ring-[#009587]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#009587] focus:ring-1 focus:ring-[#009587]"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 font-medium text-sm text-white transition hover:bg-red-600 disabled:opacity-60 cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-xs text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                className="font-semibold text-[#009587] hover:underline"
                onClick={() => {
                  onClose();
                  setShowLogin(true);
                }}
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
