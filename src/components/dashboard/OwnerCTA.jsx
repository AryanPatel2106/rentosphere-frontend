import { useNavigate } from "react-router-dom";

function OwnerCTA() {
  const navigate = useNavigate();
  return (
    <section className="mt-10 flex flex-col items-center px-4 pb-12">
      <div className="flex items-center gap-4">
        <div className="h-px w-20 bg-gray-300"></div>

        <p className="text-center text-base text-gray-700">
          Are you a Property Owner?
        </p>

        <div className="h-px w-20 bg-gray-300"></div>
      </div>

      <button className="mt-5 bg-[#009587] px-6 py-2 text-sm text-white hover:bg-[#00786d]" onClick={() => navigate("/post-property")}>
        Post Free Property Ad
      </button>
    </section>
  );
}

export default OwnerCTA;
