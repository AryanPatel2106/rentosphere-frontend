import LocalitySearch from "./LocalitySearch";
import { useNavigate } from "react-router-dom";

function SearchSection({
    filters,
    setFilters
}) {

    const handleSearch = () => {

        console.log(filters);

        navigate("/search", {
          state: filters
        });

    };

    const navigate = useNavigate();

    return (
        <section className="mt-8 flex justify-center px-4">

            <div className="w-full max-w-4xl border bg-white shadow-sm">

                {/* Top Row */}

                <div className="flex flex-col sm:flex-row">

                    {/* City */}

                    
                    {/* Locality Search */}

                    <div className="flex flex-1 border-b sm:border-r sm:border-b-0 sm:border-l">

                        <LocalitySearch
                            selected={filters.localities}
                            setSelected={(localities) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    localities
                                }))
                            }
                        />

                    </div>

                    {/* Search Button */}

                    <button
                        onClick={handleSearch}
                        className="h-12 bg-red-500 text-white transition hover:bg-red-600 sm:w-44"
                    >
                        Search
                    </button>

                </div>

                {/* Filters */}

                <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3">

                    {/* BHK */}
                    <select
                        value={filters.bhkType}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                bhkType: e.target.value
                            }))
                        }
                        className="w-32 border px-3 py-2 text-sm outline-none"
                    >
                        <option value="">BHK Type</option>
                        <option value="1RK">1 RK</option>
                        <option value="1BHK">1 BHK</option>
                        <option value="2BHK">2 BHK</option>
                        <option value="3BHK">3 BHK</option>
                        <option value="4BHK">4 BHK</option>
                    </select>

                    {/* Budget */}
                    <select
                        value={
                            filters.minRent === "" && filters.maxRent === ""
                                ? ""
                                : filters.maxRent === "20000"
                                ? "under_20k"
                                : filters.minRent === "20000" && filters.maxRent === "35000"
                                ? "20k_35k"
                                : filters.minRent === "35000" && filters.maxRent === "50000"
                                ? "35k_50k"
                                : filters.minRent === "50000"
                                ? "above_50k"
                                : ""
                        }
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "under_20k") {
                                setFilters((prev) => ({ ...prev, minRent: "", maxRent: "20000" }));
                            } else if (val === "20k_35k") {
                                setFilters((prev) => ({ ...prev, minRent: "20000", maxRent: "35000" }));
                            } else if (val === "35k_50k") {
                                setFilters((prev) => ({ ...prev, minRent: "35000", maxRent: "50000" }));
                            } else if (val === "above_50k") {
                                setFilters((prev) => ({ ...prev, minRent: "50000", maxRent: "" }));
                            } else {
                                setFilters((prev) => ({ ...prev, minRent: "", maxRent: "" }));
                            }
                        }}
                        className="w-36 border px-3 py-2 text-sm outline-none"
                    >
                        <option value="">Budget</option>
                        <option value="under_20k">&lt; ₹20,000</option>
                        <option value="20k_35k">₹20k - ₹35k</option>
                        <option value="35k_50k">₹35k - ₹50k</option>
                        <option value="above_50k">₹50,000+</option>
                    </select>

                    {/* Furnishing */}
                    <select
                        value={filters.furnishing}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                furnishing: e.target.value
                            }))
                        }
                        className="w-40 border px-3 py-2 text-sm outline-none"
                    >
                        <option value="">Furnishing</option>
                        <option value="Fully Furnished">Fully Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                    </select>

                    {/* Tenant Type */}
                    <select
                        value={filters.tenantType}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                tenantType: e.target.value
                            }))
                        }
                        className="w-36 border px-3 py-2 text-sm outline-none"
                    >
                        <option value="">Tenant Type</option>
                        <option value="Anyone">Anyone</option>
                        <option value="Family">Family</option>
                        <option value="Bachelors">Bachelors</option>
                        <option value="Company">Company</option>
                    </select>

                    {/* Availability */}

                    <select
                        value={filters.availability}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                availability: e.target.value
                            }))
                        }
                        className="w-44 border px-3 py-2 text-sm outline-none"
                    >
                        <option value="">Availability</option>

                        <option value="Immediate">
                            Immediate
                        </option>

                        <option value="Within 15 Days">
                            Within 15 Days
                        </option>

                        <option value="Within 30 Days">
                            Within 30 Days
                        </option>

                    </select>

                    {/* Parking */}

                    <label className="flex items-center gap-2 text-sm">

                        <input
                            type="checkbox"
                            checked={filters.parking}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    parking: e.target.checked
                                }))
                            }
                        />

                        Parking

                    </label>

                    {/* Pet Friendly */}

                    <label className="flex items-center gap-2 text-sm">

                        <input
                            type="checkbox"
                            checked={filters.petFriendly}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    petFriendly: e.target.checked
                                }))
                            }
                        />

                        Pet Friendly

                    </label>

                </div>

            </div>

        </section>

    );

}

export default SearchSection;