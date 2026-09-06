import { Link } from "react-router-dom";
import {
  FaHouse,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  Fa0,
  FaPerson,
  FaPersonArrowDownToLine,
  FaPersonBiking,
  FaUser,
} from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";

function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-300 bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#009587]">
                <FaHouse className="text-xl text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">Rentosphere</h2>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-gray-600">
              Discover verified rental properties, connect directly with
              property owners and enjoy a completely brokerage-free renting
              experience.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="https://github.com/AryanPatel2106"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-[#009587] hover:text-white"
              >
                <FaGithub />
              </a>

              <a
                href="https://www.linkedin.com/in/aryan-patel-9b24a0331/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-[#009587] hover:text-white"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="https://x.com/Aryanpatel0621"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-[#009587] hover:text-white"
              >
                <FaXTwitter />
              </a>
              
              <a
                href="https://dl220ysk3c4k.cloudfront.net"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-[#009587] hover:text-white"
              >
                <FaUser />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-800">Quick Links</h3>

            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-[#009587]">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/properties" className="hover:text-[#009587]">
                  Browse Properties
                </Link>
              </li>

              <li>
                <Link to="/post-property" className="hover:text-[#009587]">
                  Post Property
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-[#009587]">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-800">Support</h3>

            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/faq" className="hover:text-[#009587]">
                  FAQs
                </Link>
              </li>

              <li>
                <Link to="/privacy-policy" className="hover:text-[#009587]">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/terms" className="hover:text-[#009587]">
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-[#009587]">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-800">Contact</h3>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-3">
                <FaEnvelope className="mt-1 text-[#009587]" />
                <span>aryanpatel80822@gmail.com</span>
              </div>

              <div className="flex gap-3">
                <FaPhone className="mt-1 text-[#009587]" />
                <span>+91 8982489909</span>
              </div>

              <div className="flex gap-3">
                <FaLocationDot className="mt-1 text-[#009587]" />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}

        <div className="mt-10 flex flex-col items-center justify-between border-t border-gray-300 pt-6 md:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Rentosphere. All rights reserved.
          </p>

          <div className="mt-4 flex gap-6 text-sm text-gray-500 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-[#009587]">
              Privacy
            </Link>

            <Link to="/terms" className="hover:text-[#009587]">
              Terms
            </Link>

            <Link to="/contact" className="hover:text-[#009587]">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
