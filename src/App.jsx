import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import WebAppSplashAnimation from "./components/WebAppSplashAnimation";

// Route-based code splitting with React.lazy
const SearchResults = lazy(() => import("./pages/SearchResults"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const PostProperty = lazy(() => import("./pages/PostProperty"));
const Profile = lazy(() => import("./pages/Profile"));
const PayRent = lazy(() => import("./pages/PayRent"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Supporting pages
const AboutUs = lazy(() => import("./pages/supporting pages/AboutUs"));
const FAQ = lazy(() => import("./pages/supporting pages/FAQ"));
const PrivacyPolicy = lazy(() => import("./pages/supporting pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/supporting pages/Terms"));
const ContactUs = lazy(() => import("./pages/supporting pages/ContactUs"));

const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[#009587] shadow-xs">
      <div className="h-3.5 w-3.5 animate-spin border-2 border-[#009587] border-t-transparent"></div>
      <span>Loading page...</span>
    </div>
  </div>
);

function App() {
  return (
    <>
      <WebAppSplashAnimation />
      <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
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
    </Suspense>
    </>
  );
}

export default App;
