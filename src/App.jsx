import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";

import Profile from "./pages/Profile";

import SearchResults from "./pages/SearchResults";

import ResetPassword from "./pages/ResetPassword";

import PostProperty from "./pages/PostProperty";

import { ProtectedRoute } from "./components/ProtectedRoute";

// Supporting pages
import AboutUs from "./pages/supporting pages/AboutUs";
import FAQ from "./pages/supporting pages/FAQ";
import PrivacyPolicy from "./pages/supporting pages/PrivacyPolicy";
import Terms from "./pages/supporting pages/Terms";
import ContactUs from "./pages/supporting pages/ContactUs";
import PayRent from "./pages/PayRent";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/pay-fee" element={<PayRent />} />
        <Route path="/pay-rent" element={<PayRent />} />

        {/* Quick Links */}
        <Route path="/about" element={<AboutUs />} />

        {/* Support Links */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<ContactUs />} />
      </Route>

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<Profile />} />
        <Route path="/post-property" element={<PostProperty />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
