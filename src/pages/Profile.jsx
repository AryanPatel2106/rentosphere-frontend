import { useState, useEffect } from "react";
import {
  FaCheck,
  FaWhatsapp,
  FaHeart,
  FaTrash,
  FaPen,
  FaCreditCard,
  FaMoneyBillWave,
  FaHouseUser,
  FaXmark,
  FaCircleCheck,
  FaSpinner,
  FaPhone,
  FaReceipt,
  FaArrowRotateLeft,
  FaCalendarDays,
  FaBed,
  FaBath,
  FaShieldHalved,
  FaCircleExclamation,
} from "react-icons/fa6";
import api from "../services/api";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/errorHandler";
import { openRazorpayCheckout } from "../utils/razorpay";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const BHK_OPTIONS = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK+"];
const FURNISHING_OPTIONS = ["Fully Furnished", "Semi-Furnished", "Unfurnished"];
const TENANT_OPTIONS = ["Anyone", "Family", "Bachelors", "Company"];
const AVAILABILITY_OPTIONS = ["Immediate", "Within 15 Days", "Within 30 Days", "After 30 Days"];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab State
  // "basic" | "shortlists" | "properties" | "interested" | "rented" | "payments"
  const [activeTab, setActiveTab] = useState("basic");
  const [globalError, setGlobalError] = useState("");

  // Profile data
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    getUpdateOnWhatsApp: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [otp, setOtp] = useState("");

  // Change Password
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ text: "", error: false });

  // Data Collections
  const [userProperties, setUserProperties] = useState([]);
  const [shortlists, setShortlists] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [activeRented, setActiveRented] = useState([]);
  const [tenantRequests, setTenantRequests] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Edit Property Modal
  const [editModalProperty, setEditModalProperty] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Rental Request Modal (from shortlists)
  const [rentalModalProperty, setRentalModalProperty] = useState(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [rentalMessage, setRentalMessage] = useState("");
  const [rentalSubmitting, setRentalSubmitting] = useState(false);
  const [rentalSuccessMsg, setRentalSuccessMsg] = useState("");

  // Offline Payment Modal (for owner)
  const [offlinePaymentModal, setOfflinePaymentModal] = useState(null); // { rentalRequest, property }
  const [offlineMonth, setOfflineMonth] = useState(new Date().getMonth() + 1);
  const [offlineYear, setOfflineYear] = useState(new Date().getFullYear());
  const [offlineAmount, setOfflineAmount] = useState("");
  const [offlineMethod, setOfflineMethod] = useState("Cash");
  const [offlineNotes, setOfflineNotes] = useState("");
  const [offlineSubmitting, setOfflineSubmitting] = useState(false);

  // Razorpay Simulated Payment Modal (for tenant)
  const [razorpayModal, setRazorpayModal] = useState(null); // { request }
  const [payMonth, setPayMonth] = useState(new Date().getMonth() + 1);
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [payMethod, setPayMethod] = useState("upi");
  const [razorpayStep, setRazorpayStep] = useState("confirm"); // "confirm" | "processing" | "success"
  const [razorpayTxn, setRazorpayTxn] = useState(null);

  // ── Profile API Calls ───────────────────────────────────────────────────
  const getProfileData = async () => {
    try {
      const response = await api.get("/auth/current-user");
      setProfile(response.data.data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setGlobalError(getErrorMessage(error, "Failed to load profile data."));
    }
  };

  const updateProfileData = async () => {
    try {
      setGlobalError("");
      const response = await api.put("/auth/update-current-user", profile);
      if (response.data.data?.emailChanged) {
        setEmailChanged(true);
      }
      setProfile(response.data.data);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile data:", error);
      setGlobalError(getErrorMessage(error, "Failed to update profile details."));
    }
  };

  const handleWhatsappToggle = async () => {
    const updatedProfile = {
      ...profile,
      getUpdateOnWhatsApp: !profile.getUpdateOnWhatsApp,
    };
    setProfile(updatedProfile);
    try {
      setGlobalError("");
      const response = await api.put("/auth/update-current-user", updatedProfile);
      setProfile(response.data.data);
    } catch (error) {
      console.error("Error updating WhatsApp preference:", error);
      setGlobalError(getErrorMessage(error, "Failed to update WhatsApp preference."));
      setProfile(profile);
    }
  };

  const changePassword = async () => {
    try {
      setPasswordMsg({ text: "", error: false });
      await api.put("/auth/change-user-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPasswordMsg({ text: "Password changed successfully!", error: false });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setPasswordMsg({ text: "", error: false });
      }, 1500);
    } catch (error) {
      setPasswordMsg({
        text: getErrorMessage(error, "Error changing password."),
        error: true,
      });
    }
  };

  const handleEmailChange = async () => {
    try {
      setGlobalError("");
      const response = await api.put("/auth/update-user-email", {
        email: profile.email,
        token: otp,
      });
      if (response.status === 200) {
        setEmailChanged(false);
        setOtp("");
        getProfileData();
      }
    } catch (error) {
      console.error("Error changing email:", error);
      setGlobalError(getErrorMessage(error, "Failed to verify email token."));
    }
  };

  // ── Tab Data Loaders ────────────────────────────────────────────────────
  const fetchUserProperties = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/property/my-properties");
      setUserProperties(res.data.data || []);
    } catch (err) {
      console.error("Error fetching user properties:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchShortlists = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/property/shortlists");
      setShortlists(res.data.data || []);
    } catch (err) {
      console.error("Error fetching shortlists:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchOwnerRequests = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/property/owner-requests");
      setOwnerRequests(res.data.data || []);
    } catch (err) {
      console.error("Error fetching owner requests:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchActiveRented = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/property/active-rented");
      setActiveRented(res.data.data || []);
    } catch (err) {
      console.error("Error fetching active rented properties:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTenantRequests = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/property/tenant-requests");
      setTenantRequests(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tenant requests:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    getProfileData();
    const queryTab = searchParams.get("tab");
    if (
      queryTab &&
      ["basic", "shortlists", "properties", "interested", "rented", "payments"].includes(queryTab)
    ) {
      setActiveTab(queryTab);
    } else if (location.state?.openSection) {
      setActiveTab(location.state.openSection);
    }
  }, [location.state, searchParams]);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setGlobalError("");
  };

  useEffect(() => {
    if (activeTab === "properties") fetchUserProperties();
    else if (activeTab === "shortlists") fetchShortlists();
    else if (activeTab === "interested") fetchOwnerRequests();
    else if (activeTab === "rented") fetchActiveRented();
    else if (activeTab === "payments") fetchTenantRequests();
  }, [activeTab]);

  // ── Shortlist Actions ───────────────────────────────────────────────────
  const handleRemoveShortlist = async (propertyId) => {
    try {
      setGlobalError("");
      await api.post(`/property/shortlist/${propertyId}`);
      setShortlists((prev) => prev.filter((p) => p._id !== propertyId));
      try {
        const stored = JSON.parse(localStorage.getItem("rentosphere_shortlists") || "[]");
        localStorage.setItem(
          "rentosphere_shortlists",
          JSON.stringify(stored.filter((id) => id !== propertyId))
        );
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error("Error removing shortlist:", err);
      setGlobalError(getErrorMessage(err, "Failed to remove property from shortlist."));
    }
  };

  const handleOpenRentalRequest = (property) => {
    setRentalModalProperty(property);
    setMoveInDate("");
    setRentalMessage(
      `Hi, I would like to rent your property: ${property.title}. Please let me know the move-in steps.`
    );
    setRentalSuccessMsg("");
  };

  const handleSubmitRentalRequest = async (e) => {
    e.preventDefault();
    if (!rentalModalProperty) return;
    setRentalSubmitting(true);
    setGlobalError("");
    try {
      await api.post("/property/rental-request", {
        propertyId: rentalModalProperty._id,
        moveInDate: moveInDate || null,
        message: rentalMessage,
      });
      setRentalSuccessMsg("Rental request submitted successfully! Owner will review it.");
      setTimeout(() => {
        setRentalModalProperty(null);
        setRentalSuccessMsg("");
      }, 2000);
    } catch (err) {
      setGlobalError(getErrorMessage(err, "Failed to submit rental request."));
    } finally {
      setRentalSubmitting(false);
    }
  };

  // ── Property Management Actions ────────────────────────────────────────
  const handleOpenEditModal = (property) => {
    setEditModalProperty(property);
    setEditFormData({
      title: property.title || "",
      rent: property.rent || "",
      deposit: property.deposit || "",
      builtUpArea: property.builtUpArea || "",
      bathrooms: property.bathrooms || 1,
      balconies: property.balconies || 0,
      BHKType: property.BHKType || "2BHK",
      Furnishing: property.Furnishing || "Semi-Furnished",
      preferredTenant: property.preferredTenant || "Anyone",
      Availability: property.Availability || "Immediate",
      Parking: property.Parking || false,
      PetFriendly: property.PetFriendly || false,
      description: property.description || "",
    });
  };

  const handleSavePropertyEdit = async (e) => {
    e.preventDefault();
    if (!editModalProperty) return;
    setEditSaving(true);
    setGlobalError("");
    try {
      await api.put(`/property/${editModalProperty._id}`, editFormData);
      setEditModalProperty(null);
      fetchUserProperties();
    } catch (err) {
      setGlobalError(getErrorMessage(err, "Failed to update property details."));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to deactivate and remove this property listing?")) {
      return;
    }
    setGlobalError("");
    try {
      await api.delete(`/property/${propertyId}`);
      fetchUserProperties();
    } catch (err) {
      setGlobalError(getErrorMessage(err, "Failed to delete property."));
    }
  };

  // ── Owner Rental Application Actions ───────────────────────────────────
  const handleAcceptRequest = async (requestId) => {
    if (
      !window.confirm(
        "Accept this rental application? The property will be marked as RENTED and removed from public search."
      )
    ) {
      return;
    }
    setGlobalError("");
    try {
      await api.put(`/property/rental-request/${requestId}/accept`);
      fetchOwnerRequests();
    } catch (err) {
      setGlobalError(getErrorMessage(err, "Failed to accept application."));
    }
  };

  const handleRejectRequest = async (requestId) => {
    setGlobalError("");
    try {
      await api.put(`/property/rental-request/${requestId}/reject`);
      fetchOwnerRequests();
    } catch (err) {
      setGlobalError(getErrorMessage(err, "Failed to reject application."));
    }
  };

  // ── Active Rented & Offline Payments ───────────────────────────────────
  const handleOpenOfflinePayment = (item) => {
    setOfflinePaymentModal(item);
    setOfflineMonth(new Date().getMonth() + 1);
    setOfflineYear(new Date().getFullYear());
    setOfflineAmount(item.property?.rent || item.rentalRequest?.monthlyRent || "");
    setOfflineMethod("Cash");
    setOfflineNotes("");
  };

  const handleRecordOfflinePayment = async (e) => {
    e.preventDefault();
    if (!offlinePaymentModal?.rentalRequest?._id) return;
    setOfflineSubmitting(true);
    setGlobalError("");
    try {
      await api.post(
        `/property/rental-request/${offlinePaymentModal.rentalRequest._id}/record-payment`,
        {
          month: Number(offlineMonth),
          year: Number(offlineYear),
          amount: Number(offlineAmount),
          method: offlineMethod,
          notes: offlineNotes,
        }
      );
      setOfflinePaymentModal(null);
      fetchActiveRented();
    } catch (err) {
      setGlobalError(getErrorMessage(err, "Failed to record offline payment."));
    } finally {
      setOfflineSubmitting(false);
    }
  };

  const handleEndLease = async (propertyId) => {
    if (
      !window.confirm(
        "End lease for this property? The current tenancy will end and the property will be RE-LISTED and active in public search."
      )
    ) {
      return;
    }
    setGlobalError("");
    try {
      await api.put(`/property/${propertyId}/end-lease`);
      fetchActiveRented();
    } catch (err) {
      setGlobalError(getErrorMessage(err, "Failed to end lease."));
    }
  };

  // ── Razorpay Simulated Payment (Tenant) ────────────────────────────────
  const handleOpenRazorpay = (request) => {
    setRazorpayModal({ request });
    setPayMonth(new Date().getMonth() + 1);
    setPayYear(new Date().getFullYear());
    setPayMethod("upi");
    setRazorpayStep("confirm");
    setRazorpayTxn(null);
  };

  const handleSimulateRazorpayPayment = async () => {
    if (!razorpayModal?.request) return;
    setRazorpayStep("processing");
    setGlobalError("");

    try {
      // Step 1: Create order on backend
      const orderRes = await api.post("/property/payment/create-order", {
        requestId: razorpayModal.request._id,
        amount: razorpayModal.request.monthlyRent,
        month: payMonth,
        year: payYear,
      });

      const orderData = orderRes.data?.data;

      // Step 2: Open standard Razorpay Checkout SDK
      await openRazorpayCheckout({
        orderData,
        user: profile,
        onSuccess: async (rzpResponse) => {
          try {
            // Step 3: Verify payment on backend
            await api.post("/property/payment/verify", {
              requestId: razorpayModal.request._id,
              orderId: rzpResponse.razorpay_order_id,
              paymentId: rzpResponse.razorpay_payment_id,
              amount: razorpayModal.request.monthlyRent,
              month: payMonth,
              year: payYear,
              method: "online",
            });

            setRazorpayTxn({
              paymentId: rzpResponse.razorpay_payment_id,
              amount: razorpayModal.request.monthlyRent,
              month: MONTH_NAMES[payMonth - 1],
              year: payYear,
            });
            setRazorpayStep("success");
            fetchTenantRequests();
          } catch (verifyErr) {
            setGlobalError(getErrorMessage(verifyErr, "Payment verification failed."));
            setRazorpayStep("confirm");
          }
        },
        onFailure: (errMsg) => {
          setGlobalError(typeof errMsg === "string" ? errMsg : "Payment failed or cancelled.");
          setRazorpayStep("confirm");
        },
        onDismiss: () => {
          setRazorpayStep("confirm");
        },
      });
    } catch (err) {
      setGlobalError(getErrorMessage(err, "Error initiating Razorpay payment."));
      setRazorpayStep("confirm");
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 py-4 sm:py-6 px-3 sm:px-6">
      <div className="mx-auto flex max-w-[1500px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:h-[calc(100vh-180px)] lg:min-h-[700px] lg:flex-row lg:overflow-hidden">
        {/* ── Sidebar Navigation ────────────────────────────────────────── */}
        <div className="w-full border-r border-slate-200/80 lg:h-full lg:w-72 lg:overflow-y-auto">
          <div className="border-b border-slate-200/80 px-5 py-5 sm:px-6">
            <h2 className="text-base font-bold text-slate-800">Account Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{profile.email || "Manage your rentals"}</p>
          </div>

          <div className="flex flex-row overflow-x-auto gap-1.5 p-2 bg-slate-100/70 border-b lg:border-b-0 border-slate-200/80 scrollbar-none lg:flex-col lg:p-3 lg:space-y-1 lg:bg-white text-sm">
            <button
              onClick={() => handleSelectTab("basic")}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 lg:px-4 lg:py-3 text-left font-medium transition whitespace-nowrap ${
                activeTab === "basic"
                  ? "bg-white lg:bg-teal-50/80 text-teal-700 font-semibold shadow-xs border border-slate-200/60 lg:border-teal-200/60"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>My Profile</span>
            </button>

            <button
              onClick={() => handleSelectTab("shortlists")}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 lg:px-4 lg:py-3 text-left font-medium transition whitespace-nowrap ${
                activeTab === "shortlists"
                  ? "bg-white lg:bg-teal-50/80 text-teal-700 font-semibold shadow-xs border border-slate-200/60 lg:border-teal-200/60"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FaHeart className="text-rose-500 text-xs" />
                <span>Saved</span>
              </div>
              {shortlists.length > 0 && (
                <span className="rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 px-2 py-0.5 text-[10px] font-bold">
                  {shortlists.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectTab("properties")}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 lg:px-4 lg:py-3 text-left font-medium transition whitespace-nowrap ${
                activeTab === "properties"
                  ? "bg-white lg:bg-teal-50/80 text-teal-700 font-semibold shadow-xs border border-slate-200/60 lg:border-teal-200/60"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>My Properties</span>
              {userProperties.length > 0 && (
                <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-bold">
                  {userProperties.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectTab("interested")}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 lg:px-4 lg:py-3 text-left font-medium transition whitespace-nowrap ${
                activeTab === "interested"
                  ? "bg-white lg:bg-teal-50/80 text-teal-700 font-semibold shadow-xs border border-slate-200/60 lg:border-teal-200/60"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Applications</span>
              {ownerRequests.filter((r) => r.status === "pending").length > 0 && (
                <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 text-[10px] font-bold">
                  {ownerRequests.filter((r) => r.status === "pending").length} new
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectTab("rented")}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 lg:px-4 lg:py-3 text-left font-medium transition whitespace-nowrap ${
                activeTab === "rented"
                  ? "bg-white lg:bg-teal-50/80 text-teal-700 font-semibold shadow-xs border border-slate-200/60 lg:border-teal-200/60"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FaHouseUser className="text-teal-600 text-xs" />
                <span>Tenancies</span>
              </div>
              {activeRented.length > 0 && (
                <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 px-2 py-0.5 text-[10px] font-bold">
                  {activeRented.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectTab("payments")}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 lg:px-4 lg:py-3 text-left font-medium transition whitespace-nowrap ${
                activeTab === "payments"
                  ? "bg-white lg:bg-teal-50/80 text-teal-700 font-semibold shadow-xs border border-slate-200/60 lg:border-teal-200/60"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FaCreditCard className="text-blue-500 text-xs" />
                <span>Payments</span>
              </div>
            </button>
          </div>
        </div>

        {/* ── Main Content Area ─────────────────────────────────────────── */}
        <div className="flex-1 lg:h-full lg:overflow-y-auto">
          {/* Visible Error Banner */}
          {globalError && (
            <div className="m-3 sm:m-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 shadow-xs">
              <div className="flex items-start gap-3">
                <FaCircleExclamation className="mt-0.5 text-base text-rose-600 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-rose-800 uppercase tracking-wide">Notice</h4>
                  <p className="mt-0.5">{globalError}</p>
                </div>
                <button
                  onClick={() => setGlobalError("")}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          {/* TAB 1: BASIC PROFILE */}
          {activeTab === "basic" && (
            <div>
              <div className="border-b border-slate-200/80 px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Basic Profile</h2>
                  <p className="text-xs text-slate-500">Manage your profile details and security</p>
                </div>
                {!isChangePasswordOpen && !emailChanged && (
                  <button
                    type="button"
                    onClick={() => {
                      if (editMode) updateProfileData();
                      else setEditMode(true);
                    }}
                    className="rounded-xl bg-teal-600 px-4 sm:px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700 shadow-xs"
                  >
                    {editMode ? "Save Changes" : "Edit Profile"}
                  </button>
                )}
              </div>

              {isChangePasswordOpen ? (
                <div className="max-w-2xl px-5 sm:px-8 py-5 sm:py-8 space-y-5">
                  <h3 className="text-base font-semibold text-slate-800">Change Password</h3>
                  {passwordMsg.text && (
                    <div
                      className={`p-3 text-xs rounded-xl border ${
                        passwordMsg.error
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {passwordMsg.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={changePassword}
                      className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition shadow-xs"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => setIsChangePasswordOpen(false)}
                      className="rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : emailChanged ? (
                <div className="max-w-xl px-5 sm:px-8 py-5 sm:py-8 space-y-4">
                  <h3 className="text-base font-semibold text-slate-800">Verify New Email</h3>
                  <p className="text-xs text-slate-500">
                    A verification code has been sent to your new email address.
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  />
                  <button
                    onClick={handleEmailChange}
                    className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition shadow-xs"
                  >
                    Verify & Save Email
                  </button>
                </div>
              ) : (
                <div className="max-w-3xl px-5 sm:px-8 py-5 sm:py-8 space-y-6">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
                    <span className="text-xs font-semibold text-slate-600">Full Name:</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="fullName"
                        value={profile.fullName || ""}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-800">
                        {profile.fullName || "Not provided"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
                    <span className="text-xs font-semibold text-slate-600">Email Address:</span>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={profile.email || ""}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{profile.email}</span>
                        <FaCheck className="text-xs text-emerald-600" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
                    <span className="text-xs font-semibold text-slate-600">Mobile Phone:</span>
                    {editMode ? (
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={profile.mobileNumber || ""}
                        onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-800">
                        {profile.mobileNumber || "Not provided"}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="text-xs font-medium text-teal-600 underline hover:text-teal-700"
                    >
                      Click here to change your account password.
                    </button>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <FaWhatsapp className="text-2xl text-emerald-500" />
                    <span className="text-xs font-medium text-slate-700">
                      Get updates on WhatsApp
                    </span>
                    <button
                      type="button"
                      onClick={handleWhatsappToggle}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        profile.getUpdateOnWhatsApp ? "bg-teal-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-all ${
                          profile.getUpdateOnWhatsApp ? "left-5.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: YOUR SHORTLISTS */}
          {activeTab === "shortlists" && (
            <div>
              <div className="border-b border-slate-200/80 px-5 sm:px-8 py-4 sm:py-6">
                <h2 className="text-lg font-bold text-slate-800">Your Shortlisted Properties</h2>
                <p className="text-xs text-slate-500">Properties you saved for easy access and rental requests</p>
              </div>

              <div className="px-5 sm:px-8 py-4 sm:py-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-xs text-teal-600">
                    <FaSpinner className="animate-spin" /> Loading your shortlists…
                  </div>
                ) : shortlists.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                    <FaHeart className="mx-auto text-3xl text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-800">No properties in your saved list yet.</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Save properties you like to compare rent, deposits, amenities, and send rental requests directly.
                    </p>
                    <a
                      href="/search"
                      className="mt-4 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition shadow-xs"
                    >
                      Browse Rental Properties
                    </a>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {shortlists.map((property) => (
                      <div
                        key={property._id}
                        onClick={() => navigate(`/property/${property._id}`)}
                        className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row gap-5 items-start justify-between transition hover:border-teal-500/50 hover:shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                          <div className="h-32 w-full sm:w-44 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {property.photos && property.photos[0] ? (
                              <img
                                src={property.photos[0]}
                                alt={property.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                                No Photo
                              </div>
                            )}
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                                {property.propertyType || "Apartment"}
                              </span>
                              <span className="text-xs font-semibold text-slate-700">
                                {property.BHKType} • {property.Furnishing}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition">{property.title}</h3>
                            <p className="text-xs text-slate-500">
                              📍 {property.locality?.text || property.locality?.label || "Location"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs pt-1">
                              <span className="font-bold text-teal-600 text-sm">
                                ₹{(property.rent || 0).toLocaleString("en-IN")}/mo
                              </span>
                              <span className="text-slate-500">
                                Deposit: ₹{(property.deposit || 0).toLocaleString("en-IN")}
                              </span>
                              {property.builtUpArea > 0 && (
                                <span className="text-slate-500">{property.builtUpArea} sqft</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRentalRequest(property);
                            }}
                            className="flex-1 md:flex-initial rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs transition"
                          >
                            Request to Rent
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveShortlist(property._id);
                            }}
                            className="flex-1 md:flex-initial rounded-xl border border-rose-200 text-rose-600 px-4 py-2.5 text-xs font-semibold hover:bg-rose-50 transition flex items-center justify-center gap-1.5"
                          >
                            <FaTrash className="text-xs" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: YOUR PROPERTIES (OWNER) */}
          {activeTab === "properties" && (
            <div>
              <div className="border-b border-slate-200/80 px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Your Listed Properties</h2>
                  <p className="text-xs text-slate-500">Properties you own and posted on Rentosphere</p>
                </div>
                <a
                  href="/post-property"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 shadow-xs"
                >
                  + Post New Property
                </a>
              </div>

              <div className="px-5 sm:px-8 py-4 sm:py-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-xs text-teal-600">
                    <FaSpinner className="animate-spin" /> Loading your properties…
                  </div>
                ) : userProperties.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                    <p className="text-sm font-semibold text-slate-800">No properties listed yet.</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      List your home, flat, or PG to connect with verified tenants with zero brokerage and instant digital agreements.
                    </p>
                    <a
                      href="/post-property"
                      className="mt-4 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition shadow-xs"
                    >
                      + Post Property Free
                    </a>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {userProperties.map((property) => (
                      <div key={property._id} className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                        <div className="border-b border-slate-200/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                property.status === "rented"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200/80"
                                  : property.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {property.status === "rented" ? "● Booked / Rented" : `● ${property.status}`}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 font-medium">
                              {property.BHKType} • {property.Furnishing}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/property/${property._id}`)}
                              className="rounded-xl border border-teal-600 bg-teal-50/40 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100/50 transition"
                            >
                              View Listing
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(property)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
                            >
                              <FaPen className="text-xs text-teal-600" /> Edit Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProperty(property._id)}
                              className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1 shadow-xs"
                            >
                              <FaTrash className="text-xs" /> Deactivate
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
                            <div
                              onClick={() => navigate(`/property/${property._id}`)}
                              className="h-36 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden cursor-pointer hover:opacity-90 transition"
                              title="Click to view full property details"
                            >
                              {property.photos && property.photos[0] ? (
                                <img
                                  src={property.photos[0]}
                                  alt={property.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                                  No Photos
                                </div>
                              )}
                            </div>

                            <div className="space-y-2.5">
                              <h3
                                onClick={() => navigate(`/property/${property._id}`)}
                                className="text-base font-bold text-slate-900 hover:text-teal-600 transition cursor-pointer"
                                title="Click to view full property details"
                              >
                                {property.title}
                              </h3>
                              <p className="text-xs text-slate-500">
                                📍 {property.locality?.text || property.locality?.label}
                              </p>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-center text-xs">
                                <div>
                                  <span className="text-slate-500">Rent</span>
                                  <p className="font-bold text-teal-600 text-sm mt-0.5">
                                    ₹{(property.rent || 0).toLocaleString("en-IN")}/mo
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Deposit</span>
                                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                                    ₹{(property.deposit || 0).toLocaleString("en-IN")}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Area</span>
                                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                                    {property.builtUpArea ? `${property.builtUpArea} sqft` : "—"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Baths</span>
                                  <p className="font-bold text-slate-800 text-sm mt-0.5">{property.bathrooms || 1}</p>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 line-clamp-2">
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

          {/* TAB 4: INTERESTED IN YOUR PROPERTIES (OWNER) */}
          {activeTab === "interested" && (
            <div>
              <div className="border-b border-slate-200/80 px-5 sm:px-8 py-4 sm:py-6">
                <h2 className="text-lg font-bold text-slate-800">Interested in your Properties</h2>
                <p className="text-xs text-slate-500">
                  Prospective tenants who submitted rental requests for your listings
                </p>
              </div>

              <div className="px-5 sm:px-8 py-4 sm:py-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-xs text-teal-600">
                    <FaSpinner className="animate-spin" /> Loading tenant applications…
                  </div>
                ) : ownerRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                    <p className="text-sm font-medium text-slate-700">No applications received yet.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      When tenants apply for your properties, their applications will show up here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownerRequests.map((request) => (
                      <div
                        key={request._id}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">Property:</span>
                              <span className="text-sm font-bold text-teal-600">
                                {request.property?.title || "Property Listing"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              📍 {request.property?.locality?.text || request.property?.locality?.label}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase ${
                              request.status === "accepted"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                : request.status === "rejected"
                                ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                                : "bg-amber-50 text-amber-700 border border-amber-200/80"
                            }`}
                          >
                            Status: {request.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs">
                          <div>
                            <span className="text-slate-500">Applicant:</span>
                            <p className="font-bold text-slate-800">
                              {request.tenant?.fullName || "Prospective Tenant"}
                            </p>
                            <p className="text-slate-600">{request.tenant?.email}</p>
                            {request.tenant?.mobileNumber && (
                              <p className="text-slate-600">{request.tenant.mobileNumber}</p>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-500">Preferred Move-in:</span>
                            <p className="font-bold text-slate-800">
                              {request.moveInDate
                                ? new Date(request.moveInDate).toLocaleDateString()
                                : "Immediate"}
                            </p>
                            <p className="text-slate-500 mt-1">
                              Rent: ₹{(request.monthlyRent || 0).toLocaleString("en-IN")}/mo
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">Tenant Note:</span>
                            <p className="italic text-slate-700 line-clamp-3">
                              "{request.message || "Interested in renting this property."}"
                            </p>
                          </div>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex justify-end gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleRejectRequest(request._id)}
                              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcceptRequest(request._id)}
                              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs transition"
                            >
                              <FaCheck className="text-xs" /> Accept Application & Book
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVE RENTED PROPERTIES (OWNER) */}
          {activeTab === "rented" && (
            <div>
              <div className="border-b border-slate-200/80 px-5 sm:px-8 py-4 sm:py-6">
                <h2 className="text-lg font-bold text-slate-800">Active Rented Properties</h2>
                <p className="text-xs text-slate-500">
                  Track ongoing tenancies, record offline rent payments, or end leases to re-list
                </p>
              </div>

              <div className="px-5 sm:px-8 py-4 sm:py-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-xs text-teal-600">
                    <FaSpinner className="animate-spin" /> Loading rented properties…
                  </div>
                ) : activeRented.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                    <FaHouseUser className="mx-auto text-3xl text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700">No active tenancies currently.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      When you accept a tenant's rental application, the property is marked rented and tracked here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeRented.map((item) => {
                      const prop = item.property;
                      const req = item.rentalRequest;
                      const payments = req?.payments || [];

                      return (
                        <div key={prop._id} className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                          <div className="border-b border-slate-200/80 px-5 py-4 flex flex-wrap items-center justify-between gap-3 bg-teal-50/40">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 px-2.5 py-0.5 text-xs font-bold uppercase">
                                  Occupied / Rented
                                </span>
                                <h3 className="text-base font-bold text-slate-900">{prop.title}</h3>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                📍 {prop.locality?.text || prop.locality?.label} • ₹{(prop.rent || 0).toLocaleString("en-IN")}/mo
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {req && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenOfflinePayment(item)}
                                  className="rounded-xl bg-teal-600 text-white px-3.5 py-2 text-xs font-semibold hover:bg-teal-700 flex items-center gap-1.5 shadow-xs transition"
                                >
                                  <FaMoneyBillWave className="text-xs" /> Record Offline Payment
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleEndLease(prop._id)}
                                className="rounded-xl border border-rose-200 text-rose-600 bg-white px-3 py-2 text-xs font-semibold hover:bg-rose-50 flex items-center gap-1.5 transition"
                              >
                                <FaArrowRotateLeft className="text-xs" /> End Lease & Re-list
                              </button>
                            </div>
                          </div>

                          {/* Tenant Info */}
                          <div className="p-5 border-b border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/70">
                              <span className="text-slate-500 font-medium">Tenant Details:</span>
                              <p className="font-bold text-slate-800 text-sm mt-0.5">
                                {prop.currentTenant?.fullName || req?.tenant?.fullName || "Assigned Tenant"}
                              </p>
                              <p className="text-slate-600">{prop.currentTenant?.email || req?.tenant?.email}</p>
                              <p className="text-slate-600">
                                📞 {prop.currentTenant?.mobileNumber || req?.tenant?.mobileNumber || "Contact not provided"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/70">
                              <span className="text-slate-500 font-medium">Monthly Rent & Deposit:</span>
                              <p className="font-bold text-teal-600 text-sm mt-0.5">
                                ₹{(prop.rent || req?.monthlyRent || 0).toLocaleString("en-IN")}/month
                              </p>
                              <p className="text-slate-600">
                                Security Deposit: ₹{(prop.deposit || req?.deposit || 0).toLocaleString("en-IN")}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/70">
                              <span className="text-slate-500 font-medium">Lease Start Date:</span>
                              <p className="font-bold text-slate-800 text-sm mt-0.5">
                                {req?.moveInDate ? new Date(req.moveInDate).toLocaleDateString() : "Active Agreement"}
                              </p>
                              <p className="text-slate-500">Payments Recorded: {payments.length}</p>
                            </div>
                          </div>

                          {/* Payment Records Table */}
                          <div className="p-5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                              Rent Payment History
                            </h4>
                            {payments.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">
                                No rent payments recorded yet for this lease. Use "Record Offline Payment" above when tenant pays via Cash, UPI, or Bank Transfer.
                              </p>
                            ) : (
                              <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                    <tr>
                                      <th className="p-3">Month / Year</th>
                                      <th className="p-3">Amount</th>
                                      <th className="p-3">Method</th>
                                      <th className="p-3">Status</th>
                                      <th className="p-3">Transaction ID</th>
                                      <th className="p-3">Notes</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {payments.map((pmt, idx) => (
                                      <tr key={pmt._id || idx} className="hover:bg-slate-50/60">
                                        <td className="p-3 font-semibold text-slate-800">
                                          {MONTH_NAMES[pmt.month - 1]} {pmt.year}
                                        </td>
                                        <td className="p-3 font-bold text-teal-600">
                                          ₹{pmt.amount.toLocaleString("en-IN")}
                                        </td>
                                        <td className="p-3 uppercase font-medium text-slate-600">
                                          {pmt.method}
                                        </td>
                                        <td className="p-3">
                                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold">
                                            PAID
                                          </span>
                                        </td>
                                        <td className="p-3 font-mono text-slate-500 text-xs">
                                          {pmt.transactionId || "—"}
                                        </td>
                                        <td className="p-3 text-slate-500 text-xs">
                                          {pmt.notes || "—"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: YOUR PAYMENTS & RENT (TENANT) */}
          {activeTab === "payments" && (
            <div>
              <div className="border-b border-slate-200/80 px-5 sm:px-8 py-4 sm:py-6">
                <h2 className="text-lg font-bold text-slate-800">Your Payments & Rental Agreements</h2>
                <p className="text-xs text-slate-500">
                  View accepted leases, payment history, and pay monthly rent online via Razorpay
                </p>
              </div>

              <div className="px-5 sm:px-8 py-4 sm:py-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-xs text-teal-600">
                    <FaSpinner className="animate-spin" /> Loading rental agreements…
                  </div>
                ) : tenantRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                    <FaCreditCard className="mx-auto text-3xl text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700">No active rental applications or agreements.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      When you submit a rental request and the owner accepts, you can manage your rent payments here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {tenantRequests.map((request) => {
                      const isAccepted = request.status === "accepted";
                      const payments = request.payments || [];

                      return (
                        <div key={request._id} className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                          <div className="border-b border-slate-200/80 px-5 py-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                                    isAccepted
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                      : request.status === "rejected"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                                      : "bg-amber-50 text-amber-700 border border-amber-200/80"
                                  }`}
                                >
                                  {isAccepted ? "● Active Agreement" : `Application: ${request.status}`}
                                </span>
                                <h3 className="text-base font-bold text-slate-900">
                                  {request.property?.title || "Property"}
                                </h3>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                📍 {request.property?.locality?.text || request.property?.locality?.label}
                              </p>
                            </div>

                            {isAccepted && (
                              <button
                                type="button"
                                onClick={() => handleOpenRazorpay(request)}
                                className="rounded-xl bg-teal-600 text-white px-5 py-2 text-xs font-semibold hover:bg-teal-700 flex items-center gap-1.5 shadow-xs transition"
                              >
                                <FaCreditCard className="text-xs" /> Pay Rent Online (Razorpay)
                              </button>
                            )}
                          </div>

                          <div className="p-5 border-b border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/70">
                              <span className="text-slate-500 font-medium">Landlord:</span>
                              <p className="font-bold text-slate-800 text-sm mt-0.5">
                                {request.owner?.fullName || "Property Owner"}
                              </p>
                              <p className="text-slate-600">{request.owner?.email}</p>
                              {request.owner?.mobileNumber && (
                                <p className="text-slate-600">📞 {request.owner.mobileNumber}</p>
                              )}
                            </div>

                            <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/70">
                              <span className="text-slate-500 font-medium">Monthly Rent & Deposit:</span>
                              <p className="font-bold text-teal-600 text-sm mt-0.5">
                                ₹{(request.monthlyRent || 0).toLocaleString("en-IN")}/mo
                              </p>
                              <p className="text-slate-600">
                                Deposit: ₹{(request.deposit || 0).toLocaleString("en-IN")}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/70">
                              <span className="text-slate-500 font-medium">Move-in Date:</span>
                              <p className="font-bold text-slate-800 text-sm mt-0.5">
                                {request.moveInDate ? new Date(request.moveInDate).toLocaleDateString() : "Immediate"}
                              </p>
                              <p className="text-slate-500 mt-1">Total Paid Receipts: {payments.length}</p>
                            </div>
                          </div>

                          {/* Receipts & Payments */}
                          {isAccepted && (
                            <div className="p-5">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                                Your Rent Receipts
                              </h4>
                              {payments.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">
                                  No payments recorded yet. Click "Pay Rent Online (Razorpay)" above to complete this month's rent payment.
                                </p>
                              ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                      <tr>
                                        <th className="p-3">Rent Period</th>
                                        <th className="p-3">Amount Paid</th>
                                        <th className="p-3">Payment Method</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Transaction Ref</th>
                                        <th className="p-3">Date Paid</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {payments.map((p, idx) => (
                                        <tr key={p._id || idx} className="hover:bg-slate-50/60">
                                          <td className="p-3 font-semibold text-slate-800">
                                            {MONTH_NAMES[p.month - 1]} {p.year}
                                          </td>
                                          <td className="p-3 font-bold text-teal-600">
                                            ₹{p.amount.toLocaleString("en-IN")}
                                          </td>
                                          <td className="p-3 uppercase font-medium text-slate-600">
                                            {p.method}
                                          </td>
                                          <td className="p-3">
                                            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold">
                                              PAID
                                            </span>
                                          </td>
                                          <td className="p-3 font-mono text-slate-500 text-xs">
                                            {p.transactionId || "—"}
                                          </td>
                                          <td className="p-3 text-slate-500 text-xs">
                                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: EDIT PROPERTY DETAILS (OWNER) ────────────────────────── */}
      {editModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setEditModalProperty(null)}
              className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <FaXmark />
            </button>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Edit Listing
            </span>

            <h3 className="text-lg font-bold text-slate-900 mt-2">Edit Property Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update rent, deposit, specifications and amenities for this property listing
            </p>

            <form onSubmit={handleSavePropertyEdit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Property Title</label>
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={editFormData.rent}
                    onChange={(e) => setEditFormData({ ...editFormData, rent: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={editFormData.deposit}
                    onChange={(e) => setEditFormData({ ...editFormData, deposit: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">BHK Type</label>
                  <select
                    value={editFormData.BHKType}
                    onChange={(e) => setEditFormData({ ...editFormData, BHKType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    {BHK_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Furnishing</label>
                  <select
                    value={editFormData.Furnishing}
                    onChange={(e) => setEditFormData({ ...editFormData, Furnishing: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    {FURNISHING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Builtup Area (sqft)</label>
                  <input
                    type="number"
                    value={editFormData.builtUpArea}
                    onChange={(e) => setEditFormData({ ...editFormData, builtUpArea: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.bathrooms}
                    onChange={(e) => setEditFormData({ ...editFormData, bathrooms: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Preferred Tenant</label>
                  <select
                    value={editFormData.preferredTenant}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, preferredTenant: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    {TENANT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Availability</label>
                  <select
                    value={editFormData.Availability}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, Availability: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
                <label className="flex items-center gap-2.5 cursor-pointer font-medium text-slate-700 rounded-xl border border-slate-200 bg-slate-50/50 p-3 hover:border-teal-400 transition">
                  <input
                    type="checkbox"
                    checked={editFormData.Parking || false}
                    onChange={(e) => setEditFormData({ ...editFormData, Parking: e.target.checked })}
                    className="h-4 w-4 rounded accent-teal-600"
                  />
                  <span>Parking Available</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer font-medium text-slate-700 rounded-xl border border-slate-200 bg-slate-50/50 p-3 hover:border-teal-400 transition">
                  <input
                    type="checkbox"
                    checked={editFormData.PetFriendly || false}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, PetFriendly: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-teal-600"
                  />
                  <span>Pet Friendly</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setEditModalProperty(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 shadow-xs transition"
                >
                  {editSaving ? "Saving changes…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD OFFLINE PAYMENT (OWNER) ───────────────────────── */}
      {offlinePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setOfflinePaymentModal(null)}
              className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <FaXmark />
            </button>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Owner Payment Entry
            </span>

            <h3 className="text-base font-bold text-slate-900 mt-2">Record Offline Rent Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {offlinePaymentModal.property?.title} • Tenant:{" "}
              {offlinePaymentModal.property?.currentTenant?.fullName ||
                offlinePaymentModal.rentalRequest?.tenant?.fullName ||
                "Tenant"}
            </p>

            <form onSubmit={handleRecordOfflinePayment} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Month</label>
                  <select
                    value={offlineMonth}
                    onChange={(e) => setOfflineMonth(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={name} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Year</label>
                  <input
                    type="number"
                    value={offlineYear}
                    onChange={(e) => setOfflineYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={offlineAmount}
                  onChange={(e) => setOfflineAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Payment Method</label>
                <select
                  value={offlineMethod}
                  onChange={(e) => setOfflineMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Direct Bank Transfer / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
                <input
                  type="text"
                  value={offlineNotes}
                  onChange={(e) => setOfflineNotes(e.target.value)}
                  placeholder="e.g. Received by owner on 5th"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setOfflinePaymentModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offlineSubmitting}
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 shadow-xs transition"
                >
                  {offlineSubmitting ? "Recording…" : "Confirm Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RAZORPAY SIMULATED PAYMENT (TENANT) ───────────────────── */}
      {razorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden">
            {/* Authentic Razorpay Header */}
            <div className="bg-teal-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold tracking-wide">Rentosphere Housing</h4>
                  <p className="text-xs text-teal-100">Rent Payment Gateway</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-teal-100 font-semibold">Amount</span>
                  <p className="text-lg font-extrabold text-white">
                    ₹{(razorpayModal.request.monthlyRent || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-teal-100 border-t border-teal-500/60 pt-2.5">
                <span className="flex items-center gap-1.5">
                  <FaShieldHalved className="text-teal-200" /> Razorpay Trusted Business
                </span>
                <span className="font-medium bg-teal-700/80 px-2 py-0.5 rounded-full text-[10px] text-teal-100">
                  Instant Confirmation
                </span>
              </div>
            </div>

            <div className="p-6">
              {razorpayStep === "processing" ? (
                <div className="py-10 text-center space-y-3">
                  <FaSpinner className="mx-auto text-3xl text-teal-600 animate-spin" />
                  <h4 className="text-sm font-bold text-slate-800">Processing Payment Securely…</h4>
                  <p className="text-xs text-slate-500">Connecting to secure payment gateway. Please do not refresh.</p>
                </div>
              ) : razorpayStep === "success" ? (
                <div className="py-6 text-center space-y-3">
                  <FaCircleCheck className="mx-auto text-4xl text-teal-600" />
                  <h4 className="text-base font-bold text-slate-900">Payment Successful!</h4>
                  <p className="text-xs text-slate-600">
                    Rent of ₹{razorpayTxn?.amount?.toLocaleString("en-IN")} for {razorpayTxn?.month} {razorpayTxn?.year} recorded.
                  </p>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 font-mono text-xs text-slate-600 text-left space-y-1">
                    <div>Ref ID: {razorpayTxn?.paymentId}</div>
                    <div>Status: Captured (Success)</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRazorpayModal(null)}
                    className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition shadow-xs"
                  >
                    Close & View Receipt
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Rent Period</label>
                      <select
                        value={payMonth}
                        onChange={(e) => setPayMonth(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                      >
                        {MONTH_NAMES.map((name, i) => (
                          <option key={name} value={i + 1}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Year</label>
                      <input
                        type="number"
                        value={payYear}
                        onChange={(e) => setPayYear(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Select Payment Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod("upi")}
                        className={`rounded-xl border p-2.5 text-center text-xs font-medium transition ${
                          payMethod === "upi"
                            ? "border-teal-600 bg-teal-50 text-teal-700 font-bold shadow-xs"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        📱 UPI / QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod("card")}
                        className={`rounded-xl border p-2.5 text-center text-xs font-medium transition ${
                          payMethod === "card"
                            ? "border-teal-600 bg-teal-50 text-teal-700 font-bold shadow-xs"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        💳 Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod("netbanking")}
                        className={`rounded-xl border p-2.5 text-center text-xs font-medium transition ${
                          payMethod === "netbanking"
                            ? "border-teal-600 bg-teal-50 text-teal-700 font-bold shadow-xs"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        🏦 NetBanking
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 p-3.5 text-xs text-slate-700 space-y-1">
                    <p className="font-semibold text-teal-900 flex items-center gap-1.5">
                      <FaShieldHalved className="text-teal-600" /> Razorpay 256-bit SSL Secure Checkout
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Instant rent receipt with landlord details generated immediately upon confirmation. HRA tax compliant.
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setRazorpayModal(null)}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateRazorpayPayment}
                      className="flex-1 rounded-xl bg-teal-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Pay ₹{(razorpayModal.request.monthlyRent || 0).toLocaleString("en-IN")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SHORTLIST RENTAL REQUEST ─────────────────────────────── */}
      {rentalModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setRentalModalProperty(null)}
              className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <FaXmark />
            </button>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Rental Application
            </span>

            <h3 className="text-base font-bold text-slate-900 mt-2">Submit Rental Request</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {rentalModalProperty.title} • ₹{(rentalModalProperty.rent || 0).toLocaleString("en-IN")}/mo
            </p>

            {rentalSuccessMsg ? (
              <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/80 p-4 text-center text-teal-800">
                <FaCircleCheck className="mx-auto text-2xl text-teal-600 mb-1" />
                <p className="text-xs font-semibold">{rentalSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRentalRequest} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Preferred Move-in Date
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Message to Owner</label>
                  <textarea
                    rows={3}
                    value={rentalMessage}
                    onChange={(e) => setRentalMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                    required
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setRentalModalProperty(null)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rentalSubmitting}
                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 shadow-xs transition"
                  >
                    {rentalSubmitting ? "Submitting…" : "Send Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
