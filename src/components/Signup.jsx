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
  const [sandboxNotice, setSandboxNotice] = useState("");

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
        const autoToken = response.data?.data?.token || response.data?.data?.otp;
        if (autoToken) {
          setToken(autoToken);
          setSandboxNotice(`Verification code: ${autoToken} (SES Sandbox mode - automatically filled)`);
        }
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
              Join Rentosphere
            </h2>

            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">✓ 100% Verified Rental Listings</li>
              <li className="flex items-center gap-2">✓ Direct Owner Connect — Zero Brokerage</li>
              <li className="flex items-center gap-2">✓ Instant HRA Tax Rent Receipts</li>
              <li className="flex items-center gap-2">✓ Track Rental Requests & Payments</li>
            </ul>
          </div>

          <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Create Account
            </h2>

            {error && (
              <div className="mt-4 flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <FaTriangleExclamation className="mt-0.5 flex-shrink-0 text-red-500" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {isRegistering && (
              <>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                  Enter your email address to get started
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-[#009587]"
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
                    className="w-full bg-[#009587] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#007d70] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <FaSpinner className="animate-spin text-sm" />}
                    <span>{loading ? "Sending verification..." : "Continue"}</span>
                  </button>
                </form>
              </>
            )}

            {isVerifyingEmail && (
              <>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                  A verification code has been sent to {email}.
                </p>

                {sandboxNotice && (
                  <div className="mt-3 border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800">
                    <p className="font-semibold">{sandboxNotice}</p>
                    <p className="mt-1 text-teal-600">The verification token has been auto-filled below so you can proceed immediately.</p>
                  </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={handleVerifyEmail}>
                  <input
                    type="text"
                    placeholder="Enter verification code / token"
                    className="w-full border border-gray-300 px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-[#009587]"
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
                    className="w-full bg-[#009587] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#007d70] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <FaSpinner className="animate-spin text-sm" />}
                    <span>{loading ? "Verifying..." : "Verify Email"}</span>
                  </button>
                </form>
              </>
            )}

            {isSettingPassword && (
              <>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                  Set your password to complete registration.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSetPassword}>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full border border-gray-300 px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-[#009587]"
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
                    className="w-full border border-gray-300 px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-[#009587]"
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
                    className="w-full bg-[#009587] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#007d70] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <FaSpinner className="animate-spin text-sm" />}
                    <span>{loading ? "Creating account..." : "Set Password"}</span>
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <span className="font-semibold">Terms & Conditions</span>
            </p>

            <p className="mt-6 text-center text-sm">
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
