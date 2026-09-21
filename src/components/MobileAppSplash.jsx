import { useState, useEffect } from "react";
import { FaHouse, FaLocationDot, FaShieldHalved } from "react-icons/fa6";

const SPLASH_SESSION_KEY = "rentosphere_mobile_webapp_splash_shown";

/**
 * Checks whether the current runtime environment is a mobile device AND in standalone webapp / PWA form.
 */
function checkIsMobileWebApp() {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  // Allow manual override for testing on any device/viewport (?splash=true, ?pwa=true, or ?mode=standalone)
  if (
    urlParams.get("splash") === "true" ||
    urlParams.get("pwa") === "true" ||
    urlParams.get("mode") === "standalone"
  ) {
    return true;
  }

  // 1. Must be a mobile viewport or mobile device
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (!isMobile) return false;

  // 2. Must be in standalone webapp form (installed PWA / Add to Home Screen)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.navigator.standalone === true ||
    document.referrer.includes("android-app://");

  return isStandalone;
}

export default function MobileAppSplash() {
  const [shouldRender, setShouldRender] = useState(false);
  const [phase, setPhase] = useState("enter"); // "enter" | "active" | "exit" | "done"
  const [progress, setProgress] = useState(15);
  const [statusMessage, setStatusMessage] = useState("Initializing Zero Brokerage Platform...");

  useEffect(() => {
    const isWebApp = checkIsMobileWebApp();
    if (!isWebApp) return;

    // Check if splash was already presented in this active session
    const urlParams = new URLSearchParams(window.location.search);
    const forceSplash = urlParams.get("splash") === "true";
    const alreadyShown = sessionStorage.getItem(SPLASH_SESSION_KEY);

    if (alreadyShown && !forceSplash) {
      return;
    }

    // Mark as shown for the current session
    sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
    setShouldRender(true);

    // Choreographed animation timeline (~1.9 seconds total)
    const t1 = setTimeout(() => {
      setPhase("active");
      setProgress(60);
      setStatusMessage("Connecting to Verified Listings...");
    }, 450);

    const t2 = setTimeout(() => {
      setProgress(100);
      setStatusMessage("Welcome to Rentosphere");
    }, 1250);

    const t3 = setTimeout(() => {
      setPhase("exit");
    }, 1650);

    const t4 = setTimeout(() => {
      setPhase("done");
      setShouldRender(false);
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Allow user to tap/click to dismiss splash instantly if desired
  const handleFastForward = () => {
    setPhase("exit");
    setTimeout(() => {
      setPhase("done");
      setShouldRender(false);
    }, 250);
  };

  if (!shouldRender || phase === "done") {
    return null;
  }

  const isExiting = phase === "exit";

  return (
    <div
      onClick={handleFastForward}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#003830] via-[#004d40] to-[#002620] px-6 py-12 select-none transition-all duration-500 ease-out cursor-pointer ${
        isExiting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        paddingTop: "max(3rem, env(safe-area-inset-top))",
        paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
      }}
      role="dialog"
      aria-label="Rentosphere Starting Screen"
    >
      {/* Background Architectural Grid Lines */}
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#009587" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Subtle Radial Atmosphere Light */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(0, 210, 190, 0.22) 0%, rgba(0, 77, 64, 0.05) 70%, transparent 100%)",
        }}
      />

      {/* Top Header Pill */}
      <div
        className={`flex items-center gap-2 border border-teal-500/30 bg-teal-950/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-teal-300 backdrop-blur-md transition-all duration-700 ${
          phase === "enter" ? "translate-y-[-10px] opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d2be]"></span>
        </span>
        <span>Mobile App Edition</span>
      </div>

      {/* Center Hero: Animated Emblem + Brand Title */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Animated Radar Pulse Rings */}
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute h-36 w-36 rounded-none border border-[#009587]/30 transition-all duration-1000 ${
              phase === "enter" ? "scale-50 opacity-0" : "scale-100 opacity-100"
            }`}
          />
          <div
            className={`absolute h-48 w-48 rounded-none border border-teal-500/20 transition-all duration-1000 delay-150 ${
              phase === "enter" ? "scale-75 opacity-0" : "scale-100 opacity-100"
            }`}
          />

          {/* Core Brand Square Emblem */}
          <div
            className={`relative flex h-20 w-20 items-center justify-center border-2 border-teal-400/80 bg-gradient-to-br from-[#009587] to-[#00695c] text-white shadow-2xl shadow-teal-900/60 transition-all duration-700 ease-out ${
              phase === "enter" ? "scale-75 opacity-0 rotate-[-8deg]" : "scale-100 opacity-100 rotate-0"
            }`}
          >
            {/* Animated SVG Home Roof and Structure */}
            <svg
              viewBox="0 0 48 48"
              className="h-11 w-11 fill-none stroke-white"
              strokeWidth="3.2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              {/* Roof Triangle */}
              <path
                d="M 6 23 L 24 7 L 42 23"
                className={`transition-all duration-700 delay-200 ${
                  phase === "enter" ? "stroke-dasharray-[100] stroke-dashoffset-[100]" : "stroke-dashoffset-0"
                }`}
              />
              {/* Body Box */}
              <path d="M 12 21 L 12 39 L 36 39 L 36 21" />
              {/* Door */}
              <path d="M 20 39 L 20 27 L 28 27 L 28 39" fill="rgba(255,255,255,0.25)" />
              {/* Chimney */}
              <path d="M 33 14 L 33 11 L 37 11 L 37 18" />
            </svg>
          </div>
        </div>

        {/* Brand Name with Reveal Animation */}
        <div
          className={`mt-6 text-center transition-all duration-700 delay-200 ${
            phase === "enter" ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white drop-shadow-md">
            Rentosphere
          </h1>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="h-[1px] w-6 bg-teal-400/40"></span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-300/90">
              Zero Brokerage Rentals
            </p>
            <span className="h-[1px] w-6 bg-teal-400/40"></span>
          </div>
        </div>

        {/* Trust Badges Minimal Row */}
        <div
          className={`mt-5 flex items-center gap-4 text-[10px] text-teal-200/80 transition-all duration-700 delay-300 ${
            phase === "enter" ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="flex items-center gap-1">
            <FaShieldHalved className="text-teal-400 text-xs" /> 100% Direct Owners
          </span>
          <span className="text-teal-600">•</span>
          <span className="flex items-center gap-1">
            <FaLocationDot className="text-teal-400 text-xs" /> Verified Locations
          </span>
        </div>
      </div>

      {/* Bottom Progress Bar & Loading Status */}
      <div className="w-full max-w-[260px] flex flex-col items-center gap-2.5 z-10">
        {/* Sleek Progress Track */}
        <div className="h-1 w-full overflow-hidden bg-teal-950/70 border border-teal-500/20">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-[#00d2be] to-emerald-300 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Live Status Message */}
        <div className="flex items-center justify-between w-full text-[10px] text-teal-300/80 font-mono tracking-wider">
          <span className="truncate">{statusMessage}</span>
          <span className="text-teal-400 font-bold ml-2">{progress}%</span>
        </div>

        <p className="text-[9px] text-teal-400/50 mt-1 uppercase tracking-widest">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
