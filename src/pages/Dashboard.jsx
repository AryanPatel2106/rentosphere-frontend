import { useState } from "react";
import Hero from "../components/dashboard/Hero";
import SearchSection from "../components/dashboard/SearchSection";
import FeaturedProperties from "../components/dashboard/FeaturedProperties";
import CityShowcase from "../components/dashboard/CityShowcase";
import WhyRentosphere from "../components/dashboard/WhyRentosphere";
import OwnerCTA from "../components/dashboard/OwnerCTA";

function Dashboard() {
  const [filters, setFilters] = useState({
    localities: [],
    bhkType: "",
    minRent: "",
    maxRent: "",
    furnishing: "",
    tenantType: "",
    availability: "",
    parking: false,
    petFriendly: false,
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <Hero />

      {/* Main Search Bar & Quick Filters */}
      <SearchSection filters={filters} setFilters={setFilters} />

      {/* Handpicked / Featured Properties */}
      <FeaturedProperties />

      {/* Popular Metro Cities Showcase */}
      <CityShowcase />

      {/* Why Rentosphere Value Proposition */}
      <WhyRentosphere />

      {/* Owner / Landlord Call to Action */}
      <OwnerCTA />
    </div>
  );
}

export default Dashboard;