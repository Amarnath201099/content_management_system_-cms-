import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchNavigation } from "../../store/slices/contentSlice";
import NavLinks from "./NavLinks";
import NavOverflow from "./NavOverflow";
import {
  FiLayers,
  FiMenu,
  FiX,
  FiFolder,
  FiFileText,
  FiChevronDown,
} from "react-icons/fi";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { navigationTree } = useSelector((state) => state.content);

  // Responsive mobile drawer states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileAccordionId, setOpenMobileAccordionId] = useState(null);
  const headerRef = useRef(null);

  // Hydrate navigation tree from MongoDB on initial mount
  useEffect(() => {
    dispatch(fetchNavigation());
  }, [dispatch]);

  // Automatically close mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMobileAccordionId(null);
  }, [router.asPath]);

  // Enforce strict 5-item top-level cap; route overflow nodes into the Others dropdown for Desktop
  const { mainNav, overflowNav } = useMemo(() => {
    if (!navigationTree || !Array.isArray(navigationTree)) {
      return { mainNav: [], overflowNav: [] };
    }
    return {
      mainNav: navigationTree.slice(0, 5),
      overflowNav: navigationTree.slice(5),
    };
  }, [navigationTree]);

  // Helper to format clean corporate URLs
  const getPageHref = (slug) => {
    if (!slug || slug === "home") return "/";
    return `/${slug}`;
  };

  // Helper to check active state for mobile styling
  const checkIsActive = (slug, isFirstItem = false) => {
    const currentPath = router.asPath.split("?")[0];
    const itemHref = getPageHref(slug);
    if (currentPath === itemHref) return true;
    if (currentPath === "/" && isFirstItem) return true;
    return false;
  };

  return (
    <header
      ref={headerRef}
      className="bg-[#383939] text-[#ffffff] shadow-lg sticky top-0 z-50 border-b border-white/10 select-none font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 group shrink-0 mr-6"
        >
          <div className="w-9 h-9 rounded-lg bg-[#bf2131] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <FiLayers className="w-5 h-5 text-[#ffffff]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#ffffff]">
            Dev<span className="text-[#bf2131]">Forge</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION (Hidden on Mobile & Tablet: hidden md:flex) */}
        <nav className="hidden md:flex items-center justify-end space-x-1 sm:space-x-2 ml-auto">
          <NavLinks items={mainNav} />
          {overflowNav.length > 0 && (
            <NavOverflow overflowItems={overflowNav} />
          )}
        </nav>

        {/* MOBILE & TABLET HAMBURGER BUTTON (Visible only below md breakpoint) */}
        <div className="flex md:hidden ml-auto">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile navigation menu"
            className="p-2 rounded-lg bg-[#2b2c2c] text-[#ffffff] hover:text-white hover:bg-[#bf2131] transition-colors focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE & TABLET DROPDOWN DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#2b2c2c] border-t border-white/10 px-4 pt-3 pb-6 space-y-2 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-2 py-1 mb-1">
            Navigation Menu
          </div>

          {/* Render ALL navigation items sequentially for mobile (no 5-item cap needed) */}
          {(navigationTree || []).map((item, index) => {
            const hasChildren =
              item.children &&
              Array.isArray(item.children) &&
              item.children.length > 0;
            const targetHref = getPageHref(item.slug);
            const isFirstItem = index === 0;
            const isActive = checkIsActive(item.slug, isFirstItem);
            const displayLabel = item.navLabel || item.title;
            const isAccordionOpen = openMobileAccordionId === item._id;

            // NODE 1: Standalone Page Link (No Children)
            if (!hasChildren) {
              return (
                <Link
                  key={item._id}
                  href={targetHref}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#bf2131] text-white font-bold shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FiFolder
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#bf2131]"}`}
                  />
                  <span className="truncate">{displayLabel}</span>
                </Link>
              );
            }

            // NODE 2: Parent Page with Collapsible Accordion for Children
            return (
              <div key={item._id} className="space-y-1">
                <div className="flex items-center justify-between rounded-lg bg-[#383939]/80 border border-white/5">
                  {/* Clicking the label navigates directly to the Parent Overview */}
                  <Link
                    href={targetHref}
                    className={`flex-1 flex items-center space-x-2.5 px-3 py-2.5 text-sm font-medium transition-colors truncate ${
                      isActive
                        ? "text-[#bf2131] font-bold"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    <FiFolder className="w-4 h-4 shrink-0 text-[#bf2131]" />
                    <span className="truncate">{displayLabel}</span>
                  </Link>

                  {/* Clicking the arrow toggles the child accordion */}
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMobileAccordionId(
                        isAccordionOpen ? null : item._id,
                      )
                    }
                    className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-r-lg transition-colors focus:outline-none"
                    aria-label="Toggle sub-menu"
                  >
                    <FiChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isAccordionOpen ? "rotate-180 text-[#bf2131]" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Indented Accordion Children */}
                {isAccordionOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[#bf2131] ml-3">
                    {item.children.map((child) => {
                      const childHref = getPageHref(child.slug);
                      const isChildActive = checkIsActive(child.slug);
                      const childLabel = child.navLabel || child.title;

                      return (
                        <Link
                          key={child._id}
                          href={childHref}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                            isChildActive
                              ? "bg-[#bf2131] text-white font-bold shadow-sm"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <FiFileText className="w-3.5 h-3.5 shrink-0 text-[#bf2131]" />
                          <span className="truncate">{childLabel}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
