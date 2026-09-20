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
  const mapListRef = useRef(null);
  const listScrollRef = useRef(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const isFetchingRef = useRef(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      if (isFetchingRef.current && !isNewSearch) return;
      isFetchingRef.current = true;

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

      if (activeLocality?.city) {
        params.city = activeLocality.city;
      } else if (searchParams.get("city")) {
        params.city = searchParams.get("city");
      }

      if (activeLocality?.coordinates && activeLocality.coordinates.length === 2) {
        params.lng = activeLocality.coordinates[0];
        params.lat = activeLocality.coordinates[1];
      } else if (searchParams.get("lat") && searchParams.get("lng")) {
        params.lat = searchParams.get("lat");
        params.lng = searchParams.get("lng");
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
        const data = res.data?.data;
        const newProperties = data?.properties || [];

        if (isNewSearch) {
          setProperties(newProperties);
          setSelectedProperty(null);
          setSearchLocation(data?.searchLocation || null);
          if (listScrollRef.current) {
            listScrollRef.current.scrollTop = 0;
          }
          if (mapListRef.current) {
            mapListRef.current.scrollTop = 0;
          }
        } else {
          setProperties((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const unique = newProperties.filter((p) => !existingIds.has(p._id));
            return [...prev, ...unique];
          });
        }

        const currentPage = data?.page || pageToFetch;
        const moreAvailable = Boolean(data?.hasMore);

        pageRef.current = currentPage;
        hasMoreRef.current = moreAvailable;

        setPage(currentPage);
        setHasMore(moreAvailable);
        setTotal(data?.total || 0);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError(getErrorMessage(err, "Failed to load properties. Please try again."));
      } finally {
        isFetchingRef.current = false;
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
    pageRef.current = 1;
    hasMoreRef.current = false;
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
    if (isFetchingRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    fetchProperties(nextPage, false);
  }, [fetchProperties]);

  const handleScrollToTop = () => {
    if (viewMode === "list" && listScrollRef.current) {
      listScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (viewMode === "map" && mapListRef.current) {
      mapListRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 1. Intersection Observer on bottom sentinel
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          handleLoadMore();
        }
      },
      {
        root: viewMode === "list" ? listScrollRef.current : null,
        rootMargin: "350px 0px",
      }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loading, handleLoadMore, properties.length, viewMode]);

  // 2. Container scroll for list view box
  useEffect(() => {
    const el = listScrollRef.current;
    if (!el || viewMode !== "list") return;

    let ticking = false;
    const onListScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(el.scrollTop > 300);
          if (!isFetchingRef.current && hasMoreRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = el;
            if (scrollHeight - (scrollTop + clientHeight) <= 350) {
              handleLoadMore();
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", onListScroll, { passive: true });
    return () => el.removeEventListener("scroll", onListScroll);
  }, [viewMode, handleLoadMore]);

  // 3. Container scroll for map view card list
  useEffect(() => {
    const el = mapListRef.current;
    if (!el || viewMode !== "map") return;

    let ticking = false;
    const onMapListScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(el.scrollTop > 300);
          if (!isFetchingRef.current && hasMoreRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = el;
            if (scrollHeight - (scrollTop + clientHeight) <= 250) {
              handleLoadMore();
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", onMapListScroll, { passive: true });
    return () => el.removeEventListener("scroll", onMapListScroll);
  }, [viewMode, handleLoadMore]);

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

  // Render unified filter controls for both Desktop Left Sidebar and Mobile Slide-over Drawer
  const renderFilterContent = (isMobile = false) => (
    <div className="space-y-4 text-xs">
      {/* 1. Keyword Search */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          Search Keywords
        </label>
        <div className="relative">
          <FaMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
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
            placeholder="Title, locality, amenities..."
            className="w-full border border-gray-300 bg-gray-50 pl-8 pr-7 py-2 text-base sm:text-xs text-gray-800 outline-none transition focus:border-[#009587] focus:bg-white"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setPage(1);
                updateUrlParams({ keyword: "" });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <FaXmark className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* 2. BHK Configuration */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          BHK Configuration
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {BHK_OPTIONS.map((opt) => {
            const isSelected = bhkType === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setBhkType(opt)}
                className={`px-2 py-2 text-center text-xs font-semibold border transition ${
                  isSelected
                    ? "border-[#009587] bg-[#009587] text-white"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Budget Range */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          Monthly Rent Budget
        </label>
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
          className="w-full border border-gray-300 bg-gray-50 px-2.5 py-2 text-base sm:text-xs text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white mb-2"
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
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
            <input
              type="number"
              value={minRent}
              onChange={(e) => setMinRent(e.target.value)}
              placeholder="Min"
              className="w-full border border-gray-300 bg-gray-50 pl-6 pr-2 py-1.5 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
            />
          </div>
          <span className="text-gray-400 text-xs font-semibold">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
            <input
              type="number"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              placeholder="Max"
              className="w-full border border-gray-300 bg-gray-50 pl-6 pr-2 py-1.5 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Property Type */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          Property Type
        </label>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-full border border-gray-300 bg-gray-50 px-2.5 py-2 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Furnishing */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          Furnishing Status
        </label>
        <select
          value={furnishing}
          onChange={(e) => setFurnishing(e.target.value)}
          className="w-full border border-gray-300 bg-gray-50 px-2.5 py-2 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
        >
          {FURNISHING_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* 6. Preferred Tenant */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          Preferred Tenant
        </label>
        <select
          value={tenantType}
          onChange={(e) => setTenantType(e.target.value)}
          className="w-full border border-gray-300 bg-gray-50 px-2.5 py-2 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
        >
          {TENANT_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* 7. Availability */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          Availability
        </label>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full border border-gray-300 bg-gray-50 px-2.5 py-2 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
        >
          {AVAILABILITY_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* 8. Amenities & Rules */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          Amenities & Rules
        </label>
        <div className="space-y-2 pt-0.5">
          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={parking}
              onChange={(e) => setParking(e.target.checked)}
              className="accent-[#009587] h-4 w-4"
            />
            <FaCar className="text-gray-500 text-xs" />
            <span>Parking Available</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={petFriendly}
              onChange={(e) => setPetFriendly(e.target.checked)}
              className="accent-[#009587] h-4 w-4"
            />
            <FaPaw className="text-gray-500 text-xs" />
            <span>Pet Friendly</span>
          </label>
        </div>
      </div>

      {/* 9. Sort By */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          Sort Listings
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full border border-gray-300 bg-gray-50 px-2.5 py-2 text-base sm:text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
        >
          <option value="nearest">Nearest First</option>
          <option value="rent_asc">Price: Low to High</option>
          <option value="rent_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
          >
            Clear All Filters ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  );

  const activeLabel =
    selectedLocalities[0]?.label ||
    selectedLocalities[0]?.text ||
    searchLocation?.label ||
    searchParams.get("q") ||
    "All Localities";

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* ── Compact Header & Locality Search ─────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white py-2.5 sm:py-3 shadow-xs">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
            {/* Title & Count Badge */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                  Properties in <span className="text-[#009587]">{activeLabel}</span>
                </h1>
                {total > 0 && (
                  <span className="shrink-0 bg-teal-50 border border-teal-200 text-[#009587] text-[11px] font-bold px-2 py-0.5">
                    {total} listings
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 truncate hidden sm:block">
                Verified owners • Transparent pricing • Instant contact
              </p>
            </div>

            {/* Locality Search + View Toggle */}
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 sm:w-72 border border-gray-300 bg-gray-50 transition focus-within:border-[#009587] focus-within:bg-white text-xs">
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

              {/* View Toggle Buttons */}
              <div className="flex shrink-0 border border-gray-300 bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold transition ${
                    viewMode === "list"
                      ? "bg-[#009587] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title="List View"
                >
                  <FaList /> <span className="hidden sm:inline">List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold transition ${
                    viewMode === "map"
                      ? "bg-[#009587] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Map View"
                >
                  <FaMapLocationDot /> <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Quick Bar (Sticky on mobile only) ──────────────────── */}
      <div className="lg:hidden sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur px-3 py-2 flex items-center justify-between gap-2 shadow-xs">
        {/* Filters Drawer Trigger */}
        <button
          type="button"
          onClick={() => setShowFilterDrawer(true)}
          className={`shrink-0 flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold transition ${
            activeFilterCount > 0
              ? "border-[#009587] bg-teal-50 text-[#009587]"
              : "border-gray-300 bg-white text-gray-700 active:bg-gray-50"
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

        {/* Quick BHK Horizontal Scroller */}
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none flex-1 py-0.5">
          {BHK_OPTIONS.map((opt) => {
            const isSelected = bhkType === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setBhkType(opt)}
                className={`whitespace-nowrap px-2.5 py-1 text-xs font-medium border transition ${
                  isSelected
                    ? "border-[#009587] bg-[#009587] text-white"
                    : "border-gray-200 bg-gray-50 text-gray-700"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Quick Sort Dropdown */}
        <div className="shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-[#009587]"
          >
            <option value="nearest">Nearest</option>
            <option value="rent_asc">₹ Low</option>
            <option value="rent_desc">₹ High</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4">
        {/* ── 2-Column Responsive Layout ──────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-5">
          {/* ── DESKTOP LEFT FILTER SIDEBAR ───────────────────────────────── */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-3 h-[calc(100vh-120px)] overflow-y-auto overscroll-contain border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FaSliders className="text-[#009587] text-sm" />
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center bg-[#009587] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-red-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {renderFilterContent(false)}
          </aside>

          {/* ── RIGHT LISTINGS & CONTENT AREA ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Active Filter Chips Strip */}
            {activeFilterCount > 0 && (
              <div className="mb-3 flex flex-wrap items-center gap-1.5 bg-white border border-gray-200 p-2.5 text-xs shadow-2xs">
                <span className="text-gray-400 text-[11px] font-medium mr-1">Active:</span>
                {keyword.trim() && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-700 text-[11px]">
                    <span>"{keyword}"</span>
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
                {availability !== "All" && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-700 text-[11px]">
                    <span>{availability}</span>
                    <button
                      type="button"
                      onClick={() => setAvailability("All")}
                      className="hover:text-red-500"
                    >
                      <FaXmark className="text-[10px]" />
                    </button>
                  </span>
                )}
                {parking && (
                  <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-0.5 text-[#009587] text-[11px]">
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
                  <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-0.5 text-[#009587] text-[11px]">
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

            {error && (
              <div className="mb-4 border border-red-300 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-3">
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
                  <div ref={mapListRef} className="space-y-2 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1 max-h-72 overflow-y-auto pr-1">
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

                    <div className="py-3 text-center">
                      {loadingMore && (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#009587]">
                          <FaSpinner className="animate-spin" />
                          <span>Loading more properties…</span>
                        </div>
                      )}
                      {hasMore && !loadingMore && (
                        <button
                          type="button"
                          onClick={handleLoadMore}
                          className="w-full border border-gray-300 bg-white py-2 text-xs font-semibold text-[#009587] hover:bg-teal-50 transition"
                        >
                          Load More ({properties.length} of {total})
                        </button>
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
              <div
                ref={listScrollRef}
                className="h-[calc(100vh-170px)] lg:h-[calc(100vh-125px)] min-h-[440px] overflow-y-auto overscroll-contain pr-1 sm:pr-2 space-y-4 rounded-none border border-gray-200/80 bg-slate-50/40 p-2 sm:p-4 shadow-xs"
              >
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
                  className="group cursor-pointer border border-gray-300 bg-white shadow-xs transition hover:border-[#009587] hover:shadow-md"
                >
                  {/* Card Header: Title + Price + Distance */}
                  <div className="flex flex-col gap-2 border-b border-gray-200 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#009587]">
                          {property.propertyType || "Apartment"}
                        </span>
                        {property.preferredTenant && (
                          <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            For: {property.preferredTenant}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-gray-800 sm:text-lg group-hover:text-[#009587] transition">
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

                    {/* Rent & Distance Block */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-2 shrink-0">
                      <div>
                        <span className="text-xl sm:text-2xl font-bold text-[#009587]">
                          {formatRent(property.rent)}
                        </span>
                        <span className="text-xs text-gray-500"> / month</span>
                      </div>
                      {property.deposit > 0 && (
                        <p className="text-[11px] text-gray-500">
                          Deposit: ₹{property.deposit.toLocaleString("en-IN")}
                        </p>
                      )}
                      {dist && (
                        <div className="mt-1 w-fit bg-[#009587] px-2.5 py-0.5 text-xs font-semibold text-white">
                          📍 {dist}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-200 text-center text-xs">
                    <div className="border-b border-r border-gray-200 px-2 py-2.5 sm:p-3 sm:border-b-0">
                      <span className="block font-medium text-gray-500">
                        BHK Type
                      </span>
                      <span className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-gray-800">
                        <FaBed className="text-gray-400 text-xs" />
                        {property.BHKType || "—"}
                      </span>
                    </div>

                    <div className="border-b border-gray-200 px-2 py-2.5 sm:p-3 sm:border-b-0 sm:border-r">
                      <span className="block font-medium text-gray-500">
                        Built-up Area
                      </span>
                      <span className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-gray-800">
                        <FaRulerCombined className="text-gray-400 text-xs" />
                        {property.builtUpArea
                          ? `${property.builtUpArea} sqft`
                          : "On Request"}
                      </span>
                    </div>

                    <div className="border-r border-gray-200 px-2 py-2.5 sm:p-3">
                      <span className="block font-medium text-gray-500">
                        Furnishing
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-gray-800 truncate">
                        {property.Furnishing || "—"}
                      </span>
                    </div>

                    <div className="px-2 py-2.5 sm:p-3">
                      <span className="block font-medium text-gray-500">
                        Availability
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-gray-800 truncate">
                        {property.Availability || "Immediate"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Photo + Amenities + Description + Actions */}
                  <div className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Photo */}
                      <div className="relative h-40 w-full sm:h-36 sm:w-52 shrink-0 overflow-hidden border border-gray-200 bg-gray-100">
                        <img
                          src={photoSrc}
                          alt={property.title}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.src = DEFAULT_PROPERTY_IMAGE;
                          }}
                        />
                        {property.photos && property.photos.length > 1 && (
                          <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
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
                              className={`border px-2.5 py-1 font-medium ${
                                property.Parking
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                  : "border-gray-200 bg-gray-50 text-gray-500"
                              }`}
                            >
                              <FaCar className="mr-1 inline" />
                              {property.Parking
                                ? "Parking Available"
                                : "No Parking"}
                            </span>
                            <span
                              className={`border px-2.5 py-1 font-medium ${
                                property.PetFriendly
                                  ? "border-amber-300 bg-amber-50 text-amber-700"
                                  : "border-gray-200 bg-gray-50 text-gray-500"
                              }`}
                            >
                              <FaPaw className="mr-1 inline" />
                              {property.PetFriendly
                                ? "Pet Friendly"
                                : "No Pets"}
                            </span>
                            {property.bathrooms && (
                              <span className="border border-gray-200 bg-gray-50 px-2.5 py-1 font-medium text-gray-600">
                                <FaBath className="mr-1 inline text-gray-400" />
                                {property.bathrooms} Bath
                                {property.bathrooms > 1 ? "s" : ""}
                              </span>
                            )}
                            {property.amenities &&
                              property.amenities.slice(0, 3).map((am) => (
                                <span
                                  key={am}
                                  className="border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600"
                                >
                                  {am}
                                </span>
                              ))}
                          </div>

                          {property.description && (
                            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-600">
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
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center min-h-[40px] border border-[#009587] bg-white px-4 py-2 text-xs font-semibold text-[#009587] transition hover:bg-teal-50 active:bg-teal-100"
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
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center min-h-[40px] bg-[#009587] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#007f73] active:bg-[#006e63]"
                          >
                            Request to Rent
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleShortlist(property._id);
                            }}
                            className={`inline-flex items-center justify-center min-h-[40px] border px-3.5 py-2 text-xs font-medium transition ${
                              isShortlisted
                                ? "border-red-400 bg-red-50 text-red-600"
                                : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <FaHeart
                              className={`mr-1.5 ${
                                isShortlisted ? "text-red-500" : "text-gray-400"
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
            <div ref={sentinelRef} className="flex flex-col items-center justify-center py-6 gap-3">
              {loadingMore && (
                <div className="flex items-center gap-2 border border-[#009587]/30 bg-teal-50 px-6 py-3 text-xs font-semibold text-[#009587] shadow-sm">
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Loading next 20 properties…</span>
                </div>
              )}
              {hasMore && !loadingMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 border border-[#009587] bg-white px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#009587] shadow-sm hover:bg-[#009587] hover:text-white transition active:scale-[0.98]"
                >
                  <span>Load 20 More Properties ({properties.length} of {total} loaded)</span>
                </button>
              )}
              {!loading && !hasMore && properties.length > 0 && (
                <div className="border border-gray-200 bg-white px-6 py-2.5 text-xs text-gray-500 shadow-sm">
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
          </div>
        </div>

        {/* Floating Back to Top Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={handleScrollToTop}
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-1.5 border border-[#009587] bg-[#009587] text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#007d71] active:scale-95 transition-all rounded-none"
            title="Back to top"
          >
            <span>↑ Back to Top</span>
          </button>
        )}

        {/* ── MOBILE SLIDE-OVER FILTER DRAWER ──────────────────────────────── */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setShowFilterDrawer(false)}
            />
            {/* Slide-over panel */}
            <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3.5 bg-gray-50">
                <div className="flex items-center gap-2">
                  <FaSliders className="text-[#009587] text-sm" />
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center bg-[#009587] text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilterDrawer(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 text-base"
                >
                  <FaXmark />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
                {renderFilterContent(true)}
              </div>

              <div className="border-t border-gray-200 p-3 bg-gray-50 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 border border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterDrawer(false)}
                  className="flex-1 bg-[#009587] py-2.5 text-xs font-bold text-white hover:bg-[#007d71] transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Owner Contact Details Modal ─────────────────────────────────── */}
      {ownerModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 bg-white p-5 sm:p-6 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setOwnerModalProperty(null);
                setOwnerData(null);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-sm"
            >
              <FaXmark />
            </button>

            <div className="flex items-center gap-2 text-[#009587] mb-2">
              <FaCircleCheck className="text-lg" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Verified Property Owner
              </span>
            </div>

            <h3 className="text-base font-semibold text-gray-800">
              {ownerModalProperty.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              📍 {ownerModalProperty.locality?.text || ownerModalProperty.locality?.label}
            </p>

            <div className="mt-4 border-t border-b border-gray-100 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Monthly Rent</span>
                  <p className="text-lg font-bold text-[#009587]">
                    {formatRent(ownerModalProperty.rent)}/mo
                  </p>
                </div>
                {ownerModalProperty.deposit > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Security Deposit</span>
                    <p className="text-sm font-semibold text-gray-700">
                      ₹{ownerModalProperty.deposit.toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {ownerLoading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-[#009587]">
                  <FaSpinner className="animate-spin" />
                  <span>Loading owner contact details…</span>
                </div>
              ) : (
                <>
                  <div className="border border-gray-200 bg-gray-50 p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Owner Name:</span>
                      <span className="font-semibold text-gray-800">
                        {ownerData?.fullName || "Aryan Patel (Property Owner)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone Number:</span>
                      <span className="font-semibold text-gray-800">
                        {ownerData?.mobileNumber || "+91 98765 43210"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-semibold text-gray-800">
                        {ownerData?.email || "owner@rentosphere.com"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a
                      href={`tel:${ownerData?.mobileNumber || "+919876543210"}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#009587] py-2.5 text-xs font-semibold text-white transition hover:bg-[#007d70]"
                    >
                      <FaPhone className="text-xs" /> Call Owner
                    </a>
                    <a
                      href={`https://wa.me/${(ownerData?.mobileNumber || "919876543210").replace(/\D/g, "")}?text=Hi, I am interested in your property "${encodeURIComponent(ownerModalProperty.title)}" listed on Rentosphere.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <FaWhatsapp className="text-sm" /> WhatsApp
                    </a>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-2">
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
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 bg-white p-5 sm:p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setRentalModalProperty(null);
                setRentalError("");
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-sm"
            >
              <FaXmark />
            </button>

            <div className="flex items-center gap-2 text-[#009587] mb-2">
              <span className="bg-[#009587] text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Rental Application
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              Apply to Rent this Property
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {rentalModalProperty.title} • {rentalModalProperty.locality?.text || rentalModalProperty.locality?.label}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border border-gray-200 bg-gray-50 p-3 text-xs">
              <div>
                <span className="text-gray-500">Monthly Rent:</span>
                <p className="text-base font-bold text-[#009587]">
                  {formatRent(rentalModalProperty.rent)}/mo
                </p>
              </div>
              <div>
                <span className="text-gray-500">Security Deposit:</span>
                <p className="text-base font-bold text-gray-800">
                  ₹{(rentalModalProperty.deposit || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {rentalSuccess ? (
              <div className="mt-6 border border-teal-200 bg-teal-50 p-6 text-center text-teal-800">
                <FaCircleCheck className="mx-auto text-3xl text-[#009587] mb-2" />
                <h4 className="text-sm font-bold">Application Sent Successfully!</h4>
                <p className="text-xs text-teal-700 mt-1">
                  The property owner has received your request. Once accepted, the property will be booked for you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRentalRequest} className="mt-4 space-y-4">
                {rentalError && (
                  <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                    {rentalError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Preferred Move-in Date
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#009587]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Message to Owner
                  </label>
                  <textarea
                    rows={3}
                    value={rentalMessage}
                    onChange={(e) => setRentalMessage(e.target.value)}
                    placeholder="Tell the owner about your occupation, family size, or move-in timeline..."
                    className="w-full border border-gray-300 p-3 text-xs outline-none focus:border-[#009587]"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRentalModalProperty(null)}
                    className="flex-1 border border-gray-300 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rentalSubmitting}
                    className="flex-1 bg-[#009587] py-2.5 text-xs font-semibold text-white transition hover:bg-[#007f73] disabled:opacity-50"
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
