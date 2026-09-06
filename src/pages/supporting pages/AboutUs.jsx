import { FaHouse, FaShieldHalved, FaHandshake, FaStar } from "react-icons/fa6";
import profilePhoto from "../../assets/aryan.png";

const PROFILE_IMAGE = profilePhoto;

const values = [
  {
    icon: <FaHouse className="text-2xl text-white" />,
    title: "Find Your Home",
    desc: "We help thousands of renters discover the perfect place to live — brokerage-free and stress-free.",
  },
  {
    icon: <FaShieldHalved className="text-2xl text-white" />,
    title: "Verified Listings",
    desc: "Every property on Rentosphere is manually reviewed so you only see trustworthy, accurate listings.",
  },
  {
    icon: <FaHandshake className="text-2xl text-white" />,
    title: "Direct Connect",
    desc: "Talk directly with property owners — no middlemen, no hidden fees, no surprises.",
  },
  {
    icon: <FaStar className="text-2xl text-white" />,
    title: "Trusted by Many",
    desc: "Thousands of happy tenants and landlords trust Rentosphere for a seamless renting experience.",
  },
];

function AboutUs() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 px-4 py-16 text-center">
        <h1 className="text-4xl font-light text-gray-700 sm:text-5xl">
          About <span className="font-semibold text-[#009587]">Rentosphere</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500 leading-7">
          Rentosphere is India's brokerage-free rental platform that connects property owners
          directly with tenants — making renting simple, transparent, and affordable.
        </p>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-8 text-sm">
          We believe finding a home should be exciting, not exhausting. Our mission is to eliminate
          the friction from the rental process by providing a transparent, verified, and brokerage-free
          marketplace where tenants and landlords can connect with confidence. We are committed to
          making quality housing accessible to everyone across India.
        </p>
      </section>

      {/* Values */}
      <section className="bg-white border-t border-b border-gray-200 py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-10 text-center">What We Stand For</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="flex flex-col items-center text-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#009587]">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-6">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Meet the Builder</h2>
        <div className="flex items-center gap-5 border border-gray-200 bg-white p-6 shadow-sm">
          {PROFILE_IMAGE ? (
            <img
              src={PROFILE_IMAGE}
              alt="Aryan Patel"
              className="h-20 w-20 shrink-0 rounded-full object-cover object-top border-2 border-[#009587]"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#009587] text-white text-xl font-bold">
              AP
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">Aryan Patel</p>
            <p className="text-sm text-gray-500 mt-1">
              Full-Stack Developer · Rentosphere Creator
            </p>
            <p className="text-sm text-gray-500 leading-6 mt-2">
              Built Rentosphere to solve real problems in the Indian rental market — making it easy
              for landlords to list and tenants to discover quality homes without middlemen.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
