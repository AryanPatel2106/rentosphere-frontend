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
        <div className="border border-gray-300 bg-white px-6 py-4 flex items-center gap-3">
          <FaSearch className="text-[#009587] text-base shrink-0" />
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Search & Filters:</span> Use our main search bar to explore verified properties.
          </p>
        </div>
      </section>

      {/* Sample Listings */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-6">Sample Listings</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleProperties.map((p) => (
            <div
              key={p.id}
              className="border border-gray-300 bg-white shadow-sm overflow-hidden"
            >
              {/* Placeholder image area */}
              <div className="h-40 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                <FaBuilding className="text-3xl text-gray-300" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-800 text-xs leading-5">{p.title}</h3>
                  <span
                    className={`shrink-0 border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${badgeColor[p.badge]}`}
                  >
                    {p.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{p.location}</p>
                <p className="mt-2 text-sm font-bold text-[#009587]">{p.rent}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{p.type}</p>
                <button className="mt-4 w-full border border-[#009587] py-2 text-xs font-bold uppercase tracking-wider text-[#009587] hover:bg-[#009587] hover:text-white transition">
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
