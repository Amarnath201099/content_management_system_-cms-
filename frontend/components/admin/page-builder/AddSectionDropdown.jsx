import React, { useState } from "react";
import {
  FiPlus,
  FiChevronDown,
  FiType,
  FiImage,
  FiMousePointer,
  FiGrid,
  FiCode,
  FiInfo,
  FiDownload,
} from "react-icons/fi";

const AddSectionDropdown = ({ onAddSection }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleSelectType = (type) => {
    const uniqueId = `slice-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let defaultData = {};

    switch (type) {
      case "rich-text":
        defaultData = { blocks: [] };
        break;
      case "image-content":
        defaultData = {
          imageUrl: "",
          alt: "",
          caption: "",
          textContent: "",
          alignment: "image-left", // 'image-left' or 'image-right'
        };
        break;
      case "cta-button":
        defaultData = {
          label: "Click Here",
          link: "/services",
          style: "primary", // 'primary' (#bf2131) or 'outline'
        };
        break;
      case "table":
        defaultData = {
          headers: ["Column 1", "Column 2", "Column 3"],
          rows: [
            ["Data 1A", "Data 1B", "Data 1C"],
            ["Data 2A", "Data 2B", "Data 2C"],
          ],
        };
        break;
      case "math":
        defaultData = {
          formula: "E = mc^2",
          displayMode: true,
          description: "Mass-energy equivalence algorithm",
        };
        break;
      case "callout-box":
        defaultData = {
          style: "info", // 'info' | 'warning' | 'success'
          title: "Important Documentation Note",
          text: "Enter key architectural guidelines or system alerts here.",
        };
        break;
      case "file-download":
        defaultData = {
          fileUrl: "",
          label: "Download Technical Brochure (PDF)",
          description:
            "Download attached document to view detailed architectural diagrams and SLA guidelines.",
        };
        break;
      default:
        defaultData = {};
    }

    onAddSection({ id: uniqueId, type, data: defaultData });
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block font-sans select-none">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 bg-[#bf2131] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all transform hover:-translate-y-0.5"
      >
        <FiPlus className="w-4 h-4" />
        <span>Add Next Block</span>
        <FiChevronDown
          className={`w-4 h-4 transition-transform ${showMenu ? "rotate-180" : ""}`}
        />
      </button>

      {showMenu && (
        <div className="absolute right-0 sm:left-0 mt-2 w-64 bg-[#2b2c2c] text-white rounded-xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
          <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/50 bg-[#383939]/40">
            Select Section Type
          </div>

          <div className="p-1.5 space-y-1">
            <button
              type="button"
              onClick={() => handleSelectType("rich-text")}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/15 text-left transition-colors text-xs font-semibold"
            >
              <FiType className="w-4 h-4 text-[#bf2131] shrink-0" />
              <div>
                <span className="block text-white">Rich Text</span>
                <span className="block text-[10px] text-white/60">
                  Headings, paragraphs & nested lists
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectType("callout-box")}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/15 text-left transition-colors text-xs font-semibold"
            >
              <FiInfo className="w-4 h-4 text-[#bf2131] shrink-0" />
              <div>
                <span className="block text-white">Callout Box</span>
                <span className="block text-[10px] text-white/60">
                  Info, warning & success notice alerts
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectType("file-download")}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/15 text-left transition-colors text-xs font-semibold"
            >
              <FiDownload className="w-4 h-4 text-[#bf2131] shrink-0" />
              <div>
                <span className="block text-white">File Download CTA</span>
                <span className="block text-[10px] text-white/60">
                  Interactive technical brochure button
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectType("image-content")}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/15 text-left transition-colors text-xs font-semibold"
            >
              <FiImage className="w-4 h-4 text-[#bf2131] shrink-0" />
              <div>
                <span className="block text-white">Image + Content</span>
                <span className="block text-[10px] text-white/60">
                  Banner media with aligned narrative
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectType("cta-button")}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/15 text-left transition-colors text-xs font-semibold"
            >
              <FiMousePointer className="w-4 h-4 text-[#bf2131] shrink-0" />
              <div>
                <span className="block text-white">CTA Button</span>
                <span className="block text-[10px] text-white/60">
                  Call to action link button
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectType("table")}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/15 text-left transition-colors text-xs font-semibold"
            >
              <FiGrid className="w-4 h-4 text-[#bf2131] shrink-0" />
              <div>
                <span className="block text-white">Table Matrix</span>
                <span className="block text-[10px] text-white/60">
                  Interactive data spreadsheet
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectType("math")}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/15 text-left transition-colors text-xs font-semibold"
            >
              <FiCode className="w-4 h-4 text-[#bf2131] shrink-0" />
              <div>
                <span className="block text-white">Math Formula</span>
                <span className="block text-[10px] text-white/60">
                  KaTeX LaTeX algorithm block
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSectionDropdown;
