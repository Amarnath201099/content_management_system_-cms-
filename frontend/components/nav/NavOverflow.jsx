import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiChevronDown,
  FiMoreHorizontal,
  FiFolder,
  FiFileText,
} from "react-icons/fi";

const NavOverflow = ({ overflowItems = [] }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const overflowRef = useRef(null);

  // Auto-close overflow dropdown when clicking outside the container
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (overflowRef.current && !overflowRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Close dropdown automatically upon navigating to a new route
  useEffect(() => {
    setIsOpen(false);
  }, [router.asPath]);

  if (
    !overflowItems ||
    !Array.isArray(overflowItems) ||
    overflowItems.length === 0
  ) {
    return null;
  }

  // Format clean corporate URLs (without legacy /docs/ prefixes)
  const getPageHref = (slug) => {
    if (slug === "home" || slug === "overview") return "/";
    return `/${slug}`;
  };

  // Check if current active page lives anywhere inside the overflow menu
  const isOverflowActive = overflowItems.some((item) => {
    const targetHref = getPageHref(item.slug);
    if (router.asPath === targetHref) return true;
    if (item.children && Array.isArray(item.children)) {
      return item.children.some(
        (child) => router.asPath === getPageHref(child.slug),
      );
    }
    return false;
  });

  return (
    <div ref={overflowRef} className="relative font-sans select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
          isOpen || isOverflowActive
            ? "bg-[#bf2131] text-[#ffffff] font-bold shadow-sm"
            : "text-[#ffffff]/80 hover:text-[#ffffff] hover:bg-white/10"
        }`}
      >
        <FiMoreHorizontal className="w-4 h-4 text-[#bf2131] group-hover:text-[#ffffff] transition-colors" />
        <span>Others</span>
        <FiChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#ffffff]" : ""
          }`}
        />
      </button>

      {/* Click-to-Toggle Overflow Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-1.5 min-w-[240px] bg-[#383939] border border-[#bf2131]/30 shadow-xl rounded-md py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 border-b border-white/10 mb-1 text-[10px] font-bold uppercase tracking-wider text-white/50 bg-black/20">
            Additional Documentation Topics
          </div>

          <div className="space-y-1 px-1.5 max-h-80 overflow-y-auto">
            {overflowItems.map((item) => {
              const hasChildren =
                item.children &&
                Array.isArray(item.children) &&
                item.children.length > 0;
              const targetHref = getPageHref(item.slug);
              const isItemActive = router.asPath === targetHref;
              const displayLabel = item.navLabel || item.title;

              return (
                <div key={item._id} className="space-y-0.5">
                  {/* Top-Level Overflow Link */}
                  <Link
                    href={targetHref}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-bold transition-colors ${
                      isItemActive
                        ? "bg-[#bf2131] text-[#ffffff]"
                        : "text-[#ffffff]/90 hover:text-[#ffffff] hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FiFolder className="w-3.5 h-3.5 shrink-0 text-[#bf2131]" />
                      <span className="truncate">{displayLabel}</span>
                    </div>
                  </Link>

                  {/* Indented Sub-Links for Nested Children */}
                  {hasChildren && (
                    <div className="pl-5 border-l-2 border-[#bf2131]/40 ml-3 space-y-0.5 py-1">
                      {item.children.map((child) => {
                        const childHref = getPageHref(child.slug);
                        const isChildActive = router.asPath === childHref;
                        const childLabel = child.navLabel || child.title;

                        return (
                          <Link
                            key={child._id}
                            href={childHref}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              isChildActive
                                ? "bg-[#bf2131] text-[#ffffff] font-bold"
                                : "text-[#ffffff]/70 hover:text-[#ffffff] hover:bg-white/10"
                            }`}
                          >
                            <FiFileText className="w-3 h-3 shrink-0 text-[#bf2131]" />
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
        </div>
      )}
    </div>
  );
};

export default NavOverflow;
