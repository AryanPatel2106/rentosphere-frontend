import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

const faqs = [
  {
    q: "Is Rentosphere completely free to use?",
    a: "Yes! Browsing and searching properties on Rentosphere is 100% free for tenants. There are no brokerage fees or hidden charges — you connect directly with the property owner.",
  },
  {
    q: "How do I post my property on Rentosphere?",
    a: "Click on 'Post Property' in the navigation menu, fill in your property details (type, location, rent, furnishing), upload photos, and submit. Your listing will go live after a quick review.",
  },
  {
    q: "Are the listings verified?",
    a: "We manually review each listing before it goes live to ensure accuracy and authenticity. However, we always recommend scheduling an in-person visit before finalizing any rental agreement.",
  },
  {
    q: "How do I contact a property owner?",
    a: "Once you find a property you like, you can view the owner's contact details directly on the listing page. Create a free account to unlock full contact information.",
  },
  {
    q: "Can I filter properties by location or BHK type?",
    a: "Absolutely. Our search feature supports filters by locality, BHK type, furnishing status, tenant preference, parking, and pet-friendliness.",
  },
  {
    q: "What cities is Rentosphere available in?",
    a: "Rentosphere is currently available in major Indian cities including Bengaluru, Mumbai, Hyderabad, Pune, Chennai, Delhi NCR, and more. We are expanding rapidly.",
  },
  {
    q: "How do I reset my password?",
    a: "Go to the login page and click 'Forgot Password'. Enter your registered email and we'll send you a password reset link.",
  },
  {
    q: "Is my data safe on Rentosphere?",
    a: "Yes. We take data privacy seriously. Your personal information is never sold to third parties. Please read our Privacy Policy for complete details.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-gray-700 hover:text-[#009587] transition-colors"
      >
        <span>{q}</span>
        {open ? (
          <FaChevronUp className="shrink-0 text-[#009587]" />
        ) : (
          <FaChevronDown className="shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-500 leading-7">{a}</p>
      )}
    </div>
  );
}

function FAQ() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 px-4 py-16 text-center">
        <h1 className="text-4xl font-light text-gray-700 sm:text-5xl">
          Frequently Asked <span className="font-semibold text-[#009587]">Questions</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 leading-7">
          Have questions? We've got answers. Browse our FAQs below.
        </p>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="border border-gray-200 bg-white shadow-sm px-6">
          {faqs.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Still have questions?{" "}
          <a href="/contact" className="text-[#009587] hover:underline font-medium">
            Contact us
          </a>
        </p>
      </section>
    </div>
  );
}

export default FAQ;
