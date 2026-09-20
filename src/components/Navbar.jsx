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
  const { user, logout } = useAuth() || {};
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
    <header className="relative w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* ── Brand Logo ───────────────────────────────────────────────── */}
        <div
          className="flex cursor-pointer items-center gap-2.5 select-none"
          onClick={() => navigate("/")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <FaHouse className="text-sm" />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              Rentosphere
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
              Zero Brokerage Rentals
            </p>
          </div>
        </div>

        {/* ── Desktop Navigation & Top-Right Actions ────────────────────── */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Pay Rent Quick Action */}
          <button
            onClick={() => navigate("/pay-fee")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition shadow-xs"
          >
            <FaCreditCard className="text-teal-600 text-xs" />
            <span>Pay Rent</span>
          </button>

          {/* Post Property Quick Action */}
          <button
            onClick={() => {
              isLoggedIn
                ? navigate("/post-property")
                : props.setShowSignup(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition shadow-xs"
          >
            <FaPlus className="text-xs" />
            <span>Post Property Free</span>
          </button>

          {/* User Auth Buttons or Profile Chip */}
          {isLoggedIn ? (
            <button
              onClick={() => handleNavigate("/profile")}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 hover:border-teal-300 hover:bg-teal-50/50 transition shadow-xs"
              title="Go to Account Dashboard"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold">
                {userInitial}
              </div>
              <span className="max-w-[120px] truncate font-semibold text-slate-800">
                {displayName}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-2">
              <button
                onClick={() => props.setShowLogin(true)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 transition"
              >
                Log In
              </button>

              <button
                onClick={() => props.setShowSignup(true)}
                className="rounded-full border border-teal-600 bg-white px-3.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition shadow-xs"
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
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                menuIsOpen
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                {/* User Header / Guest Banner */}
                {isLoggedIn ? (
                  <div className="border-b border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white text-base font-bold flex-shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {user?.email || "Signed in"}
                        </p>
                        <span className="inline-block mt-1 bg-teal-50 text-teal-700 border border-teal-200/60 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
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

        {/* ── Mobile Header Actions ──────────────────────────────────── */}
        <div className="flex items-center gap-2 lg:hidden" ref={mobileMenuRef}>
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/profile")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold transition active:scale-95 shadow-xs"
              title="My Account"
            >
              {userInitial}
            </button>
          ) : (
            <button
              onClick={() => props.setShowLogin(true)}
              className="rounded-full border border-teal-600 bg-white px-3 py-1 text-xs font-semibold text-teal-700 active:bg-teal-50 shadow-xs"
            >
              Log In
            </button>
          )}

          <button
            onClick={() => setMenuIsOpen(!menuIsOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs transition ${
              menuIsOpen
                ? "border-teal-600 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-700 active:bg-slate-50"
            }`}
            aria-label="Toggle menu"
          >
            {menuIsOpen ? <FaXmark className="text-sm" /> : <FaBars className="text-xs" />}
          </button>

          {/* ── Mobile Dropdown Menu ───────────────────────────────────── */}
          {menuIsOpen && (
            <div className="absolute left-0 right-0 top-full border-b border-slate-200/80 bg-white shadow-2xl z-50 max-h-[calc(100vh-60px)] overflow-y-auto rounded-b-2xl">
              {/* User Header / Guest Banner */}
              {isLoggedIn ? (
                <div className="border-b border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white font-bold shadow-xs">
                      {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-b border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-900">Welcome to Rentosphere</p>
                  <p className="text-xs text-slate-500 mt-0.5">Find verified rentals with zero brokerage.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMenuIsOpen(false);
                        props.setShowLogin(true);
                      }}
                      className="rounded-xl bg-teal-600 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 shadow-xs"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setMenuIsOpen(false);
                        props.setShowSignup(true);
                      }}
                      className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs"
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
