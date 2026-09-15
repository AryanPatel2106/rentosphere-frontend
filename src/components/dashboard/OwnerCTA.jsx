import { useNavigate } from "react-router-dom";
import { FaBuilding, FaCheckCircle, FaArrowRight } from "react-icons/fa";

function OwnerCTA() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-[#073630] to-[#004d40] px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-400/20">
              <FaBuilding className="text-xs" /> Landlords & Property Owners
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl text-white">
              Rent out your property faster, with 0% brokerage.
            </h2>

            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              List your flat, villa, or PG on Rentosphere. Get direct calls and WhatsApp messages from genuine tenants looking for homes right now.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-teal-200">
              <span className="flex items-center gap-1.5">
                <FaCheckCircle className="text-teal-400" /> Free Forever
              </span>
              <span className="flex items-center gap-1.5">
                <FaCheckCircle className="text-teal-400" /> 100% Direct Inquiries
              </span>
              <span className="flex items-center gap-1.5">
                <FaCheckCircle className="text-teal-400" /> No Middlemen
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => navigate("/post-property")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 px-8 py-3.5 text-sm font-bold text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-teal-500/25"
            >
              Post Free Property Ad <FaArrowRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OwnerCTA;
