import { useState } from "react";
import api from "../services/api";
import {
  FaPenToSquare,
  FaCamera,
  FaCircleCheck,
  FaCircleInfo,
  FaIndianRupeeSign,
  FaPlus,
  FaTrash,
  FaCar,
  FaPaw,
  FaBuilding,
  FaBed,
  FaBath,
  FaRulerCombined,
} from "react-icons/fa6";
import LocalitySearch from "../components/dashboard/LocalitySearch";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: <FaPenToSquare className="text-2xl text-white" />,
    title: "Fill in Property Details",
    desc: "Enter the property type, location, rent, furnishing status, and other key details.",
  },
  {
    icon: <FaCamera className="text-2xl text-white" />,
    title: "Upload Photos",
    desc: "Add clear photos of your property to attract quality tenants quickly.",
  },
  {
    icon: <FaCircleCheck className="text-2xl text-white" />,
    title: "Go Live",
    desc: "Submit your listing. After a quick review, your property will be visible to thousands of renters.",
  },
];

const CURATED_SAMPLE_PHOTOS = [
  {
    label: "Modern Living Room",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Modular Kitchen",
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Master Bedroom",
    url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Luxury High-Rise",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
];

const POPULAR_AMENITIES = [
  "Lift",
  "Power Backup",
  "Gym",
  "Swimming Pool",
  "Gated Security",
  "Clubhouse",
  "Park",
  "Gas Pipeline",
  "Covered Parking",
  "Wi-Fi",
];

function PostProperty() {
  const [selectedLocalities, setSelectedLocalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [photoInput, setPhotoInput] = useState("");
  const navigate = useNavigate();

  const [propertyDetails, setPropertyDetails] = useState({
    title: "",
    Locality: {},
    rent: "",
    deposit: "",
    propertyType: "Apartment",
    bhkType: "2BHK",
    Furnishing: "Semi-Furnished",
    preferredTenant: "Anyone",
    Availability: "Immediate",
    builtUpArea: "",
    bathrooms: "2",
    balconies: "1",
    floor: "",
    totalFloors: "",
    parking: true,
    petFriendly: false,
    photos: [CURATED_SAMPLE_PHOTOS[0].url],
    amenities: ["Lift", "Power Backup", "Gated Security"],
    description: "",
  });

  const handleLocalitySelection = (localities) => {
    setSelectedLocalities(localities);
    setPropertyDetails((prev) => ({
      ...prev,
      Locality: localities[0] || {},
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPropertyDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add photo URL
  const handleAddPhoto = () => {
    if (!photoInput.trim()) return;
    if (!photoInput.startsWith("http://") && !photoInput.startsWith("https://")) {
      setError("Please enter a valid image URL starting with http:// or https://");
      return;
    }
    setPropertyDetails((prev) => ({
      ...prev,
      photos: [...prev.photos, photoInput.trim()],
    }));
    setPhotoInput("");
    setError(null);
  };

  // Remove photo
  const handleRemovePhoto = (index) => {
    setPropertyDetails((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Toggle amenity
  const handleToggleAmenity = (amenity) => {
    setPropertyDetails((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Auto calculate deposit as 2x or 3x rent
  const handleSetDepositMultiplier = (multiplier) => {
    const rentNum = Number(propertyDetails.rent);
    if (rentNum > 0) {
      setPropertyDetails((prev) => ({
        ...prev,
        deposit: String(rentNum * multiplier),
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // Validation
    if (!propertyDetails.title.trim()) {
      setError("Please enter a property title.");
      return;
    }
    if (!propertyDetails.Locality?.label && !propertyDetails.Locality?.text) {
      setError("Please search and select a locality.");
      return;
    }
    if (!propertyDetails.rent || Number(propertyDetails.rent) <= 0) {
      setError("Please enter a valid monthly rent.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/property", propertyDetails);
      setLoading(false);
      navigate("/profile", { state: { openSection: "properties" } });
    } catch (err) {
      console.error("Property creation error:", err);
      setError(err.response?.data?.message || err.message || "Failed to post property.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white px-4 py-12 text-center sm:py-16">
        <h1 className="text-3xl font-light text-gray-700 sm:text-4xl lg:text-5xl">
          Post Your <span className="font-semibold text-[#009587]">Property</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
          List your property on Rentosphere for free and connect directly with verified tenants —
          zero brokerage, maximum reach.
        </p>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
        <h2 className="mb-8 text-center text-xl font-semibold text-gray-800">
          How It Works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center gap-3 text-center">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#009587]">
                {step.icon}
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">{step.title}</h3>
              <p className="text-xs leading-5 text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form Section ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <FaCircleInfo className="text-[#009587]" />
            <p className="text-xs sm:text-sm text-gray-600">
              Fill in all details accurately so suitable tenants can reach out directly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={propertyDetails.title}
                onChange={handleChange}
                placeholder="e.g. Spacious 2BHK Apartment in Koramangala 4th Block"
                className="w-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                required
              />
            </div>

            {/* Locality Search */}
            <div>
              <label htmlFor="Locality" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Locality / Area <span className="text-red-500">*</span>
              </label>
              <div className="w-full border border-gray-300 bg-gray-50 text-sm text-gray-700 outline-none transition focus-within:border-[#009587] focus-within:bg-white">
                <LocalitySearch
                  selected={selectedLocalities}
                  setSelected={handleLocalitySelection}
                  singleSelect={true}
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Type city or area name to select from verified Google Places.
              </p>
            </div>

            {/* Rent & Deposit Section */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rent" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Monthly Rent (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    id="rent"
                    name="rent"
                    type="number"
                    min="1"
                    value={propertyDetails.rent}
                    onChange={handleChange}
                    placeholder="25000"
                    className="w-full border border-gray-300 bg-gray-50 pl-8 pr-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="deposit" className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Security Deposit (₹)
                  </label>
                  {propertyDetails.rent > 0 && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetDepositMultiplier(2)}
                        className="text-[10px] text-[#009587] hover:underline"
                      >
                        2x Rent
                      </button>
                      <span className="text-gray-300 text-[10px]">|</span>
                      <button
                        type="button"
                        onClick={() => handleSetDepositMultiplier(3)}
                        className="text-[10px] text-[#009587] hover:underline"
                      >
                        3x Rent
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    id="deposit"
                    name="deposit"
                    type="number"
                    min="0"
                    value={propertyDetails.deposit}
                    onChange={handleChange}
                    placeholder="50000"
                    className="w-full border border-gray-300 bg-gray-50 pl-8 pr-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Property Type, BHK Type, Furnishing */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="propertyType" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Property Type
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={propertyDetails.propertyType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Villa">Villa</option>
                  <option value="Builder Floor">Builder Floor</option>
                  <option value="Studio">Studio</option>
                  <option value="PG/Co-living">PG/Co-living</option>
                </select>
              </div>

              <div>
                <label htmlFor="bhkType" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  BHK Type
                </label>
                <select
                  id="bhkType"
                  name="bhkType"
                  value={propertyDetails.bhkType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="1RK">1RK</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="4BHK">4BHK</option>
                  <option value="5BHK+">5BHK+</option>
                </select>
              </div>

              <div>
                <label htmlFor="Furnishing" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Furnishing
                </label>
                <select
                  id="Furnishing"
                  name="Furnishing"
                  value={propertyDetails.Furnishing}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>

            {/* Tenant, Availability, Built-up Area */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="preferredTenant" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Preferred Tenant
                </label>
                <select
                  id="preferredTenant"
                  name="preferredTenant"
                  value={propertyDetails.preferredTenant}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="Anyone">Anyone</option>
                  <option value="Family">Family</option>
                  <option value="Bachelors">Bachelors</option>
                  <option value="Company">Company</option>
                </select>
              </div>

              <div>
                <label htmlFor="Availability" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Availability
                </label>
                <select
                  id="Availability"
                  name="Availability"
                  value={propertyDetails.Availability}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="Within 15 Days">Within 15 Days</option>
                  <option value="Within 30 Days">Within 30 Days</option>
                  <option value="After 30 Days">After 30 Days</option>
                </select>
              </div>

              <div>
                <label htmlFor="builtUpArea" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Built-up Area (sqft)
                </label>
                <input
                  id="builtUpArea"
                  name="builtUpArea"
                  type="number"
                  min="50"
                  value={propertyDetails.builtUpArea}
                  onChange={handleChange}
                  placeholder="e.g. 1150"
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                />
              </div>
            </div>

            {/* Bathrooms & Balconies */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bathrooms" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Bathrooms
                </label>
                <select
                  id="bathrooms"
                  name="bathrooms"
                  value={propertyDetails.bathrooms}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>
              </div>

              <div>
                <label htmlFor="balconies" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Balconies
                </label>
                <select
                  id="balconies"
                  name="balconies"
                  value={propertyDetails.balconies}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="0">No Balcony</option>
                  <option value="1">1 Balcony</option>
                  <option value="2">2 Balconies</option>
                  <option value="3">3+ Balconies</option>
                </select>
              </div>
            </div>

            {/* Parking & Pet Friendly Checkboxes */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition hover:border-[#009587]">
                <input
                  id="parking"
                  name="parking"
                  type="checkbox"
                  checked={Boolean(propertyDetails.parking)}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#009587]"
                />
                <FaCar className="text-gray-500" />
                <span className="font-medium">Parking Available</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition hover:border-[#009587]">
                <input
                  id="petFriendly"
                  name="petFriendly"
                  type="checkbox"
                  checked={Boolean(propertyDetails.petFriendly)}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#009587]"
                />
                <FaPaw className="text-gray-500" />
                <span className="font-medium">Pet Friendly</span>
              </label>
            </div>

            {/* Popular Amenities Selection */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Key Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_AMENITIES.map((amenity) => {
                  const isChecked = propertyDetails.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleToggleAmenity(amenity)}
                      className={`border px-3 py-1.5 text-xs font-medium transition ${
                        isChecked
                          ? "border-[#009587] bg-teal-50 text-[#009587]"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {isChecked ? "✓ " : "+ "}
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photos Section */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Property Photos
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  className="flex-1 border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#009587] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="border border-[#009587] bg-teal-50 px-3 py-2 text-xs font-semibold text-[#009587] hover:bg-teal-100 transition flex items-center gap-1"
                >
                  <FaPlus className="text-[10px]" /> Add Photo
                </button>
              </div>

              {/* Curated Sample Photos Chips */}
              <div className="mb-3">
                <span className="text-[11px] text-gray-400 block mb-1">
                  Or add sample photos in 1-click:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CURATED_SAMPLE_PHOTOS.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => {
                        if (!propertyDetails.photos.includes(sample.url)) {
                          setPropertyDetails((prev) => ({
                            ...prev,
                            photos: [...prev.photos, sample.url],
                          }));
                        }
                      }}
                      className="border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600 hover:border-[#009587] transition"
                    >
                      + {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Previews */}
              {propertyDetails.photos.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {propertyDetails.photos.map((url, i) => (
                    <div key={i} className="relative h-20 w-24 border border-gray-200 overflow-hidden group">
                      <img src={url} alt="Uploaded preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-1 right-1 bg-black/70 p-1 text-white hover:bg-red-600 transition text-[10px]"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={propertyDetails.description}
                onChange={handleChange}
                placeholder="Highlight sunlight, ventilation, security, nearby schools/metros, and neighborhood features..."
                className="w-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[#009587] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#007d71] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Submitting Listing...</>
              ) : (
                <>Publish Property Listing</>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default PostProperty;
