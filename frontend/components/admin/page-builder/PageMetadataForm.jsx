import React, { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";
import {
  FiUsers,
  FiUserCheck,
  FiLock,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

const PageMetadataForm = ({
  title,
  setTitle,
  slug,
  setSlug,
  navLabel,
  setNavLabel,
  parent,
  setParent,
  isPublished,
  setIsPublished,
  assignedEditors,
  setAssignedEditors,
  parentOptions = [],
  isEditing,
  user,
}) => {
  const [availableEditors, setAvailableEditors] = useState([]);
  const [loadingEditors, setLoadingEditors] = useState(false);
  const [isDelegationOpen, setIsDelegationOpen] = useState(false); // Collapsed accordion state by default

  // Fetch active editors strictly when logged in as Admin
  const fetchAvailableEditors = useCallback(async () => {
    if (user?.role !== "admin") return;
    setLoadingEditors(true);
    try {
      const res = await api.get("/auth/editors");
      setAvailableEditors(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch available editors for delegation:", err);
    } finally {
      setLoadingEditors(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAvailableEditors();
    }
  }, [user?.role, fetchAvailableEditors]);

  // Auto-generate URL slug from Title during initial creation
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditing) {
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s/]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generatedSlug);
    }
  };

  // Toggle editor assignment checkbox (Admin Only)
  const handleEditorToggle = (editorId) => {
    setAssignedEditors((prev) => {
      if (prev.includes(editorId)) {
        return prev.filter((id) => id !== editorId);
      } else {
        return [...prev, editorId];
      }
    });
  };

  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#383939]/20 shadow-sm space-y-6 font-sans select-none animate-in fade-in duration-300">
      <div className="border-b border-[#383939]/15 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2b2c2c]">
            Page Routing, Hierarchy & Delegation
          </h2>
          <p className="text-xs text-[#5c5c5c] mt-0.5">
            Configure the document title, navbar label, URL slug path,
            navigation parent, and team assignments.
          </p>
        </div>
        <span className="text-xs font-mono bg-[#f5f5f5] px-2.5 py-1 rounded border border-[#383939]/20 text-[#383939]/80">
          Step 1 of 2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Page Title */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
            Page Title <span className="text-[#bf2131]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Enterprise Software Solutions"
            value={title}
            onChange={handleTitleChange}
            className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-4 py-2.5 text-sm font-medium text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131] focus:bg-white transition-all"
          />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center justify-start md:justify-end pt-2 md:pt-6">
          {user?.role === "admin" ? (
            <label className="relative flex items-center space-x-3 cursor-pointer bg-[#f5f5f5] px-5 py-2.5 rounded-xl border border-[#383939]/20 hover:bg-white transition-colors shadow-sm">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 text-[#bf2131] rounded focus:ring-[#bf2131] border-[#383939]/60"
              />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c] select-none">
                  {isPublished ? "Published Live" : "Draft Mode"}
                </span>
                <span className="block text-[10px] text-[#5c5c5c]">
                  {isPublished
                    ? "Visible in navigation"
                    : "Hidden from public view"}
                </span>
              </div>
            </label>
          ) : (
            <div className="flex items-center space-x-3 bg-amber-50 px-5 py-2.5 rounded-xl border border-amber-300 shadow-sm cursor-not-allowed select-none opacity-90">
              <FiLock className="w-5 h-5 text-[#bf2131] shrink-0" />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-amber-900">
                  Draft Mode (Locked)
                </span>
                <span className="block text-[10px] text-amber-700">
                  Only Admins can publish directly to live production
                </span>
              </div>
            </div>
          )}
        </div>

        {/* URL Slug Path: Scrubbed strictly to localhost:3000/ */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
            URL Slug Path <span className="text-[#bf2131]">*</span>
          </label>
          <div className="flex items-center">
            <span className="bg-[#f5f5f5] border border-r-0 border-[#383939]/30 px-3 py-2.5 rounded-l-lg text-xs font-mono text-[#5c5c5c] select-none">
              localhost:3000/
            </span>
            <input
              type="text"
              required
              placeholder="services/enterprise-solutions"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value.toLowerCase().trim().replace(/\s+/g, "-"),
                )
              }
              className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-r-lg px-3 py-2.5 text-xs font-mono text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131] focus:bg-white transition-all"
            />
          </div>
          <p className="text-[11px] text-[#5c5c5c] italic">
            Tip: Use slashes for composite paths (e.g.,
            'services/web-development').
          </p>
        </div>

        {/* Navbar Label (navLabel) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
            Navbar Label (navLabel)
          </label>
          <input
            type="text"
            placeholder="e.g., Services"
            value={navLabel}
            onChange={(e) => setNavLabel(e.target.value)}
            className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131] focus:bg-white transition-all"
          />
          <p className="text-[11px] text-[#5c5c5c] leading-normal">
            Leave blank to exclude from navbar, or enter a short title (e.g.,
            'Services') for the navigation menu.
          </p>
        </div>

        {/* Parent Page Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
            Parent Page Hierarchy
          </label>
          <div className="relative">
            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-4 py-2.5 text-xs font-medium text-[#2b2c2c] appearance-none focus:outline-none focus:ring-2 focus:ring-[#bf2131] focus:bg-white transition-all pr-10"
            >
              <option value="">-- Core Root Page (No Parent) --</option>
              {parentOptions.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  📁 {doc.title} (/{doc.slug})
                </option>
              ))}
            </select>
            <FiChevronDown className="w-4 h-4 text-[#5c5c5c] absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ADMIN ONLY: Collapsible Editor Delegation Accordion */}
      {user?.role === "admin" && (
        <div className="pt-4 border-t border-[#383939]/15">
          <button
            type="button"
            onClick={() => setIsDelegationOpen(!isDelegationOpen)}
            className="w-full flex items-center justify-between p-3 bg-[#f5f5f5]/70 hover:bg-[#f5f5f5] rounded-xl border border-[#383939]/20 transition-all text-left"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#2b2c2c] flex items-center space-x-2">
              <FiUsers className="w-4 h-4 text-[#bf2131]" />
              <span>
                👥 Manage Editor Access ({assignedEditors.length} Assigned)
              </span>
            </span>
            <div className="flex items-center space-x-1 text-[#5c5c5c]">
              <span className="text-[11px] font-semibold">
                {isDelegationOpen ? "Collapse" : "Expand"}
              </span>
              {isDelegationOpen ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {isDelegationOpen && (
            <div className="mt-3 p-4 bg-[#f5f5f5]/40 rounded-xl border border-[#383939]/15 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5c5c5c]">
                  Select team members authorized to author and modify this
                  document:
                </span>
              </div>

              {loadingEditors ? (
                <div className="p-4 bg-white rounded-xl text-center text-xs text-[#5c5c5c] italic">
                  Loading active editors list...
                </div>
              ) : availableEditors.length === 0 ? (
                <div className="p-4 bg-white rounded-xl text-center text-xs text-[#5c5c5c]">
                  No Editor accounts provisioned yet. Use the Team Management
                  tab to onboard team members.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableEditors.map((ed) => {
                    const isChecked = assignedEditors.includes(ed._id);
                    return (
                      <label
                        key={ed._id}
                        onClick={() => handleEditorToggle(ed._id)}
                        className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-[#383939] text-white border-[#383939] shadow-sm"
                            : "bg-white hover:bg-[#f5f5f5] text-[#2b2c2c] border-[#383939]/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleEditorToggle(ed._id)} // Handled by label onClick
                          className="w-4 h-4 text-[#bf2131] rounded focus:ring-[#bf2131] border-[#383939]/60 pointer-events-none"
                        />
                        <div className="truncate flex-1">
                          <span className="block text-xs font-bold truncate">
                            {ed.name}
                          </span>
                          <span
                            className={`block text-[10px] truncate ${isChecked ? "text-white/70" : "text-[#5c5c5c]"}`}
                          >
                            {ed.email}
                          </span>
                        </div>
                        {isChecked && (
                          <FiUserCheck className="w-4 h-4 text-[#bf2131] shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PageMetadataForm;
