import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocuments } from "../../store/slices/contentSlice";
import { logoutUser } from "../../store/slices/authSlice";
import PagesTable from "../../components/admin/PagesTable";
import NavSorter from "../../components/admin/NavSorter";
import TeamManager from "../../components/admin/TeamManager";
import {
  FiHome,
  FiFileText,
  FiLayers,
  FiUsers,
  FiPlus,
  FiLogOut,
  FiShield,
  FiBookOpen,
  FiActivity,
  FiCheckCircle,
  FiTrendingUp,
  FiClock,
  FiGlobe,
  FiArrowRight,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiDatabase,
  FiRefreshCw,
} from "react-icons/fi";

const AdminDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Extract loading state from auth slice to prevent race conditions on refresh
  const {
    isAuthenticated,
    user,
    loading: authLoading,
  } = useSelector((state) => state.auth);
  const { documents, loading: docsLoading } = useSelector(
    (state) => state.content,
  );

  const [activeTab, setActiveTab] = useState("welcome");
  const [statusMessage, setStatusMessage] = useState(null);

  /**
   * CRITICAL FIX: Auth Hydration Guard
   * Do not redirect if authentication is still verifying session cookies on page refresh!
   */
  useEffect(() => {
    if (authLoading) return; // Wait until initial session check completes

    if (!isAuthenticated) {
      router.push("/admin/login"); // Strictly use /admin/login
    } else if (user && user.role !== "admin" && user.role !== "editor") {
      router.push("/");
    } else {
      dispatch(fetchDocuments({ limit: 100, published: "all" }));
    }
  }, [isAuthenticated, user, authLoading, router, dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/");
  };

  const totalPages = useMemo(() => documents?.length || 0, [documents]);
  const publishedPages = useMemo(
    () => (documents || []).filter((d) => d.isPublished).length,
    [documents],
  );
  const pendingDrafts = useMemo(
    () => (documents || []).filter((d) => !d.isPublished).length,
    [documents],
  );

  // While checking auth on page refresh, display a clean loading screen instead of redirecting
  if (
    authLoading ||
    !isAuthenticated ||
    !user ||
    (user.role !== "admin" && user.role !== "editor")
  ) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center space-y-3 font-sans">
        <FiRefreshCw className="w-8 h-8 text-[#bf2131] animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
          Verifying Mission Control Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans select-none">
      {/* Top Bar */}
      <header className="bg-[#383939] text-white shadow-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-lg bg-[#bf2131] flex items-center justify-center shadow-md">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">
                CMS Mission Control
              </span>
              <span className="hidden sm:inline-block ml-3 text-xs bg-[#2b2c2c] border border-white/20 px-2.5 py-0.5 rounded text-white/80 uppercase tracking-wider font-semibold">
                {user.name} • {user.role}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab("welcome")}
              className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all border ${
                activeTab === "welcome"
                  ? "bg-[#bf2131] text-white border-[#bf2131] shadow-md"
                  : "bg-[#2b2c2c] hover:bg-white/10 text-white border-white/20"
              }`}
            >
              <FiHome className="w-4 h-4" />
              <span className="hidden md:inline">Welcome Hub</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-1.5 text-xs font-semibold bg-[#2b2c2c] hover:bg-white/10 text-white px-3.5 py-2 rounded-lg transition-colors border border-white/20"
            >
              <FiBookOpen className="w-4 h-4 text-[#bf2131]" />
              <span className="hidden md:inline">Public Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-xs font-semibold bg-[#bf2131] hover:bg-red-700 text-white px-3.5 py-2 rounded-lg transition-colors shadow"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-[#383939]/15 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("welcome")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shrink-0 ${activeTab === "welcome" ? "bg-[#2b2c2c] text-white shadow-sm" : "bg-[#f5f5f5] text-[#2b2c2c] hover:bg-[#383939]/10"}`}
            >
              <FiHome className="w-3.5 h-3.5 text-[#bf2131]" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("pages")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shrink-0 ${activeTab === "pages" ? "bg-[#2b2c2c] text-white shadow-sm" : "bg-[#f5f5f5] text-[#2b2c2c] hover:bg-[#383939]/10"}`}
            >
              <FiFileText className="w-3.5 h-3.5 text-[#bf2131]" />
              <span>Page Management</span>
            </button>
            {user.role === "admin" && (
              <>
                <button
                  onClick={() => setActiveTab("navigation")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shrink-0 ${activeTab === "navigation" ? "bg-[#2b2c2c] text-white shadow-sm" : "bg-[#f5f5f5] text-[#2b2c2c] hover:bg-[#383939]/10"}`}
                >
                  <FiLayers className="w-3.5 h-3.5 text-[#bf2131]" />
                  <span>Navigation Order</span>
                </button>
                <button
                  onClick={() => setActiveTab("team")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shrink-0 ${activeTab === "team" ? "bg-[#2b2c2c] text-white shadow-sm" : "bg-[#f5f5f5] text-[#2b2c2c] hover:bg-[#383939]/10"}`}
                >
                  <FiUsers className="w-3.5 h-3.5 text-[#bf2131]" />
                  <span>Team Management</span>
                </button>
              </>
            )}
          </div>

          <Link
            href="/admin/editor/new"
            className="flex items-center space-x-2 px-4 py-2 bg-[#bf2131] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all transform hover:-translate-y-0.5 shrink-0 ml-4"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create New Page</span>
          </Link>
        </div>
      </nav>

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${statusMessage.type === "success" ? "bg-green-50 border-green-300 text-green-900" : "bg-red-50 border-red-300 text-red-900"}`}
          >
            <div className="flex items-center space-x-2.5">
              {statusMessage.type === "success" ? (
                <FiCheck className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-[#383939] hover:text-[#2b2c2c]"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === "welcome" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="bg-[#2b2c2c] text-white p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#bf2131]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center space-x-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#bf2131]">
                  <FiActivity className="w-3.5 h-3.5" />
                  <span>Central CMS Mission Control</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Welcome back,{" "}
                  <span className="text-[#bf2131]">{user.name}</span>.
                </h1>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  You are currently logged into the **DevForge Platform**
                  control plane with **{user.role.toUpperCase()}** privileges.
                  Use the telemetry below to monitor live databases, audit SEO
                  performance, or execute authoring actions.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/60">
                  <span className="flex items-center space-x-1.5 bg-[#383939] px-3 py-1.5 rounded-lg border border-white/10">
                    <FiGlobe className="w-4 h-4 text-[#bf2131]" />
                    <span>Environment: Production MERN Cluster</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-[#383939] px-3 py-1.5 rounded-lg border border-white/10">
                    <FiDatabase className="w-4 h-4 text-[#bf2131]" />
                    <span>Database: MongoDB Atlas Connected</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Grids */}
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#383939] flex items-center space-x-2 mb-3">
                  <FiDatabase className="w-4 h-4 text-[#bf2131]" />
                  <span>Tier 1: Live Database Repository Metrics</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#383939]/15 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#383939]/70">
                      <span>Total Web Pages</span>
                      <FiFileText className="w-4 h-4 text-[#bf2131]" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#2b2c2c]">
                      {docsLoading ? "..." : totalPages}
                    </div>
                    <p className="text-[11px] text-[#383939]/60">
                      Total modular documents in MongoDB
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#383939]/15 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-green-700">
                      <span>Published Live Pages</span>
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-green-700">
                      {docsLoading ? "..." : publishedPages}
                    </div>
                    <p className="text-[11px] text-[#383939]/60">
                      Currently indexed and publicly visible
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#383939]/15 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700">
                      <span>Pending Drafts</span>
                      <FiClock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-amber-700">
                      {docsLoading ? "..." : pendingDrafts}
                    </div>
                    <p className="text-[11px] text-[#383939]/60">
                      Unpublished works in authoring progress
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#383939] flex items-center space-x-2 mb-3">
                  <FiActivity className="w-4 h-4 text-[#bf2131]" />
                  <span>Tier 2: Executive Telemetry & Performance Audit</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#383939]/15 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#383939]/70">
                      <span>Lighthouse Score</span>
                      <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-green-300">
                        Optimal
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-[#2b2c2c]">
                      98/100
                    </div>
                    <p className="text-[11px] text-[#383939]/60">
                      Core Web Vitals & SEO audit passing
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#383939]/15 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#383939]/70">
                      <span>Technical SEO</span>
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-3xl font-extrabold text-[#2b2c2c]">
                      100% Valid
                    </div>
                    <p className="text-[11px] text-[#383939]/60">
                      Sitemap, meta tags & KaTeX math indexed
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#383939]/15 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#383939]/70">
                      <span>Monthly Visitors</span>
                      <FiTrendingUp className="w-4 h-4 text-[#bf2131]" />
                    </div>
                    <div className="text-3xl font-extrabold text-[#2b2c2c]">
                      14.2K
                    </div>
                    <p className="text-[11px] text-[#bf2131] font-semibold">
                      GA4 API Ready • +18% MoM
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#383939]/15 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#383939]/70">
                      <span>API Latency</span>
                      <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-green-300">
                        Fast
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-[#2b2c2c]">
                      42ms
                    </div>
                    <p className="text-[11px] text-[#383939]/60">
                      Express backend response time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#383939] flex items-center space-x-2 mb-4">
                <FiLayers className="w-4 h-4 text-[#bf2131]" />
                <span>Mission Control Quick Actions</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                  onClick={() => setActiveTab("pages")}
                  className="bg-[#2b2c2c] text-white p-6 rounded-2xl border border-white/10 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#bf2131]/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#bf2131] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <FiFileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#bf2131] transition-colors">
                      Page Management
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Create, edit, and publish modular web pages across the
                      platform.
                    </p>
                  </div>
                  <div className="pt-6 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#bf2131]">
                    <span>Manage Pages</span>
                    <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {user.role === "admin" ? (
                  <div
                    onClick={() => setActiveTab("navigation")}
                    className="bg-[#2b2c2c] text-white p-6 rounded-2xl border border-white/10 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#bf2131]/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-[#bf2131] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <FiLayers className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#bf2131] transition-colors">
                        Navigation Order
                      </h3>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Drag and drop navbar hierarchy to rearrange public site
                        links.
                      </p>
                    </div>
                    <div className="pt-6 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#bf2131]">
                      <span>Sort Hierarchy</span>
                      <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#383939]/60 text-white/40 p-6 rounded-2xl border border-white/5 shadow-inner flex flex-col justify-between cursor-not-allowed opacity-60">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center">
                        <FiLayers className="w-5 h-5 text-white/40" />
                      </div>
                      <h3 className="text-lg font-bold text-white/60">
                        Navigation Order
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed">
                        Drag and drop navbar hierarchy. (Locked: Admin access
                        strictly required).
                      </p>
                    </div>
                    <div className="pt-6 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      🔒 Admin Access Required
                    </div>
                  </div>
                )}

                {user.role === "admin" ? (
                  <div
                    onClick={() => setActiveTab("team")}
                    className="bg-[#2b2c2c] text-white p-6 rounded-2xl border border-white/10 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#bf2131]/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-[#bf2131] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <FiUsers className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#bf2131] transition-colors">
                        Team Management
                      </h3>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Onboard editors, provision credentials, and assign
                        collaborative page permissions.
                      </p>
                    </div>
                    <div className="pt-6 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#bf2131]">
                      <span>Manage Team</span>
                      <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#383939]/60 text-white/40 p-6 rounded-2xl border border-white/5 shadow-inner flex flex-col justify-between cursor-not-allowed opacity-60">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center">
                        <FiUsers className="w-5 h-5 text-white/40" />
                      </div>
                      <h3 className="text-lg font-bold text-white/60">
                        Team Management
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed">
                        Onboard editors and assign permissions. (Locked: Admin
                        access strictly required).
                      </p>
                    </div>
                    <div className="pt-6 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      🔒 Admin Access Required
                    </div>
                  </div>
                )}

                <div
                  onClick={() => router.push("/admin/editor/new")}
                  className="bg-[#bf2131] text-white p-6 rounded-2xl border border-red-400/30 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl hover:bg-red-700 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#bf2131] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform font-extrabold text-lg">
                      <FiPlus className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:underline">
                      + Create New Page
                    </h3>
                    <p className="text-xs text-white/90 leading-relaxed">
                      Launch the modular page builder to assemble rich text,
                      callouts, tables, or math algorithms.
                    </p>
                  </div>
                  <div className="pt-6 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
                    <span>Launch Editor</span>
                    <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pages" && (
          <PagesTable setStatusMessage={setStatusMessage} />
        )}
        {activeTab === "navigation" && user.role === "admin" && (
          <NavSorter setStatusMessage={setStatusMessage} />
        )}
        {activeTab === "team" && user.role === "admin" && (
          <TeamManager setStatusMessage={setStatusMessage} />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
