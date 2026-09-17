import { useNavigate } from "react-router-dom";

function OwnerCTA() {
  const navigate = useNavigate();
  return (
    <section className="mt-12 flex flex-col items-center px-4 pb-14">
      <div className="flex items-center gap-4">
        <div className="h-px w-16 bg-gray-300 sm:w-24"></div>
        <p className="text-center text-sm font-bold uppercase tracking-wider text-gray-700 sm:text-base">
          Are you a Property Owner or Landlord?
        </p>
        <div className="h-px w-16 bg-gray-300 sm:w-24"></div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-500 max-w-md leading-relaxed">
        List your flat, house, or room for free. Receive verified tenant applications directly with zero brokerage or hidden fees.
      </p>

      <button
        className="mt-4 bg-[#009587] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#00786d] transition shadow-sm"
        onClick={() => navigate("/post-property")}
      >
        Post Your Property for Free
      </button>
    </section>
  );
}

export default OwnerCTA;
