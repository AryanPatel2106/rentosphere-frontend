import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import api from "../services/api";
import LocalitySearch from "../components/dashboard/LocalitySearch";
import PropertyMap from "../components/PropertyMap";
import {
  FaLocationDot,
  FaCar,
  FaPaw,
  FaSpinner,
  FaBuilding,
  FaHeart,
  FaList,
  FaMapLocationDot,
} from "react-icons/fa6";

function formatDistance(meters) {
  if (meters === undefined || meters === null) return null;
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

function SearchResults() {
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialLocality =
    state?.localities && state.localities.length > 0
      ? state.localities
      : searchParams.get("placeId")
      ? [
          {
            placeId: searchParams.get("placeId"),
            label: searchParams.get("label") || "Selected Place",
            text: searchParams.get("text") || "",
          },
        ]
      : [];

  const [selectedLocalities, setSelectedLocalities] = useState(initialLocality);
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLocation, setSearchLocation] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [selectedProperty, setSelectedProperty] = useState(null);

  const sentinelRef = useRef(null);

  const fetchProperties = useCallback(
    async (pageToFetch, isNewSearch = false) => {
      const activeLocality = selectedLocalities[0];
      const params = { page: pageToFetch, limit: 20 };

      if (activeLocality?.placeId) {
        params.placeId = activeLocality.placeId;
      } else if (activeLocality?.label || activeLocality?.text) {
        params.q = activeLocality.label || activeLocality.text;
      } else if (searchParams.get("q")) {
        params.q = searchParams.get("q");
      }

      try {
        if (isNewSearch) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const res = await api.get("/property/get-properties", { params });
        const data = res.data.data;

        if (isNewSearch) {
          setProperties(data.properties || []);
          setSelectedProperty(null);
          if (data.searchLocation) {
            setSearchLocation(data.searchLocation);
          } else {
            setSearchLocation(null);
          }
        } else {
          setProperties((prev) => [...prev, ...(data.properties || [])]);
        }

        setPage(data.page || pageToFetch);
        setHasMore(Boolean(data.hasMore));
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError("Failed to load properties. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedLocalities, searchParams]
  );

  useEffect(() => {
    setPage(1);
    fetchProperties(1, true);
  }, [fetchProperties]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchProperties(page + 1, false);
  }, [loading, loadingMore, hasMore, page, fetchProperties]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) handleLoadMore(); },
      { rootMargin: "250px" }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loading, loadingMore, handleLoadMore]);

  const activeLabel =
    selectedLocalities[0]?.label ||
    selectedLocalities[0]?.text ||
    searchLocation?.label ||
    searchParams.get("q") ||
    "All Localities";

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white px-4 py-8 text-center sm:py-10">
        <h1 className="text-2xl font-light text-gray-700 sm:text-3xl lg:text-4xl">
          Properties near{" "}
          <span className="font-semibold text-[#009587]">{activeLabel}</span>
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-6 text-gray-500 sm:text-sm">
          Showing rental properties sorted by nearest proximity.
          {total > 0 && ` Found ${total} listing${total !== 1 ? "s" : ""}.`}
        </p>
      </section>

      {/* ── Search bar + View toggle ──────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white py-3 shadow-sm sm:py-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Locality search — takes all available width */}
            <div className="min-w-0 flex-1 border border-gray-300 bg-gray-50 transition focus-within:border-[#009587] focus-within:bg-white">
              <LocalitySearch
                selected={selectedLocalities}
                setSelected={(localities) => {
                  setSelectedLocalities(localities);
                  if (localities.length > 0) {
                    setSearchParams({
                      placeId: localities[0].placeId || "",
                      label: localities[0].label || "",
                    });
                  } else {
                    setSearchParams({});
                  }
                }}
                singleSelect={true}
              />
            </div>

            {/* View toggle — full width on mobile, shrinks on sm+ */}
            <div className="flex w-full border border-gray-300 bg-white shadow-sm sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition sm:flex-initial ${
                  viewMode === "list"
                    ? "bg-[#009587] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaList /> List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition sm:flex-initial ${
                  viewMode === "map"
                    ? "bg-[#009587] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaMapLocationDot /> Map View
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border border-gray-300 bg-white">
                <div className="border-b border-gray-200 p-4 space-y-2">
                  <div className="h-5 w-1/3 bg-gray-200" />
                  <div className="h-4 w-1/2 bg-gray-200" />
                </div>
                <div className="grid grid-cols-2 border-b border-gray-200 sm:grid-cols-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-14 bg-gray-100 mx-4 my-3" />
                  ))}
                </div>
                <div className="p-4 flex gap-4">
                  <div className="hidden sm:block h-32 w-44 shrink-0 bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 bg-gray-200" />
                    <div className="h-4 w-1/2 bg-gray-200" />
                    <div className="h-9 w-40 bg-gray-200 mt-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MAP VIEW ──────────────────────────────────────────────────────── */}
        {!loading && viewMode === "map" && properties.length > 0 && (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            {/* Left: compact card list */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <p className="mb-2 text-xs text-gray-500">
                {properties.length} listings — click a card to focus
              </p>
              {/* Fixed height on lg+, natural height (limited) on mobile */}
              <div className="space-y-2 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1 max-h-64 overflow-y-auto pr-1">
                {properties.map((property, idx) => {
                  const dist = formatDistance(property.distance);
                  const isSel = selectedProperty?._id === property._id;
                  return (
                    <div
                      key={property._id || idx}
                      onClick={() => setSelectedProperty(property)}
                      className={`cursor-pointer border bg-white p-3 transition ${
                        isSel
                          ? "border-[#009587] bg-teal-50/30"
                          : "border-gray-300 hover:border-[#009587]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#009587]">
                            {property.BHKType || "Apartment"} •{" "}
                            {property.Furnishing || "Unfurnished"}
                          </span>
                          <h4 className="mt-0.5 truncate text-sm font-semibold text-gray-800">
                            {property.title}
                          </h4>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                            <FaLocationDot className="shrink-0 text-[#009587]" />
                            {property.locality?.label || property.locality?.text || ""}
                          </p>
                        </div>
                        {dist && (
                          <span className="shrink-0 bg-[#009587] px-2 py-0.5 text-[10px] font-semibold text-white">
                            {dist}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div ref={sentinelRef} className="py-2 text-center">
                  {loadingMore && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[#009587]">
                      <FaSpinner className="animate-spin" />
                      <span>Loading more…</span>
                    </div>
                  )}
                  {!loading && !hasMore && properties.length > 0 && (
                    <div className="text-[11px] text-gray-400">
                      ✓ All {properties.length} properties loaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Map — full width on mobile, fills remaining space on lg */}
            <div className="w-full flex-1 lg:sticky lg:top-6 lg:h-[calc(100vh-260px)]" style={{ minHeight: "380px" }}>
              <PropertyMap
                properties={properties}
                searchLocation={searchLocation}
                selectedProperty={selectedProperty}
                onSelectProperty={setSelectedProperty}
              />
            </div>
          </div>
        )}

        {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
        {!loading && viewMode === "list" && properties.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {properties.map((property, idx) => {
              const dist = formatDistance(property.distance);
              return (
                <div
                  key={property._id || idx}
                  className="border border-gray-300 bg-white shadow-sm transition hover:border-[#009587]"
                >
                  {/* Card header */}
                  <div className="flex flex-col gap-2 border-b border-gray-300 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
                        {property.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <FaLocationDot className="shrink-0 text-[#009587]" />
                        <span className="truncate">
                          {property.locality?.text ||
                            property.locality?.label ||
                            "Location specified by owner"}
                        </span>
                      </p>
                    </div>
                    {dist && (
                      <div className="w-fit shrink-0 self-start bg-[#009587] px-3 py-1 text-xs font-semibold text-white">
                        📍 {dist}
                      </div>
                    )}
                  </div>

                  {/* Metrics strip — 2 cols mobile, 4 cols sm+ */}
                  <div className="grid grid-cols-2 border-b border-gray-300 text-center text-xs sm:grid-cols-4">
                    <div className="border-b border-r border-gray-300 p-3 sm:border-b-0">
                      <span className="block font-medium text-gray-500">BHK Type</span>
                      <span className="mt-1 block text-sm font-semibold text-gray-800">
                        {property.BHKType || "—"}
                      </span>
                    </div>
                    <div className="border-b border-gray-300 p-3 sm:border-b-0 sm:border-r">
                      <span className="block font-medium text-gray-500">Furnishing</span>
                      <span className="mt-1 block text-sm font-semibold text-gray-800">
                        {property.Furnishing || "—"}
                      </span>
                    </div>
                    <div className="border-r border-gray-300 p-3">
                      <span className="block font-medium text-gray-500">Availability</span>
                      <span className="mt-1 block text-sm font-semibold text-gray-800">
                        {property.Availability || "Immediate"}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="block font-medium text-gray-500">Distance</span>
                      <span className="mt-1 block text-sm font-semibold text-[#009587]">
                        {dist || "Near Locality"}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Image placeholder — hidden on very small screens */}
                      <div className="hidden h-32 w-full shrink-0 flex-col items-center justify-center border border-gray-300 bg-gray-100 text-gray-400 sm:flex sm:h-36 sm:w-44">
                        <FaBuilding className="text-3xl" />
                        <span className="mt-2 text-xs font-medium">Rentosphere Listing</span>
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between gap-3">
                        <div>
                          {/* Amenity badges */}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span
                              className={`border px-3 py-1 font-medium ${
                                property.Parking
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                  : "border-gray-200 bg-gray-50 text-gray-500"
                              }`}
                            >
                              <FaCar className="mr-1 inline" />
                              {property.Parking ? "Parking Available" : "No Parking"}
                            </span>
                            <span
                              className={`border px-3 py-1 font-medium ${
                                property.PetFriendly
                                  ? "border-amber-300 bg-amber-50 text-amber-700"
                                  : "border-gray-200 bg-gray-50 text-gray-500"
                              }`}
                            >
                              <FaPaw className="mr-1 inline" />
                              {property.PetFriendly ? "Pet Friendly" : "No Pets"}
                            </span>
                          </div>

                          {property.description && (
                            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-600">
                              {property.description}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            className="bg-red-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-red-600"
                          >
                            Get Owner Details
                          </button>
                          <button
                            type="button"
                            className="border border-gray-300 px-4 py-2.5 text-xs text-gray-600 transition hover:bg-gray-100"
                          >
                            <FaHeart className="mr-1 inline text-gray-400" />
                            Shortlist
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-4">
              {loadingMore && (
                <div className="flex items-center gap-2 border border-gray-300 bg-white px-6 py-3 text-xs font-medium text-[#009587]">
                  <FaSpinner className="animate-spin" />
                  Loading more nearest properties…
                </div>
              )}
              {!loading && !hasMore && properties.length > 0 && (
                <div className="border border-gray-200 bg-white px-6 py-2.5 text-xs text-gray-500">
                  ✓ All {properties.length} properties displayed
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && properties.length === 0 && (
          <div className="border border-dashed border-gray-300 bg-white p-10 text-center sm:p-12">
            <FaBuilding className="mx-auto text-4xl text-gray-300" />
            <h3 className="mt-3 text-base font-semibold text-gray-700">No properties found</h3>
            <p className="mt-1 text-xs text-gray-500">
              There are no rental properties near this location yet. Try a different locality or
              city.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchResults;