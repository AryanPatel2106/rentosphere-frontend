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
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 sm:flex-row sm:items-center shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                Pay Rent & Fees
              </h1>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                Razorpay Secured
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Pay monthly rent online via UPI, Credit/Debit Cards, NetBanking, or Wallets.
            </p>
          </div>

          <div>
            <button
              onClick={() => navigate("/profile?tab=payments")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <span className="flex items-center gap-1.5">
                <FaReceipt className="text-teal-600" /> Payment History
              </span>
            </button>
          </div>
        </div>

        {/* ── Value Props & Reassurance Bar ─────────────────────────────── */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <FaReceipt className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">HRA Rent Receipts</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Instant tax-compliant digital receipts with landlord PAN & rental details.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <FaShieldHalved className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">100% Secure Checkout</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">256-bit encrypted transactions directly routed through Razorpay.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <FaCreditCard className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">UPI, Cards & NetBanking</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Pay conveniently via GPay, PhonePe, Paytm, RuPay, Visa, Mastercard or NetBanking.</p>
            </div>
          </div>
        </div>

        {/* ── Error Banner ──────────────────────────────────────────────── */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 shadow-xs">
            <div className="flex items-start gap-3">
              <FaCircleExclamation className="mt-0.5 text-base text-rose-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-rose-800 uppercase tracking-wide">Error</h4>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── Success Banner ────────────────────────────────────────────── */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 shadow-xs">
            <div className="flex items-start gap-3">
              <FaCircleCheck className="mt-0.5 text-base text-emerald-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-emerald-900 uppercase tracking-wide">Payment Recorded</h4>
                <p className="mt-0.5">{successMessage}</p>
                {lastReceipt && (
                  <div className="mt-3 rounded-xl border border-emerald-200/80 bg-white p-3.5 text-xs space-y-1 text-slate-700 shadow-xs">
                    <p><span className="font-semibold text-slate-900">Transaction ID:</span> {lastReceipt.paymentId}</p>
                    <p><span className="font-semibold text-slate-900">Property:</span> {lastReceipt.propertyTitle}</p>
                    <p><span className="font-semibold text-slate-900">Period:</span> {lastReceipt.month} {lastReceipt.year}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── Guest View / Login Prompt ─────────────────────────────────── */}
        {!user && (
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-xs shrink-0">
                  <FaHouseUser className="text-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Sign in to view your active rental agreements
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Log in with your tenant account to load your properties, rent dues, and receipts.
                  </p>
                </div>
              </div>
              <button
                onClick={() => (setShowLogin ? setShowLogin(true) : navigate("/login"))}
                className="whitespace-nowrap rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition shadow-xs"
              >
                Log In / Register
              </button>
            </div>
          </div>
        )}

        {/* ── Mode Switch Tabs ─────────────────────────────────────────── */}
        <div className="mb-6 flex rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/80 overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveView("rentals")}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold transition whitespace-nowrap rounded-xl ${
              activeView === "rentals"
                ? "bg-white text-teal-700 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <FaHouseUser />
            <span>My Active Rentals {rentals.length > 0 && `(${rentals.length})`}</span>
          </button>
          <button
            onClick={() => setActiveView("direct")}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold transition whitespace-nowrap rounded-xl ${
              activeView === "direct"
                ? "bg-white text-teal-700 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-800"
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
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <FaSpinner className="animate-spin text-2xl text-teal-600" />
                <p className="mt-3 text-xs text-slate-500">Loading your rental details...</p>
              </div>
            ) : rentals.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <FaHouseUser className="text-xl" />
                </div>
                <h3 className="mt-4 text-sm font-bold tracking-wide text-slate-800">
                  No Active Rental Agreements Found
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
                  You do not have any active rental agreements on this account yet. Search properties or use the direct rent payment option below.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => navigate("/search")}
                    className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition shadow-xs"
                  >
                    Search Properties
                  </button>
                  <button
                    onClick={() => setActiveView("direct")}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
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
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Select Rental Property
                    </h3>
                    {rentals.map((r) => {
                      const isSelected = r._id === selectedRental?._id;
                      return (
                        <div
                          key={r._id}
                          onClick={() => setSelectedRentalId(r._id)}
                          className={`cursor-pointer rounded-xl border p-4 transition ${
                            isSelected
                              ? "border-teal-500 bg-teal-50/40 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                            {r.property?.title || "Property"}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {getLocalityDisplay(r.property)}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="font-bold text-teal-600">
                              ₹{r.monthlyRent?.toLocaleString("en-IN")}/mo
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 text-[10px] font-medium">
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
                  className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs ${
                    rentals.length > 1 ? "lg:col-span-2" : "lg:col-span-3"
                  }`}
                >
                  {selectedRental && (
                    <div>
                      {/* Property Header */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
                        <div>
                          <span className="inline-block rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 mb-2">
                            Active Agreement
                          </span>
                          <h2 className="text-base font-bold text-slate-900">
                            {selectedRental.property?.title || "Rental Property"}
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            {getLocalityDisplay(selectedRental.property)}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Monthly Rent</p>
                          <p className="text-xl font-bold text-teal-600">
                            ₹{selectedRental.monthlyRent?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Landlord Contact */}
                      {selectedRental.owner && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 rounded-xl bg-slate-50/70 border border-slate-200/80 p-3.5">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <FaUser className="text-teal-600" /> Landlord: {selectedRental.owner?.fullName || "Owner"}
                          </span>
                          {selectedRental.owner?.mobileNumber && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <FaPhone className="text-slate-400 text-[10px]" /> {selectedRental.owner.mobileNumber}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Month & Year Selection */}
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Select Month
                          </label>
                          <select
                            value={payMonth}
                            onChange={(e) => setPayMonth(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                          >
                            {MONTH_NAMES.map((name, idx) => (
                              <option key={idx + 1} value={idx + 1}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Select Year
                          </label>
                          <select
                            value={payYear}
                            onChange={(e) => setPayYear(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
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
                            <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/80 p-3.5 flex items-center gap-3 text-xs text-slate-700">
                              <FaCircleCheck className="text-teal-600 text-sm flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-900">Payment already recorded: </span>
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
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Amount to Pay (₹)
                        </label>
                        <input
                          type="number"
                          value={customAmount !== "" ? customAmount : selectedRental.monthlyRent}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                        />
                      </div>

                      {/* Action Button */}
                      <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <FaShieldHalved className="text-teal-600" />
                          <span>Standard Razorpay 256-bit SSL Checkout</span>
                        </div>

                        <button
                          onClick={() => handlePayRent(selectedRental)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto rounded-xl bg-teal-600 px-8 py-3 text-xs font-bold tracking-wide text-white hover:bg-teal-700 disabled:bg-slate-300 transition flex items-center justify-center gap-2 shadow-xs"
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
                        <div className="mt-8 border-t border-slate-200/80 pt-6">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                            Payment History for this Property
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="p-3">Period</th>
                                  <th className="p-3">Amount</th>
                                  <th className="p-3">Method</th>
                                  <th className="p-3">Txn ID</th>
                                  <th className="p-3">Date</th>
                                  <th className="p-3">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {selectedRental.payments.map((p, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/60">
                                    <td className="p-3 font-semibold text-slate-800">
                                      {MONTH_NAMES[p.month - 1]} {p.year}
                                    </td>
                                    <td className="p-3 font-bold text-teal-600">
                                      ₹{p.amount?.toLocaleString("en-IN")}
                                    </td>
                                    <td className="p-3 uppercase font-medium text-slate-600">{p.method || "online"}</td>
                                    <td className="p-3 font-mono text-slate-500 text-xs">
                                      {p.transactionId || "—"}
                                    </td>
                                    <td className="p-3 text-slate-500">
                                      {p.paidAt
                                        ? new Date(p.paidAt).toLocaleDateString("en-IN")
                                        : "—"}
                                    </td>
                                    <td className="p-3">
                                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold">
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
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="max-w-xl">
              <h2 className="text-base font-bold tracking-tight text-slate-800">
                Direct Rent / Fee Payment
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Pay rent directly to your landlord or property management using Razorpay.
              </p>

              <form onSubmit={handleDirectPayment} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Property Reference / Apartment No. / Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 304, Green Heights, Bengaluru"
                    value={directPropRef}
                    onChange={(e) => setDirectPropRef(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Landlord Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={directLandlordName}
                      onChange={(e) => setDirectLandlordName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Rent Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 15000"
                      value={directAmount}
                      onChange={(e) => setDirectAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Rent Month
                    </label>
                    <select
                      value={payMonth}
                      onChange={(e) => setPayMonth(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Rent Year
                    </label>
                    <select
                      value={payYear}
                      onChange={(e) => setPayYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                    >
                      <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                      <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                      <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Payment Remarks / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly rent"
                    value={directNote}
                    onChange={(e) => setDirectNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="rounded-xl bg-teal-600 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 disabled:bg-slate-300 transition flex items-center gap-2 shadow-xs"
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
