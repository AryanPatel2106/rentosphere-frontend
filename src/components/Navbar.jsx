import { useState, useEffect, useRef } from "react";
import {
  FaHouse,
  FaBars,
  FaXmark,
  FaChevronDown,
  FaCreditCard,
  FaPlus,
  FaMagnifyingGlass,
  FaHeart,
  FaUser,
  FaHouseUser,
  FaFileLines,
  FaPhone,
  FaRightFromBracket,
  FaCircleQuestion,
} from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isLoggedIn = !!user;

  // Close menu on route change
  useEffect(() => {
    setMenuIsOpen(false);
  }, [location.pathname, location.search]);

  // Handle click outside and Escape key to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inDesktop =
        desktopMenuRef.current && desktopMenuRef.current.contains(event.target);
      const inMobile =
        mobileMenuRef.current && mobileMenuRef.current.contains(event.target);
      if (!inDesktop && !inMobile) {
        setMenuIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuIsOpen(false);
      }
    };

    if (menuIsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuIsOpen]);

  const handleNavigate = (path) => {
    setMenuIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setMenuIsOpen(false);
    await logout();
    navigate("/");
  };

  const userInitial = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : user?.email
    ? user.email.trim().charAt(0).toUpperCase()
    : "U";

  const displayName =
    user?.fullName || (user?.email ? user.email.split("@")[0] : "My Account");

  return (
    <header className="relative w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* ── Brand Logo ───────────────────────────────────────────────── */}
        <div
          className="flex cursor-pointer items-center gap-2.5 select-none"
          onClick={() => navigate("/")}
        >
          <div className="flex h-8 w-8 items-center justify-center bg-[#009587] text-white">
            <FaHouse className="text-sm" />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">
              Rentosphere
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-0.5">
              Zero Brokerage Rentals
            </p>
          </div>
        </div>

        {/* ── Desktop Navigation & Top-Right Actions ────────────────────── */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Pay Rent Quick Action */}
          <button
            onClick={() => navigate("/pay-fee")}
            className="flex items-center gap-2 border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition"
          >
            <FaCreditCard className="text-[#009587] text-xs" />
            <span>Pay Rent</span>
          </button>

          {/* Post Property Quick Action */}
          <button
            onClick={() => {
              isLoggedIn
                ? navigate("/post-property")
                : props.setShowSignup(true);
            }}
            className="flex items-center gap-1.5 bg-[#009587] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#007d70] transition"
          >
            <FaPlus className="text-xs" />
            <span>Post Property Free</span>
          </button>

          {/* User Auth Buttons or Profile Chip */}
          {isLoggedIn ? (
            <button
              onClick={() => handleNavigate("/profile")}
              className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-800 hover:border-teal-300 hover:bg-teal-50/50 transition"
              title="Go to Account Dashboard"
            >
              <div className="flex h-6 w-6 items-center justify-center bg-[#009587] text-white text-xs font-bold">
                {userInitial}
              </div>
              <span className="max-w-[120px] truncate font-semibold text-gray-800">
                {displayName}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-2">
              <button
                onClick={() => props.setShowLogin(true)}
                className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#009587] transition"
              >
                Log In
              </button>

              <button
                onClick={() => props.setShowSignup(true)}
                className="border border-[#009587] bg-white px-3 py-1.5 text-xs font-semibold text-[#009587] hover:bg-teal-50 transition"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Top-Right Menu Trigger */}
          <div className="relative" ref={desktopMenuRef}>
            <button
              type="button"
              onClick={() => setMenuIsOpen(!menuIsOpen)}
              className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                menuIsOpen
                  ? "border-[#009587] bg-teal-50 text-[#009587]"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}
              aria-expanded={menuIsOpen}
              aria-label="Toggle navigation menu"
            >
              <FaBars className="text-xs" />
              <span>Menu</span>
              <FaChevronDown
                className={`text-[10px] transition-transform duration-200 ${
                  menuIsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ── Desktop Dropdown Menu ───────────────────────────────── */}
            {menuIsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 border border-gray-300 bg-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* User Header / Guest Banner */}
                {isLoggedIn ? (
                  <div className="border-b border-gray-200 bg-gray-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#009587] text-white text-base font-bold flex-shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user?.email || "Signed in"}
                        </p>
                        <span className="inline-block mt-1 bg-teal-100 text-[#009587] border border-teal-200 px-1.5 py-0.2 text-[10px] font-bold uppercase">
                          Active Account
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-gray-200 bg-gray-50/80 p-4">
                    <p className="text-xs font-bold text-gray-900">
                      Welcome to Rentosphere
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Zero brokerage rentals & instant digital receipts.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setMenuIsOpen(false);
                          props.setShowLogin(true);
                        }}
                        className="bg-[#009587] py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#007d70] transition text-center"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => {
                          setMenuIsOpen(false);
                          props.setShowSignup(true);
                        }}
                        className="border border-gray-300 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition text-center"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}

                {/* Dropdown Menu Items */}
                <div className="max-h-[calc(100vh-180px)] overflow-y-auto py-2 divide-y divide-gray-100 text-xs">
                  {/* Category: Account & Activity (if logged in) */}
                  {isLoggedIn && (
                    <div className="py-1">
                      <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        My Rentals & Dashboard
                      </div>

                      <button
                        type="button"
                        onClick={() => handleNavigate("/profile?tab=basic")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                      >
                        <FaUser className="text-gray-400 text-xs w-4" />
                        <span>My Profile & Account</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate("/profile?tab=shortlists")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                      >
                        <FaHeart className="text-red-500 text-xs w-4" />
                        <span>Saved Properties</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate("/profile?tab=properties")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                      >
                        <FaHouse className="text-gray-400 text-xs w-4" />
                        <span>My Listed Properties</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate("/profile?tab=interested")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                      >
                        <FaFileLines className="text-amber-500 text-xs w-4" />
                        <span>Rental Applications</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate("/profile?tab=rented")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                      >
                        <FaHouseUser className="text-[#009587] text-xs w-4" />
                        <span>Active Tenancies</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate("/profile?tab=payments")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                      >
                        <FaCreditCard className="text-blue-500 text-xs w-4" />
                        <span>Rent Payments & Receipts</span>
                      </button>
                    </div>
                  )}

                  {/* Category: Property Discovery & Services */}
                  <div className="py-1">
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Explore & Services
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavigate("/search")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                    >
                      <FaMagnifyingGlass className="text-[#009587] text-xs w-4" />
                      <span>Search Rental Properties</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isLoggedIn) {
                          handleNavigate("/post-property");
                        } else {
                          setMenuIsOpen(false);
                          if (props.setShowSignup) props.setShowSignup(true);
                        }
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                    >
                      <FaPlus className="text-[#009587] text-xs w-4" />
                      <span>Post Property (Zero Brokerage)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate("/pay-fee")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                    >
                      <FaCreditCard className="text-[#009587] text-xs w-4" />
                      <span>Pay Rent Online (Razorpay)</span>
                    </button>
                  </div>

                  {/* Category: About & Support */}
                  <div className="py-1">
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Help & Information
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavigate("/about")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                    >
                      <FaHouse className="text-gray-400 text-xs w-4" />
                      <span>About Rentosphere</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate("/contact")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                    >
                      <FaPhone className="text-gray-400 text-xs w-4" />
                      <span>Contact Support</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate("/faq")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 hover:text-[#009587] transition cursor-pointer"
                    >
                      <FaCircleQuestion className="text-gray-400 text-xs w-4" />
                      <span>Frequently Asked Questions</span>
                    </button>
                  </div>

                  {/* Log Out Option (if logged in) */}
                  {isLoggedIn && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                      >
                        <FaRightFromBracket className="text-red-500 text-xs w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Hamburger Button ──────────────────────────────────── */}
        <div className="flex items-center gap-2 lg:hidden" ref={mobileMenuRef}>
          <button
            onClick={() => navigate("/pay-fee")}
            className="border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
            title="Pay Rent"
          >
            <FaCreditCard className="text-xs text-[#009587]" />
          </button>

          <button
            onClick={() => setMenuIsOpen(!menuIsOpen)}
            className={`flex h-9 w-9 items-center justify-center border text-sm transition ${
              menuIsOpen
                ? "border-[#009587] bg-teal-50 text-[#009587]"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
            aria-label="Toggle menu"
          >
            {menuIsOpen ? <FaXmark className="text-base" /> : <FaBars className="text-sm" />}
          </button>

          {/* ── Mobile Dropdown Menu ───────────────────────────────────── */}
          {menuIsOpen && (
            <div className="absolute left-0 right-0 top-full border-b border-gray-300 bg-white shadow-2xl z-50 max-h-[calc(100vh-60px)] overflow-y-auto">
              {/* User Header / Guest Banner */}
              {isLoggedIn ? (
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#009587] text-white font-bold">
                      {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-900">Welcome to Rentosphere</p>
                  <p className="text-xs text-gray-500 mt-0.5">Find verified rentals with zero brokerage.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMenuIsOpen(false);
                        props.setShowLogin(true);
                      }}
                      className="bg-[#009587] py-2 text-xs font-bold uppercase text-white hover:bg-[#007d70]"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setMenuIsOpen(false);
                        props.setShowSignup(true);
                      }}
                      className="border border-gray-300 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Nav Links */}
              <div className="divide-y divide-gray-100 text-xs">
                {isLoggedIn && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      My Account
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigate("/profile?tab=basic")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <FaUser className="text-gray-400 text-xs w-4" />
                      <span>My Profile & Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("/profile?tab=shortlists")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <FaHeart className="text-red-500 text-xs w-4" />
                      <span>Saved Properties</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("/profile?tab=properties")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <FaHouse className="text-gray-400 text-xs w-4" />
                      <span>My Listed Properties</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("/profile?tab=interested")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <FaFileLines className="text-amber-500 text-xs w-4" />
                      <span>Rental Applications</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("/profile?tab=rented")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <FaHouseUser className="text-[#009587] text-xs w-4" />
                      <span>Active Tenancies</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("/profile?tab=payments")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <FaCreditCard className="text-blue-500 text-xs w-4" />
                      <span>Rent Payments & Receipts</span>
                    </button>
                  </div>
                )}

                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Explore
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/search")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <FaMagnifyingGlass className="text-[#009587] text-xs w-4" />
                    <span>Search Properties</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isLoggedIn) {
                        handleNavigate("/post-property");
                      } else {
                        setMenuIsOpen(false);
                        if (props.setShowSignup) props.setShowSignup(true);
                      }
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <FaPlus className="text-[#009587] text-xs w-4" />
                    <span>Post Property Free</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/pay-fee")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <FaCreditCard className="text-[#009587] text-xs w-4" />
                    <span>Pay Rent Online</span>
                  </button>
                </div>

                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Support
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/about")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <FaHouse className="text-gray-400 text-xs w-4" />
                    <span>About Us</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/contact")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <FaPhone className="text-gray-400 text-xs w-4" />
                    <span>Contact Support</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/faq")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <FaCircleQuestion className="text-gray-400 text-xs w-4" />
                    <span>FAQ</span>
                  </button>
                </div>

                {isLoggedIn && (
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <FaRightFromBracket className="text-red-500 text-xs w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
