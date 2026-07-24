import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchNavigation } from "../store/slices/contentSlice";
import { FiRefreshCw, FiLogIn, FiBookOpen } from "react-icons/fi";

const HomePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { navigationTree, loading } = useSelector((state) => state.content);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Trigger navigation tree retrieval from MongoDB on initial hydration
  useEffect(() => {
    dispatch(fetchNavigation()).finally(() => {
      setHasAttemptedFetch(true);
    });
  }, [dispatch]);

  // SMART ROOT REDIRECT:
  // Once the navigation tree is available, extract the first published slug and redirect immediately
  useEffect(() => {
    if (navigationTree && navigationTree.length > 0) {
      const firstSlug = navigationTree[0].slug;
      // Use replace() strictly so we do not trap the user in a back-button history loop
      router.replace(`/${firstSlug}`);
    }
  }, [navigationTree, router]);

  // Determine if we are actively redirecting or waiting for initial database payload
  const isRedirecting = navigationTree && navigationTree.length > 0;
  const showLoading = loading || !hasAttemptedFetch || isRedirecting;

  return (
    <div className="min-h-screen bg-[#2b2c2c] text-white flex flex-col justify-center items-center font-sans select-none p-4">
      {/* STATE A: REDIRECTING / LOADING SPINNER */}
      {showLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4 max-w-sm text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-[#bf2131]/10 border border-[#bf2131]/30 flex items-center justify-center text-[#bf2131] shadow-2xl">
            <FiRefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              Dev<span className="text-[#bf2131]">Docs</span> Portal
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Locating primary navigation entry point and redirecting...
            </p>
          </div>
        </div>
      ) : (
        /* STATE B: EMPTY DATABASE FALLBACK (No published navigation items exist yet) */
        <div className="max-w-md w-full bg-[#383939] border border-white/10 p-8 sm:p-10 rounded-3xl text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-[#bf2131]/15 border border-[#bf2131]/30 text-[#bf2131] flex items-center justify-center mx-auto shadow-inner">
            <FiBookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              No Published Pages Found
            </h1>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              The documentation repository is currently empty or contains only
              unpublished drafts. Please log in to the administrative control
              plane to author and publish your first page.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/admin/login"
              className="w-full inline-flex items-center justify-center space-x-2 bg-[#bf2131] hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <FiLogIn className="w-4 h-4" />
              <span>Access Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
