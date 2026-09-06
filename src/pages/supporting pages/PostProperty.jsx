import { FaPenToSquare, FaCamera, FaCircleCheck, FaCircleInfo } from "react-icons/fa6";

const steps = [
  {
    icon: <FaPenToSquare className="text-2xl text-white" />,
    title: "Fill in Property Details",
    desc: "Enter the property type, location, rent, furnishing status, and other key details.",
  },
  {
    icon: <FaCamera className="text-2xl text-white" />,
    title: "Upload Photos",
    desc: "Add clear photos of your property to attract quality tenants quickly.",
  },
  {
    icon: <FaCircleCheck className="text-2xl text-white" />,
    title: "Go Live",
    desc: "Submit your listing. After a quick review, your property will be visible to thousands of renters.",
  },
];

function PostProperty() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 px-4 py-16 text-center">
        <h1 className="text-4xl font-light text-gray-700 sm:text-5xl">
          Post Your <span className="font-semibold text-[#009587]">Property</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 leading-7">
          List your property on Rentosphere for free and connect directly with verified tenants —
          no brokerage, no hassle.
        </p>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="text-2xl font-semibold text-gray-800 mb-10 text-center">How It Works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#009587]">
                {s.icon}
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-6">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon Form */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FaCircleInfo className="text-[#009587]" />
            <p className="text-sm text-gray-500">
              Property listing is currently under development. Check back soon!
            </p>
          </div>

          <div className="space-y-4">
            {["Property Title", "City", "Monthly Rent (₹)", "BHK Type"].map((label) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  disabled
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed outline-none"
                />
              </div>
            ))}

            <button
              disabled
              className="mt-2 w-full rounded-lg bg-[#009587] px-4 py-3 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
            >
              Submit Listing (Coming Soon)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PostProperty;
