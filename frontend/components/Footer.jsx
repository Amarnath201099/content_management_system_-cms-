import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiHeart,
  FiLayers,
  FiArrowRight,
  FiMail,
  FiMapPin,
} from "react-icons/fi";

const Footer = () => {
  const { navigationTree } = useSelector((state) => state.content);

  // Extract top 5 navigation nodes to populate Quick Links
  const quickLinks = (navigationTree || []).slice(0, 5);

  // Helper to format clean corporate URLs (without legacy /docs/ prefixes)
  const getPageHref = (slug) => {
    if (!slug || slug === "home" || slug === "overview") return "/";
    return `/${slug}`;
  };

  return (
    <footer className="bg-[#2b2c2c] text-[#5c5c5c] border-t border-white/10 py-12 mt-auto select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Column 1: Corporate Brand & Value Proposition (Spans 5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="flex items-center space-x-3 group inline-block"
            >
              <div className="w-9 h-9 rounded-lg bg-[#bf2131] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <FiLayers className="w-5 h-5 text-[#ffffff]" />
              </div>
              <span className="font-bold text-[#ffffff] text-xl tracking-tight">
                Dev<span className="text-[#bf2131]">Forge</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#5c5c5c] max-w-sm leading-relaxed">
              Empowering enterprise organizations with scalable digital
              architectures, modular web solutions, and high-performance cloud
              infrastructure.
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#5c5c5c]">
              <div className="flex items-center space-x-2.5">
                <FiMapPin className="w-4 h-4 text-[#bf2131] shrink-0" />
                <span>Global Headquarters • Enterprise Solutions</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <FiMail className="w-4 h-4 text-[#bf2131] shrink-0" />
                <span>contact@devforge.enterprise</span>
              </div>
            </div>
          </div>

          {/* Column 2: Dynamic Quick Links (Spans 3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-[#ffffff] font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-[#bf2131] pl-2.5">
              Solutions & Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[#5c5c5c] hover:text-[#ffffff] transition-colors inline-flex items-center space-x-1 group"
                >
                  <FiArrowRight className="w-3 h-3 text-[#bf2131] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Platform Overview</span>
                </Link>
              </li>
              {quickLinks.map((item) => (
                <li key={item._id}>
                  <Link
                    href={getPageHref(item.slug)}
                    className="text-[#5c5c5c] hover:text-[#ffffff] transition-colors truncate inline-flex items-center space-x-1 group max-w-[200px]"
                  >
                    <FiArrowRight className="w-3 h-3 text-[#bf2131] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    <span className="truncate">
                      {item.navLabel || item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Corporate Governance & Legal (Spans 4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-[#ffffff] font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-[#bf2131] pl-2.5">
              Corporate Governance
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="#"
                  className="text-[#5c5c5c] hover:text-[#ffffff] transition-colors"
                >
                  Privacy Policy & GDPR
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#5c5c5c] hover:text-[#ffffff] transition-colors"
                >
                  Terms of Service & SLAs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#5c5c5c] hover:text-[#ffffff] transition-colors"
                >
                  Security & Compliance Audit
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#5c5c5c] hover:text-[#ffffff] transition-colors"
                >
                  Enterprise Support Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Socials & Discreet Admin Link */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5c5c5c] gap-6">
          <p className="flex items-center text-center sm:text-left">
            © {new Date().getFullYear()} DevForge Technologies Inc. All rights
            reserved.
          </p>

          <div className="flex items-center space-x-6">
            <div className="flex space-x-3">
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-[#ffffff] transition-colors p-2 rounded-full bg-[#383939] hover:bg-[#bf2131]"
              >
                <FiLinkedin className="w-3.5 h-3.5 text-[#ffffff]" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-[#ffffff] transition-colors p-2 rounded-full bg-[#383939] hover:bg-[#bf2131]"
              >
                <FiTwitter className="w-3.5 h-3.5 text-[#ffffff]" />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="hover:text-[#ffffff] transition-colors p-2 rounded-full bg-[#383939] hover:bg-[#bf2131]"
              >
                <FiGithub className="w-3.5 h-3.5 text-[#ffffff]" />
              </a>
            </div>

            <div className="h-4 w-[1px] bg-white/10"></div>

            {/* Discreet Admin Portal Entry Point */}
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-[#5c5c5c] hover:text-[#ffffff] transition-colors uppercase tracking-wider"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
