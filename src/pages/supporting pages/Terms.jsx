const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using the Rentosphere platform, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use our services. We reserve the right to update these terms at any time, and continued use of Rentosphere constitutes acceptance of the revised terms.`,
  },
  {
    title: "2. User Accounts",
    body: `To post a property or access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during registration and to update it as necessary.`,
  },
  {
    title: "3. Property Listings",
    body: `Property owners ("Landlords") may list properties on Rentosphere subject to our listing guidelines. You represent that you have the legal right to list the property. Listings must be accurate, non-deceptive, and comply with all applicable laws. Rentosphere reserves the right to remove any listing that violates these terms.`,
  },
  {
    title: "4. No Brokerage Guarantee",
    body: `Rentosphere operates as a direct-connect platform between landlords and tenants. We do not charge brokerage fees. However, Rentosphere is not a party to any rental agreement between landlord and tenant, and is not responsible for the terms, conditions, or execution of such agreements.`,
  },
  {
    title: "5. Prohibited Conduct",
    body: `You may not use Rentosphere to post fraudulent, misleading, or illegal listings; harass, abuse, or harm other users; scrape, copy, or distribute platform content without permission; attempt to gain unauthorized access to our systems; or engage in any activity that disrupts the normal functioning of the platform.`,
  },
  {
    title: "6. Intellectual Property",
    body: `All content, trademarks, logos, and materials on Rentosphere are owned by or licensed to us and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without explicit written permission.`,
  },
  {
    title: "7. Limitation of Liability",
    body: `Rentosphere provides its services "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to losses resulting from rental agreements, disputes between landlords and tenants, or inaccuracies in listings.`,
  },
  {
    title: "8. Governing Law",
    body: `These Terms & Conditions are governed by the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.`,
  },
];

function Terms() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 px-4 py-16 text-center">
        <h1 className="text-4xl font-light text-gray-700 sm:text-5xl">
          Terms &amp; <span className="font-semibold text-[#009587]">Conditions</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 leading-7">
          Last updated: July 2026
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500 leading-7">
          Please read these terms carefully before using Rentosphere.
        </p>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-6 py-14 space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-3">{s.title}</h2>
            <p className="text-sm text-gray-600 leading-7">{s.body}</p>
          </div>
        ))}

        <p className="text-center text-sm text-gray-500">
          Questions about these terms?{" "}
          <a href="/contact" className="text-[#009587] hover:underline font-medium">
            Contact us
          </a>
        </p>
      </section>
    </div>
  );
}

export default Terms;
