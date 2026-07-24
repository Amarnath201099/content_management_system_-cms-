import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocuments } from "../../store/slices/contentSlice";
import { useToast, useModal } from "../../context/UIContext";
import api from "../../utils/api";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiFolder,
  FiFileText,
  FiSearch,
  FiRefreshCw,
  FiUser,
  FiLayers,
  FiCheckCircle,
  FiLock,
} from "react-icons/fi";

const PagesTable = () => {
  const dispatch = useDispatch();
  const showToast = useToast();
  const showConfirm = useModal();

  const { user } = useSelector((state) => state.auth);
  const { documents, loading: docsLoading } = useSelector(
    (state) => state.content,
  );

  // Ephemeral local state for search and status tabs
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  // Apply status tabs and search query in memory
  const displayedDocuments = useMemo(() => {
    let list = documents || [];

    if (statusFilter === "published") {
      list = list.filter((doc) => doc.isPublished === true);
    } else if (statusFilter === "draft") {
      list = list.filter((doc) => doc.isPublished === false);
    }

    if (!searchFilter.trim()) return list;
    const query = searchFilter.toLowerCase();
    return list.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.slug.toLowerCase().includes(query),
    );
  }, [documents, statusFilter, searchFilter]);

  // Quick Action: Toggle Publish State (Admin Only Enforced)
  const handleTogglePublish = async (doc) => {
    if (user?.role === "editor") {
      showToast(
        "Only Administrators are authorized to change publication states directly.",
        "error",
      );
      return;
    }

    try {
      await api.put(`/content/${doc._id}`, {
        title: doc.title,
        slug: doc.slug,
        parent: doc.parent
          ? typeof doc.parent === "object"
            ? doc.parent._id
            : doc.parent
          : null,
        sections: doc.sections || doc.blocks || [],
        isPublished: !doc.isPublished,
      });
      await dispatch(fetchDocuments({ limit: 100, published: "all" }));
      showToast(
        `"${doc.title}" is now ${!doc.isPublished ? "Published Live" : "set to Draft Mode"}.`,
        "success",
      );
    } catch (err) {
      showToast(
        `Error updating publish status: ${err.response?.data?.message || err.message}`,
        "error",
      );
    }
  };

  // Quick Action: Delete Document (Admin Only Enforced with Custom Modal)
  const handleDeleteDocument = (doc) => {
    if (user?.role !== "admin") return;

    showConfirm({
      title: "Permanently Delete Page?",
      message: `Are you sure you want to delete "${doc.title}"? This action cannot be undone and child pages will be safely unlinked.`,
      confirmText: "Yes, Delete Page",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await api.delete(`/content/${doc._id}`);
          await dispatch(fetchDocuments({ limit: 100, published: "all" }));
          showToast(`Page "${doc.title}" deleted successfully.`, "success");
        } catch (err) {
          showToast(
            `Error deleting page: ${err.response?.data?.message || err.message}`,
            "error",
          );
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#383939]/20 shadow-sm overflow-hidden font-sans select-none animate-in fade-in duration-300">
      {/* Table Header Bar with Search & Refresh */}
      <div className="p-6 border-b border-[#383939]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f5f5f5]/60">
        <div>
          <h2 className="text-lg font-bold text-[#2b2c2c]">
            {user?.role === "admin"
              ? "Global Page Repository"
              : "Assigned Authoring Workspace"}
          </h2>
          <p className="text-xs text-[#5c5c5c] mt-0.5">
            {user?.role === "admin"
              ? "Global Admin View: Construct slices, manage publishing states, and remove documents."
              : "Editor View: You are viewing pages where you are the author or an authorized collaborator."}
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="w-4 h-4 text-[#5c5c5c] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search titles or slugs..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-white text-[#2b2c2c] placeholder-[#5c5c5c] text-xs rounded-lg pl-10 pr-4 py-2.5 border border-[#383939]/30 focus:outline-none focus:ring-2 focus:ring-[#bf2131] transition-all shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              dispatch(fetchDocuments({ limit: 100, published: "all" }))
            }
            disabled={docsLoading}
            className="flex items-center space-x-1.5 text-xs font-semibold text-[#5c5c5c] hover:text-[#2b2c2c] bg-white px-3.5 py-2.5 rounded-lg border border-[#383939]/20 shadow-sm transition-colors shrink-0"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 ${docsLoading ? "animate-spin text-[#bf2131]" : ""}`}
            />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="px-6 py-3 bg-[#f5f5f5]/40 border-b border-[#383939]/15 flex items-center space-x-2 overflow-x-auto">
        <span className="text-xs font-semibold text-[#5c5c5c] uppercase tracking-wider mr-2 flex items-center space-x-1 shrink-0">
          <FiLayers className="w-3.5 h-3.5 text-[#bf2131] inline" />
          <span>Status Filter:</span>
        </span>

        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            statusFilter === "all"
              ? "bg-[#2b2c2c] text-white shadow-sm"
              : "bg-white text-[#2b2c2c] hover:bg-[#f5f5f5] border border-[#383939]/20"
          }`}
        >
          <span>All Pages ({documents?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("published")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            statusFilter === "published"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-white text-green-700 hover:bg-green-50 border border-green-200"
          }`}
        >
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>
            Published ({(documents || []).filter((d) => d.isPublished).length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("draft")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            statusFilter === "draft"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200"
          }`}
        >
          <FiEyeOff className="w-3.5 h-3.5" />
          <span>
            Unpublished Drafts (
            {(documents || []).filter((d) => !d.isPublished).length})
          </span>
        </button>
      </div>

      {/* Responsive Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-[#383939] text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Title & Routing Slug</th>
              <th className="p-4 font-semibold">Hierarchy</th>
              <th className="p-4 font-semibold">Author / Team</th>
              <th className="p-4 font-semibold">Status Badge</th>
              <th className="p-4 font-semibold">Last Modified</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#383939]/15">
            {docsLoading ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-[#5c5c5c] italic"
                >
                  Loading modular pages from MongoDB...
                </td>
              </tr>
            ) : displayedDocuments.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-[#5c5c5c] space-y-2"
                >
                  <FiFileText className="w-8 h-8 mx-auto stroke-1 text-[#5c5c5c]" />
                  <p className="font-semibold text-[#2b2c2c]">
                    No matching pages found
                  </p>
                  <p className="text-xs">
                    {statusFilter !== "all" || searchFilter
                      ? "Try clearing your status filters or keyword search above."
                      : 'Click "+ Create New Page" above to start authoring content.'}
                  </p>
                </td>
              </tr>
            ) : (
              displayedDocuments.map((doc) => {
                const parentTitle = doc.parent
                  ? typeof doc.parent === "object"
                    ? doc.parent.title
                    : "Nested Guide"
                  : null;

                const authorDisplayName =
                  doc.authorName ||
                  (typeof doc.author === "object"
                    ? doc.author.name
                    : "Unknown");
                const assignedCount = doc.assignedEditors
                  ? doc.assignedEditors.length
                  : 0;

                return (
                  <tr
                    key={doc._id}
                    className="hover:bg-[#f5f5f5]/80 transition-colors group"
                  >
                    {/* Title & Slug Path */}
                    <td className="p-4">
                      <div className="font-bold text-[#2b2c2c] group-hover:text-[#bf2131] transition-colors text-base">
                        {doc.title}
                      </div>
                      <div className="font-mono text-xs text-[#5c5c5c] mt-0.5">
                        /{doc.slug}
                      </div>
                    </td>

                    {/* Parent Hierarchy */}
                    <td className="p-4">
                      {parentTitle ? (
                        <span className="inline-flex items-center space-x-1 text-xs bg-[#f5f5f5] px-2.5 py-1 rounded font-medium text-[#2b2c2c] border border-[#383939]/10">
                          <FiFolder className="w-3 h-3 text-[#bf2131]" />
                          <span>{parentTitle}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#5c5c5c] font-medium italic">
                          Core Root Page
                        </span>
                      )}
                    </td>

                    {/* Author Name & Assignments */}
                    <td className="p-4">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#2b2c2c]">
                        <FiUser className="w-3.5 h-3.5 text-[#5c5c5c]" />
                        <span>{authorDisplayName}</span>
                      </div>
                      {assignedCount > 0 && (
                        <div className="text-[10px] text-[#5c5c5c] font-medium mt-0.5">
                          +{assignedCount} Assigned Editor
                          {assignedCount > 1 ? "s" : ""}
                        </div>
                      )}
                    </td>

                    {/* Status Badge Pill */}
                    <td className="p-4">
                      {user?.role === "admin" ? (
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(doc)}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                            doc.isPublished
                              ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                          }`}
                          title="Click to toggle publish status"
                        >
                          {doc.isPublished ? (
                            <FiEye className="w-3.5 h-3.5" />
                          ) : (
                            <FiEyeOff className="w-3.5 h-3.5" />
                          )}
                          <span>{doc.isPublished ? "Published" : "Draft"}</span>
                        </button>
                      ) : (
                        <div
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider cursor-not-allowed select-none opacity-80 ${
                            doc.isPublished
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                          title="Only Admins can publish pages directly to live production"
                        >
                          {doc.isPublished ? (
                            <FiEye className="w-3.5 h-3.5" />
                          ) : (
                            <FiLock className="w-3.5 h-3.5 text-[#bf2131]" />
                          )}
                          <span>
                            {doc.isPublished ? "Published" : "Draft (Locked)"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Last Modified Date */}
                    <td className="p-4 text-xs text-[#5c5c5c] font-medium">
                      {new Date(
                        doc.updatedAt || doc.createdAt,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action Buttons: Scoped hover styles prevent invisibility */}
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/admin/editor/${doc._id}`}
                        className="inline-flex items-center space-x-1 bg-white text-[#5c5c5c] hover:text-[#bf2131] transition-colors p-2 rounded hover:bg-[#2b2c2c] border border-[#383939]/30 shadow-sm"
                        title="Edit Modular Slices"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold ml-1">Edit</span>
                      </Link>

                      {user?.role === "admin" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc)}
                          className="inline-flex items-center space-x-1 bg-white text-[#5c5c5c] hover:text-[#bf2131] transition-colors p-2 rounded hover:bg-[#2b2c2c] border border-[#383939]/30 shadow-sm"
                          title="Delete Page Permanently"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PagesTable;
