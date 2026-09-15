import { FaRegMoneyBillAlt, FaUserCheck, FaMapMarkedAlt, FaBolt } from "react-icons/fa";

const PERKS = [
  {
    icon: <FaRegMoneyBillAlt className="text-2xl text-teal-600" />,
    title: "Zero Brokerage Forever",
    description:
      "Keep 100% of your hard-earned money. Rent directly from owners without paying exorbitant 15-30 day broker commission fees.",
  },
  {
    icon: <FaUserCheck className="text-2xl text-teal-600" />,
    title: "Verified Owner Contacts",
    description:
      "Say goodbye to fake ads. All listings come with verified phone numbers, direct WhatsApp connect, and accurate property details.",
  },
  {
    icon: <FaMapMarkedAlt className="text-2xl text-teal-600" />,
    title: "Interactive Map Discovery",
    description:
      "Explore homes visually on an interactive map. Pinpoint distance to your office tech parks, schools, and metro stations easily.",
  },
  {
    icon: <FaBolt className="text-2xl text-teal-600" />,
    title: "Instant Free Listing",
    description:
      "Are you a landlord? List your flat or house in under 2 minutes with photos and start receiving inquiries immediately.",
  },
];

export default function WhyRentosphere() {
  return (
    <section className="bg-white py-14 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#009587]">
            Why Choose Us
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            A Better Way to Rent Your Next Home
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Rentosphere is engineered to remove the friction, hidden fees, and hassle from traditional house hunting in India.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk, index) => (
            <div
              key={index}
              className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all duration-300 hover:border-teal-200 hover:bg-white hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 shadow-2xs">
                {perk.icon}
              </div>
              <h3 className="mt-5 text-base font-bold text-gray-900">
                {perk.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {perk.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
