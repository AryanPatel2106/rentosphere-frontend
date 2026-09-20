import { IoClose } from "react-icons/io5";
import { FaHouse, FaTriangleExclamation, FaSpinner } from "react-icons/fa6";
import { useState } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

function Signup({ isOpen, onClose, setShowLogin }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { email });
      if (response.status === 200) {
        setIsRegistering(false);
        setIsVerifyingEmail(true);
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError(getErrorMessage(err, "Registration failed. Please check your email and try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please enter the verification code sent to your email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-email", { email, token });
      if (response.status === 200) {
        setIsVerifyingEmail(false);
        setIsSettingPassword(true);
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setError(getErrorMessage(err, "Invalid or expired verification code."));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
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
    } catch (err) {
      console.error("Error during setting password:", err);
      setError(getErrorMessage(err, "Failed to set password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
          aria-label="Close"
        >
          <IoClose className="text-lg" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="hidden flex-col justify-center bg-slate-50/80 p-8 md:p-10 md:flex border-r border-slate-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-xs">
              <FaHouse className="text-2xl text-white" />
            </div>

            <h2 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">
              Join Rentosphere
            </h2>

            <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600 font-medium">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold">✓</span>
                <span>100% Verified Rental Listings</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold">✓</span>
                <span>Direct Owner Connect — Zero Brokerage</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold">✓</span>
                <span>Instant HRA Tax Rent Receipts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold">✓</span>
                <span>Track Rental Requests & Payments</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Create Account
            </h2>

            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                <FaTriangleExclamation className="mt-0.5 flex-shrink-0 text-rose-500" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {isRegistering && (
              <>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">
                  Enter your email address to get started
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 sm:py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-teal-600 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
                  >
                    {loading && <FaSpinner className="animate-spin text-sm" />}
                    <span>{loading ? "Sending verification..." : "Continue"}</span>
                  </button>
                </form>
              </>
            )}

            {isVerifyingEmail && (
              <>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">
                  A verification code has been sent to <span className="font-semibold text-slate-800">{email}</span>.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleVerifyEmail}>
                  <input
                    type="text"
                    placeholder="Enter verification code / token"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 sm:py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-teal-600 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
                  >
                    {loading && <FaSpinner className="animate-spin text-sm" />}
                    <span>{loading ? "Verifying..." : "Verify Email"}</span>
                  </button>
                </form>
              </>
            )}

            {isSettingPassword && (
              <>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">
                  Set your password to complete registration.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSetPassword}>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 sm:py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 sm:py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-teal-600 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
                  >
                    {loading && <FaSpinner className="animate-spin text-sm" />}
                    <span>{loading ? "Creating account..." : "Set Password"}</span>
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-xs text-slate-500">
              By continuing, you agree to our{" "}
              <span className="font-semibold text-slate-700">Terms & Conditions</span>
            </p>

            <p className="mt-4 text-center text-xs sm:text-sm text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                className="font-semibold text-teal-600 hover:text-teal-700 hover:underline"
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
