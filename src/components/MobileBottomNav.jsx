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
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 lg:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.05)] rounded-t-2xl"
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
                className="group flex flex-col items-center justify-center -mt-3.5 cursor-pointer select-none touch-manipulation"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition shadow-md ${
                    item.isActive
                      ? "bg-teal-700 text-white ring-2 ring-teal-700/20"
                      : "bg-teal-600 text-white group-active:scale-95 group-hover:bg-teal-700"
                  }`}
                >
                  <Icon className="text-base" />
                </div>
                <span className="text-[10px] font-semibold text-teal-700 mt-1">
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
                  ? "text-teal-700"
                  : "text-slate-500 hover:text-slate-800 active:text-teal-700"
              }`}
            >
              <div
                className={`flex items-center justify-center transition-all ${
                  item.isActive
                    ? "bg-teal-50 text-teal-700 rounded-full px-3 py-0.5"
                    : "p-0.5"
                }`}
              >
                <Icon
                  className={`text-base transition-transform ${
                    item.isActive ? "scale-105" : ""
                  }`}
                />
              </div>
              <span
                className={`mt-0.5 text-[10px] tracking-tight ${
                  item.isActive ? "font-bold text-teal-800" : "font-medium"
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
