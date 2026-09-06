import { FaSearch, FaBuilding, FaLeaf, FaWifi } from "react-icons/fa";
import { Link } from "react-router-dom";

const sampleProperties = [
  {
    id: 1,
    title: "2 BHK in Koramangala",
    location: "Koramangala, Bengaluru",
    rent: "₹22,000 / month",
    type: "Semi-Furnished",
    badge: "Available",
  },
  {
    id: 2,
    title: "1 BHK in Andheri West",
    location: "Andheri West, Mumbai",
    rent: "₹18,500 / month",
    type: "Fully Furnished",
    badge: "Available",
  },
  {
    id: 3,
    title: "3 BHK in Hitech City",
    location: "Hitech City, Hyderabad",
    rent: "₹32,000 / month",
    type: "Semi-Furnished",
    badge: "Available",
  },
  {
    id: 4,
    title: "Studio in Powai",
    location: "Powai, Mumbai",
    rent: "₹14,000 / month",
    type: "Unfurnished",
    badge: "Available",
  },
  {
    id: 5,
    title: "2 BHK in Whitefield",
    location: "Whitefield, Bengaluru",
    rent: "₹20,000 / month",
    type: "Fully Furnished",
    badge: "Available",
  },
  {
    id: 6,
    title: "4 BHK in Gurgaon",
    location: "Sector 54, Gurgaon",
    rent: "₹55,000 / month",
    type: "Fully Furnished",
    badge: "Premium",
  },
];

const badgeColor = {
  Available: "bg-green-100 text-green-700",
  Premium: "bg-amber-100 text-amber-700",
};

function BrowseProperties() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 px-4 py-16 text-center">
        <h1 className="text-4xl font-light text-gray-700 sm:text-5xl">
          Browse <span className="font-semibold text-[#009587]">Properties</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 leading-7">
          Explore verified rental listings across India — zero brokerage, direct from owners.
        </p>
      </section>

      {/* Coming Soon Banner */}
      <section className="mx-auto max-w-5xl px-6 pt-10">
        <div className="rounded-2xl bg-[#009587]/10 border border-[#009587]/20 px-6 py-4 flex items-center gap-3">
          <FaSearch className="text-[#009587] text-lg shrink-0" />
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-[#009587]">Full search & filters</span> are coming
            soon. Below is a preview of sample listings.
          </p>
        </div>
      </section>

      {/* Sample Listings */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Sample Listings</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleProperties.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Placeholder image area */}
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FaBuilding className="text-4xl text-gray-300" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-5">{p.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor[p.badge]}`}
                  >
                    {p.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{p.location}</p>
                <p className="mt-3 text-sm font-semibold text-[#009587]">{p.rent}</p>
                <p className="mt-0.5 text-xs text-gray-400">{p.type}</p>
                <button className="mt-4 w-full rounded-lg border border-[#009587] py-1.5 text-xs font-medium text-[#009587] hover:bg-[#009587] hover:text-white transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BrowseProperties;
