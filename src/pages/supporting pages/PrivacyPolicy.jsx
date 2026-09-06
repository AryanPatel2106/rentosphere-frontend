const sections = [
  {
    title: "Information We Collect",
    body: `We collect information you voluntarily provide when you register an account, post a property listing, or contact us. This includes your name, email address, phone number, and property details. We may also automatically collect certain technical information such as your IP address, browser type, and usage data to improve our services.`,
  },
  {
    title: "How We Use Your Information",
    body: `Your information is used solely to provide and improve the Rentosphere platform. Specifically, we use it to: create and manage your account, display your property listings to prospective tenants, send service-related communications, and respond to support inquiries. We do not use your data for unsolicited marketing.`,
  },
  {
    title: "Sharing of Information",
    body: `We do not sell, trade, or rent your personal information to third parties. Your contact details on property listings are visible only to registered users of Rentosphere. We may share information with trusted service providers who assist us in operating the platform, subject to strict confidentiality obligations.`,
  },
  {
    title: "Data Security",
    body: `We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All data is transmitted over encrypted HTTPS connections. However, no internet transmission is 100% secure, and we encourage you to use a strong, unique password for your account.`,
  },
  {
    title: "Cookies",
    body: `Rentosphere uses essential cookies to maintain your session and preferences. We do not use third-party advertising cookies. You can manage or disable cookies in your browser settings, though some features may not function correctly without them.`,
  },
  {
    title: "Your Rights",
    body: `You have the right to access, correct, or delete your personal information at any time. You can update your profile information from your account settings page. To request deletion of your account and associated data, please contact us at support@rentosphere.com.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a revised effective date. Continued use of Rentosphere after changes constitutes your acceptance of the updated policy.`,
  },
];

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 px-4 py-16 text-center">
        <h1 className="text-4xl font-light text-gray-700 sm:text-5xl">
          Privacy <span className="font-semibold text-[#009587]">Policy</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 leading-7">
          Last updated: July 2026
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500 leading-7">
          Your privacy matters to us. This policy explains how Rentosphere collects, uses, and
          protects your personal information.
        </p>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-6 py-14 space-y-8">
        {sections.map((s) => (
          <div key={s.title} className="border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-3">{s.title}</h2>
            <p className="text-sm text-gray-600 leading-7">{s.body}</p>
          </div>
        ))}

        <p className="text-center text-sm text-gray-500">
          Questions about this policy?{" "}
          <a href="/contact" className="text-[#009587] hover:underline font-medium">
            Contact us
          </a>
        </p>
      </section>
    </div>
  );
}

export default PrivacyPolicy;
