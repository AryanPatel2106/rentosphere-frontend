import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import Hero from "../components/dashboard/Hero";
import SearchSection from "../components/dashboard/SearchSection";
import OwnerCTA from "../components/dashboard/OwnerCTA";

import Signup from "../components/Signup";
import Login from "../components/Login";

function Dashboard() {

    const [filters, setFilters] = useState({
        localities: [],
        bhkType: "",
        furnishing: "",
        tenantType: "",
        availability: "",
        parking: false,
        petFriendly: false
    });

    const { showSignup, setShowSignup } = useOutletContext();
    const { showLogin, setShowLogin } = useOutletContext();

    return (
        <div className="max-h-screen bg-[#f8f8f8]">

            
                <>
                    <Hero />

                    <SearchSection
                        filters={filters}
                        setFilters={setFilters}
                    />

                    <OwnerCTA />
                </>
            

            <Signup
                isOpen={showSignup}
                onClose={() => setShowSignup(false)}
                setShowLogin={setShowLogin}
            />

            <Login
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                setShowSignup={setShowSignup}
            />

        </div>
    );
}

export default Dashboard;