import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
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
  FaMagnifyingGlass,
  FaXmark,
  FaPhone,
  FaWhatsapp,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaArrowDownWideShort,
  FaSliders,
  FaCircleCheck,
  FaCircleExclamation,
} from "react-icons/fa6";
import { getErrorMessage } from "../utils/errorHandler";

const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";

function formatDistance(meters) {
  if (meters === undefined || meters === null) return null;
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

function formatRent(amount) {
  if (!amount) return "Rent on Request";
  return `₹${amount.toLocaleString("en-IN")}`;
}

const BHK_OPTIONS = ["All", "1RK", "1BHK", "2BHK", "3BHK", "4BHK"];

const BUDGET_PRESETS = [
  { label: "All Budgets", min: "", max: "" },
  { label: "< ₹20k", min: "", max: "20000" },
  { label: "₹20k - ₹35k", min: "20000", max: "35000" },
  { label: "₹35k - ₹50k", min: "35000", max: "50000" },
  { label: "₹50k+", min: "50000", max: "" },
];

const PROPERTY_TYPES = [
  "All",
  "Apartment",
  "Independent House",
  "Villa",
  "Builder Floor",
  "Studio",
  "PG/Co-living",
];

const FURNISHING_OPTIONS = [
  "All",
  "Fully Furnished",
  "Semi-Furnished",
  "Unfurnished",
];

const TENANT_OPTIONS = ["All", "Anyone", "Family", "Bachelors", "Company"];

const AVAILABILITY_OPTIONS = [
  "All",
  "Immediate",
  "Within 15 Days",
  "Within 30 Days",
];

function SearchResults() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Locality setup
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

  // Filter states (initialized from URL params or state passed from dashboard)
  const [keyword, setKeyword] = useState(searchParams.get("search") || "");
  const [bhkType, setBhkType] = useState(
    searchParams.get("bhkType") || state?.bhkType || "All"
  );
  const [minRent, setMinRent] = useState(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxRent") || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "All"
  );
  const [furnishing, setFurnishing] = useState(
    searchParams.get("furnishing") || state?.furnishing || "All"
  );
  const [tenantType, setTenantType] = useState(
    searchParams.get("tenantType") || state?.tenantType || "All"
  );
  const [availability, setAvailability] = useState(
    searchParams.get("availability") || state?.availability || "All"
  );
  const [parking, setParking] = useState(
    searchParams.get("parking") === "true" || Boolean(state?.parking)
  );
  const [petFriendly, setPetFriendly] = useState(
    searchParams.get("petFriendly") === "true" || Boolean(state?.petFriendly)
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "nearest");

  // UI state
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
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

  // Owner details modal
  const [ownerModalProperty, setOwnerModalProperty] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerData, setOwnerData] = useState(null);

  // Shortlist state (stored in localStorage + synced with backend)
  const [shortlists, setShortlists] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rentosphere_shortlists") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchShortlists = async () => {
      try {
        const res = await api.get("/property/shortlists");
        if (res.data?.data) {
          const ids = res.data.data.map((p) => (typeof p === "string" ? p : p._id));
          setShortlists(ids);
          localStorage.setItem("rentosphere_shortlists", JSON.stringify(ids));
        }
      } catch (err) {
        // user not logged in or offline, continue with localStorage
      }
    };
    fetchShortlists();
  }, []);

  const toggleShortlist = async (propertyId) => {
    setShortlists((prev) => {
      const next = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      try {
        localStorage.setItem("rentosphere_shortlists", JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    try {
      await api.post(`/property/shortlist/${propertyId}`);
    } catch (err) {
      console.warn("Could not sync shortlist with server:", err.message);
    }
  };

  // Rental Request Modal State
  const [rentalModalProperty, setRentalModalProperty] = useState(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [rentalMessage, setRentalMessage] = useState("");
  const [rentalSubmitting, setRentalSubmitting] = useState(false);
  const [rentalSuccess, setRentalSuccess] = useState(false);
  const [rentalError, setRentalError] = useState("");

  const handleOpenRentalModal = (property) => {
    setRentalModalProperty(property);
    setMoveInDate("");
    setRentalMessage(
      `Hi, I am interested in renting your ${property.BHKType || ""} ${
        property.propertyType || "property"
      } located at ${property.locality?.text || property.locality?.label || "this location"}.`
    );
    setRentalSuccess(false);
    setRentalError("");
  };

  const handleSubmitRentalRequest = async (e) => {
    e.preventDefault();
    if (!rentalModalProperty) return;
    setRentalSubmitting(true);
    setRentalError("");
    try {
      await api.post("/property/rental-request", {
        propertyId: rentalModalProperty._id,
        moveInDate: moveInDate || null,
        message: rentalMessage,
      });
      setRentalSuccess(true);
      setTimeout(() => {
        setRentalModalProperty(null);
        setRentalSuccess(false);
      }, 2000);
    } catch (err) {
      setRentalError(
        err.response?.data?.message ||
          "Failed to submit rental request. Please ensure you are logged in."
      );
    } finally {
      setRentalSubmitting(false);
    }
  };

  const sentinelRef = useRef(null);

  // Calculate active filter count (excluding default values)
  const activeFilterCount = [
    keyword.trim() !== "",
    bhkType !== "All" && bhkType !== "",
    minRent !== "" || maxRent !== "",
    propertyType !== "All" && propertyType !== "",
    furnishing !== "All" && furnishing !== "",
    tenantType !== "All" && tenantType !== "",
    availability !== "All" && availability !== "",
    parking,
    petFriendly,
    sortBy !== "nearest",
  ].filter(Boolean).length;

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(
    (overrides = {}) => {
      const params = {};
      const activeLoc = selectedLocalities[0];
      if (activeLoc?.placeId) params.placeId = activeLoc.placeId;
      if (activeLoc?.label) params.label = activeLoc.label;

      const currentKeyword = overrides.keyword !== undefined ? overrides.keyword : keyword;
      if (currentKeyword.trim()) params.search = currentKeyword.trim();

      const currentBhk = overrides.bhkType !== undefined ? overrides.bhkType : bhkType;
      if (currentBhk && currentBhk !== "All") params.bhkType = currentBhk;

      const currentMin = overrides.minRent !== undefined ? overrides.minRent : minRent;
      if (currentMin !== "") params.minRent = currentMin;

      const currentMax = overrides.maxRent !== undefined ? overrides.maxRent : maxRent;
      if (currentMax !== "") params.maxRent = currentMax;

      const currentType = overrides.propertyType !== undefined ? overrides.propertyType : propertyType;
      if (currentType && currentType !== "All") params.propertyType = currentType;

      const currentFurn = overrides.furnishing !== undefined ? overrides.furnishing : furnishing;
      if (currentFurn && currentFurn !== "All") params.furnishing = currentFurn;

      const currentTenant = overrides.tenantType !== undefined ? overrides.tenantType : tenantType;
      if (currentTenant && currentTenant !== "All") params.tenantType = currentTenant;

      const currentAvail = overrides.availability !== undefined ? overrides.availability : availability;
      if (currentAvail && currentAvail !== "All") params.availability = currentAvail;

      const currentPark = overrides.parking !== undefined ? overrides.parking : parking;
      if (currentPark) params.parking = "true";

      const currentPet = overrides.petFriendly !== undefined ? overrides.petFriendly : petFriendly;
      if (currentPet) params.petFriendly = "true";

      const currentSort = overrides.sortBy !== undefined ? overrides.sortBy : sortBy;
      if (currentSort && currentSort !== "nearest") params.sortBy = currentSort;

      setSearchParams(params, { replace: true });
    },
    [
      selectedLocalities,
      keyword,
      bhkType,
      minRent,
      maxRent,
      propertyType,
      furnishing,
      tenantType,
      availability,
      parking,
      petFriendly,
      sortBy,
      setSearchParams,
    ]
  );

  // Fetch properties from backend with all filters
  const fetchProperties = useCallback(
    async (pageToFetch, isNewSearch = false) => {
      const activeLocality = selectedLocalities[0];
      const params = {
        page: pageToFetch,
        limit: 20,
      };

      if (activeLocality?.placeId) {
        params.placeId = activeLocality.placeId;
      } else if (activeLocality?.label || activeLocality?.text) {
        params.q = activeLocality.label || activeLocality.text;
      } else if (searchParams.get("q")) {
        params.q = searchParams.get("q");
      }

      if (keyword.trim()) params.search = keyword.trim();
      if (bhkType && bhkType !== "All") params.bhkType = bhkType;
      if (minRent !== "") params.minRent = minRent;
      if (maxRent !== "") params.maxRent = maxRent;
      if (propertyType && propertyType !== "All") params.propertyType = propertyType;
      if (furnishing && furnishing !== "All") params.furnishing = furnishing;
      if (tenantType && tenantType !== "All") params.tenantType = tenantType;
      if (availability && availability !== "All") params.availability = availability;
      if (parking) params.parking = "true";
      if (petFriendly) params.petFriendly = "true";
      if (sortBy) params.sortBy = sortBy;

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
        setError(getErrorMessage(err, "Failed to load properties. Please try again."));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      selectedLocalities,
      keyword,
      bhkType,
      minRent,
      maxRent,
      propertyType,
      furnishing,
      tenantType,
      availability,
      parking,
      petFriendly,
      sortBy,
      searchParams,
    ]
  );

  // Trigger search when any filter changes
  useEffect(() => {
    setPage(1);
    fetchProperties(1, true);
    updateUrlParams();
  }, [
    selectedLocalities,
    bhkType,
    minRent,
    maxRent,
    propertyType,
    furnishing,
    tenantType,
    availability,
    parking,
    petFriendly,
    sortBy,
  ]);

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchProperties(page + 1, false);
  }, [loading, loadingMore, hasMore, page, fetchProperties]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: "250px" }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loading, loadingMore, handleLoadMore]);

  // Open owner contact modal and fetch details
  const handleGetOwnerDetails = async (property) => {
    setOwnerModalProperty(property);
    setOwnerLoading(true);
    try {
      const res = await api.get(`/property/property-info/${property._id}`);
      setOwnerData(res.data.data?.owner || property.owner || null);
    } catch (err) {
      console.error("Error fetching owner details:", err);
      setOwnerData(property.owner || null);
    } finally {
      setOwnerLoading(false);
    }
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setKeyword("");
    setBhkType("All");
    setMinRent("");
    setMaxRent("");
    setPropertyType("All");
    setFurnishing("All");
    setTenantType("All");
    setAvailability("All");
    setParking(false);
    setPetFriendly(false);
    setSortBy("nearest");
    updateUrlParams({
      keyword: "",
      bhkType: "All",
      minRent: "",
      maxRent: "",
      propertyType: "All",
      furnishing: "All",
      tenantType: "All",
      availability: "All",
      parking: false,
      petFriendly: false,
      sortBy: "nearest",
    });
  };

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
          Explore rental properties with verified owners and transparent pricing.
          {total > 0 && ` Found ${total} listing${total !== 1 ? "s" : ""}.`}
        </p>
      </section>

      {/* ── Search Bar & View Toggle ────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white py-3 shadow-sm sm:py-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Locality search */}
            <div className="min-w-0 flex-1 border border-gray-300 bg-gray-50 transition focus-within:border-[#009587] focus-within:bg-white">
              <LocalitySearch
                selected={selectedLocalities}
                setSelected={(localities) => {
                  setSelectedLocalities(localities);
                  if (localities.length > 0) {
                    setSearchParams((prev) => {
                      prev.set("placeId", localities[0].placeId || "");
                      prev.set("label", localities[0].label || "");
                      return prev;
                    });
                  }
                }}
                singleSelect={true}
              />
            </div>

            {/* View toggle */}
            <div className="flex w-full rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-xs sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition sm:flex-initial ${
                  viewMode === "list"
                    ? "bg-white text-teal-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaList /> List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition sm:flex-initial ${
                  viewMode === "map"
                    ? "bg-white text-teal-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaMapLocationDot /> Map View
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search-Based Filters Strip ──────────────────────────────────── */}
      <section className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          {/* Top filter row: Keyword Search + Quick BHK + Budget + Filter Drawer Toggle + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {/* Search within listings input */}
            <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    fetchProperties(1, true);
                    updateUrlParams({ keyword });
                  }
                }}
                placeholder="Search title, locality, keywords..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-7 py-2 text-base sm:text-xs text-slate-800 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600/20"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setPage(1);
                    updateUrlParams({ keyword: "" });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <FaXmark />
                </button>
              )}
            </div>

            {/* Quick Filters Row (horizontal scroll on mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0 scrollbar-none flex-1">
              {/* Quick BHK pills */}
              <div className="flex items-center gap-1 shrink-0">
                {BHK_OPTIONS.map((opt) => {
                  const isSelected = bhkType === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBhkType(opt)}
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium border transition ${
                        isSelected
                          ? "border-teal-600 bg-teal-600 text-white shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Budget Presets Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={
                    BUDGET_PRESETS.find(
                      (p) => p.min === minRent && p.max === maxRent
                    )?.label || "Custom Budget"
                  }
                  onChange={(e) => {
                    const found = BUDGET_PRESETS.find(
                      (p) => p.label === e.target.value
                    );
                    if (found) {
                      setMinRent(found.min);
                      setMaxRent(found.max);
                    }
                  }}
                  className="border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  {BUDGET_PRESETS.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label}
                    </option>
                  ))}
                  {minRent !== "" &&
                    maxRent !== "" &&
                    !BUDGET_PRESETS.some(
                      (p) => p.min === minRent && p.max === maxRent
                    ) && <option value="Custom Budget">Custom Budget</option>}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="relative shrink-0 flex items-center gap-1 sm:ml-auto">
                <FaArrowDownWideShort className="text-gray-400 text-xs hidden sm:inline" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="nearest">Nearest First</option>
                  <option value="rent_asc">Price: Low to High</option>
                  <option value="rent_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* More Filters Toggle Button */}
              <button
                type="button"
                onClick={() => setShowFilterDrawer((prev) => !prev)}
                className={`shrink-0 flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition ${
                  showFilterDrawer || activeFilterCount > 0
                    ? "border-[#009587] bg-teal-50 text-[#009587]"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaSliders className="text-xs" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center bg-[#009587] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Collapsible Advanced Filter Drawer ────────────────────────── */}
          {showFilterDrawer && (
            <div className="mt-3 border-t border-gray-200 pt-4 pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Furnishing
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value)}
                    className="w-full border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
                  >
                    {FURNISHING_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Tenant */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Preferred Tenant
                  </label>
                  <select
                    value={tenantType}
                    onChange={(e) => setTenantType(e.target.value)}
                    className="w-full border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
                  >
                    {TENANT_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
                  >
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second row: Custom Rent Range + Amenities Checkboxes + Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-3">
                {/* Custom budget min / max */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Rent:</span>
                  <input
                    type="number"
                    value={minRent}
                    onChange={(e) => setMinRent(e.target.value)}
                    placeholder="Min ₹"
                    className="w-24 border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
                  />
                  <span className="text-gray-400 text-xs">to</span>
                  <input
                    type="number"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    placeholder="Max ₹"
                    className="w-24 border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parking}
                      onChange={(e) => setParking(e.target.checked)}
                      className="accent-[#009587]"
                    />
                    <FaCar className="text-gray-500 text-xs" />
                    <span>Parking Available</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={petFriendly}
                      onChange={(e) => setPetFriendly(e.target.checked)}
                      className="accent-[#009587]"
                    />
                    <FaPaw className="text-gray-500 text-xs" />
                    <span>Pet Friendly</span>
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterDrawer(false)}
                    className="bg-[#009587] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#007d71] transition"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Active Filter Chips Strip ───────────────────────────────── */}
          {activeFilterCount > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2 text-xs">
              <span className="text-gray-400 text-[11px] font-medium mr-1">Active:</span>
              {keyword.trim() && (
                <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-700 text-[11px]">
                  <span>\"${keyword}\"</span>
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword("");
                      setPage(1);
                      updateUrlParams({ keyword: "" });
                    }}
                    className="hover:text-red-500"
                  >
                    <FaXmark className="text-[10px]" />
                  </button>
                </span>
              )}
              {bhkType !== "All" && (
                <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-0.5 text-[#009587] text-[11px] font-medium">
                  <span>{bhkType}</span>
                  <button
                    type="button"
                    onClick={() => setBhkType("All")}
                    className="hover:text-red-500"
                  >
                    <FaXmark className="text-[10px]" />
                  </button>
                </span>
              )}
              {(minRent !== "" || maxRent !== "") && (
                <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-0.5 text-[#009587] text-[11px] font-medium">
                  <span>
                    {minRent ? `₹${Number(minRent).toLocaleString()}` : "₹0"} -{" "}
                    {maxRent ? `₹${Number(maxRent).toLocaleString()}` : "Any"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMinRent("");
                      setMaxRent("");
                    }}
                    className="hover:text-red-500"
                  >
                    <FaXmark className="text-[10px]" />
                  </button>
                </span>
              )}
              {propertyType !== "All" && (
                <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-700 text-[11px]">
                  <span>{propertyType}</span>
                  <button
                    type="button"
                    onClick={() => setPropertyType("All")}
                    className="hover:text-red-500"
                  >
                    <FaXmark className="text-[10px]" />
                  </button>
                </span>
              )}
              {furnishing !== "All" && (
                <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-700 text-[11px]">
                  <span>{furnishing}</span>
                  <button
                    type="button"
                    onClick={() => setFurnishing("All")}
                    className="hover:text-red-500"
                  >
                    <FaXmark className="text-[10px]" />
                  </button>
                </span>
              )}
              {tenantType !== "All" && (
                <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-700 text-[11px]">
                  <span>{tenantType}</span>
                  <button
                    type="button"
                    onClick={() => setTenantType("All")}
                    className="hover:text-red-500"
                  >
                    <FaXmark className="text-[10px]" />
                  </button>
                </span>
              )}
              {parking && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-700 text-[11px]">
                  <span>Parking</span>
                  <button
                    type="button"
                    onClick={() => setParking(false)}
                    className="hover:text-red-500"
                  >
                    <FaXmark className="text-[10px]" />
                  </button>
                </span>
              )}
              {petFriendly && (
                <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 text-amber-700 text-[11px]">
                  <span>Pet Friendly</span>
                  <button
                    type="button"
                    onClick={() => setPetFriendly(false)}
                    className="hover:text-red-500"
                  >
                    <FaXmark className="text-[10px]" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-red-500 hover:underline ml-1"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-3">
            <FaCircleExclamation className="text-red-600 text-base mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-red-800 uppercase tracking-wide">Notice</h4>
              <p className="mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-500 hover:text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse border border-gray-300 bg-white"
              >
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
                  <div className="hidden sm:block h-36 w-48 shrink-0 bg-gray-200" />
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

        {/* ── MAP VIEW ──────────────────────────────────────────────────── */}
        {!loading && viewMode === "map" && properties.length > 0 && (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            {/* Left: compact card list */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <p className="mb-2 text-xs text-gray-500 font-medium">
                {properties.length} listings — click a card to focus on map
              </p>
              <div className="space-y-2 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1 max-h-72 overflow-y-auto pr-1">
                {properties.map((property, idx) => {
                  const dist = formatDistance(property.distance);
                  const isSel = selectedProperty?._id === property._id;
                  const photoSrc =
                    property.photos && property.photos.length > 0
                      ? property.photos[0]
                      : DEFAULT_PROPERTY_IMAGE;

                  return (
                    <div
                      key={property._id || idx}
                      onClick={() => setSelectedProperty(property)}
                      className={`cursor-pointer border bg-white p-3 transition flex gap-3 ${
                        isSel
                          ? "border-[#009587] bg-teal-50/40 ring-1 ring-[#009587]"
                          : "border-gray-300 hover:border-[#009587]"
                      }`}
                    >
                      <img
                        src={photoSrc}
                        alt={property.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/property/${property._id}`);
                        }}
                        title="Click to view full property details"
                        className="h-16 w-20 shrink-0 object-cover border border-gray-200 hover:opacity-90 transition"
                        onError={(e) => {
                          e.target.src = DEFAULT_PROPERTY_IMAGE;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-sm font-bold text-[#009587]">
                            {formatRent(property.rent)}
                            <span className="text-[10px] font-normal text-gray-500">
                              /mo
                            </span>
                          </span>
                          {dist && (
                            <span className="shrink-0 bg-[#009587] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                              {dist}
                            </span>
                          )}
                        </div>
                        <h4
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${property._id}`);
                          }}
                          className="mt-0.5 truncate text-xs font-semibold text-gray-800 hover:text-[#009587] transition cursor-pointer"
                          title="Click to view full property details"
                        >
                          {property.title}
                        </h4>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {property.BHKType} • {property.Furnishing}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <p className="flex items-center gap-1 truncate text-[10px] text-gray-400">
                            <FaLocationDot className="shrink-0 text-[#009587]" />
                            {property.locality?.label ||
                              property.locality?.text ||
                              ""}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/property/${property._id}`);
                            }}
                            className="shrink-0 text-[10px] font-semibold text-[#009587] hover:underline"
                          >
                            View Details →
                          </button>
                        </div>
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

            {/* Right: Map view container */}
            <div
              className="w-full flex-1 lg:sticky lg:top-24 lg:h-[calc(100vh-260px)]"
              style={{ minHeight: "420px" }}
            >
              <PropertyMap
                properties={properties}
                searchLocation={searchLocation}
                selectedProperty={selectedProperty}
                onSelectProperty={setSelectedProperty}
              />
            </div>
          </div>
        )}

        {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
        {!loading && viewMode === "list" && properties.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {properties.map((property, idx) => {
              const dist = formatDistance(property.distance);
              const isShortlisted = shortlists.includes(property._id);
              const photoSrc =
                property.photos && property.photos.length > 0
                  ? property.photos[0]
                  : DEFAULT_PROPERTY_IMAGE;

              return (
                <div
                  key={property._id || idx}
                  onClick={() => navigate(`/property/${property._id}`)}
                  className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:border-teal-500/50 hover:shadow-md overflow-hidden"
                >
                  {/* Card Header: Title + Price + Distance */}
                  <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-teal-50 border border-teal-200/80 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                          {property.propertyType || "Apartment"}
                        </span>
                        {property.preferredTenant && (
                          <span className="bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                            For: {property.preferredTenant}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 sm:text-lg group-hover:text-teal-700 transition">
                        {property.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <FaLocationDot className="shrink-0 text-teal-600" />
                        <span className="truncate">
                          {property.locality?.text ||
                            property.locality?.label ||
                            "Location specified by owner"}
                        </span>
                      </p>
                    </div>

                    {/* Rent & Distance Block */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-2 shrink-0">
                      <div>
                        <span className="text-xl sm:text-2xl font-bold text-teal-700">
                          {formatRent(property.rent)}
                        </span>
                        <span className="text-xs text-slate-500"> / month</span>
                      </div>
                      {property.deposit > 0 && (
                        <p className="text-[11px] text-slate-500">
                          Deposit: ₹{property.deposit.toLocaleString("en-IN")}
                        </p>
                      )}
                      {dist && (
                        <div className="mt-1 w-fit rounded-full bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                          📍 {dist}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100 bg-slate-50/50 text-center text-xs">
                    <div className="border-b border-r border-slate-100 px-2 py-2.5 sm:p-3 sm:border-b-0">
                      <span className="block font-medium text-slate-500">
                        BHK Type
                      </span>
                      <span className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-slate-800">
                        <FaBed className="text-slate-400 text-xs" />
                        {property.BHKType || "—"}
                      </span>
                    </div>

                    <div className="border-b border-slate-100 px-2 py-2.5 sm:p-3 sm:border-b-0 sm:border-r">
                      <span className="block font-medium text-slate-500">
                        Built-up Area
                      </span>
                      <span className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-slate-800">
                        <FaRulerCombined className="text-slate-400 text-xs" />
                        {property.builtUpArea
                          ? `${property.builtUpArea} sqft`
                          : "On Request"}
                      </span>
                    </div>

                    <div className="border-r border-slate-100 px-2 py-2.5 sm:p-3">
                      <span className="block font-medium text-slate-500">
                        Furnishing
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-slate-800 truncate">
                        {property.Furnishing || "—"}
                      </span>
                    </div>

                    <div className="px-2 py-2.5 sm:p-3">
                      <span className="block font-medium text-slate-500">
                        Availability
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-slate-800 truncate">
                        {property.Availability || "Immediate"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Photo + Amenities + Description + Actions */}
                  <div className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Photo */}
                      <div className="relative h-40 w-full sm:h-36 sm:w-52 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img
                          src={photoSrc}
                          alt={property.title}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.src = DEFAULT_PROPERTY_IMAGE;
                          }}
                        />
                        {property.photos && property.photos.length > 1 && (
                          <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white">
                            +{property.photos.length - 1} photos
                          </span>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex flex-1 flex-col justify-between gap-3">
                        <div>
                          {/* Amenity Badges */}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span
                              className={`rounded-full border px-2.5 py-1 font-medium ${
                                property.Parking
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-500"
                              }`}
                            >
                              <FaCar className="mr-1 inline" />
                              {property.Parking
                                ? "Parking Available"
                                : "No Parking"}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-1 font-medium ${
                                property.PetFriendly
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-slate-200 bg-slate-50 text-slate-500"
                              }`}
                            >
                              <FaPaw className="mr-1 inline" />
                              {property.PetFriendly
                                ? "Pet Friendly"
                                : "No Pets"}
                            </span>
                            {property.bathrooms && (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
                                <FaBath className="mr-1 inline text-slate-400" />
                                {property.bathrooms} Bath
                                {property.bathrooms > 1 ? "s" : ""}
                              </span>
                            )}
                            {property.amenities &&
                              property.amenities.slice(0, 3).map((am) => (
                                <span
                                  key={am}
                                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 font-medium"
                                >
                                  {am}
                                </span>
                              ))}
                          </div>

                          {property.description && (
                            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                              {property.description}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-stretch sm:items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGetOwnerDetails(property);
                            }}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center min-h-[40px] rounded-xl border border-teal-600 bg-white px-4 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 active:bg-teal-100 shadow-xs"
                          >
                            <FaPhone className="mr-1.5 text-xs" />
                            Get Owner Details
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRentalModal(property);
                            }}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center min-h-[40px] rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 active:bg-teal-800 shadow-xs"
                          >
                            Request to Rent
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleShortlist(property._id);
                            }}
                            className={`inline-flex items-center justify-center min-h-[40px] rounded-xl border px-3.5 py-2 text-xs font-medium transition shadow-xs ${
                              isShortlisted
                                ? "border-rose-300 bg-rose-50 text-rose-600"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <FaHeart
                              className={`mr-1.5 ${
                                isShortlisted ? "text-rose-500" : "text-slate-400"
                              }`}
                            />
                            {isShortlisted ? "Shortlisted" : "Shortlist"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-4">
              {loadingMore && (
                <div className="flex items-center gap-2 border border-gray-300 bg-white px-6 py-3 text-xs font-medium text-[#009587]">
                  <FaSpinner className="animate-spin" />
                  Loading more properties…
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

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="border border-dashed border-gray-300 bg-white p-10 text-center sm:p-14">
            <FaBuilding className="mx-auto text-4xl text-gray-300" />
            <h3 className="mt-3 text-base font-semibold text-gray-700">
              No properties matched your criteria
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
              Try removing some filters, selecting a different BHK type, expanding
              your budget, or searching in a different locality.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 bg-[#009587] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#007d71]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* ── Owner Contact Details Modal ─────────────────────────────────── */}
      {ownerModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setOwnerModalProperty(null);
                setOwnerData(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-sm"
            >
              <FaXmark />
            </button>

            <div className="flex items-center gap-2 text-teal-700 mb-2">
              <FaCircleCheck className="text-lg text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Verified Property Owner
              </span>
            </div>

            <h3 className="text-base font-semibold text-slate-800">
              {ownerModalProperty.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              📍 {ownerModalProperty.locality?.text || ownerModalProperty.locality?.label}
            </p>

            <div className="mt-4 border-t border-b border-slate-100 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Monthly Rent</span>
                  <p className="text-lg font-bold text-teal-700">
                    {formatRent(ownerModalProperty.rent)}/mo
                  </p>
                </div>
                {ownerModalProperty.deposit > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Security Deposit</span>
                    <p className="text-sm font-semibold text-slate-700">
                      ₹{ownerModalProperty.deposit.toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {ownerLoading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-teal-700">
                  <FaSpinner className="animate-spin text-teal-600" />
                  <span>Loading owner contact details…</span>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Owner Name:</span>
                      <span className="font-semibold text-slate-800">
                        {ownerData?.fullName || "Aryan Patel (Property Owner)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone Number:</span>
                      <span className="font-semibold text-slate-800">
                        {ownerData?.mobileNumber || "+91 98765 43210"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-semibold text-slate-800">
                        {ownerData?.email || "owner@rentosphere.com"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a
                      href={`tel:${ownerData?.mobileNumber || "+919876543210"}`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700 shadow-xs"
                    >
                      <FaPhone className="text-xs" /> Call Owner
                    </a>
                    <a
                      href={`https://wa.me/${(ownerData?.mobileNumber || "919876543210").replace(/\D/g, "")}?text=Hi, I am interested in your property "${encodeURIComponent(ownerModalProperty.title)}" listed on Rentosphere.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-xs"
                    >
                      <FaWhatsapp className="text-sm" /> WhatsApp
                    </a>
                  </div>

                  <p className="text-xs text-slate-500 text-center mt-2">
                    💡 Tip: Never transfer token deposit without visiting the property and verifying documents.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Rental Request Application Modal ───────────────────────────────── */}
      {rentalModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setRentalModalProperty(null);
                setRentalError("");
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-sm"
            >
              <FaXmark />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-50 border border-teal-200/80 text-teal-800 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Rental Application
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Apply to Rent this Property
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {rentalModalProperty.title} • {rentalModalProperty.locality?.text || rentalModalProperty.locality?.label}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
              <div>
                <span className="text-slate-500">Monthly Rent:</span>
                <p className="text-base font-bold text-teal-700">
                  {formatRent(rentalModalProperty.rent)}/mo
                </p>
              </div>
              <div>
                <span className="text-slate-500">Security Deposit:</span>
                <p className="text-base font-bold text-slate-800">
                  ₹{(rentalModalProperty.deposit || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {rentalSuccess ? (
              <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-6 text-center text-teal-800">
                <FaCircleCheck className="mx-auto text-3xl text-teal-600 mb-2" />
                <h4 className="text-sm font-bold">Application Sent Successfully!</h4>
                <p className="text-xs text-teal-700 mt-1">
                  The property owner has received your request. Once accepted, the property will be booked for you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRentalRequest} className="mt-4 space-y-4">
                {rentalError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                    {rentalError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Move-in Date
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message to Owner
                  </label>
                  <textarea
                    rows={3}
                    value={rentalMessage}
                    onChange={(e) => setRentalMessage(e.target.value)}
                    placeholder="Tell the owner about your occupation, family size, or move-in timeline..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs outline-none focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600/20"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRentalModalProperty(null)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rentalSubmitting}
                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50 shadow-xs"
                  >
                    {rentalSubmitting ? "Submitting..." : "Send Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
