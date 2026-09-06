import { useState } from "react";
import { FaEnvelope, FaPhone, FaLocationDot, FaCircleCheck } from "react-icons/fa6";
import api from "../../services/api";

function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/contact-us", form);
      if (response.status === 200) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 px-4 py-16 text-center">
        <h1 className="text-4xl font-light text-gray-700 sm:text-5xl">
          Contact <span className="font-semibold text-[#009587]">Us</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 leading-7">
          Have a question, suggestion, or issue? We'd love to hear from you.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 grid gap-10 md:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Get in Touch</h2>
          <p className="text-sm text-gray-500 leading-7">
            Reach out to us via the form or use the contact details below. We typically respond
            within 24 hours on business days.
          </p>

          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4 border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#009587]/10">
                <FaEnvelope className="text-[#009587]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Email</p>
                <p className="text-sm text-gray-700 font-medium">aryanpatel80822@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#009587]/10">
                <FaPhone className="text-[#009587]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Phone</p>
                <p className="text-sm text-gray-700 font-medium">+91 8982489909</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#009587]/10">
                <FaLocationDot className="text-[#009587]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Location</p>
                <p className="text-sm text-gray-700 font-medium">Chennai, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="border border-gray-200 bg-white p-6 shadow-sm">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-10">
              <FaCircleCheck className="text-5xl text-[#009587]" />
              <h3 className="text-lg font-semibold text-gray-800">Message Sent!</h3>
              <p className="text-sm text-gray-500 leading-6">
                Thank you for reaching out. We'll get back to you within 24 business hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="mt-2 border border-[#009587] px-4 py-2 text-sm text-[#009587] hover:bg-[#009587] hover:text-white transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Send a Message</h2>

              {[
                { name: "name", label: "Your Name", type: "text", placeholder: "Aryan Patel" },
                { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
                { name: "subject", label: "Subject", type: "text", placeholder: "e.g. Issue with listing" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                  <input
                    required
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#009587] focus:ring-1 focus:ring-[#009587] transition"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                <textarea
                  required
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#009587] focus:ring-1 focus:ring-[#009587] transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#009587] py-3 text-sm font-semibold text-white hover:bg-[#007a6e] transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default ContactUs;
