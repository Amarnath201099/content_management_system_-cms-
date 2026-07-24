import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiChevronDown, FiFolder, FiFileText } from "react-icons/fi";

const NavLinks = ({ items = [] }) => {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownAlignment, setDropdownAlignment] = useState("left");
  const navRef = useRef(null);

  // Auto-close dropdown when clicking anywhere outside the navigation container
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Automatically close open dropdowns whenever the route changes
  useEffect(() => {
    setOpenDropdownId(null);
  }, [router.asPath]);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  // Format clean corporate URLs
  const getPageHref = (slug) => {
    if (!slug || slug === "home") return "/";
    return `/${slug}`;
  };

  // Robust Active-State Checker
  const checkIsActive = (item, isFirstItem = false) => {
    const currentPath = router.asPath.split("?")[0];
    const itemHref = getPageHref(item.slug);

    if (currentPath === itemHref) return true;
    if (currentPath === "/" && isFirstItem) return true;

    if (item.children && Array.isArray(item.children)) {
      return item.children.some((child) => {
        const childHref = getPageHref(child.slug);
        return currentPath === childHref;
      });
    }

    return false;
  };

  /**
   * SMART VIEWPORT COLLISION DETECTION
   * Measures available horizontal space before opening. If the dropdown would
   * overflow the right edge of the screen, flip alignment to `right-0`.
   */
  const handleDropdownToggle = (event, itemId, isOpen) => {
    if (isOpen) {
      setOpenDropdownId(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const estimatedDropdownWidth = 240; // Buffer threshold for min-w-[220px]

      if (buttonRect.left + estimatedDropdownWidth > viewportWidth - 20) {
        setDropdownAlignment("right");
      } else {
        setDropdownAlignment("left");
      }
      setOpenDropdownId(itemId);
    }
  };

  return (
    <div
      ref={navRef}
      className="flex items-center space-x-1 sm:space-x-2 font-sans select-none"
    >
      {items.map((item, index) => {
        const hasChildren =
          item.children &&
          Array.isArray(item.children) &&
          item.children.length > 0;
        const targetHref = getPageHref(item.slug);
        const isFirstItem = index === 0;
        const isActive = checkIsActive(item, isFirstItem);
        const displayLabel = item.navLabel || item.title;
        const isOpen = openDropdownId === item._id;

        // NODE 1: Standalone Page Link (No Children)
        if (!hasChildren) {
          return (
            <Link
              key={item._id}
              href={targetHref}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#bf2131] text-[#ffffff] font-bold shadow-sm"
                  : "text-[#ffffff]/80 hover:text-[#ffffff] hover:bg-white/10"
              }`}
            >
              {displayLabel}
            </Link>
          );
        }

        // NODE 2: Parent Page with Smart Collision-Aware Dropdown
        return (
          <div key={item._id} className="relative">
            <button
              type="button"
              onClick={(e) => handleDropdownToggle(e, item._id, isOpen)}
              aria-expanded={isOpen}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isOpen || isActive
                  ? "bg-[#bf2131] text-[#ffffff] font-bold shadow-sm"
                  : "text-[#ffffff]/80 hover:text-[#ffffff] hover:bg-white/10"
              }`}
            >
              <span>{displayLabel}</span>
              <FiChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Smart Collision Dropdown Menu Popover */}
            {isOpen && (
              <div
                className={`absolute ${
                  dropdownAlignment === "right" ? "right-0" : "left-0"
                } mt-1.5 min-w-[220px] max-w-[90vw] bg-[#383939] border border-[#bf2131]/30 shadow-xl rounded-md py-2 z-50 animate-in fade-in zoom-in-95 duration-150`}
              >
                {/* Parent Overview Header Link */}
                <div className="px-3 py-1.5 border-b border-white/10 mb-1 bg-black/20">
                  <Link
                    href={targetHref}
                    onClick={() => setOpenDropdownId(null)}
                    className="text-xs font-bold text-[#bf2131] uppercase tracking-wider hover:underline flex items-center space-x-1.5"
                  >
                    <FiFolder className="w-3.5 h-3.5 inline shrink-0" />
                    <span className="truncate">{displayLabel} Overview</span>
                  </Link>
                </div>

                {/* Child Links */}
                <div className="space-y-0.5 px-1.5 max-h-72 overflow-y-auto">
                  {item.children.map((child) => {
                    const childHref = getPageHref(child.slug);
                    const isChildActive =
                      router.asPath.split("?")[0] === childHref;
                    const childLabel = child.navLabel || child.title;

                    return (
                      <Link
                        key={child._id}
                        href={childHref}
                        onClick={() => setOpenDropdownId(null)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          isChildActive
                            ? "bg-[#bf2131] text-[#ffffff] font-bold"
                            : "text-[#ffffff]/80 hover:text-[#ffffff] hover:bg-white/10"
                        }`}
                      >
                        <FiFileText className="w-3.5 h-3.5 shrink-0 text-[#bf2131]" />
                        <span className="truncate">{childLabel}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NavLinks;
