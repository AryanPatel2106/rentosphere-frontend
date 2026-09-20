import { useState, useRef, useEffect } from "react";
import axios from "axios";
import api from "../services/api";
import {
  FaPenToSquare,
  FaCamera,
  FaCircleCheck,
  FaCircleInfo,
  FaCircleExclamation,
  FaIndianRupeeSign,
  FaPlus,
  FaTrash,
  FaCar,
  FaPaw,
  FaBuilding,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCloudArrowUp,
  FaSpinner,
  FaStar,
  FaImage,
  FaPaste,
} from "react-icons/fa6";
import LocalitySearch from "../components/dashboard/LocalitySearch";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/errorHandler";

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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
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
    photos: [],
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

  // Upload files to AWS S3
  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not an image file.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 10MB limit.`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setError(null);
    setUploadingCount((prev) => prev + validFiles.length);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgressText(
        `Uploading ${file.name} to S3 (${i + 1}/${validFiles.length})...`
      );

      try {
        // 1. Get presigned upload URL from backend
        const res = await api.post("/property/upload-url", {
          fileName: file.name,
          fileType: file.type || "image/jpeg",
        });

        const { uploadUrl, fileUrl } = res.data.data;

        // 2. Direct binary upload to S3 (standard axios without cookies/auth header)
        await axios.put(uploadUrl, file, {
          headers: {
            "Content-Type": file.type || "image/jpeg",
          },
        });

        // 3. Add uploaded S3 URL to property photos
        setPropertyDetails((prev) => ({
          ...prev,
          photos: [...prev.photos, fileUrl],
        }));
      } catch (presignedErr) {
        console.warn(
          "Direct S3 presigned upload failed, falling back to backend direct upload:",
          presignedErr
        );
        try {
          const formData = new FormData();
          formData.append("image", file);
          const fallbackRes = await api.post("/property/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const fileUrl = fallbackRes.data.data.fileUrl;
          setPropertyDetails((prev) => ({
            ...prev,
            photos: [...prev.photos, fileUrl],
          }));
        } catch (fallbackErr) {
          console.error("Failed to upload image:", fallbackErr);
          setError(
            getErrorMessage(fallbackErr, `Failed to upload "${file.name}" to S3.`)
          );
        }
      } finally {
        setUploadingCount((prev) => Math.max(0, prev - 1));
      }
    }
    setUploadProgressText("");
  };

  const dragCounter = useRef(0);
  const handleFilesRef = useRef(handleFiles);
  handleFilesRef.current = handleFiles;

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    // 1. Files dropped directly from system / file manager
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      return;
    }

    // 2. Dragged image from web browser / HTML
    const uriList = e.dataTransfer.getData("text/uri-list");
    const plainText = e.dataTransfer.getData("text/plain");
    const droppedUrl = (uriList || plainText || "").trim();
    if (
      droppedUrl &&
      (droppedUrl.startsWith("http://") || droppedUrl.startsWith("https://"))
    ) {
      if (/\.(jpeg|jpg|png|webp|gif|avif)($|\?)/i.test(droppedUrl)) {
        setPropertyDetails((prev) => ({
          ...prev,
          photos: [...prev.photos, droppedUrl],
        }));
      }
    }
  };

  // Clipboard paste support (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      const files = e.clipboardData?.files;
      const pastedImages = [];

      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type && item.type.startsWith("image/")) {
            const blob = item.getAsFile();
            if (blob) {
              const ext = blob.type.split("/")[1]?.replace("+xml", "") || "png";
              const namedFile = new File(
                [blob],
                blob.name && blob.name !== "image.png"
                  ? blob.name
                  : `clipboard-image-${Date.now()}-${i + 1}.${ext}`,
                { type: blob.type }
              );
              pastedImages.push(namedFile);
            }
          }
        }
      }

      if (pastedImages.length === 0 && files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type && file.type.startsWith("image/")) {
            pastedImages.push(file);
          }
        }
      }

      if (pastedImages.length > 0) {
        e.preventDefault();
        handleFilesRef.current(pastedImages);
        return;
      }

      // If user pastes an image URL when NOT focused on a text input/textarea
      const targetTag = e.target?.tagName?.toLowerCase();
      const isTextInput =
        (targetTag === "input" && e.target?.type !== "file") ||
        targetTag === "textarea" ||
        e.target?.isContentEditable;

      if (!isTextInput) {
        const text = e.clipboardData?.getData("text/plain")?.trim();
        if (
          text &&
          (text.startsWith("http://") || text.startsWith("https://")) &&
          /\.(jpeg|jpg|png|webp|gif|avif)($|\?)/i.test(text)
        ) {
          e.preventDefault();
          setPropertyDetails((prev) => ({
            ...prev,
            photos: [...prev.photos, text],
          }));
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ""; // Reset input so same file can be re-selected if needed
    }
  };

  const handleMakeCoverPhoto = (index) => {
    if (index === 0) return;
    setPropertyDetails((prev) => {
      const nextPhotos = [...prev.photos];
      const [selected] = nextPhotos.splice(index, 1);
      nextPhotos.unshift(selected);
      return { ...prev, photos: nextPhotos };
    });
  };

  // Add photo URL (fallback / external URL)
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
    if (uploadingCount > 0) {
      setError("Please wait until all photos finish uploading to S3.");
      return;
    }
    if (!propertyDetails.photos || propertyDetails.photos.length === 0) {
      setError("Please upload at least one photo of the property.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/property", propertyDetails);
      setLoading(false);
      navigate("/profile", { state: { openSection: "properties" } });
    } catch (err) {
      console.error("Property creation error:", err);
      setError(getErrorMessage(err, "Failed to post property. Please check your details."));
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
              <div className="relative flex h-12 w-12 items-center justify-center bg-[#009587]">
                {step.icon}
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-gray-800 text-[10px] font-bold text-white">
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
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Property Photos <span className="text-red-500">*</span>
                </label>
                <span className="border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-[#009587]">
                  AWS S3 Secure Storage
                </span>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg,image/heic,image/heif"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Drag & Drop Upload Zone */}
              <div
                tabIndex={0}
                role="button"
                aria-label="Upload property photos"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative cursor-pointer border-2 border-dashed p-6 text-center transition focus:outline-none focus:ring-1 focus:ring-[#009587] ${
                  isDragging
                    ? "border-[#009587] bg-teal-50 ring-2 ring-[#009587]/20"
                    : "border-gray-300 bg-gray-50 hover:border-[#009587] hover:bg-teal-50/20"
                }`}
              >
                <div className="pointer-events-none flex flex-col items-center justify-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center bg-teal-100 text-[#009587]">
                    {uploadingCount > 0 ? (
                      <FaSpinner className="animate-spin text-xl text-[#009587]" />
                    ) : (
                      <FaCloudArrowUp className="text-2xl text-[#009587]" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {uploadingCount > 0
                      ? uploadProgressText || "Uploading photos to S3..."
                      : isDragging
                      ? "Drop images here to upload directly"
                      : "Drag & drop photos, click to browse, or paste with Ctrl+V / ⌘V"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Supports JPG, PNG, WEBP up to 10MB each (Multi-upload & clipboard screenshots supported)
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={uploadingCount > 0}
                      className="pointer-events-auto bg-[#009587] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#007d70] disabled:opacity-50"
                    >
                      Select Images From Computer
                    </button>
                    <span className="pointer-events-auto inline-flex items-center gap-1.5 border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600">
                      <FaPaste className="text-[#009587]" />
                      Paste Screenshot / Image (Ctrl+V)
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Progress Indicator */}
              {uploadingCount > 0 && (
                <div className="mt-2 flex items-center justify-between border border-teal-200 bg-teal-50 p-2.5 text-xs text-teal-800">
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin text-[#009587]" />
                    {uploadProgressText || `Uploading ${uploadingCount} photo(s) to S3...`}
                  </span>
                  <span className="font-semibold text-teal-900">Direct S3 Upload</span>
                </div>
              )}

              {/* Uploaded Photos Gallery */}
              {propertyDetails.photos.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600">
                    <span>Uploaded Photos ({propertyDetails.photos.length})</span>
                    <span className="text-[11px] text-gray-400">
                      First photo is the Cover Image shown to tenants
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {propertyDetails.photos.map((url, i) => (
                      <div
                        key={i}
                        className="group relative border border-gray-300 bg-white overflow-hidden shadow-xs"
                      >
                        <div className="aspect-4/3 w-full overflow-hidden bg-gray-100">
                          <img
                            src={url}
                            alt={`Property photo ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {i === 0 ? (
                          <span className="absolute top-1 left-1 bg-[#009587] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                            Cover Photo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeCoverPhoto(i)}
                            className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 hover:bg-[#009587] shadow-xs"
                          >
                            <FaStar className="text-[9px]" /> Make Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          title="Remove photo"
                          className="absolute top-1 right-1 bg-black/70 p-1 text-xs text-white transition hover:bg-red-600"
                        >
                          <FaTrash className="text-[10px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional URL or Sample Photos Toggle */}
              <div className="mt-3 border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#009587] hover:underline"
                >
                  {showUrlInput
                    ? "- Hide external photo options"
                    : "+ Paste image URL or pick sample photos"}
                </button>
                {showUrlInput && (
                  <div className="mt-2 space-y-3 border border-gray-200 bg-gray-50 p-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={photoInput}
                        onChange={(e) => setPhotoInput(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#009587]"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="flex items-center gap-1 border border-[#009587] bg-[#009587] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#007d70]"
                      >
                        <FaPlus className="text-[10px]" /> Add URL
                      </button>
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] text-gray-500">
                        Sample verified photos:
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
                            className="border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-600 transition hover:border-[#009587] hover:text-[#009587]"
                          >
                            + {sample.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
              <div className="border border-red-300 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
                <FaCircleExclamation className="text-red-600 text-sm mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold">Error: </span>
                  {error}
                </div>
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
