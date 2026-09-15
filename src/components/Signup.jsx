import { IoClose } from "react-icons/io5";
import { FaHouse } from "react-icons/fa6";
import { useState } from "react";
import api from "../services/api";

function Signup({ isOpen, onClose, setShowLogin }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/register", { email });
      if (response.status === 200) {
        setIsRegistering(false);
        setIsVerifyingEmail(true);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/verify-email", { email, token });
      if (response.status === 200) {
        setIsVerifyingEmail(false);
        setIsSettingPassword(true);
      }
    } catch (error) {
      console.error("Error during verification:", error);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
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
    }
  };

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

          <div className="flex flex-col justify-center p-8 md:p-10">
            <h2 className="text-3xl font-semibold text-gray-800">
              Create Account
            </h2>
            {isRegistering && (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  Enter your email to continue
                </p>

                <form className="mt-8" onSubmit={handleRegister}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="mt-6 w-full bg-red-500 py-3 font-medium text-white transition hover:bg-red-600"
                  >
                    Continue
                  </button>
                </form>
              </>
            )}

            {isVerifyingEmail && (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  A verification link has been sent to your email.
                </p>

                <form className="mt-8" onSubmit={handleVerifyEmail}>
                  <input
                    type="text"
                    placeholder="Enter verification token"
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587]"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="mt-6 w-full bg-red-500 py-3 font-medium text-white transition hover:bg-red-600"
                  >
                    Verify Email
                  </button>
                </form>
              </>
            )}

            {isSettingPassword && (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  Set your password to complete registration.
                </p>

                <form className="mt-8" onSubmit={handleSetPassword}>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="mt-4 w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="mt-6 w-full bg-red-500 py-3 font-medium text-white transition hover:bg-red-600"
                  >
                    Set Password
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
