import { useNavigate } from "react-router-dom";

function OwnerCTA() {
  const navigate = useNavigate();
  return (
    <section className="mt-12 flex flex-col items-center px-4 pb-14">
      <div className="flex items-center gap-2 sm:gap-4 max-w-full">
        <div className="h-px w-6 sm:w-24 bg-gray-300 shrink-0"></div>
        <p className="text-center text-xs sm:text-base font-bold uppercase tracking-wider text-gray-700">
          Are you a Property Owner or Landlord?
        </p>
        <div className="h-px w-6 sm:w-24 bg-gray-300 shrink-0"></div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-500 max-w-md leading-relaxed">
        List your flat, house, or room for free. Receive verified tenant applications directly with zero brokerage or hidden fees.
      </p>

      <button
        className="mt-4 rounded-xl bg-teal-600 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition shadow-sm active:scale-98"
        onClick={() => navigate("/post-property")}
      >
        Post Your Property for Free
      </button>
    </section>
  );
}

export default OwnerCTA;
