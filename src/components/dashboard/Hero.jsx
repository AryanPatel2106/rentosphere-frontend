import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaHandHoldingUsd, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

const POPULAR_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Pune",
  "Chennai",
  "Hyderabad",
];

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-transparent pt-12 pb-6 px-4">
      {/* Background Decorative Blob */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl"></div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Zero Brokerage Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-teal-800 shadow-2xs backdrop-blur-xs">
          <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
          India's Smart Zero-Brokerage Discovery
        </div>

        {/* Main Headline */}
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Find Your Perfect Rental Home{" "}
          <span className="bg-gradient-to-r from-[#009587] to-teal-700 bg-clip-text text-transparent">
            Without Brokerage
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          Connect directly with verified property owners. Save thousands on commissions and move in with total peace of mind.
        </p>

        {/* Quick City Navigation Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <FaMapMarkerAlt className="text-teal-600 text-[11px]" /> Popular:
          </span>
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => navigate(`/search?q=${encodeURIComponent(city)}`)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-2xs transition hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-800"
            >
              {city}
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6 border-t border-gray-100 pt-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <FaHandHoldingUsd className="text-xs" />
            </div>
            <span>Zero Brokerage Fees</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <FaShieldAlt className="text-xs" />
            </div>
            <span>Verified Owner Listings</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <FaPhoneAlt className="text-xs" />
            </div>
            <span>Direct WhatsApp & Call</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
