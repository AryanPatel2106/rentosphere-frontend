import { useState, useEffect } from "react";
import { FaHouse } from "react-icons/fa6";

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
  const [stage, setStage] = useState("bouncing"); // "bouncing" | "name_reveal" | "ready" | "exit" | "done"

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

    // Timeline:
    // 0ms -> 700ms: Logo drops from top and bounces into frame
    // 700ms -> 1300ms: Logo settles, app name & tagline animate in
    // 1600ms -> 1950ms: Smooth fade-out transition, opening the webapp
    const tName = setTimeout(() => {
      setStage("name_reveal");
    }, 700);

    const tReady = setTimeout(() => {
      setStage("ready");
    }, 1300);

    const tExit = setTimeout(() => {
      setStage("exit");
    }, 1750);

    const tDone = setTimeout(() => {
      setStage("done");
      setShouldRender(false);
    }, 2100);

    return () => {
      clearTimeout(tName);
      clearTimeout(tReady);
      clearTimeout(tExit);
      clearTimeout(tDone);
    };
  }, []);

  // Allow user to tap/click to dismiss splash instantly if desired
  const handleFastForward = () => {
    setStage("exit");
    setTimeout(() => {
      setStage("done");
      setShouldRender(false);
    }, 250);
  };

  if (!shouldRender || stage === "done") {
    return null;
  }

  const isExiting = stage === "exit";

  return (
    <>
      <style>{`
        @keyframes rentosphereBounceIn {
          0% {
            opacity: 0;
            transform: translateY(-240px) scale(0.6);
          }
          45% {
            opacity: 1;
            transform: translateY(0) scale(1.18, 0.82);
          }
          60% {
            transform: translateY(-38px) scale(0.92, 1.08);
          }
          75% {
            transform: translateY(0) scale(1.08, 0.94);
          }
          88% {
            transform: translateY(-12px) scale(0.98, 1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1, 1);
          }
        }

        @keyframes rentosphereShadowPulse {
          0% {
            opacity: 0;
            transform: scale(0.2);
          }
          45% {
            opacity: 0.6;
            transform: scale(1.15);
          }
          60% {
            opacity: 0.25;
            transform: scale(0.7);
          }
          75% {
            opacity: 0.5;
            transform: scale(1.05);
          }
          88% {
            opacity: 0.35;
            transform: scale(0.9);
          }
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
        }

        @keyframes rentosphereFadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-logo-bounce {
          animation: rentosphereBounceIn 0.75s cubic-bezier(0.28, 0.84, 0.42, 1) forwards;
        }

        .animate-shadow-bounce {
          animation: rentosphereShadowPulse 0.75s cubic-bezier(0.28, 0.84, 0.42, 1) forwards;
        }

        .animate-name-reveal {
          animation: rentosphereFadeSlideUp 0.5s ease-out forwards;
        }
      `}</style>

      <div
        onClick={handleFastForward}
        className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-white text-gray-900 select-none cursor-pointer transition-opacity duration-350 ease-out ${
          isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          paddingTop: "max(3rem, env(safe-area-inset-top))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
        role="dialog"
        aria-label="Rentosphere Webapp Starting Screen"
      >
        {/* Top subtle bar to match original webpage */}
        <div className="w-full flex justify-center pt-2">
          <div className="h-1 w-12 bg-gray-200" />
        </div>

        {/* Center: Bouncing Logo and Name Reveal */}
        <div className="flex flex-col items-center justify-center my-auto px-4">
          {/* Logo & Drop Shadow Container */}
          <div className="relative flex flex-col items-center">
            {/* The Original Rentosphere Teal Square Logo */}
            <div className="animate-logo-bounce flex h-20 w-20 items-center justify-center bg-[#009587] text-white shadow-xl shadow-[#009587]/25">
              <FaHouse className="text-3xl text-white drop-shadow-sm" />
            </div>

            {/* Dynamic Ground Shadow that reacts to the bounce */}
            <div className="animate-shadow-bounce mt-3 h-2.5 w-16 rounded-full bg-gray-400/30 blur-[2px]" />
          </div>

          {/* App Name & Tagline: Reveals right after logo bounces in */}
          <div className="mt-6 flex flex-col items-center text-center min-h-[70px]">
            {stage !== "bouncing" && (
              <div className="animate-name-reveal flex flex-col items-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-none">
                  Rentosphere
                </h1>
                <p className="text-xs uppercase tracking-widest text-[#009587] font-bold mt-1.5">
                  Zero Brokerage Rentals
                </p>

                {/* Subtle loading indicator line */}
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#009587] animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#009587] animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#009587] animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom indicator matching the webpage design */}
        <div className="flex flex-col items-center pb-2 text-[11px] text-gray-400 tracking-wider uppercase font-medium">
          <span>Direct Owner Rentals</span>
        </div>
      </div>
    </>
  );
}
