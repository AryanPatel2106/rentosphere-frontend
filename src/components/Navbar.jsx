import { useState, useEffect } from "react";
import { FaBars, FaRegCreditCard } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar(props) {
  const navigate = useNavigate();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const isLoggedIn = !!user;

  return (
    <header className="relative w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-3 lg:px-6">
        <div className="flex cursor-pointer items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#009587]">
            <FaHouse className="text-sm text-white" />
          </div>

          <h1 className="text-xl font-bold tracking-wide text-gray-800">
            Rentosphere
          </h1>
        </div>

        <div className="hidden items-center lg:flex">
          <button
            className="flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
            onClick={() => {
              isLoggedIn ? navigate("/pay-fee") : props.setShowSignup(true);
            }}
          >
            <FaRegCreditCard />
            <span className="text-xs">Pay Tuition Fee</span>
          </button>

          <button
            className="ml-3 bg-[#009587] px-4 py-1.5 text-sm text-white hover:bg-[#007d70]"
            onClick={() => {
              isLoggedIn
                ? navigate("/post-property")
                : props.setShowSignup(true);
            }}
          >
            Post Your Property
          </button>

          {isLoggedIn ? (
            <>
              <button
                className="ml-4 text-sm hover:text-red-500"
                onClick={() => navigate("/profile")}
              >
                <span className="text-sm">Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="ml-4 text-sm hover:text-red-500"
                onClick={() => props.setShowSignup(true)}
              >
                Sign up
              </button>

              <button
                className="ml-4 text-sm hover:text-red-500"
                onClick={() => props.setShowLogin(true)}
              >
                Log in
              </button>
            </>
          )}

          <button
            onClick={() => setMenuIsOpen(!menuIsOpen)}
            className="ml-4 flex items-center gap-1.5 text-sm"
          >
            <FaBars />
            <span>Menu</span>
          </button>
        </div>

        <button
          onClick={() => setMenuIsOpen(!menuIsOpen)}
          className="text-xl lg:hidden"
        >
          <FaBars />
        </button>
      </div>

      {menuIsOpen && (
        <div className="absolute right-0 z-50 mt-3 w-56 overflow-hidden border border-gray-200 bg-white shadow-xl">
          <button
            className="w-full px-5 py-3 text-left text-sm hover:bg-gray-100"
            onClick={() => {
              navigate("/");
            }}
          >
            Home
          </button>

          <button
            className="w-full px-5 py-3 text-left text-sm hover:bg-gray-100"
            onClick={() => {
              isLoggedIn ? navigate("/pay-fee") : props.setShowSignup(true);
            }}
          >
            Pay Tuition Fee
          </button>

          <button
            className="w-full px-5 py-3 text-left text-sm hover:bg-gray-100"
            onClick={() => {
              isLoggedIn
                ? navigate("/post-property")
                : props.setShowSignup(true);
            }}
          >
            Post Your Property
          </button>

          {isLoggedIn ? (
            <>
              <button
                className="w-full px-5 py-3 text-left text-sm hover:bg-gray-100"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>

              <button
                className="w-full px-5 py-3 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  logout();
                  setMenuIsOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  props.setShowSignup(true);
                  setMenuIsOpen(false);
                }}
                className="w-full px-5 py-3 text-left text-sm hover:bg-gray-100"
              >
                Sign up
              </button>

              <button
                className="w-full px-5 py-3 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  props.setShowLogin(true);
                  setMenuIsOpen(false);
                }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
