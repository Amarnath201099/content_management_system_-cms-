import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/UIContext";
import {
  FiUserPlus,
  FiUser,
  FiMail,
  FiLock,
  FiRefreshCw,
  FiUsers,
  FiCalendar,
  FiCheckSquare,
  FiChevronDown,
  FiSave,
  FiX,
  FiFileText,
  FiFolder,
  FiLayers,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const TeamManager = ({ setStatusMessage }) => {
  const showToast = useToast();

  // Registry State
  const [editors, setEditors] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Account Provisioning State with password toggle
  const [editorForm, setEditorForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creatingEditor, setCreatingEditor] = useState(false);

  // Inline Page Delegation State
  const [activeEditorId, setActiveEditorId] = useState(null);
  const [pendingPageIds, setPendingPageIds] = useState([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  // Fetch active editors list
  const fetchEditorsList = useCallback(async () => {
    try {
      const res = await api.get("/auth/editors");
      setEditors(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch active editors:", err);
      showToast("Failed to load editors registry", "error");
    }
  }, [showToast]);

  // Fetch all website pages for assignment mapping
  const fetchPagesList = useCallback(async () => {
    try {
      const res = await api.get("/content", {
        params: { limit: 100, published: "all" },
      });
      setPages(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch website pages:", err);
      showToast("Failed to load website pages for delegation", "error");
    }
  }, [showToast]);

  // Concurrently load both datasets on mount
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchEditorsList(), fetchPagesList()]);
    setLoading(false);
  }, [fetchEditorsList, fetchPagesList]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Admin Action: Provision New Editor Account
  const handleCreateEditor = async (e) => {
    e.preventDefault();
    if (
      !editorForm.name.trim() ||
      !editorForm.email.trim() ||
      !editorForm.password
    ) {
      showToast(
        "All fields are required to provision an editor account.",
        "error",
      );
      if (setStatusMessage)
        setStatusMessage({ type: "error", text: "All fields are required." });
      return;
    }

    setCreatingEditor(true);
    if (setStatusMessage) setStatusMessage(null);

    try {
      await api.post("/auth/create-editor", {
        name: editorForm.name.trim(),
        email: editorForm.email.trim(),
        password: editorForm.password,
      });
      showToast(
        `Editor account for "${editorForm.name}" provisioned successfully!`,
        "success",
      );
      setEditorForm({ name: "", email: "", password: "" });
      await fetchEditorsList();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Error provisioning editor account.";
      showToast(errorMsg, "error");
      if (setStatusMessage) setStatusMessage({ type: "error", text: errorMsg });
    } finally {
      setCreatingEditor(false);
    }
  };

  // Helper: Calculate how many pages are currently assigned to an editor
  const getEditorAssignmentCount = (editorId) => {
    return pages.filter((page) => {
      const assigned = page.assignedEditors || [];
      return assigned.some((ed) => {
        const edId = typeof ed === "object" ? ed._id : ed;
        return edId?.toString() === editorId.toString();
      });
    }).length;
  };

  // Helper: Toggle open the inline assignment dropdown and pre-populate checked state
  const handleToggleEditAccess = (editorId) => {
    if (activeEditorId === editorId) {
      setActiveEditorId(null);
      setPendingPageIds([]);
    } else {
      setActiveEditorId(editorId);
      const currentlyAssigned = pages
        .filter((page) => {
          const assigned = page.assignedEditors || [];
          return assigned.some((ed) => {
            const edId = typeof ed === "object" ? ed._id : ed;
            return edId?.toString() === editorId.toString();
          });
        })
        .map((page) => page._id);
      setPendingPageIds(currentlyAssigned);
    }
  };

  // Helper: Toggle individual checkbox inside the open dropdown
  const handlePageCheckboxToggle = (pageId) => {
    setPendingPageIds((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId],
    );
  };

  // Admin Action: Persist assignment modifications to MongoDB across affected pages
  const handleSaveAssignments = async (editorId) => {
    setSavingAssignments(true);
    try {
      const updatePromises = [];

      pages.forEach((page) => {
        const currentEditors = (page.assignedEditors || []).map((ed) =>
          typeof ed === "object" ? ed._id?.toString() : ed?.toString(),
        );
        const wasAssigned = currentEditors.includes(editorId.toString());
        const shouldBeAssigned = pendingPageIds.includes(page._id);

        // Diff Detection: Trigger PUT only for documents whose assignment status changed
        if (wasAssigned && !shouldBeAssigned) {
          const newEditors = currentEditors.filter(
            (id) => id !== editorId.toString(),
          );
          updatePromises.push(
            api.put(`/content/${page._id}`, { assignedEditors: newEditors }),
          );
        } else if (!wasAssigned && shouldBeAssigned) {
          const newEditors = [...currentEditors, editorId.toString()];
          updatePromises.push(
            api.put(`/content/${page._id}`, { assignedEditors: newEditors }),
          );
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        showToast("Editor page assignments updated successfully!", "success");
        await fetchPagesList();
      } else {
        showToast("No modifications detected in page assignments.", "info");
      }

      setActiveEditorId(null);
      setPendingPageIds([]);
    } catch (err) {
      console.error("Failed to save assignments:", err);
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Error updating page assignments.",
        "error",
      );
    } finally {
      setSavingAssignments(false);
    }
  };

  return (
    <div className="space-y-8 font-sans select-none animate-in fade-in duration-300">
      {/* 1. DIRECT ACCOUNT PROVISIONING CARD */}
      <div className="bg-[#2b2c2c] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl">
        <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-[#bf2131] bg-black/30 px-2.5 py-1 rounded">
              <FiUserPlus className="w-3.5 h-3.5" />
              <span>Direct Account Provisioning</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              Provision New Editor Account
            </h3>
          </div>
          <span className="text-xs font-mono text-white/50 hidden sm:inline">
            Role Assigned: EDITOR
          </span>
        </div>

        <form
          onSubmit={handleCreateEditor}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80">
              Full Name <span className="text-[#bf2131]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g., Jane Doe"
                value={editorForm.name}
                onChange={(e) =>
                  setEditorForm({ ...editorForm, name: e.target.value })
                }
                className="w-full bg-[#383939] border border-white/20 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
              <FiUser className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80">
              Email Address <span className="text-[#bf2131]">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="editor@test.com"
                value={editorForm.email}
                onChange={(e) =>
                  setEditorForm({ ...editorForm, email: e.target.value })
                }
                className="w-full bg-[#383939] border border-white/20 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
              <FiMail className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80">
              Initial Password <span className="text-[#bf2131]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Min 8 chars, 1 sym, 1 upper"
                value={editorForm.password}
                onChange={(e) =>
                  setEditorForm({ ...editorForm, password: e.target.value })
                }
                className="w-full bg-[#383939] border border-white/20 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
              <FiLock className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={creatingEditor}
              className="flex items-center space-x-2 px-8 py-3 bg-[#bf2131] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <FiUserPlus className="w-4 h-4" />
              <span>
                {creatingEditor
                  ? "Provisioning Account..."
                  : "Create & Onboard Editor"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. ACTIVE EDITORS REGISTRY & INLINE PAGE DELEGATION TABLE */}
      <div
        className={`bg-white rounded-2xl border border-[#383939]/20 shadow-sm transition-all ${activeEditorId ? "pb-48" : ""}`}
      >
        <div className="p-6 border-b border-[#383939]/15 flex items-center justify-between bg-[#f5f5f5]/60 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-[#2b2c2c]">
              Active Team Members & Page Delegation
            </h3>
            <p className="text-xs text-[#383939]/70 mt-0.5">
              Manage provisioned authoring credentials and assign granular
              collaborative editing permissions to specific website pages.
            </p>
          </div>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center space-x-1.5 text-xs font-semibold text-[#383939] hover:text-[#2b2c2c] bg-white px-3.5 py-2 rounded-lg border border-[#383939]/20 shadow-sm transition-colors shrink-0"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#bf2131]" : ""}`}
            />
            <span>Refresh Table</span>
          </button>
        </div>

        <div className="overflow-x-auto sm:overflow-visible">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#383939] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Editor Name</th>
                <th className="p-4 font-semibold">Email Address</th>
                <th className="p-4 font-semibold">System Role Badge</th>
                <th className="p-4 font-semibold">Assigned Pages</th>
                <th className="p-4 font-semibold">Date Provisioned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#383939]/15">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-[#383939] italic"
                  >
                    Loading active team members and page repository...
                  </td>
                </tr>
              ) : editors.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-12 text-center text-[#383939] space-y-2"
                  >
                    <FiUsers className="w-8 h-8 mx-auto stroke-1 text-[#383939]" />
                    <p className="font-semibold text-[#2b2c2c]">
                      No Editor accounts provisioned
                    </p>
                    <p className="text-xs">
                      Use the provisioning form above to onboard your first team
                      editor.
                    </p>
                  </td>
                </tr>
              ) : (
                editors.map((edUser) => {
                  const assignedCount = getEditorAssignmentCount(edUser._id);
                  const isDropdownOpen = activeEditorId === edUser._id;

                  return (
                    <tr
                      key={edUser._id}
                      className="hover:bg-[#f5f5f5]/60 transition-colors relative"
                    >
                      {/* Editor Name */}
                      <td className="p-4 font-bold text-[#2b2c2c]">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 text-[#bf2131] shrink-0" />
                          <span>{edUser.name}</span>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="p-4 font-mono text-xs text-[#383939]/80">
                        {edUser.email}
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-[#383939] text-white px-3 py-1 rounded-full border border-black/20">
                          Editor
                        </span>
                      </td>

                      {/* INLINE PAGE DELEGATION CELL */}
                      <td className="p-4 relative">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center space-x-1 text-xs font-bold bg-[#f5f5f5] text-[#2b2c2c] px-2.5 py-1 rounded-full border border-[#383939]/20">
                            <FiLayers className="w-3 h-3 text-[#bf2131]" />
                            <span>
                              {assignedCount} Page
                              {assignedCount !== 1 ? "s" : ""}
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleEditAccess(edUser._id)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                              isDropdownOpen
                                ? "bg-[#bf2131] text-white border-[#bf2131] shadow-md"
                                : "bg-white hover:bg-[#383939] text-[#2b2c2c] hover:text-white border-[#383939]/30 shadow-sm"
                            }`}
                          >
                            <span>Edit Access</span>
                            <FiChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>

                        {/* CLICK-TO-TOGGLE INLINE DELEGATION DROPDOWN */}
                        {isDropdownOpen && (
                          <div className="absolute left-4 top-14 bg-[#383939] border border-[#bf2131]/40 p-4 rounded-xl shadow-2xl z-50 w-80 text-white animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#bf2131] flex items-center space-x-1">
                                <FiCheckSquare className="w-3.5 h-3.5" />
                                <span>Assign Page Access</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveEditorId(null)}
                                className="text-white/60 hover:text-white transition-colors"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>

                            <p className="text-[11px] text-white/70 mb-3 leading-normal">
                              Select website documents that{" "}
                              <span className="font-bold text-white">
                                {edUser.name}
                              </span>{" "}
                              is authorized to modify and author.
                            </p>

                            {/* Scrollable Checkbox List of All Website Pages */}
                            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 my-2 border border-white/10 rounded-lg p-2 bg-black/20">
                              {pages.length === 0 ? (
                                <p className="text-xs text-white/50 italic text-center py-4">
                                  No website pages created yet.
                                </p>
                              ) : (
                                pages.map((page) => {
                                  const isChecked = pendingPageIds.includes(
                                    page._id,
                                  );
                                  const parentTitle = page.parent
                                    ? typeof page.parent === "object"
                                      ? page.parent.title
                                      : "Child Guide"
                                    : null;

                                  return (
                                    <label
                                      key={page._id}
                                      onClick={() =>
                                        handlePageCheckboxToggle(page._id)
                                      }
                                      className={`flex items-start space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${
                                        isChecked
                                          ? "bg-[#bf2131]/20 border-[#bf2131]/60 text-white"
                                          : "hover:bg-white/10 border-transparent text-white/80"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          handlePageCheckboxToggle(page._id);
                                        }} // Handled by label onClick
                                        className="w-4 h-4 text-[#bf2131] rounded focus:ring-[#bf2131] border-white/40 mt-0.5 pointer-events-none"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold truncate block">
                                            {page.title}
                                          </span>
                                          <span
                                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded shrink-0 ml-1 ${
                                              page.isPublished
                                                ? "bg-green-500/20 text-green-300"
                                                : "bg-amber-500/20 text-amber-300"
                                            }`}
                                          >
                                            {page.isPublished
                                              ? "Live"
                                              : "Draft"}
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-white/50 block truncate">
                                          /docs/{page.slug}{" "}
                                          {parentTitle && `[📁 ${parentTitle}]`}
                                        </span>
                                      </div>
                                    </label>
                                  );
                                })
                              )}
                            </div>

                            {/* Dropdown Footer Controls */}
                            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-white/60">
                                {pendingPageIds.length} Page
                                {pendingPageIds.length !== 1 ? "s" : ""}{" "}
                                Selected
                              </span>

                              <button
                                type="button"
                                disabled={savingAssignments}
                                onClick={() =>
                                  handleSaveAssignments(edUser._id)
                                }
                                className="flex items-center space-x-1.5 bg-[#bf2131] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow transition-all disabled:opacity-50"
                              >
                                <FiSave className="w-3.5 h-3.5" />
                                <span>
                                  {savingAssignments
                                    ? "Saving..."
                                    : "Save Assignments"}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Provisioned Date */}
                      <td className="p-4 text-xs text-[#383939]/70 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <FiCalendar className="w-3.5 h-3.5 text-[#383939]/50 shrink-0" />
                          <span>
                            {new Date(edUser.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamManager;
