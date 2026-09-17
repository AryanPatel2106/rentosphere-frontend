import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocalitySearch from "./LocalitySearch";
import {
  FaMagnifyingGlass,
  FaSliders,
  FaCar,
  FaPaw,
  FaBuilding,
  FaBed,
  FaRotateLeft
} from "react-icons/fa6";

const BHK_OPTIONS = ["All", "1RK", "1BHK", "2BHK", "3BHK", "4BHK"];

const BUDGET_PRESETS = [
  { label: "All Budgets", min: "", max: "" },
  { label: "< ₹20,000", min: "", max: "20000" },
  { label: "₹20,000 - ₹35,000", min: "20000", max: "35000" },
  { label: "₹35,000 - ₹50,000", min: "35000", max: "50000" },
  { label: "₹50,000+", min: "50000", max: "" },
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

function SearchSection() {
  const navigate = useNavigate();

  const [localities, setLocalities] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [bhkType, setBhkType] = useState("All");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [furnishing, setFurnishing] = useState("All");
  const [tenantType, setTenantType] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [parking, setParking] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleBudgetPreset = (preset) => {
    setMinRent(preset.min);
    setMaxRent(preset.max);
  };

  const handleReset = () => {
    setLocalities([]);
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
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
      params.set("search", keyword.trim());
    }

    if (bhkType && bhkType !== "All") {
      params.set("bhkType", bhkType);
    }

    if (minRent) params.set("minRent", minRent);
    if (maxRent) params.set("maxRent", maxRent);

    if (propertyType && propertyType !== "All") {
      params.set("propertyType", propertyType);
    }

    if (furnishing && furnishing !== "All") {
      params.set("furnishing", furnishing);
    }

    if (tenantType && tenantType !== "All") {
      params.set("tenantType", tenantType);
    }

    if (availability && availability !== "All") {
      params.set("availability", availability);
    }

    if (parking) params.set("parking", "true");
    if (petFriendly) params.set("petFriendly", "true");

    if (localities && localities.length > 0) {
      const loc = localities[0];
      if (loc.placeId) params.set("placeId", loc.placeId);
      if (loc.label) params.set("label", loc.label);
      if (loc.text) params.set("text", loc.text);
      if (loc.coordinates && loc.coordinates.length === 2) {
        params.set("lng", loc.coordinates[0]);
        params.set("lat", loc.coordinates[1]);
      }
    }

    navigate(`/search?${params.toString()}`, {
      state: {
        localities,
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
      },
    });
  };

  return (
    <section className="mt-6 flex justify-center px-4">
      <div className="w-full max-w-5xl border border-gray-300 bg-white shadow-md">
        {/* Top Search Inputs Row */}
        <div className="flex flex-col border-b border-gray-200 md:flex-row">
          {/* Locality Autocomplete Search */}
          <div className="flex-1 border-b border-gray-200 md:border-b-0 md:border-r">
            <LocalitySearch
              selected={localities}
              setSelected={setLocalities}
            />
          </div>

          {/* Keyword Search Input */}
          <div className="relative flex flex-1 items-center px-4 py-2.5 border-b border-gray-200 md:border-b-0 md:border-r">
            <FaMagnifyingGlass className="text-gray-400 mr-2 flex-shrink-0 text-sm" />
            <input
              type="text"
              placeholder="Search apartment, society, or landmark (e.g. Prestige, Brigade)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-[#009587] py-3.5 px-8 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#007d70] md:w-48"
          >
            <FaMagnifyingGlass className="text-xs" />
            <span>Search</span>
          </button>
        </div>

        {/* Middle Row: BHK Pills & Budget Presets */}
        <div className="border-b border-gray-200 bg-gray-50/70 px-5 py-3 space-y-3">
          {/* BHK Type Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 mr-1 flex items-center gap-1.5">
              <FaBed className="text-xs text-gray-500" /> Bedrooms (BHK):
            </span>
            {BHK_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setBhkType(opt)}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  bhkType === opt
                    ? "bg-[#009587] text-white font-semibold"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Budget Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 mr-1">
              Monthly Budget:
            </span>
            {BUDGET_PRESETS.map((preset) => {
              const isSelected =
                minRent === preset.min && maxRent === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleBudgetPreset(preset)}
                  className={`px-3 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? "bg-[#009587] text-white font-semibold"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            {/* Custom Min / Max Rent Inputs */}
            <div className="flex items-center gap-1.5 ml-auto text-xs">
              <input
                type="number"
                placeholder="Min ₹"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value)}
                className="w-24 border border-gray-300 bg-white px-2.5 py-1.5 outline-none text-xs text-gray-800 focus:border-[#009587]"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                className="w-24 border border-gray-300 bg-white px-2.5 py-1.5 outline-none text-xs text-gray-800 focus:border-[#009587]"
              />
            </div>
          </div>
        </div>

        {/* Dropdowns Filter Row: Property Type, Furnishing, Tenant, Availability */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {/* Property Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#009587]"
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Furnishing Status
              </label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#009587]"
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Preferred Tenant
              </label>
              <select
                value={tenantType}
                onChange={(e) => setTenantType(e.target.value)}
                className="w-full border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#009587]"
              >
                {TENANT_OPTIONS.map((tn) => (
                  <option key={tn} value={tn}>
                    {tn}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Move-in Timeline
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#009587]"
              >
                {AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Amenities & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={parking}
                  onChange={(e) => setParking(e.target.checked)}
                  className="accent-[#009587] h-3.5 w-3.5"
                />
                <FaCar className="text-gray-400 text-xs" />
                <span className="text-xs sm:text-sm">Reserved Parking</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={petFriendly}
                  onChange={(e) => setPetFriendly(e.target.checked)}
                  className="accent-[#009587] h-3.5 w-3.5"
                />
                <FaPaw className="text-gray-400 text-xs" />
                <span className="text-xs sm:text-sm">Pet Friendly</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-800 flex items-center gap-1.5 text-xs font-semibold transition"
            >
              <FaRotateLeft className="text-[11px]" /> Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchSection;