import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import PropertyMap from "../components/PropertyMap";
import {
  FaLocationDot,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCar,
  FaPaw,
  FaBuilding,
  FaHeart,
  FaPhone,
  FaWhatsapp,
  FaCircleCheck,
  FaCircleExclamation,
  FaSpinner,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaShareNodes,
  FaCheck,
  FaXmark,
  FaShieldHalved,
  FaRegCalendarDays,
  FaLayerGroup,
  FaHouse,
  FaUserGroup,
} from "react-icons/fa6";
import { getErrorMessage } from "../utils/errorHandler";

const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";

function formatRent(amount) {
  if (!amount) return "Rent on Request";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // Shortlist state
  const [isShortlisted, setIsShortlisted] = useState(false);

  // Owner details modal
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  // Rental Application modal
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");
  const [rentalMessage, setRentalMessage] = useState("");
  const [rentalSubmitting, setRentalSubmitting] = useState(false);
  const [rentalSuccess, setRentalSuccess] = useState(false);
  const [rentalError, setRentalError] = useState("");

  // Fetch property data
  useEffect(() => {
    let isMounted = true;
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/property/property-info/${id}`);
        if (isMounted) {
          const propData = res.data?.data;
          setProperty(propData);
          if (propData) {
            setRentalMessage(
              `Hi, I am interested in renting your ${propData.BHKType || ""} ${
                propData.propertyType || "property"
              } located at ${
                propData.locality?.text || propData.locality?.label || "your listed location"
              }.`
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Property not found or has been deactivated."));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Sync shortlist status with localStorage & backend
  useEffect(() => {
    if (!id) return;
    try {
      const stored = JSON.parse(localStorage.getItem("rentosphere_shortlists") || "[]");
      setIsShortlisted(stored.includes(id));
    } catch {
      // ignore
    }
  }, [id]);

  const toggleShortlist = async () => {
    if (!property) return;
    const nextState = !isShortlisted;
    setIsShortlisted(nextState);

    try {
      const stored = JSON.parse(localStorage.getItem("rentosphere_shortlists") || "[]");
      const updated = nextState
        ? Array.from(new Set([...stored, id]))
        : stored.filter((item) => item !== id);
      localStorage.setItem("rentosphere_shortlists", JSON.stringify(updated));
      await api.post(`/property/shortlist/${id}`);
    } catch (err) {
      console.warn("Could not sync shortlist status:", err.message);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleSubmitRentalRequest = async (e) => {
    e.preventDefault();
    if (!property) return;
    setRentalSubmitting(true);
    setRentalError("");
    try {
      await api.post("/property/rental-request", {
        propertyId: property._id,
        moveInDate: moveInDate || null,
        message: rentalMessage,
      });
      setRentalSuccess(true);
      setTimeout(() => {
        setShowRentalModal(false);
        setRentalSuccess(false);
      }, 2500);
    } catch (err) {
      setRentalError(
        err.response?.data?.message ||
          "Failed to submit rental application. Please log in first."
      );
    } finally {
      setRentalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8f8f8] py-16 px-4">
        <FaSpinner className="animate-spin text-4xl text-[#009587] mb-3" />
        <p className="text-sm font-semibold text-gray-700">Loading property details...</p>
        <p className="text-xs text-gray-500 mt-1">Retrieving latest specifications and images</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8f8f8] py-16 px-4">
        <div className="max-w-md w-full border border-gray-300 bg-white p-8 text-center shadow-xs">
          <FaCircleExclamation className="mx-auto text-4xl text-amber-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-800">Property Unavailable</h2>
          <p className="mt-2 text-xs text-gray-600">{error || "This property could not be found."}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Go Back
            </button>
            <Link
              to="/search"
              className="bg-[#009587] px-4 py-2 text-xs font-semibold text-white hover:bg-[#007d70] transition inline-block"
            >
              Browse All Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const photos = property.photos && property.photos.length > 0 ? property.photos : [DEFAULT_PROPERTY_IMAGE];
  const activePhoto = photos[activePhotoIdx] || photos[0];

  const localityText =
    property.locality?.text || property.locality?.label || "Location specified by owner";

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-16">
      {/* ── BREADCRUMB & TOP CONTROLS ────────────────────────────────────── */}
      <div className="border-b border-gray-300 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 font-semibold text-[#009587] hover:underline"
            >
              <FaArrowLeft className="text-xs" /> Back
            </button>
            <span>/</span>
            <Link to="/search" className="hover:text-gray-800">
              Properties
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-xs">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <FaShareNodes className="text-xs text-[#009587]" />
              {copiedShare ? "Link Copied!" : "Share"}
            </button>
            <button
              type="button"
              onClick={toggleShortlist}
              className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-medium transition ${
                isShortlisted
                  ? "border-red-400 bg-red-50 text-red-600"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaHeart className={`text-xs ${isShortlisted ? "text-red-500" : "text-gray-400"}`} />
              {isShortlisted ? "Shortlisted" : "Shortlist"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* ── HEADER CARD ─────────────────────────────────────────────────── */}
        <div className="border border-gray-300 bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#009587]">
                  {property.propertyType || "Apartment"}
                </span>
                <span className="border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                  {property.BHKType || "Residential"}
                </span>
                <span className="border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {property.Furnishing || "Semi-Furnished"}
                </span>
                <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  ● {property.status === "rented" ? "Rented" : "Available"}
                </span>
              </div>

              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                {property.title}
              </h1>

              <p className="flex items-center gap-2 text-sm text-gray-600">
                <FaLocationDot className="shrink-0 text-[#009587]" />
                <span>{localityText}</span>
              </p>
            </div>

            {/* Price & Primary CTA */}
            <div className="flex flex-row lg:flex-col items-baseline lg:items-end justify-between border-t border-gray-200 pt-4 lg:border-t-0 lg:pt-0 gap-1 shrink-0">
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-[#009587]">
                  {formatRent(property.rent)}
                </span>
                <span className="text-xs text-gray-500 font-medium"> / month</span>
              </div>
              {property.deposit > 0 && (
                <span className="text-xs text-gray-500">
                  Security Deposit: ₹{property.deposit.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ───────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left Column: Photos, Overview, Amenities, Description, Map */}
          <div className="space-y-6">
            {/* PHOTO SHOWCASE GALLERY */}
            <div className="border border-gray-300 bg-white p-4 shadow-xs">
              {/* Main Photo Viewer */}
              <div className="relative aspect-16/9 w-full overflow-hidden border border-gray-200 bg-gray-900">
                <img
                  src={activePhoto}
                  alt={`${property.title} photo ${activePhotoIdx + 1}`}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.src = DEFAULT_PROPERTY_IMAGE;
                  }}
                />

                {/* Cover badge if first photo */}
                {activePhotoIdx === 0 && (
                  <span className="absolute top-3 left-3 bg-[#009587] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                    Cover Photo
                  </span>
                )}

                {/* Photo counter */}
                <span className="absolute bottom-3 right-3 bg-black/75 px-2.5 py-1 text-xs font-semibold text-white">
                  {activePhotoIdx + 1} / {photos.length} Photos
                </span>

                {/* Navigation arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                      }
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 p-2.5 text-white transition hover:bg-[#009587]"
                    >
                      <FaChevronLeft className="text-sm" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                      }
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 p-2.5 text-white transition hover:bg-[#009587]"
                    >
                      <FaChevronRight className="text-sm" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {photos.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {photos.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhotoIdx(i)}
                      className={`relative h-18 w-24 shrink-0 overflow-hidden border-2 transition ${
                        i === activePhotoIdx
                          ? "border-[#009587] ring-1 ring-[#009587]"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_PROPERTY_IMAGE;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* OVERVIEW SPECIFICATIONS METRICS */}
            <div className="border border-gray-300 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                Property Overview
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 text-xs">
                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaBed className="text-[#009587]" /> BHK Type
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">{property.BHKType || "—"}</p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaRulerCombined className="text-[#009587]" /> Built-up Area
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {property.builtUpArea ? `${property.builtUpArea} sqft` : "On Request"}
                  </p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaHouse className="text-[#009587]" /> Furnishing
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {property.Furnishing || "Semi-Furnished"}
                  </p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaBath className="text-[#009587]" /> Bathrooms
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">{property.bathrooms || "—"}</p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaBuilding className="text-[#009587]" /> Floor
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {property.floor
                      ? `${property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ""}`
                      : "—"}
                  </p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaUserGroup className="text-[#009587]" /> Preferred Tenant
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {property.preferredTenant || "Anyone"}
                  </p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaRegCalendarDays className="text-[#009587]" /> Availability
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {property.Availability || "Immediate"}
                  </p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaCar className="text-[#009587]" /> Parking
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {property.Parking ? "Available" : "No"}
                  </p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaPaw className="text-[#009587]" /> Pet Friendly
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {property.PetFriendly ? "Yes" : "No"}
                  </p>
                </div>

                <div className="border border-gray-200 bg-gray-50 p-3.5">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaLayerGroup className="text-[#009587]" /> Balconies
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-800">{property.balconies || "—"}</p>
                </div>
              </div>
            </div>

            {/* AMENITIES */}
            <div className="border border-gray-300 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                Amenities & Features
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 font-medium"
                    >
                      <FaCheck className="text-[#009587] text-xs shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 col-span-full">
                    No specific amenities listed by the owner.
                  </p>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="border border-gray-300 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                About this Property
              </h2>
              <div className="prose prose-sm max-w-none text-xs leading-relaxed text-gray-700 whitespace-pre-line">
                {property.description ||
                  "Well maintained property situated in a prime residential locality with easy access to markets, transportation, and essentials."}
              </div>
            </div>

            {/* LOCATION MAP */}
            <div className="border border-gray-300 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
                Locality & Surrounding Map
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                📍 {localityText}
              </p>
              <div className="h-72 w-full border border-gray-200 overflow-hidden">
                <PropertyMap
                  properties={[property]}
                  selectedProperty={property}
                  searchLocation={
                    property.location?.coordinates
                      ? {
                          lat: property.location.coordinates[1],
                          lng: property.location.coordinates[0],
                        }
                      : null
                  }
                />
              </div>
            </div>
          </div>

          {/* Right Column: Owner & Action Sidebar */}
          <div className="space-y-6">
            {/* OWNER & APPLICATION CARD */}
            <div className="border border-gray-300 bg-white p-6 shadow-xs sticky top-20">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <span className="border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#009587]">
                  Direct Owner Listing
                </span>
                <h3 className="mt-2 text-base font-bold text-gray-800">
                  {property.owner?.fullName || "Property Owner"}
                </h3>
                <p className="flex items-center gap-1 text-xs text-emerald-700 font-medium mt-0.5">
                  <FaShieldHalved className="text-xs" /> Verified Contact Information
                </p>
              </div>

              {/* Price summary */}
              <div className="border border-gray-200 bg-gray-50 p-4 mb-5 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Rent</span>
                  <span className="font-bold text-[#009587] text-sm">{formatRent(property.rent)}/mo</span>
                </div>
                {property.deposit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Security Deposit</span>
                    <span className="font-bold text-gray-800">
                      ₹{property.deposit.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Brokerage / Commission</span>
                  <span className="font-bold text-emerald-600">₹0 (Zero Brokerage)</span>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowOwnerModal(true)}
                  className="w-full flex items-center justify-center gap-2 border border-[#009587] bg-white py-3 text-xs font-bold uppercase tracking-wider text-[#009587] transition hover:bg-teal-50 shadow-xs"
                >
                  <FaPhone className="text-xs" /> Contact Owner
                </button>

                <button
                  type="button"
                  onClick={() => setShowRentalModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#009587] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#007d70] shadow-xs"
                >
                  Request to Rent
                </button>

                <Link
                  to="/pay-rent"
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-gray-50 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Pay Rent / Deposit Online
                </Link>
              </div>

              {/* Safety notice */}
              <div className="mt-5 border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
                <p className="font-semibold flex items-center gap-1 mb-0.5">
                  <FaShieldHalved className="text-amber-600" /> Rentosphere Safety Note
                </p>
                Visit the property in person and inspect documentation before transferring deposits or token payments.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── OWNER CONTACT MODAL ────────────────────────────────────────────── */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md border border-gray-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowOwnerModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-sm"
            >
              <FaXmark />
            </button>

            <span className="border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#009587]">
              Verified Owner Contact
            </span>

            <h3 className="text-lg font-bold text-gray-800 mt-2">
              {property.owner?.fullName || "Property Owner"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Listed for {property.title}
            </p>

            <div className="mt-4 space-y-2 border border-gray-200 bg-gray-50 p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-semibold text-gray-800">
                  {property.owner?.mobileNumber || "+91 98765 43210"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-semibold text-gray-800">
                  {property.owner?.email || "owner@rentosphere.com"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-semibold text-gray-800 truncate max-w-[200px]">
                  {localityText}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <a
                href={`tel:${property.owner?.mobileNumber || "+919876543210"}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#009587] py-2.5 text-xs font-semibold text-white transition hover:bg-[#007d70]"
              >
                <FaPhone className="text-xs" /> Call Owner
              </a>
              <a
                href={`https://wa.me/${(property.owner?.mobileNumber || "919876543210").replace(/\D/g, "")}?text=Hi, I am interested in your property "${encodeURIComponent(property.title)}" listed on Rentosphere.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <FaWhatsapp className="text-sm" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── RENTAL APPLICATION MODAL ───────────────────────────────────────── */}
      {showRentalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg border border-gray-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setShowRentalModal(false);
                setRentalError("");
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-sm"
            >
              <FaXmark />
            </button>

            <span className="border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#009587]">
              Rental Application
            </span>

            <h3 className="text-lg font-bold text-gray-800 mt-2">
              Apply to Rent this Property
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {property.title} • {localityText}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border border-gray-200 bg-gray-50 p-3 text-xs">
              <div>
                <span className="text-gray-500">Monthly Rent:</span>
                <p className="text-base font-bold text-[#009587]">
                  {formatRent(property.rent)}/mo
                </p>
              </div>
              <div>
                <span className="text-gray-500">Security Deposit:</span>
                <p className="text-base font-bold text-gray-800">
                  ₹{(property.deposit || 0).toLocaleString("en-IN")}
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
                    onClick={() => setShowRentalModal(false)}
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
