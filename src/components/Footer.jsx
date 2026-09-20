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
    <footer className="mt-16 border-t border-slate-200/80 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-xs">
                <FaHouse className="text-lg text-white" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Rentosphere</h2>
            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              Discover verified rental properties, connect directly with
              property owners and enjoy a completely brokerage-free renting
              experience.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="https://github.com/AryanPatel2106"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-teal-600 hover:border-teal-600 hover:text-white shadow-2xs"
              >
                <FaGithub />
              </a>

              <a
                href="https://linkendin.com/in/aryan-patel-9b24a0331/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-teal-600 hover:border-teal-600 hover:text-white shadow-2xs"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="https://x.com/Aryanpatel0621"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-teal-600 hover:border-teal-600 hover:text-white shadow-2xs"
              >
                <FaXTwitter />
              </a>
              
              <a
                href="https://dl220ysk3c4k.cloudfront.net"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-teal-600 hover:border-teal-600 hover:text-white shadow-2xs"
              >
                <FaUser />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-bold text-slate-900 text-sm tracking-wide">Quick Links</h3>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li>
                <Link to="/" className="hover:text-teal-700 transition">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/properties" className="hover:text-teal-700 transition">
                  Browse Properties
                </Link>
              </li>

              <li>
                <Link to="/post-property" className="hover:text-teal-700 transition">
                  Post Property
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-teal-700 transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-bold text-slate-900 text-sm tracking-wide">Support</h3>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li>
                <Link to="/faq" className="hover:text-teal-700 transition">
                  FAQs
                </Link>
              </li>

              <li>
                <Link to="/privacy-policy" className="hover:text-teal-700 transition">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/terms" className="hover:text-teal-700 transition">
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-teal-700 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-bold text-slate-900 text-sm tracking-wide">Contact</h3>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <div className="flex gap-3">
                <FaEnvelope className="mt-1 text-teal-600 shrink-0" />
                <span className="break-all">aryanpatel80822@gmail.com</span>
              </div>

              <div className="flex gap-3">
                <FaPhone className="mt-1 text-teal-600 shrink-0" />
                <span>+91 8982489909</span>
              </div>

              <div className="flex gap-3">
                <FaLocationDot className="mt-1 text-teal-600 shrink-0" />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}

        <div className="mt-10 flex flex-col items-center justify-between border-t border-slate-200/80 pt-6 md:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Rentosphere. All rights reserved.
          </p>

          <div className="mt-4 flex gap-6 text-xs text-slate-500 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-teal-700 transition">
              Privacy
            </Link>

            <Link to="/terms" className="hover:text-teal-700 transition">
              Terms
            </Link>

            <Link to="/contact" className="hover:text-teal-700 transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
