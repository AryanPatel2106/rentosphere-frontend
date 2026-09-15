import { useState, useRef, useEffect } from "react";
import { FaBars, FaTimes, FaSearch, FaUserCircle, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar({ setShowLogin, setShowSignup }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  const isLoggedIn = !!user;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="group flex cursor-pointer items-center gap-2.5 transition"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#009587] to-[#007066] shadow-sm transition group-hover:scale-105">
            <FaHouse className="text-base text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">
              Rent<span className="text-[#009587]">osphere</span>
            </h1>
            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
              Zero Brokerage
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => navigate("/search")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
          >
            <FaSearch className="text-xs text-teal-600" />
            <span>Browse Homes</span>
          </button>

          <button
            onClick={() => {
              if (isLoggedIn) {
                navigate("/post-property");
              } else {
                setShowLogin(true);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-[#009587] px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-[#007d70]"
          >
            <FaPlus className="text-xs" />
            <span>Post Free Ad</span>
          </button>

          {isLoggedIn ? (
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-3 transition hover:border-teal-500 hover:shadow-xs"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800 text-sm">
                  {userInitial}
                </div>
                <span className="max-w-[100px] truncate text-xs font-semibold text-gray-700">
                  {user.name || user.email?.split("@")[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="border-b border-gray-100 px-4 py-2.5">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {user.name || "Rentosphere User"}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <FaUserCircle className="text-gray-400" />
                    <span>My Dashboard & Ads</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate("/post-property");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <FaPlus className="text-xs text-gray-400" />
                    <span>Post New Property</span>
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Log in
              </button>

              <button
                onClick={() => setShowSignup(true)}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-red-600"
              >
                Sign up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => navigate("/search")}
            aria-label="Search"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <FaSearch className="text-base" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-gray-200 bg-white px-4 pt-2 pb-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/");
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaHouse className="text-teal-600" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/search");
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaSearch className="text-teal-600" />
              <span>Browse All Properties</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isLoggedIn) navigate("/post-property");
                else setShowLogin(true);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-teal-700 bg-teal-50/60 hover:bg-teal-50"
            >
              <FaPlus className="text-teal-600" />
              <span>Post Your Property (Free)</span>
            </button>

            {isLoggedIn ? (
              <>
                <div className="my-2 border-t border-gray-100"></div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaUserCircle className="text-gray-500" />
                  <span>My Profile & Listings</span>
                </button>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt className="text-red-500" />
                  <span>Log Out ({user?.email})</span>
                </button>
              </>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogin(true);
                  }}
                  className="rounded-lg border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowSignup(true);
                  }}
                  className="rounded-lg bg-red-500 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
