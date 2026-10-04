import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LocalitySearch from "./LocalitySearch";
import {
  FaMagnifyingGlass,
  FaSliders,
  FaCar,
  FaPaw,
  FaBuilding,
  FaBed,
  FaRotateLeft,
  FaWandMagicSparkles,
  FaLightbulb,
  FaSpinner
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

const AI_SAMPLE_PROMPTS = [
  "🐾 Pet-friendly 2 BHK in Chennai under ₹25k with parking",
  "🏢 Fully furnished 3 BHK in Coimbatore with Gym & Pool",
  "⚡ 1 RK bachelor flat in Madurai under ₹10,000",
  "🏡 Independent house near OMR with power backup"
];

function SearchSection() {
  const navigate = useNavigate();

  // Search mode: 'standard' or 'ai'
  const [searchMode, setSearchMode] = useState("standard");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiParsing, setIsAiParsing] = useState(false);

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

  const handleAiSearch = async (promptToUse) => {
    const raw = promptToUse || aiPrompt;
    if (!raw.trim()) return;

    setIsAiParsing(true);

    try {
      const res = await api.post("/property/ai-parse", { prompt: raw });
      const parsed = res.data?.data;
      if (parsed?.filters) {
        const params = new URLSearchParams();
        const f = parsed.filters;

        if (f.city) params.set("city", f.city);
        if (f.locality) params.set("locality", f.locality);
        if (f.bhkType) params.set("bhkType", f.bhkType);
        if (f.minRent) params.set("minRent", f.minRent);
        if (f.maxRent) params.set("maxRent", f.maxRent);
        if (f.propertyType) params.set("propertyType", f.propertyType);
        if (f.furnishing) params.set("furnishing", f.furnishing);
        if (f.preferredTenant) params.set("tenantType", f.preferredTenant);
        if (f.parking) params.set("parking", "true");
        if (f.petFriendly) params.set("petFriendly", "true");
        if (f.keyword) params.set("keyword", f.keyword);
        if (f.amenities && f.amenities.length > 0) {
          f.amenities.forEach(a => params.append("amenities", a));
        }

        params.set("aiPrompt", raw);
        navigate(`/search?${params.toString()}`, {
          state: {
            aiParsed: parsed,
            aiSummary: parsed.summary,
            aiTags: parsed.tags
          }
        });
      }
    } catch (err) {
      console.error("AI Search Parse error:", err);
      navigate(`/search?search=${encodeURIComponent(raw)}&keyword=${encodeURIComponent(raw)}&aiPrompt=${encodeURIComponent(raw)}`);
    } finally {
      setIsAiParsing(false);
    }
  };

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
        {/* Search Mode Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/90 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setSearchMode("standard")}
            className={`flex items-center gap-2 px-5 py-3 border-r border-gray-200 transition ${
              searchMode === "standard"
                ? "bg-white text-[#009587] border-b-2 border-b-[#009587]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <FaMagnifyingGlass className="text-xs" />
            <span>Standard Filters</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("ai")}
            className={`flex items-center gap-2 px-5 py-3 transition ${
              searchMode === "ai"
                ? "bg-white text-[#009587] border-b-2 border-b-[#009587]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <FaWandMagicSparkles className="text-xs text-emerald-600" />
            <span>AI Smart Search</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 font-bold">
              AI
            </span>
          </button>
        </div>

        {searchMode === "ai" ? (
          <div className="p-4 sm:p-6 bg-gradient-to-b from-emerald-50/40 via-teal-50/20 to-white">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <FaWandMagicSparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-sm" />
                <input
                  type="text"
                  placeholder="e.g. Pet-friendly 2 BHK in Chennai under 25k with car parking and power backup..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 bg-white text-base sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#009587] shadow-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAiSearch()}
                disabled={isAiParsing}
                className="flex items-center justify-center gap-2 bg-[#009587] py-3.5 px-8 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#007d70] disabled:opacity-50 shrink-0"
              >
                {isAiParsing ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FaWandMagicSparkles className="text-xs" />
                    <span>Search with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="mt-4 pt-3 border-t border-gray-200/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <FaLightbulb className="text-amber-500" />
                Try Asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_SAMPLE_PROMPTS.map((promptText, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAiPrompt(promptText);
                      handleAiSearch(promptText);
                    }}
                    className="border border-gray-300 bg-white hover:border-[#009587] hover:text-[#009587] px-3 py-1 text-xs text-gray-700 transition"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
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
              className="w-full text-base sm:text-sm text-gray-800 placeholder-gray-400 outline-none"
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
        <div className="border-b border-gray-200 bg-gray-50/70 px-4 sm:px-5 py-3 space-y-3">
          {/* BHK Type Selector */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-gray-600 mr-1 flex items-center gap-1.5 shrink-0">
              <FaBed className="text-xs text-gray-500" /> BHK:
            </span>
            {BHK_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setBhkType(opt)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium transition ${
                  bhkType === opt
                    ? "bg-[#009587] text-white font-semibold"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Budget Presets & Custom Rent */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full min-w-0">
            {/* Quick Budget Chips */}
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0 scrollbar-none w-full sm:flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-600 mr-1 shrink-0">
                Budget:
              </span>
              {BUDGET_PRESETS.map((preset) => {
                const isSelected =
                  minRent === preset.min && maxRent === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleBudgetPreset(preset)}
                    className={`shrink-0 px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "bg-[#009587] text-white font-semibold"
                        : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Rent Inputs */}
            <div className="flex items-center gap-1.5 text-xs w-full min-w-0 pt-1 sm:pt-0 sm:w-auto sm:shrink-0 sm:border-l sm:border-gray-200 sm:pl-3">
              <span className="text-xs text-gray-500 font-medium shrink-0 sm:hidden">Custom:</span>
              <div className="relative flex-1 min-w-0 sm:w-24 sm:flex-initial">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  className="w-full min-w-0 border border-gray-300 bg-white pl-5 pr-1.5 py-1.5 outline-none text-base sm:text-xs text-gray-800 focus:border-[#009587] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <span className="text-gray-400 font-bold shrink-0">-</span>
              <div className="relative flex-1 min-w-0 sm:w-24 sm:flex-initial">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="w-full min-w-0 border border-gray-300 bg-white pl-5 pr-1.5 py-1.5 outline-none text-base sm:text-xs text-gray-800 focus:border-[#009587] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
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
        </>
        )}
      </div>
    </section>
  );
}

export default SearchSection;