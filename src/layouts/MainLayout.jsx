import { Outlet } from "react-router-dom";
import { useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Login from "../components/Login";
import Signup from "../components/Signup";
import MobileBottomNav from "../components/MobileBottomNav";

function MainLayout() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-100 pb-16 lg:pb-0">
      {/* Navbar always above page content */}
      <div className="sticky top-0 z-50">
        <Navbar
          setShowSignup={setShowSignup}
          showSignup={showSignup}
          setShowLogin={setShowLogin}
          showLogin={showLogin}
        />
      </div>

      <Outlet
        context={{
          showSignup,
          setShowSignup,
          showLogin,
          setShowLogin,
        }}
      />

      <Footer />

      {/* App-like Bottom Navigation for Mobile */}
      <MobileBottomNav setShowLogin={setShowLogin} />

      {/* Modals — rendered at the layout level so they work on every page */}
      <Login
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        setShowSignup={setShowSignup}
      />
      <Signup
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        setShowLogin={setShowLogin}
      />
    </div>
  );
}

export default MainLayout;
