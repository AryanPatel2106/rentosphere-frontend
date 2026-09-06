import { useState } from "react";
import api from "../services/api";
import {
  FaPenToSquare,
  FaCamera,
  FaCircleCheck,
  FaCircleInfo,
} from "react-icons/fa6";
import LocalitySearch from "../components/dashboard/LocalitySearch";
import {useNavigate} from "react-router-dom";

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

function PostProperty() {
  const [selectedLocalities, setSelectedLocalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [propertyDetails, setPropertyDetails] = useState({
    title: "",
    Locality: {},
    Furnishing: "",
    bhkType: "",
    Availability: "",
    parking: false,
    petFriendly: false,
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
    const { name, value } = event.target;
    setPropertyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        setLoading(true);
        const response = await api.post("/property", propertyDetails);
        navigate("/profile", { state: { openSection: "properties" } });
        setLoading(false);
    } catch (error) {
        setError(error.message);
        setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <section className="border-b border-gray-200 bg-white px-4 py-16 text-center">
        <h1 className="text-4xl font-light text-gray-700 sm:text-5xl">
          Post Your <span className="font-semibold text-[#009587]">Property</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-500">
          List your property on Rentosphere for free and connect directly with verified tenants —
          no brokerage, no hassle.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="mb-10 text-center text-2xl font-semibold text-gray-800">How It Works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#009587]">
                {step.icon}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800">{step.title}</h3>
              <p className="text-sm leading-6 text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <FaCircleInfo className="text-[#009587]" />
            <p className="text-sm text-gray-500">
              Share the details below and we&apos;ll help you get the right tenant quickly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="mb-1 block text-xs font-medium text-gray-600">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={propertyDetails.title}
                onChange={handleChange}
                placeholder="Enter property title"
                className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="Locality" className="mb-1 block text-xs font-medium text-gray-600">
                Locality
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none transition focus-within:border-[#009587] focus-within:bg-white"
              >
                <LocalitySearch
                  selected={selectedLocalities}
                  setSelected={handleLocalitySelection}
                  singleSelect={true}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="furnishing" className="mb-1 block text-xs font-medium text-gray-600">
                  Furnishing
                </label>
                <select
                  id="Furnishing"
                  name="Furnishing"
                  value={propertyDetails.Furnishing || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="Furnishing">Furnishing</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              <div>
                <label htmlFor="bhkType" className="mb-1 block text-xs font-medium text-gray-600">
                  BHK Type
                </label>
                <select
                  id="bhkType"
                  name="bhkType"
                  value={propertyDetails.bhkType || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="BHK Type">BHK Type</option>
                  <option value="1RK">1RK</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="4BHK">4BHK</option>
                </select>
              </div>
            </div>

            <div>
                <label htmlFor="availability" className="mb-1 block text-xs font-medium text-gray-600">
                    Availability
                </label>
                <select
                  id="Availability"
                  name="Availability"
                  value={propertyDetails.Availability || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
                >
                  <option value="Availability">Availability</option>
                  <option value="Immediate">Immediate</option>
                  <option value="Within 15 Days">Within 15 Days</option>
                  <option value="Within 30 Days">Within 30 Days</option>
                </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition hover:border-[#009587]">
                <input
                  id="parking"
                  name="parking"
                  type="checkbox"
                  checked={Boolean(propertyDetails.parking)}
                  onChange={(e) =>
                    setPropertyDetails((prev) => ({
                      ...prev,
                      parking: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[#009587]"
                />
                <span className="font-medium">Parking</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition hover:border-[#009587]">
                <input
                  id="petFriendly"
                  name="petFriendly"
                  type="checkbox"
                  checked={Boolean(propertyDetails.petFriendly)}
                  onChange={(e) =>
                    setPropertyDetails((prev) => ({
                      ...prev,
                      petFriendly: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[#009587]"
                />
                <span className="font-medium">Pet Friendly</span>
              </label>
            </div>

            <div>
              <label htmlFor="description" className="mb-1 block text-xs font-medium text-gray-600">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={propertyDetails.description}
                onChange={handleChange}
                placeholder="Write a short description of the property"
                className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#009587] focus:bg-white"
              />
            </div>

            <button
              type="submit"
                disabled={loading}
              className="mt-2 w-full bg-[#009587] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#007d71]"
            >
              {loading ? (
                <span className="ml-2">Loading...</span>
              ) : (<>Submit Listing</>)}
            </button>

            {error && (
              <div className="mt-2 text-sm text-red-500">
                {error}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

export default PostProperty;