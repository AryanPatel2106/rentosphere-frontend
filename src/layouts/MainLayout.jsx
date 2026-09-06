import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

import Footer from "../components/Footer";

import { useState } from "react";

function MainLayout() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar
        setShowSignup={setShowSignup}
        showSignup={showSignup}
        setShowLogin={setShowLogin}
        showLogin={showLogin}
      />

      <Outlet
        context={{
          showSignup,
          setShowSignup,
          showLogin,
          setShowLogin,
        }}
      />

      <Footer />
    </div>
  );
}

export default MainLayout;
