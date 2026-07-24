import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchNavigation } from "../../store/slices/contentSlice";
import api from "../../utils/api";
import { useToast } from "../../context/UIContext";
import {
  FiMove,
  FiSave,
  FiRefreshCw,
  FiFolder,
  FiLayers,
} from "react-icons/fi";

const NavSorter = () => {
  const dispatch = useDispatch();
  const showToast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // References to track dragged DOM indices without causing re-renders during motion
  const dragItemNode = useRef();
  const dragOverItemNode = useRef();

  // Fetch only top-level parent documents for navigation sorting
  const fetchTopLevelPages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/content", {
        params: { limit: 100, published: "all" },
      });
      const allDocs = res.data.data || [];

      // Filter strictly for root items (no parent) and sort by their existing navOrder
      const roots = allDocs
        .filter((doc) => !doc.parent)
        .sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0));

      setItems(roots);
    } catch (err) {
      console.error("Failed to load top-level navigation pages:", err);
      showToast("Failed to load top-level navigation pages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopLevelPages();
  }, []);

  // --- HTML5 NATIVE DRAG AND DROP ENGINE ---

  const handleDragStart = (e, index) => {
    dragItemNode.current = index;
    // Set standard dataTransfer to ensure browser drag cursor activates
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.parentNode);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    dragOverItemNode.current = index;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.target.style.opacity = "1";

    const fromIndex = dragItemNode.current;
    const toIndex = dragOverItemNode.current;

    if (
      fromIndex === undefined ||
      toIndex === undefined ||
      fromIndex === toIndex
    ) {
      return;
    }

    // Clone array and relocate dragged element
    const newItems = [...items];
    const draggedItemContent = newItems.splice(fromIndex, 1)[0];
    newItems.splice(toIndex, 0, draggedItemContent);

    dragItemNode.current = null;
    dragOverItemNode.current = null;
    setItems(newItems);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    dragItemNode.current = null;
    dragOverItemNode.current = null;
  };

  // Dispatch new index sequence to backend bulk reorder API
  const handleSaveOrder = async () => {
    setSaving(true);

    const payload = items.map((doc, idx) => ({
      _id: doc._id,
      navOrder: idx,
    }));

    try {
      await api.put("/content/navigation/reorder", { items: payload });
      await dispatch(fetchNavigation()); // Refresh global navbar state immediately
      showToast(
        "Top-level navigation hierarchy sequence saved successfully!",
        "success",
      );
      fetchTopLevelPages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Error saving navigation order.";
      showToast(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-muted-text/20 shadow-sm overflow-hidden font-sans select-none animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="p-6 border-b border-muted-text/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-light-bg/60">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-red bg-brand-red/10 px-2.5 py-1 rounded mb-1">
            <FiLayers className="w-3.5 h-3.5" />
            <span>Visual Hierarchy Engine</span>
          </div>
          <h3 className="text-lg font-bold text-dark-card">
            Top-Level Navigation Sequence
          </h3>
          <p className="text-xs text-muted-text mt-0.5">
            Click and drag items to rearrange the order in which top-level links
            appear in the customer-facing navbar.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={fetchTopLevelPages}
            disabled={loading || saving}
            className="flex items-center space-x-1.5 text-xs font-semibold text-muted-text hover:text-dark-card bg-white px-3.5 py-2.5 rounded-lg border border-muted-text/20 shadow-sm transition-colors"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-red" : ""}`}
            />
            <span className="hidden sm:inline">Reset Order</span>
          </button>

          <button
            onClick={handleSaveOrder}
            disabled={loading || saving || items.length === 0}
            className="flex items-center space-x-2 px-6 py-2.5 bg-brand-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>
              {saving ? "Persisting Sequence..." : "Save Navigation Order"}
            </span>
          </button>
        </div>
      </div>

      {/* Draggable List Container */}
      <div className="p-6 sm:p-8">
        {loading ? (
          <div className="p-12 text-center text-muted-text italic">
            Loading top-level navigation pages from MongoDB...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-muted-text space-y-2 border border-dashed border-muted-text/30 rounded-2xl">
            <FiFolder className="w-8 h-8 mx-auto stroke-1 text-muted-text" />
            <p className="font-semibold text-dark-card">
              No top-level root pages found
            </p>
            <p className="text-xs">
              Create a root page (with no parent assigned) to manage its navbar
              sorting position.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {items.map((doc, index) => (
              <div
                key={doc._id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className="group flex items-center justify-between p-4 bg-light-bg hover:bg-white border border-muted-text/20 hover:border-brand-red/50 rounded-xl shadow-sm hover:shadow transition-all cursor-move"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-dark-nav text-white/70 group-hover:text-white transition-colors">
                    <FiMove className="w-4 h-4" />
                  </div>
                  <span className="w-6 h-6 rounded-md bg-brand-red/15 text-brand-red font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-dark-card group-hover:text-brand-red transition-colors">
                      {doc.navLabel || doc.title}
                    </h4>
                    <span className="text-xs font-mono text-muted-text block">
                      /{doc.slug} {doc.navLabel && `(Title: "${doc.title}")`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      doc.isPublished
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {doc.isPublished ? "Live" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavSorter;
