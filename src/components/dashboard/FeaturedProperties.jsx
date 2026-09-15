import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaMapMarkerAlt, FaBed, FaCouch, FaArrowRight, FaHeart, FaShareAlt } from "react-icons/fa";

export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/property/get-properties", {
          params: { limit: 4, sortBy: "createdAt_desc" },
        });
        if (isMounted && res.data?.data) {
          const list = Array.isArray(res.data.data)
            ? res.data.data
            : res.data.data.properties || [];
          setProperties(list.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch featured properties:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleShare = (e, propId) => {
    e.stopPropagation();
    const url = `${window.location.origin}/search?q=${propId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(propId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!loading && properties.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#009587]">
            Handpicked For You
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Featured Rental Properties
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Recently posted zero-brokerage homes with high-resolution photos and verified owners
          </p>
        </div>

        <button
          onClick={() => navigate("/search")}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-[#009587] hover:underline"
        >
          Explore All Homes <FaArrowRight className="text-xs" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs animate-pulse"
              >
                <div className="h-48 w-full bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-6 w-1/3 rounded bg-gray-200"></div>
                </div>
              </div>
            ))
          : properties.map((p) => {
              const photo =
                p.photos && p.photos.length > 0
                  ? p.photos[0]
                  : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80";

              return (
                <div
                  key={p._id}
                  onClick={() =>
                    navigate("/search", {
                      state: { localities: [p.location?.address || p.title] },
                    })
                  }
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                >
                  {/* Photo & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={photo}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="rounded-md bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-800 shadow-xs backdrop-blur-xs">
                        {p.bhkType}
                      </span>
                      {p.furnishing && (
                        <span className="rounded-md bg-teal-600/90 px-2 py-0.5 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs">
                          {p.furnishing}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleShare(e, p._id)}
                      title="Share link"
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:bg-white hover:text-teal-600 backdrop-blur-xs"
                    >
                      <FaShareAlt className="text-xs" />
                    </button>

                    {copiedId === p._id && (
                      <div className="absolute top-12 right-3 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white backdrop-blur-xs">
                        Link copied!
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{(p.rent || 0).toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-gray-500"> / month</span>
                      </span>
                      {p.deposit > 0 && (
                        <span className="text-[11px] text-gray-500">
                          Dep: ₹{(p.deposit / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-[#009587] transition">
                      {p.title}
                    </h3>

                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 line-clamp-1">
                      <FaMapMarkerAlt className="text-teal-600 shrink-0 text-[11px]" />
                      <span>{p.location?.address || "Prime Location"}</span>
                    </p>

                    <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3 text-[11px] text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaBed className="text-gray-400" />
                        {p.bhkType}
                      </span>
                      {p.builtUpArea > 0 && (
                        <span className="text-gray-500">
                          • {p.builtUpArea} sq.ft
                        </span>
                      )}
                      {p.preferredTenant && (
                        <span className="text-gray-500">
                          • {p.preferredTenant}
                        </span>
                      )}
                    </div>

                    <button
                      className="mt-4 w-full rounded-lg bg-gray-50 py-2 text-center text-xs font-semibold text-teal-700 transition group-hover:bg-[#009587] group-hover:text-white"
                    >
                      View Details & Contact Owner
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
}
