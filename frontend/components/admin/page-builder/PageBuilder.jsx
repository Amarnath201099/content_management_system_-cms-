import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDocuments,
  fetchNavigation,
} from "../../../store/slices/contentSlice";
import { useToast } from "../../../context/UIContext";
import PageMetadataForm from "./PageMetadataForm";
import AddSectionDropdown from "./AddSectionDropdown";
import SectionCard from "./SectionCard";
import api from "../../../utils/api";
import { FiSave, FiX, FiLayers } from "react-icons/fi";

const PageBuilder = ({ initialData = null, onSaveSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const showToast = useToast();

  const { documents } = useSelector((state) => state.content);
  const { user } = useSelector((state) => state.auth);

  // Ephemeral React Local State for Document Metadata
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [navLabel, setNavLabel] = useState(initialData?.navLabel || "");
  const [parent, setParent] = useState(
    initialData?.parent
      ? typeof initialData.parent === "object"
        ? initialData.parent._id
        : initialData.parent
      : "",
  );
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished || false,
  );
  const [assignedEditors, setAssignedEditors] = useState(() => {
    if (
      initialData?.assignedEditors &&
      Array.isArray(initialData.assignedEditors)
    ) {
      return initialData.assignedEditors.map((ed) =>
        typeof ed === "object" ? ed._id : ed,
      );
    }
    return [];
  });

  // Ephemeral React Local State for Modular Slices Array
  const [sections, setSections] = useState(() => {
    if (
      initialData?.sections &&
      Array.isArray(initialData.sections) &&
      initialData.sections.length > 0
    ) {
      return initialData.sections;
    }
    if (
      initialData?.blocks &&
      Array.isArray(initialData.blocks) &&
      initialData.blocks.length > 0
    ) {
      return [
        {
          id: `slice-legacy-${Date.now()}`,
          type: "rich-text",
          data: { blocks: initialData.blocks },
        },
      ];
    }
    return [];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData && initialData._id);

  // Auto-Scroll Refs and Logic
  const sectionRefs = useRef({});
  const prevSectionsLength = useRef(sections.length);

  useEffect(() => {
    // When section count increases, scroll the newly added slice smoothly into view
    if (sections.length > prevSectionsLength.current) {
      const lastAddedSection = sections[sections.length - 1];
      const targetElement = sectionRefs.current[lastAddedSection.id];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    prevSectionsLength.current = sections.length;
  }, [sections.length, sections]);

  const parentOptions = useMemo(() => {
    return (documents || []).filter(
      (doc) => !isEditing || doc._id !== initialData._id,
    );
  }, [documents, isEditing, initialData]);

  // Section Array Mutation Helpers
  const handleAddSection = (newSlice) => {
    setSections((prev) => [...prev, newSlice]);
  };

  const handleRemoveSection = (index) => {
    setSections((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveSection = (index, direction) => {
    setSections((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleUpdateSectionData = (index, newData) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        data: { ...copy[index].data, ...newData },
      };
      return copy;
    });
  };

  // API Form Submission
  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      showToast("Page Title and URL Slug are required.", "error");
      return;
    }

    setIsSubmitting(true);

    // SPARSE INDEX SAFEGUARD: Map empty string navLabels to null so Mongoose indexes don't collide
    const cleanNavLabel = navLabel.trim() === "" ? null : navLabel.trim();

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      navLabel: cleanNavLabel,
      parent: parent || null,
      isPublished: user?.role === "admin" ? isPublished : false,
      assignedEditors,
      sections,
    };

    try {
      if (isEditing) {
        await api.put(`/content/${initialData._id}`, payload);
        showToast(`Page "${title}" updated successfully!`, "success");
      } else {
        await api.post("/content", payload);
        showToast(`Page "${title}" created successfully!`, "success");
      }

      await dispatch(fetchDocuments({ limit: 100, published: "all" }));
      await dispatch(fetchNavigation());
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
      }, 1200);
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to save page.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-16 font-sans select-none animate-in fade-in duration-300">
      {/* Top Workspace Action Bar */}
      <div className="bg-[#383939] text-white shadow-lg sticky top-12 sm:top-16 z-40 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#bf2131] flex items-center justify-center shadow-md">
              <FiLayers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#bf2131] bg-black/20 px-2 py-0.5 rounded">
                {isEditing ? "Slice Editor Mode" : "New Page Builder"}
              </span>
              <h1 className="text-xl font-extrabold text-white leading-tight mt-0.5">
                {isEditing
                  ? `Editing: "${initialData.title}"`
                  : "Construct Modular Page"}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#2b2c2c] hover:bg-white/15 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors shadow-sm"
            >
              <FiX className="w-4 h-4 text-[#bf2131]" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleSavePage}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#bf2131] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              <FiSave className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Persisting..."
                  : isEditing
                    ? "Update Page"
                    : "Save & Publish Page"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Document Settings */}
        <PageMetadataForm
          title={title}
          setTitle={setTitle}
          slug={slug}
          setSlug={setSlug}
          navLabel={navLabel}
          setNavLabel={setNavLabel}
          parent={parent}
          setParent={setParent}
          isPublished={isPublished}
          setIsPublished={setIsPublished}
          assignedEditors={assignedEditors}
          setAssignedEditors={setAssignedEditors}
          parentOptions={parentOptions}
          isEditing={isEditing}
          user={user}
        />

        {/* Modular Slices List & Cards */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#383939]/20 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-[#2b2c2c]">
                Modular Page Slices ({sections.length})
              </h2>
              <p className="text-xs text-[#5c5c5c] mt-0.5">
                Add, configure, and reorder content blocks. Slices render
                vertically in sequence.
              </p>
            </div>
            <AddSectionDropdown onAddSection={handleAddSection} />
          </div>

          {sections.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-[#383939]/30 text-center space-y-3">
              <FiLayers className="w-10 h-10 text-[#5c5c5c]/50 mx-auto stroke-1" />
              <h3 className="text-base font-bold text-[#2b2c2c]">
                No Content Slices Created Yet
              </h3>
              <p className="text-xs text-[#5c5c5c] max-w-sm mx-auto">
                Click "Add Next Block" above to assemble your page using rich
                text, callouts, downloads, imagery, tables, or math formulas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  totalSections={sections.length}
                  onMoveUp={() => handleMoveSection(index, "up")}
                  onMoveDown={() => handleMoveSection(index, "down")}
                  onRemove={() => handleRemoveSection(index)}
                  onUpdateData={(newData) =>
                    handleUpdateSectionData(index, newData)
                  }
                  cardRef={(el) => (sectionRefs.current[section.id] = el)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PageBuilder;
