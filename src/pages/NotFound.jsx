import { useNavigate } from "react-router-dom";
import { FaHouse } from "react-icons/fa6";
import { BiSearchAlt } from "react-icons/bi";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-inner">
        <FaHouse className="text-4xl" />
      </div>
      <span className="mt-6 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600">
        404 • Page Not Found
      </span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Lost your way home?
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-500">
        The page you are looking for might have been moved, deleted, or doesn't exist. Let's get you back to discovering great rental homes.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-lg bg-[#009587] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#007d70]"
        >
          <FaHouse className="text-xs" /> Go to Homepage
        </button>
        <button
          onClick={() => navigate("/search")}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <BiSearchAlt className="text-base" /> Browse All Properties
        </button>
      </div>
    </div>
  );
}
