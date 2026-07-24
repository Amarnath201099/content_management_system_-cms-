import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDocumentBySlug,
  clearActiveDocument,
  fetchNavigation,
} from "../store/slices/contentSlice";
import Navbar from "../components/nav/Navbar";
import Footer from "../components/Footer";
import SectionRenderer from "../components/SectionRenderer";
import { FiRefreshCw, FiAlertCircle, FiArrowLeft } from "react-icons/fi";

const CatchAllPageView = () => {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch();

  const { activeDocument, loading, navigationTree } = useSelector(
    (state) => state.content,
  );

  // Local state tracking strictly if THIS exact route query failed with a 404 from the backend
  const [fetchFailed, setFetchFailed] = useState(false);
  const [isRedirectingFallback, setIsRedirectingFallback] = useState(false);

  const fullSlug = useMemo(() => {
    if (!router.isReady || !slug) return null;
    return Array.isArray(slug) ? slug.join("/") : slug;
  }, [router.isReady, slug]);

  const isAdminOrApiRoute = useMemo(() => {
    if (!fullSlug) return false;
    const lower = fullSlug.toLowerCase();
    return (
      lower.startsWith("admin") ||
      lower.startsWith("login") ||
      lower.startsWith("api")
    );
  }, [fullSlug]);

  /**
   * STRICT FETCH ENGINE
   * Only mark fetchFailed = true if the backend explicitly rejects the request promise!
   */
  useEffect(() => {
    if (isAdminOrApiRoute || !router.isReady || !fullSlug) return;

    setIsRedirectingFallback(false);
    setFetchFailed(false);
    dispatch(fetchNavigation());

    dispatch(fetchDocumentBySlug(fullSlug))
      .unwrap()
      .then(() => {
        setFetchFailed(false);
      })
      .catch((err) => {
        console.warn(
          `[404 Fallback Guard] Route '${fullSlug}' not found:`,
          err,
        );
        setFetchFailed(true);
      });

    return () => {
      dispatch(clearActiveDocument());
    };
  }, [dispatch, fullSlug, isAdminOrApiRoute, router.isReady]);

  /**
   * SMART 404 FALLBACK REDIRECT ENGINE
   * Only executes when local fetchFailed is confirmed true by the promise rejection above!
   */
  useEffect(() => {
    if (isAdminOrApiRoute || !fetchFailed) return;

    if (navigationTree && navigationTree.length > 0) {
      const firstSlug = navigationTree[0].slug;
      if (fullSlug !== firstSlug) {
        setIsRedirectingFallback(true);
        router.replace(`/${firstSlug}`);
      }
    }
  }, [fetchFailed, navigationTree, fullSlug, router, isAdminOrApiRoute]);

  const handleRetry = () => {
    if (fullSlug && !isAdminOrApiRoute) {
      setIsRedirectingFallback(false);
      setFetchFailed(false);
      dispatch(fetchDocumentBySlug(fullSlug));
    }
  };

  if (isAdminOrApiRoute) {
    return null; // Let Next.js handle administrative routing cleanly
  }

  const pageSections =
    activeDocument?.sections && activeDocument.sections.length > 0
      ? activeDocument.sections
      : activeDocument?.blocks || [];

  const showLoadingSpinner =
    (loading && !activeDocument) || isRedirectingFallback;
  const showErrorScreen =
    fetchFailed && !loading && !activeDocument && !isRedirectingFallback;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] font-sans select-none">
      <Navbar />

      <main className="flex-1 min-h-screen bg-[#f5f5f5] text-[#2b2c2c]">
        {showLoadingSpinner && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#bf2131]/10 flex items-center justify-center text-[#bf2131] shadow-inner">
              <FiRefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-lg text-[#2b2c2c]">
                {isRedirectingFallback
                  ? "Redirecting to Safety..."
                  : "Loading Page Content..."}
              </h3>
              <p className="text-xs text-[#383939]/70 max-w-sm">
                {isRedirectingFallback
                  ? `The requested URL was not found. Redirecting you to our primary navigation entry point.`
                  : `Fetching structured slices and media layouts from the backend.`}
              </p>
            </div>
          </div>
        )}

        {showErrorScreen && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white border border-red-200 text-[#2b2c2c] p-8 sm:p-14 rounded-3xl text-center space-y-6 w-full shadow-lg animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#bf2131] flex items-center justify-center mx-auto shadow-inner">
                <FiAlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2b2c2c]">
                  Page Not Found
                </h1>
                <p className="text-sm sm:text-base text-[#383939]/80 leading-relaxed max-w-lg mx-auto">
                  We could not locate any active page matching the path{" "}
                  <span className="font-mono font-bold text-[#bf2131]">
                    /{fullSlug}
                  </span>
                  . It may have been moved, deleted, or is currently
                  unpublished.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center space-x-2 bg-[#383939] hover:bg-black text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Retry Request</span>
                </button>

                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 bg-[#bf2131] hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Return to Homepage</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeDocument &&
          !loading &&
          !isRedirectingFallback &&
          !fetchFailed && (
            <article className="w-full pb-16 animate-in fade-in duration-500">
              <div className="sr-only">
                <h1>{activeDocument.title}</h1>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
                <SectionRenderer sections={pageSections} />
              </div>
            </article>
          )}
      </main>

      <Footer />
    </div>
  );
};

export default CatchAllPageView;
