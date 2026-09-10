import { useState } from "react";

import Hero from "../components/dashboard/Hero";
import SearchSection from "../components/dashboard/SearchSection";
import OwnerCTA from "../components/dashboard/OwnerCTA";

function Dashboard() {
  const [filters, setFilters] = useState({
    localities: [],
    bhkType: "",
    furnishing: "",
    tenantType: "",
    availability: "",
    parking: false,
    petFriendly: false,
  });

  return (
    <div className="bg-[#f8f8f8]">
      <Hero />
      <SearchSection filters={filters} setFilters={setFilters} />
      <OwnerCTA />
    </div>
  );
}

export default Dashboard;