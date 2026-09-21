import { useState, useEffect, useCallback } from "react";
import { FaHouse } from "react-icons/fa6";

/**
 * Native-feeling starting animation shown exclusively when:
 * 1. The user is on a mobile device/viewport (<= 768px or mobile UA)
 * 2. The app is launched in WebApp form (PWA standalone, iOS Home Screen standalone, TWA, or ?webapp=true)
 */
export default function WebAppSplashAnimation() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const dismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setShouldRender(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const hasOverride =
      searchParams.get("webapp") === "true" ||
      searchParams.get("pwa") === "true" ||
      searchParams.get("mode") === "standalone";

    // 1. Mobile Detection (viewport <= 768px or mobile UA)
    const isMobileViewport = window.innerWidth <= 768;
    const isMobileUA =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
        navigator.userAgent
      );
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

    const isMobile = isMobileViewport && (isMobileUA || isTouch || isMobileViewport);

    // 2. WebApp Form Detection
    // Standard W3C PWA standalone (Android / Chrome / Edge)
    const isStandaloneDisplay =
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches;

    // iOS Safari Home Screen standalone mode
    const isIOSStandalone =
      window.navigator && window.navigator.standalone === true;

    // Minimal-UI or fullscreen display mode
    const isMinimalUI =
      window.matchMedia &&
      (window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches);

    // Android Trusted Web Activity (TWA)
    const isAndroidTWA =
      typeof document !== "undefined" &&
      document.referrer &&
      document.referrer.includes("android-app://");

    const isWebAppForm =
      isStandaloneDisplay ||
      isIOSStandalone ||
      isMinimalUI ||
      isAndroidTWA ||
      hasOverride;

    // Only run on mobile AND when in webapp form
    if (!isMobile || !isWebAppForm) {
      return;
    }

    // Ensure it only plays once per webapp session so route changes don't re-trigger it
    const alreadyShown = sessionStorage.getItem("rentosphere_webapp_splash_seen");
    if (alreadyShown && !hasOverride) {
      return;
    }

    sessionStorage.setItem("rentosphere_webapp_splash_seen", "true");
    setShouldRender(true);

    // Auto-dismiss timeline: 1900ms play, 500ms exit fade
    const timer = setTimeout(() => {
      dismiss();
    }, 1900);

    return () => clearTimeout(timer);
  }, [dismiss]);

  if (!shouldRender) return null;

  return (
    <div
      onClick={dismiss}
      onTouchStart={dismiss}
      role="presentation"
      aria-label="Rentosphere launch screen"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between select-none overflow-hidden bg-gradient-to-b from-[#00362f] via-[#004d40] to-[#00221c] transition-all duration-500 ease-out ${
        isExiting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-[#009587]/20 blur-3xl" />

      {/* Top spacing safe area */}
      <div className="pt-[max(32px,env(safe-area-inset-top))]" />

      {/* Center Emblem & Brand */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Pulsating Logo Container */}
        <div className="relative flex items-center justify-center">
          {/* Animated Outward Expanding Ripple */}
          <div
            className="absolute h-24 w-24 rounded-2xl border-2 border-emerald-400/30"
            style={{ animation: "splash-ripple 2s infinite ease-out" }}
          />

          {/* Core Brand Icon Box */}
          <div
            className="relative flex h-20 w-20 items-center justify-center bg-[#009587] text-white shadow-2xl shadow-emerald-950/70"
            style={{ animation: "splash-pulse 2s infinite ease-in-out" }}
          >
            <FaHouse className="text-4xl text-white drop-shadow-md" />
          </div>
        </div>

        {/* Brand Name */}
        <h1
          className="mt-6 text-3xl font-extrabold tracking-tight text-white drop-shadow-sm"
          style={{ animation: "splash-fade-up 0.7s ease-out forwards" }}
        >
          Rentosphere
        </h1>

        {/* Brand Tagline Badge */}
        <div
          className="mt-2.5 inline-flex items-center gap-2 border border-emerald-600/40 bg-[#00332a]/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-xs"
          style={{ animation: "splash-fade-up 0.9s ease-out forwards" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Zero Brokerage Rentals</span>
        </div>
      </div>

      {/* Bottom Progress Bar & Safe Area */}
      <div className="relative z-10 flex flex-col items-center pb-[max(28px,env(safe-area-inset-bottom))] px-6 w-full">
        {/* Sleek Progress Line */}
        <div className="h-1 w-44 overflow-hidden rounded-full bg-emerald-950/90 border border-emerald-800/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#009587] via-emerald-400 to-[#00bfa5]"
            style={{
              animation: "splash-loader 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          />
        </div>

        {/* Footer Subtext */}
        <p className="mt-2.5 text-[10px] font-medium uppercase tracking-widest text-emerald-400/80">
          Starting WebApp...
        </p>
      </div>
    </div>
  );
}
