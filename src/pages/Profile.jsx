import { useState, useEffect } from "react";
import { FaCheck, FaWhatsapp } from "react-icons/fa";
import api from "../services/api";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    getUpdateOnWhatsApp: false,
  });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const changePassword = async () => {
    try{
      const response = await api.put("/auth/change-user-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      console.log("Password changed successfully:", response.data);
      setIsChangePasswordOpen(false);
    } catch(error) {
      console.error("Error changing password:", error);
    }
  }

  const getProfileData = async () => {
    try {
      const response = await api.get("/auth/current-user");
      setProfile(response.data.data);
    } catch (error) {
        console.error("Error fetching profile data:", error);
    }
  }

  useEffect(() => {
    getProfileData();
  }, []);
  
  const updateProfileData = async () => {
    try {
      const response = await api.put("/auth/update-current-user", profile);
      if(response.data.data.emailChanged) {
        setEmailChanged(true);
      }
      setProfile(response.data.data);
    } catch (error) {
      console.error("Error updating profile data:", error);
    }
  }

  const handleWhatsappToggle = async () => {
    const updatedProfile = {
        ...profile,
        getUpdateOnWhatsApp: !profile.getUpdateOnWhatsApp,
    };

    setProfile(updatedProfile);

    try {
        const response = await api.put(
            "/auth/update-current-user",
            updatedProfile
        );

        setProfile(response.data.data);
    } catch (error) {
        console.error("Error updating WhatsApp preference:", error);

        setProfile(profile);
    }
  };

  const handleEmailChange = async () => {
    try {
        console.log({
            email: profile.email,
            token: otp,
        });
        const response = await api.put("/auth/update-user-email", { email: profile.email, token: otp });
        if (response.status === 200) {
            setEmailChanged(false);
            getProfileData();
        }
    } catch (error) {
        console.error("Error changing email:", error);
    }
  }


  const handleChange = (e) => {
    setProfile({
      ...profile,

      [e.target.name]: e.target.value,
    });
  };

  const [otp, setOtp] = useState("");
  const location = useLocation();

  const [editMode, setEditMode] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);

  useEffect(() => {
    if (location.state?.openSection === "properties") {
      setBasicProfileOpen(false);
      setShortlistsOpen(false);
      setPaymentsOpen(false);
      setPropertiesOpen(true);
      setInterestedPropertiesOpen(false);
    }
  }, [location.state]);

  const [basicProfileOpen, setBasicProfileOpen] = useState(true);
  const [shortlistsOpen, setShortlistsOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [interestedPropertiesOpen, setInterestedPropertiesOpen] = useState(false);
  const [userProperties, setUserProperties] = useState([]);

  useEffect(() => {
    const fetchUserProperties = async () => {
      try {
        const response = await api.get("/property/my-properties");
        setUserProperties(response.data.data || []);
      } catch (error) {
        console.error("Error fetching user properties:", error);
      }
    };

    fetchUserProperties();
  }, []);

  return (
    <div className="bg-[#f6f6f6]">
      <div className="mx-auto flex max-w-[1500px] flex-col border border-gray-300 bg-white lg:h-[calc(100vh-220px)] lg:min-h-[620px] lg:flex-row lg:overflow-hidden">
        {/* Sidebar */}

        <div className="w-full border-r border-gray-300 lg:h-full lg:w-72 lg:overflow-y-auto">
          <div className="border-b border-gray-200 px-8 py-8">
            <h2 className="text-[15px] font-medium">Manage your Account</h2>
          </div>

          <button className={basicProfileOpen ? "w-full bg-gray-400 px-8 py-4 text-left text-[14px] text-white" : "w-full px-8 py-4 text-left text-[14px] hover:bg-gray-100"}
            onClick={() => {
              setBasicProfileOpen(true);
              setShortlistsOpen(false);
              setPaymentsOpen(false);
              setPropertiesOpen(false);
              setInterestedPropertiesOpen(false);
            }}
          >
            Basic Profile
          </button>

          <button className={shortlistsOpen ? "w-full bg-gray-400 px-8 py-4 text-left text-[14px] text-white" : "w-full px-8 py-4 text-left text-[14px] hover:bg-gray-100"}
            onClick={() => {
              setBasicProfileOpen(false);
              setShortlistsOpen(true);
              setPaymentsOpen(false);
              setPropertiesOpen(false);
              setInterestedPropertiesOpen(false);
            }}
          >
            Your Shortlists
          </button>

          <button className={paymentsOpen ? "w-full bg-gray-400 px-8 py-4 text-left text-[14px] text-white" : "w-full px-8 py-4 text-left text-[14px] hover:bg-gray-100"}
            onClick={() => {
              setBasicProfileOpen(false);
              setShortlistsOpen(false);
              setPaymentsOpen(true);
              setPropertiesOpen(false);
              setInterestedPropertiesOpen(false);
            }}
          >
            Your Payments
          </button>

          <button className={propertiesOpen ? "w-full bg-gray-400 px-8 py-4 text-left text-[14px] text-white" : "w-full px-8 py-4 text-left text-[14px] hover:bg-gray-100"}
            onClick={() => {
              setBasicProfileOpen(false);
              setShortlistsOpen(false);
              setPaymentsOpen(false);
              setPropertiesOpen(true);
              setInterestedPropertiesOpen(false);
            }}
          >
            Your Properties
          </button>

          <button className={interestedPropertiesOpen ? "w-full bg-gray-400 px-8 py-4 text-left text-[14px] text-white" : "w-full px-8 py-4 text-left text-[14px] hover:bg-gray-100"}
            onClick={() => {
              setBasicProfileOpen(false);
              setShortlistsOpen(false);
              setPaymentsOpen(false);
              setPropertiesOpen(false);
              setInterestedPropertiesOpen(true);
            }}
          >
            Interested in your Properties
          </button>
        </div>

        {/* Right */}

        {(basicProfileOpen && !emailChanged) && (
          <>
            {isChangePasswordOpen ? (<>
              <div className="flex-1 lg:h-full lg:overflow-y-auto">
                <div className="border-b border-gray-300 px-8 py-6">
                    <h2 className="text-[18px] font-medium">Change Password</h2>
                </div>

                <div className="max-w-4xl px-8 py-8">
                    <div className="mb-8 grid grid-cols-1 items-center gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                      <label className="text-[14px] font-medium">Current Password</label>
                        <input 
                            type="password" 
                            placeholder="Current Password"
                            className="h-11 w-full max-w-xl border border-gray-300 px-4 outline-none focus:border-blue-500"
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-8 grid grid-cols-1 items-center gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                      <label className="text-[14px] font-medium">New Password</label>
                        <input 
                            type="password" 
                            placeholder="new Password"
                            className="h-11 w-full max-w-xl border border-gray-300 px-4 outline-none focus:border-blue-500"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-8 grid grid-cols-1 items-center gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                      <label className="text-[14px] font-medium">Confirm New Password</label>
                        <input 
                            type="password" 
                            placeholder="Confirm New Password"
                            className="h-11 w-full max-w-xl border border-gray-300 px-4 outline-none focus:border-blue-500"
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                    </div>
                    

                        <button
                            onClick={changePassword}
                            className="mt-4 w-fit bg-red-500 px-10 py-3 text-[14px] text-white transition-colors hover:bg-red-600"
                        >
                            Change Password
                        </button>
                  </div>
              </div>
            </>) : (<>
              <div className="flex-1 lg:h-full lg:overflow-y-auto">
                <div className="border-b border-gray-300 px-8 py-6">
                    <h2 className="text-[18px] font-medium">Edit Your Profile</h2>
                </div>
    
                <div className="max-w-4xl px-8 py-8">
                    {/* Name */}
    
                    <div className="mb-8 grid grid-cols-1 items-center gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                    <label className="text-[14px] font-medium">Name</label>
    
                    { editMode ? (<>
                        <input
                            type="text"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleChange}
                            className="h-11 w-full max-w-xl border border-gray-300 px-4 outline-none focus:border-blue-500"
                        />
                    </>) : (<>
                        <div className="flex items-center gap-2 text-gray-500">
                        <span>{profile.fullName}</span>
                        </div>
                    </>)}
                    </div>
    
                    {/* Email */}
    
                    <div className="mb-8 grid grid-cols-1 items-center gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                    <label className="text-[14px] font-medium">Email Address</label>
    
                    { editMode ? (<>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            className="h-11 w-full max-w-xl border border-gray-300 px-4 outline-none focus:border-blue-500"
                        />
                    </>) : (<>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>{profile.email}</span>
    
                            <FaCheck className="text-xs text-green-600" />
                        </div>
                    </>)}
                    </div>
                    
    
                    {/* Mobile */}
    
                    <div className="mb-8 grid grid-cols-1 items-center gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                    <label className="text-[14px] font-medium">Mobile Phone</label>
                    
                    { editMode ? (<>
                        <input
                            type="tel"
                            name="mobileNumber"
                            value={profile.mobileNumber}
                            onChange={handleChange}
                            className="h-11 w-full max-w-xl border border-gray-300 px-4 outline-none focus:border-blue-500"
                        />
                    </>) : (<>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>{profile.mobileNumber}</span>
    
                            <FaCheck className="text-xs text-green-600" />
                        </div>
                    </>)}
                    </div>
    
                    {/* Password Reset */}
    
                    <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                    <div></div>
    
                    <button className="w-fit text-gray-500 underline hover:text-black"
                      onClick={() => setIsChangePasswordOpen(previous => !previous)}
                    >
                        Click here to change your password.
                    </button>
                    </div>
    
                    {/* WhatsApp */}
    
                    <div className="mb-10 grid grid-cols-1 items-center gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                    <div></div>
    
                    <div className="flex flex-wrap items-center gap-4">
                        <FaWhatsapp className="text-[34px] text-green-500" />
    
                        <span className="text-[14px]">Get Updates on WhatsApp</span>
    
                        <button
                        onClick={handleWhatsappToggle}
                        className={`relative h-6 w-12 transition-colors ${
                            profile.getUpdateOnWhatsApp ? "bg-teal-500" : "bg-gray-300"
                        } `}
                        >
                        <div
                            className={`absolute top-[2px] h-5 w-5 bg-white transition-all ${
                            profile.getUpdateOnWhatsApp ? "left-6" : "left-1"
                            } `}
                        />
                        </button>
                    </div>
                    </div>
                    {/* Save Button */}
    
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_1fr] lg:gap-8">
                    <div></div>
                    
                    {editMode ? (<>
                        <button
                            onClick={() => {
                                updateProfileData();
                                getProfileData();
                                setEditMode(previous=>!previous);
                            }}
                            className="w-fit bg-red-500 px-10 py-3 text-[14px] text-white transition-colors hover:bg-red-600"
                        >
                            {"Save Changes"}
                        </button>
                    </>) : (<>
                        <button
                            onClick={() => {
                                setEditMode(previous=>!previous);
                            }}
                            className="w-fit bg-red-500 px-10 py-3 text-[14px] text-white transition-colors hover:bg-red-600"
                        >
                            {"Edit Profile"}
                        </button>
                    </>)}
                    </div>
                </div>
              </div>  
            </>)}
          </>
        )}

        {(basicProfileOpen && emailChanged) && (
          <div className="flex-1 lg:h-full lg:overflow-y-auto">
                <div className="border-b border-gray-300 px-8 py-6">
                    <h2 className="text-[18px] font-medium">Verify new email</h2>

                    <p className="mt-2 text-[14px] text-gray-500">
                        A verification email has been sent to your new email address.
                    </p>

                    <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="mt-4 h-11 w-full max-w-xl border border-gray-300 px-4 outline-none focus:border-blue-500"
                    />

                    <button
                        onClick={handleEmailChange}
                        className="mt-4 w-fit bg-red-500 px-10 py-3 text-[14px] text-white transition-colors hover:bg-red-600"
                    >
                        Verify Email
                    </button    >
                </div>
            </div>
        )}

        {shortlistsOpen && (
          <div className="flex-1 lg:h-full lg:overflow-y-auto">
                <div className="border-b border-gray-300 px-8 py-6">
                    <h2 className="text-[18px] font-medium">Your Shortlists</h2>
                </div>
            </div>
        )}

        {propertiesOpen && (
          <div className="flex-1 lg:h-full lg:overflow-y-auto">
                <div className="border-b border-gray-300 px-8 py-6">
                    <h2 className="text-[18px] font-medium">Your Properties</h2>
                </div>

            <div className="px-8 py-8">
              {userProperties.length === 0 ? (
                <div className="border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
                  <p className="text-[14px] text-gray-600">No properties listed yet.</p>
                  <p className="mt-2 text-[13px] text-gray-500">Post a property to see it here.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {userProperties.map((property, index) => (
                    <div key={property._id || `user-prop-${index}`} className="border border-gray-300 bg-white">
                      <div className="border-b border-gray-300 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#009587]">
                            {property.propertyType || "Apartment"}
                          </span>
                          <span className="bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                            {property.BHKType} • {property.Furnishing}
                          </span>
                        </div>
                        <h3 className="text-[17px] font-semibold leading-6 text-gray-800">
                          {property.title}
                        </h3>
                        <p className="mt-1 text-[13px] text-gray-600">
                          📍 {property.locality?.text || property.locality?.label || "Location specified"}
                        </p>
                      </div>

                      <div className="grid border-b border-gray-300 sm:grid-cols-3">
                        <div className="border-b border-gray-300 px-4 py-3 text-center sm:border-b-0 sm:border-r">
                          <p className="text-[20px] font-semibold text-[#009587]">
                            ₹{property.rent ? property.rent.toLocaleString("en-IN") : "—"}/mo
                          </p>
                          <p className="mt-0.5 text-[12px] text-gray-500">Monthly Rent</p>
                        </div>
                        <div className="border-b border-gray-300 px-4 py-3 text-center sm:border-b-0 sm:border-r">
                          <p className="text-[20px] font-semibold text-gray-800">
                            ₹{property.deposit ? property.deposit.toLocaleString("en-IN") : "0"}
                          </p>
                          <p className="mt-0.5 text-[12px] text-gray-500">Security Deposit</p>
                        </div>
                        <div className="px-4 py-3 text-center">
                          <p className="text-[20px] font-semibold text-gray-800">
                            {property.builtUpArea ? `${property.builtUpArea} sqft` : "—"}
                          </p>
                          <p className="mt-0.5 text-[12px] text-gray-500">Builtup Area</p>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
                          <div className="h-40 border border-gray-200 bg-gray-100 overflow-hidden">
                            {property.photos && property.photos.length > 0 ? (
                              <img
                                src={property.photos[0]}
                                alt={property.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                                Property Image
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-3">
                            <div className="grid border border-gray-300 sm:grid-cols-2">
                              <div className="border-b border-gray-300 px-4 py-2 sm:border-b sm:border-r">
                                <p className="text-[16px] font-semibold text-gray-800">{property.BHKType || "—"}</p>
                                <p className="text-[12px] text-gray-500">BHK Type</p>
                              </div>
                              <div className="border-b border-gray-300 px-4 py-2 sm:border-b">
                                <p className="text-[16px] font-semibold text-gray-800">{property.Furnishing || "—"}</p>
                                <p className="text-[12px] text-gray-500">Furnishing</p>
                              </div>
                              <div className="border-b border-gray-300 px-4 py-2 sm:border-b-0 sm:border-r">
                                <p className="text-[16px] font-semibold text-gray-800">{property.bathrooms || 1}</p>
                                <p className="text-[12px] text-gray-500">Bathrooms</p>
                              </div>
                              <div className="px-4 py-2">
                                <p className="text-[16px] font-semibold text-gray-800">
                                  {property.Parking ? "Available" : "No"}
                                </p>
                                <p className="text-[12px] text-gray-500">Parking</p>
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 line-clamp-2">
                              {property.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
        )}
      </div>
    </div>
  );
}
