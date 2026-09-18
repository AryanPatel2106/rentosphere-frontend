import { useState, useEffect } from "react";
import {
  FaCreditCard,
  FaShieldHalved,
  FaReceipt,
  FaSpinner,
  FaCircleCheck,
  FaCircleExclamation,
  FaHouseUser,
  FaArrowRight,
  FaCalendarDays,
  FaMoneyBillWave,
  FaUser,
  FaPhone
} from "react-icons/fa6";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorHandler";
import { openRazorpayCheckout } from "../utils/razorpay";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getLocalityDisplay = (property) => {
  if (!property) return "Location";
  const loc = property.locality;
  if (typeof loc === "string") return loc;
  if (loc && typeof loc === "object") {
    return loc.text || loc.label || loc.city || property.city || "Location";
  }
  return property.city || "Location";
};

export default function PayRent(props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const outlet = useOutletContext() || {};
  const setShowLogin = props.setShowLogin || outlet.setShowLogin;

  // Active rentals & payment state
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Payment process state
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [payMonth, setPayMonth] = useState(new Date().getMonth() + 1);
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  // Direct custom payment form
  const [directPropRef, setDirectPropRef] = useState("");
  const [directAmount, setDirectAmount] = useState("");
  const [directLandlordName, setDirectLandlordName] = useState("");
  const [directNote, setDirectNote] = useState("");
  const [activeView, setActiveView] = useState("rentals"); // "rentals" | "direct"

  useEffect(() => {
    if (user) {
      fetchTenantRentals();
    }
  }, [user]);

  const fetchTenantRentals = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await api.get("/property/tenant-requests");
      const list = res.data?.data || [];
      const activeAgreements = list.filter((r) => r.status === "accepted");
      setRentals(activeAgreements);
      if (activeAgreements.length > 0 && !selectedRentalId) {
        setSelectedRentalId(activeAgreements[0]._id);
      }
    } catch (err) {
      console.error("Error fetching rental agreements:", err);
      setErrorMessage(getErrorMessage(err, "Failed to load rental agreements."));
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async (rental) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsProcessing(true);

    try {
      const amountToPay = customAmount
        ? Number(customAmount)
        : (rental?.monthlyRent || 0);

      if (!amountToPay || amountToPay <= 0) {
        setErrorMessage("Please enter a valid payment amount greater than zero.");
        setIsProcessing(false);
        return;
      }

      // 1. Create order on backend
      const orderRes = await api.post("/property/payment/create-order", {
        requestId: rental._id,
        amount: amountToPay,
        month: payMonth,
        year: payYear,
      });

      const orderData = orderRes.data?.data;
      if (!orderData) {
        throw new Error("Could not initialize Razorpay payment order.");
      }

      // 2. Open standard Razorpay Checkout
      await openRazorpayCheckout({
        orderData,
        user,
        onSuccess: async (rzpResponse) => {
          try {
            // 3. Verify payment on backend
            await api.post("/property/payment/verify", {
              requestId: rental._id,
              orderId: rzpResponse.razorpay_order_id,
              paymentId: rzpResponse.razorpay_payment_id,
              amount: amountToPay,
              month: payMonth,
              year: payYear,
              method: "online",
            });

            setSuccessMessage(
              `Payment of ₹${amountToPay.toLocaleString("en-IN")} for ${MONTH_NAMES[payMonth - 1]} ${payYear} completed successfully.`
            );
            setLastReceipt({
              paymentId: rzpResponse.razorpay_payment_id,
              orderId: rzpResponse.razorpay_order_id,
              amount: amountToPay,
              month: MONTH_NAMES[payMonth - 1],
              year: payYear,
              date: new Date().toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              propertyTitle: rental.property?.title || "Rental Property",
            });

            // Refresh rental data
            fetchTenantRentals();
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setErrorMessage(
              getErrorMessage(
                verifyErr,
                "Payment was received but verification failed. Please contact support."
              )
            );
          } finally {
            setIsProcessing(false);
          }
        },
        onFailure: (failedError) => {
          setIsProcessing(false);
          const msg =
            typeof failedError === "string"
              ? failedError
              : failedError?.description || "Payment was cancelled or failed.";
          setErrorMessage(msg);
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error("Pay rent error:", err);
      setIsProcessing(false);
      setErrorMessage(getErrorMessage(err, "Failed to initiate payment."));
    }
  };

  const handleDirectPayment = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const amount = Number(directAmount);
    if (!amount || amount <= 0) {
      setErrorMessage("Please enter a valid rent amount.");
      return;
    }

    setIsProcessing(true);

    try {
      const dummyOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const orderData = {
        id: dummyOrderId,
        amount: amount * 100, // paise
        currency: "INR",
        description: `Direct Rent for ${MONTH_NAMES[payMonth - 1]} ${payYear}`,
        notes: {
          propertyRef: directPropRef || "Direct",
          landlordName: directLandlordName || "Landlord",
          month: String(payMonth),
          year: String(payYear),
        },
      };

      await openRazorpayCheckout({
        orderData,
        user: user || {
          fullName: "Tenant",
          email: "",
          mobileNumber: "",
        },
        onSuccess: (rzpResponse) => {
          setIsProcessing(false);
          setSuccessMessage(
            `Rent payment of ₹${amount.toLocaleString("en-IN")} submitted successfully.`
          );
          setLastReceipt({
            paymentId: rzpResponse.razorpay_payment_id,
            orderId: rzpResponse.razorpay_order_id,
            amount: amount,
            month: MONTH_NAMES[payMonth - 1],
            year: payYear,
            date: new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            propertyTitle: directPropRef ? `Ref: ${directPropRef}` : "Direct Payment",
          });
        },
        onFailure: (err) => {
          setIsProcessing(false);
          setErrorMessage(typeof err === "string" ? err : "Payment failed.");
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(getErrorMessage(err, "Direct payment failed."));
    }
  };

  const selectedRental = rentals.find((r) => r._id === selectedRentalId) || rentals[0];

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-gray-300 bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold uppercase tracking-wide text-gray-800 sm:text-2xl">
                Pay Rent & Fees
              </h1>
              <span className="border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                Razorpay Secured
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Pay monthly rent online via UPI, Credit/Debit Cards, NetBanking, or Wallets.
            </p>
          </div>

          <div>
            <button
              onClick={() => navigate("/profile?tab=payments")}
              className="border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              <span className="flex items-center gap-1.5">
                <FaReceipt /> Payment History
              </span>
            </button>
          </div>
        </div>

        {/* ── Value Props & Reassurance Bar ─────────────────────────────── */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border border-gray-300 bg-white p-4">
          <div className="flex items-start gap-3">
            <FaReceipt className="text-[#009587] text-base mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">HRA Rent Receipts</h4>
              <p className="text-xs text-gray-500 mt-0.5">Instant tax-compliant digital receipts with landlord PAN & rental details.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-3">
            <FaShieldHalved className="text-[#009587] text-base mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">100% Secure Checkout</h4>
              <p className="text-xs text-gray-500 mt-0.5">256-bit encrypted transactions directly routed through Razorpay.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-3">
            <FaCreditCard className="text-[#009587] text-base mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">UPI, Cards & NetBanking</h4>
              <p className="text-xs text-gray-500 mt-0.5">Pay conveniently via GPay, PhonePe, Paytm, RuPay, Visa, Mastercard or NetBanking.</p>
            </div>
          </div>
        </div>

        {/* ── Error Banner (Sharp rectangular, flat) ────────────────────── */}
        {errorMessage && (
          <div className="mb-6 border border-red-300 bg-red-50 p-4 text-xs text-red-700">
            <div className="flex items-start gap-3">
              <FaCircleExclamation className="mt-0.5 text-base text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-red-800 uppercase tracking-wide">Error</h4>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="text-xs text-red-500 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── Success Banner (Sharp rectangular, flat) ──────────────────── */}
        {successMessage && (
          <div className="mb-6 border border-green-300 bg-green-50 p-4 text-xs text-green-800">
            <div className="flex items-start gap-3">
              <FaCircleCheck className="mt-0.5 text-base text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-green-900 uppercase tracking-wide">Payment Recorded</h4>
                <p className="mt-0.5">{successMessage}</p>
                {lastReceipt && (
                  <div className="mt-2 border border-green-200 bg-white p-3 text-xs space-y-0.5 text-gray-700">
                    <p><span className="font-semibold text-gray-900">Transaction ID:</span> {lastReceipt.paymentId}</p>
                    <p><span className="font-semibold text-gray-900">Property:</span> {lastReceipt.propertyTitle}</p>
                    <p><span className="font-semibold text-gray-900">Period:</span> {lastReceipt.month} {lastReceipt.year}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-xs text-green-600 hover:text-green-800 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── Guest View / Login Prompt ─────────────────────────────────── */}
        {!user && (
          <div className="mb-6 border border-gray-300 bg-white p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center bg-[#009587] text-white flex-shrink-0">
                  <FaHouseUser className="text-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Sign in to view your active rental agreements
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Log in with your tenant account to load your properties, rent dues, and receipts.
                  </p>
                </div>
              </div>
              <button
                onClick={() => (setShowLogin ? setShowLogin(true) : navigate("/login"))}
                className="whitespace-nowrap bg-[#009587] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#007d70] transition"
              >
                Log In / Register
              </button>
            </div>
          </div>
        )}

        {/* ── Mode Switch Tabs ─────────────────────────────────────────── */}
        <div className="mb-6 flex border-b border-gray-300 bg-white px-4">
          <button
            onClick={() => setActiveView("rentals")}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition ${
              activeView === "rentals"
                ? "border-[#009587] text-[#009587]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <FaHouseUser />
            <span>My Active Rentals {rentals.length > 0 && `(${rentals.length})`}</span>
          </button>
          <button
            onClick={() => setActiveView("direct")}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition ${
              activeView === "direct"
                ? "border-[#009587] text-[#009587]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <FaCreditCard />
            <span>Direct Rent Payment</span>
          </button>
        </div>

        {/* ── View 1: Active Rentals ───────────────────────────────────── */}
        {activeView === "rentals" && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-300">
                <FaSpinner className="animate-spin text-2xl text-[#009587]" />
                <p className="mt-3 text-xs text-gray-500">Loading your rental details...</p>
              </div>
            ) : rentals.length === 0 ? (
              <div className="border border-gray-300 bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-gray-100 text-gray-500">
                  <FaHouseUser className="text-xl" />
                </div>
                <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-800">
                  No Active Rental Agreements Found
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs text-gray-500">
                  You do not have any active rental agreements on this account yet. Search properties or use the direct rent payment option below.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => navigate("/search")}
                    className="bg-[#009587] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#007d70] transition"
                  >
                    Search Properties
                  </button>
                  <button
                    onClick={() => setActiveView("direct")}
                    className="border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    Direct Rent Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Property Selector if multiple */}
                {rentals.length > 1 && (
                  <div className="space-y-3 lg:col-span-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Select Rental Property
                    </h3>
                    {rentals.map((r) => {
                      const isSelected = r._id === selectedRental?._id;
                      return (
                        <div
                          key={r._id}
                          onClick={() => setSelectedRentalId(r._id)}
                          className={`cursor-pointer border p-4 transition ${
                            isSelected
                              ? "border-[#009587] bg-gray-50"
                              : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        >
                          <h4 className="font-bold text-gray-900 text-xs line-clamp-1">
                            {r.property?.title || "Property"}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getLocalityDisplay(r.property)}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="font-bold text-[#009587]">
                              ₹{r.monthlyRent?.toLocaleString("en-IN")}/mo
                            </span>
                            <span className="text-gray-500 text-xs">
                              {r.payments?.length || 0} paid
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Right: Payment Details & Form */}
                <div
                  className={`border border-gray-300 bg-white p-6 ${
                    rentals.length > 1 ? "lg:col-span-2" : "lg:col-span-3"
                  }`}
                >
                  {selectedRental && (
                    <div>
                      {/* Property Header */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-gray-200 pb-5">
                        <div>
                          <span className="inline-block border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-gray-700 mb-2">
                            Active Agreement
                          </span>
                          <h2 className="text-base font-bold text-gray-900">
                            {selectedRental.property?.title || "Rental Property"}
                          </h2>
                          <p className="text-xs text-gray-500 mt-1">
                            {getLocalityDisplay(selectedRental.property)}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Monthly Rent</p>
                          <p className="text-xl font-bold text-[#009587]">
                            ₹{selectedRental.monthlyRent?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Landlord Contact */}
                      {selectedRental.owner && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50 border border-gray-200 p-3">
                          <span className="flex items-center gap-1 font-semibold text-gray-800">
                            <FaUser className="text-[#009587]" /> Landlord: {selectedRental.owner?.fullName || "Owner"}
                          </span>
                          {selectedRental.owner?.mobileNumber && (
                            <span className="flex items-center gap-1">
                              <FaPhone className="text-gray-400" /> {selectedRental.owner.mobileNumber}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Month & Year Selection */}
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Select Month
                          </label>
                          <select
                            value={payMonth}
                            onChange={(e) => setPayMonth(Number(e.target.value))}
                            className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                          >
                            {MONTH_NAMES.map((name, idx) => (
                              <option key={idx + 1} value={idx + 1}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Select Year
                          </label>
                          <select
                            value={payYear}
                            onChange={(e) => setPayYear(Number(e.target.value))}
                            className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                          >
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                          </select>
                        </div>
                      </div>

                      {/* Existing Payment Notice */}
                      {(() => {
                        const existingPayment = selectedRental.payments?.find(
                          (p) => p.month === payMonth && p.year === payYear
                        );
                        if (existingPayment) {
                          return (
                            <div className="mt-4 border border-gray-300 bg-gray-50 p-3 flex items-center gap-3 text-xs text-gray-700">
                              <FaCircleCheck className="text-[#009587] text-sm flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-gray-900">Payment already recorded: </span>
                                Paid ₹{existingPayment.amount?.toLocaleString("en-IN")} via {existingPayment.method || "online"} on{" "}
                                {new Date(existingPayment.paidAt).toLocaleDateString("en-IN")}.
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Custom Amount */}
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Amount to Pay (₹)
                        </label>
                        <input
                          type="number"
                          value={customAmount !== "" ? customAmount : selectedRental.monthlyRent}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                        />
                      </div>

                      {/* Action Button */}
                      <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                          <FaShieldHalved className="text-[#009587]" />
                          <span>Standard Razorpay 256-bit SSL Checkout</span>
                        </div>

                        <button
                          onClick={() => handlePayRent(selectedRental)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto bg-[#009587] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#007d70] disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <FaSpinner className="animate-spin text-xs" />
                              <span>Opening Razorpay...</span>
                            </>
                          ) : (
                            <>
                              <FaCreditCard />
                              <span>
                                Pay ₹
                                {(
                                  Number(customAmount) || selectedRental.monthlyRent
                                )?.toLocaleString("en-IN")}{" "}
                                with Razorpay
                              </span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Payment History */}
                      {selectedRental.payments && selectedRental.payments.length > 0 && (
                        <div className="mt-8 border-t border-gray-200 pt-6">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                            Payment History for this Property
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-gray-200">
                              <thead className="bg-gray-100 text-gray-700 uppercase font-semibold border-b border-gray-200">
                                <tr>
                                  <th className="p-2.5">Period</th>
                                  <th className="p-2.5">Amount</th>
                                  <th className="p-2.5">Method</th>
                                  <th className="p-2.5">Txn ID</th>
                                  <th className="p-2.5">Date</th>
                                  <th className="p-2.5">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {selectedRental.payments.map((p, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-2.5 font-medium text-gray-900">
                                      {MONTH_NAMES[p.month - 1]} {p.year}
                                    </td>
                                    <td className="p-2.5 font-bold text-[#009587]">
                                      ₹{p.amount?.toLocaleString("en-IN")}
                                    </td>
                                    <td className="p-2.5 capitalize">{p.method || "online"}</td>
                                    <td className="p-2.5 font-mono text-xs text-gray-500">
                                      {p.transactionId || "—"}
                                    </td>
                                    <td className="p-2.5 text-gray-500">
                                      {p.paidAt
                                        ? new Date(p.paidAt).toLocaleDateString("en-IN")
                                        : "—"}
                                    </td>
                                    <td className="p-2.5">
                                      <span className="border border-green-300 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-800">
                                        Paid
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── View 2: Direct Payment Form ──────────────────────────────── */}
        {activeView === "direct" && (
          <div className="border border-gray-300 bg-white p-6 sm:p-8">
            <div className="max-w-xl">
              <h2 className="text-base font-bold uppercase tracking-wide text-gray-800">
                Direct Rent / Fee Payment
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Pay rent directly to your landlord or property management using Razorpay.
              </p>

              <form onSubmit={handleDirectPayment} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Property Reference / Apartment No. / Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 304, Green Heights, Bengaluru"
                    value={directPropRef}
                    onChange={(e) => setDirectPropRef(e.target.value)}
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Landlord Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={directLandlordName}
                      onChange={(e) => setDirectLandlordName(e.target.value)}
                      className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Rent Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 15000"
                      value={directAmount}
                      onChange={(e) => setDirectAmount(e.target.value)}
                      className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Rent Month
                    </label>
                    <select
                      value={payMonth}
                      onChange={(e) => setPayMonth(Number(e.target.value))}
                      className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Rent Year
                    </label>
                    <select
                      value={payYear}
                      onChange={(e) => setPayYear(Number(e.target.value))}
                      className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                    >
                      <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                      <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                      <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Remarks / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly rent"
                    value={directNote}
                    onChange={(e) => setDirectNote(e.target.value)}
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#009587] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-[#009587] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#007d70] disabled:bg-gray-400 transition flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <FaCreditCard />
                        <span>Pay via Razorpay Checkout</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
