import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchNavigation } from "../../store/slices/contentSlice";
import NavLinks from "./NavLinks";
import NavOverflow from "./NavOverflow";
import { FiLayers } from "react-icons/fi";

const Navbar = () => {
  const dispatch = useDispatch();
  const { navigationTree } = useSelector((state) => state.content);
  const headerRef = useRef(null);

  // Hydrate navigation tree from MongoDB on initial mount
  useEffect(() => {
    dispatch(fetchNavigation());
  }, [dispatch]);

  // Enforce strict 5-item top-level cap; route overflow nodes into the Others dropdown
  const { mainNav, overflowNav } = useMemo(() => {
    if (!navigationTree || !Array.isArray(navigationTree)) {
      return { mainNav: [], overflowNav: [] };
    }
    return {
      mainNav: navigationTree.slice(0, 5),
      overflowNav: navigationTree.slice(5),
    };
  }, [navigationTree]);

  return (
    <header
      ref={headerRef}
      className="bg-[#383939] text-[#ffffff] shadow-lg sticky top-0 z-50 border-b border-white/10 select-none font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo (Upgraded to modular corporate architecture theme) */}
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

        {/* Atomic Click-to-Toggle Navigation Architecture (Pushed to total right with ml-auto) */}
        <nav className="flex items-center justify-end space-x-1 sm:space-x-2 ml-auto">
          <NavLinks items={mainNav} />
          {overflowNav.length > 0 && (
            <NavOverflow overflowItems={overflowNav} />
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
