import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHouse,
  FaMagnifyingGlass,
  FaPlus,
  FaCreditCard,
  FaUser,
} from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav({ setShowLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  // Do not show bottom nav on property details page (which has its own sticky booking/contact bar)
  if (location.pathname.startsWith("/property/")) {
    return null;
  }

  const navItems = [
    {
      id: "home",
      label: "Explore",
      icon: FaHouse,
      path: "/",
      isActive: location.pathname === "/",
    },
    {
      id: "search",
      label: "Search",
      icon: FaMagnifyingGlass,
      path: "/search",
      isActive: location.pathname === "/search",
    },
    {
      id: "post",
      label: "Post Ad",
      icon: FaPlus,
      path: "/post-property",
      isActive: location.pathname === "/post-property",
      isPrimary: true,
    },
    {
      id: "pay",
      label: "Pay Rent",
      icon: FaCreditCard,
      path: "/pay-fee",
      isActive: location.pathname === "/pay-fee",
    },
    {
      id: "account",
      label: user ? "Account" : "Log In",
      icon: FaUser,
      path: "/profile",
      isActive: location.pathname.startsWith("/profile"),
      requiresAuth: true,
    },
  ];

  const handleNav = (item) => {
    if (item.requiresAuth && !user) {
      setShowLogin(true);
      return;
    }
    navigate(item.path);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-md border-t border-gray-200 lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item)}
                className="group flex flex-col items-center justify-center -mt-3 cursor-pointer select-none touch-manipulation"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center transition shadow-sm ${
                    item.isActive
                      ? "bg-[#007b70] text-white"
                      : "bg-[#009587] text-white group-active:scale-95"
                  }`}
                >
                  <Icon className="text-base" />
                </div>
                <span className="text-[10px] font-semibold text-[#009587] mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item)}
              className={`flex flex-1 flex-col items-center justify-center py-1 select-none touch-manipulation transition ${
                item.isActive
                  ? "text-[#009587]"
                  : "text-gray-500 hover:text-gray-700 active:text-[#009587]"
              }`}
            >
              <Icon
                className={`text-base transition-transform ${
                  item.isActive ? "scale-110" : ""
                }`}
              />
              <span
                className={`mt-1 text-[10px] tracking-tight ${
                  item.isActive ? "font-bold text-[#009587]" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
