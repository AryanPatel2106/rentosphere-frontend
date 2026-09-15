import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const CITIES = [
  {
    name: "Bangalore",
    subtitle: "Silicon Valley of India",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80",
    properties: "1,200+ Homes",
  },
  {
    name: "Mumbai",
    subtitle: "Financial Capital",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80",
    properties: "950+ Homes",
  },
  {
    name: "Delhi NCR",
    subtitle: "National Capital Region",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80",
    properties: "1,100+ Homes",
  },
  {
    name: "Pune",
    subtitle: "Oxford of the East",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
    properties: "680+ Homes",
  },
  {
    name: "Hyderabad",
    subtitle: "Cyberabad & HITEC City",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80",
    properties: "840+ Homes",
  },
  {
    name: "Chennai",
    subtitle: "Detroit of Asia",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&auto=format&fit=crop&q=80",
    properties: "550+ Homes",
  },
];

export default function CityShowcase() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#009587]">
            Explore by Metro
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Popular Cities for Rent
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Discover thousands of verified apartments and flats in top rental hubs
          </p>
        </div>

        <button
          onClick={() => navigate("/search")}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-[#009587] hover:underline"
        >
          View All Listings <FaArrowRight className="text-xs" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CITIES.map((city) => (
          <div
            key={city.name}
            onClick={() => navigate(`/search?q=${encodeURIComponent(city.name)}`)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-gray-100"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={city.image}
                alt={city.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-base font-bold leading-tight drop-shadow-sm">{city.name}</p>
                <p className="text-[11px] text-teal-200">{city.properties}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
