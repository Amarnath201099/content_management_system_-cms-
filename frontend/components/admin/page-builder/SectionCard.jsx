import React from "react";
import EditorWrapper from "../../EditorWrapper";
import {
  FiArrowUp,
  FiArrowDown,
  FiTrash2,
  FiType,
  FiImage,
  FiMousePointer,
  FiGrid,
  FiCode,
  FiInfo,
  FiDownload,
  FiPlus,
  FiX,
  FiAlignLeft,
  FiAlignRight,
  FiLink,
} from "react-icons/fi";

const SectionCard = ({
  section,
  index,
  totalSections,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdateData,
  cardRef,
}) => {
  const { id, type, data } = section;

  // Table Matrix Manipulation Helpers
  const addTableColumn = () => {
    const currentData = data || { headers: [], rows: [] };
    const newHeaders = [
      ...(currentData.headers || []),
      `Column ${(currentData.headers?.length || 0) + 1}`,
    ];
    const newRows = (currentData.rows || []).map((row) => [...row, ""]);
    onUpdateData({ headers: newHeaders, rows: newRows });
  };

  const removeTableColumn = (colIndex) => {
    const currentData = data || { headers: [], rows: [] };
    if ((currentData.headers?.length || 0) <= 1) {
      alert("A table must have at least one column.");
      return;
    }
    const newHeaders = currentData.headers.filter((_, idx) => idx !== colIndex);
    const newRows = currentData.rows.map((row) =>
      row.filter((_, idx) => idx !== colIndex),
    );
    onUpdateData({ headers: newHeaders, rows: newRows });
  };

  const addTableRow = () => {
    const currentData = data || { headers: [], rows: [] };
    const colCount = currentData.headers?.length || 1;
    const newRow = Array(colCount).fill("");
    onUpdateData({ rows: [...(currentData.rows || []), newRow] });
  };

  const removeTableRow = (rowIndex) => {
    const currentData = data || { headers: [], rows: [] };
    if ((currentData.rows?.length || 0) <= 1) {
      alert("A table must have at least one data row.");
      return;
    }
    const newRows = currentData.rows.filter((_, idx) => idx !== rowIndex);
    onUpdateData({ rows: newRows });
  };

  const updateTableHeader = (colIndex, value) => {
    const currentData = data || { headers: [], rows: [] };
    const newHeaders = [...currentData.headers];
    newHeaders[colIndex] = value;
    onUpdateData({ headers: newHeaders });
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    const currentData = data || { headers: [], rows: [] };
    const newRows = currentData.rows.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      const newRow = [...row];
      newRow[colIndex] = value;
      return newRow;
    });
    onUpdateData({ rows: newRows });
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl border border-[#383939]/20 shadow-sm overflow-hidden transition-all hover:border-[#bf2131]/40 font-sans select-none"
    >
      {/* Slice Header & Order Controls */}
      <div className="bg-[#383939] text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-6 h-6 rounded-md bg-[#bf2131] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {index + 1}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
            {type === "rich-text" && (
              <FiType className="w-3.5 h-3.5 text-[#bf2131]" />
            )}
            {type === "callout-box" && (
              <FiInfo className="w-3.5 h-3.5 text-[#bf2131]" />
            )}
            {type === "file-download" && (
              <FiDownload className="w-3.5 h-3.5 text-[#bf2131]" />
            )}
            {type === "image-content" && (
              <FiImage className="w-3.5 h-3.5 text-[#bf2131]" />
            )}
            {type === "cta-button" && (
              <FiMousePointer className="w-3.5 h-3.5 text-[#bf2131]" />
            )}
            {type === "table" && (
              <FiGrid className="w-3.5 h-3.5 text-[#bf2131]" />
            )}
            {type === "math" && (
              <FiCode className="w-3.5 h-3.5 text-[#bf2131]" />
            )}
            <span>{type.replace("-", " ")} Slice</span>
          </span>
          <span className="text-[10px] font-mono text-white/50 hidden sm:inline">
            ID: {id}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1.5 rounded hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move Section Up"
          >
            <FiArrowUp className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === totalSections - 1}
            className="p-1.5 rounded hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move Section Down"
          >
            <FiArrowDown className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-white/20 mx-1"></div>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded bg-[#bf2131]/80 hover:bg-[#bf2131] text-white transition-colors"
            title="Delete Section"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slice Body */}
      <div className="p-6">
        {/* TYPE 1: RICH TEXT */}
        {type === "rich-text" && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
              Dynamic Editor.js Content (With Nested List Support)
            </label>
            <div className="border border-[#383939]/30 rounded-xl overflow-hidden">
              <EditorWrapper
                key={id}
                initialData={
                  data?.blocks ? { blocks: data.blocks } : { blocks: [] }
                }
                onChange={(savedData) =>
                  onUpdateData({ blocks: savedData.blocks || [] })
                }
              />
            </div>
          </div>
        )}

        {/* TYPE 2: CALLOUT BOX */}
        {type === "callout-box" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Alert Notice Style
              </label>
              <select
                value={data?.style || "info"}
                onChange={(e) => onUpdateData({ style: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              >
                <option value="info">🔵 Blue Info Notice</option>
                <option value="warning">🟡 Amber Warning Alert</option>
                <option value="success">🟢 Green Success Notice</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Callout Header Title
              </label>
              <input
                type="text"
                placeholder="e.g., Important Architectural Requirement"
                value={data?.title || ""}
                onChange={(e) => onUpdateData({ title: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Alert Body Text Narrative
              </label>
              <textarea
                rows={3}
                placeholder="Enter detailed documentation guidelines or warning text here..."
                value={data?.text || ""}
                onChange={(e) => onUpdateData({ text: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg p-3.5 text-sm text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131] leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TYPE 3: FILE DOWNLOAD CTA */}
        {type === "file-download" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                File Asset URL <span className="text-[#bf2131]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://drive.google.com/... or /files/brochure.pdf"
                  value={data?.fileUrl || ""}
                  onChange={(e) => onUpdateData({ fileUrl: e.target.value })}
                  className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg pl-9 pr-3.5 py-2 text-xs font-mono text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
                />
                <FiLink className="w-3.5 h-3.5 text-[#5c5c5c] absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Button Label <span className="text-[#bf2131]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Download Technical Brochure (PDF)"
                value={data?.label || ""}
                onChange={(e) => onUpdateData({ label: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Document Description Narrative
              </label>
              <input
                type="text"
                placeholder="Explain what the user will receive upon downloading this file..."
                value={data?.description || ""}
                onChange={(e) => onUpdateData({ description: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-xs text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
            </div>
          </div>
        )}

        {/* TYPE 4: IMAGE + CONTENT */}
        {type === "image-content" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                  Image Asset URL <span className="text-[#bf2131]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={data?.imageUrl || ""}
                  onChange={(e) => onUpdateData({ imageUrl: e.target.value })}
                  className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-xs font-mono text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                  Alt Description
                </label>
                <input
                  type="text"
                  placeholder="Describe image for screen readers"
                  value={data?.alt || ""}
                  onChange={(e) => onUpdateData({ alt: e.target.value })}
                  className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-xs text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                  Layout Alignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateData({ alignment: "image-left" })}
                    className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold border transition-all ${
                      data?.alignment === "image-left" || !data?.alignment
                        ? "bg-[#2b2c2c] text-white border-[#2b2c2c]"
                        : "bg-[#f5f5f5] text-[#2b2c2c] border-[#383939]/30 hover:bg-white"
                    }`}
                  >
                    <FiAlignLeft className="w-4 h-4 text-[#bf2131]" />
                    <span>Image Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateData({ alignment: "image-right" })}
                    className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold border transition-all ${
                      data?.alignment === "image-right"
                        ? "bg-[#2b2c2c] text-white border-[#2b2c2c]"
                        : "bg-[#f5f5f5] text-[#2b2c2c] border-[#383939]/30 hover:bg-white"
                    }`}
                  >
                    <FiAlignRight className="w-4 h-4 text-[#bf2131]" />
                    <span>Image Right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Text Narrative & Caption
              </label>
              <textarea
                rows={6}
                placeholder="Enter paragraph text accompanying the image..."
                value={data?.textContent || ""}
                onChange={(e) => onUpdateData({ textContent: e.target.value })}
                className="w-full flex-1 bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg p-3.5 text-sm text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131] leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TYPE 5: CTA BUTTON */}
        {type === "cta-button" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Button Label <span className="text-[#bf2131]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Get Started Now"
                value={data?.label || ""}
                onChange={(e) => onUpdateData({ label: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Target URL Link <span className="text-[#bf2131]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="/services or https://..."
                  value={data?.link || ""}
                  onChange={(e) => onUpdateData({ link: e.target.value })}
                  className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg pl-9 pr-3.5 py-2 text-xs font-mono text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
                />
                <FiLink className="w-3.5 h-3.5 text-[#5c5c5c] absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Visual Style
              </label>
              <select
                value={data?.style || "primary"}
                onChange={(e) => onUpdateData({ style: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              >
                <option value="primary">🔴 Primary Red (#bf2131)</option>
                <option value="outline">⚪ Dark Outline (#2b2c2c)</option>
              </select>
            </div>
          </div>
        )}

        {/* TYPE 6: INTERACTIVE TABLE SPREADSHEET */}
        {type === "table" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f5f5f5] p-3 rounded-xl border border-[#383939]/20">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Grid Dimensions: {(data?.headers || []).length} Columns ×{" "}
                {(data?.rows || []).length} Rows
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={addTableColumn}
                  className="px-3 py-1.5 bg-[#2b2c2c] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center space-x-1"
                >
                  <FiPlus className="w-3.5 h-3.5 text-[#bf2131]" />
                  <span>Add Column</span>
                </button>
                <button
                  type="button"
                  onClick={addTableRow}
                  className="px-3 py-1.5 bg-[#bf2131] hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center space-x-1"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#383939]/30 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#383939] text-white">
                  <tr>
                    {(data?.headers || []).map((header, colIdx) => (
                      <th
                        key={colIdx}
                        className="p-2 border-r border-white/10 last:border-r-0 min-w-[140px]"
                      >
                        <div className="flex items-center justify-between space-x-1">
                          <input
                            type="text"
                            value={header}
                            onChange={(e) =>
                              updateTableHeader(colIdx, e.target.value)
                            }
                            className="bg-transparent text-white font-bold text-xs focus:outline-none focus:underline w-full placeholder-white/50"
                            placeholder="Header..."
                          />
                          {(data?.headers || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTableColumn(colIdx)}
                              className="text-white/40 hover:text-[#bf2131] transition-colors p-0.5"
                              title="Delete Column"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="w-10 bg-[#2b2c2c] text-center font-mono text-[10px] text-white/50">
                      Del
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#383939]/20 bg-white">
                  {(data?.rows || []).map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-[#f5f5f5]/50 transition-colors"
                    >
                      {row.map((cell, colIdx) => (
                        <td
                          key={colIdx}
                          className="p-2 border-r border-[#383939]/20 last:border-r-0"
                        >
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) =>
                              updateTableCell(rowIdx, colIdx, e.target.value)
                            }
                            className="w-full bg-transparent text-[#2b2c2c] text-xs focus:outline-none focus:bg-[#f5f5f5] p-1 rounded"
                            placeholder="Cell value..."
                          />
                        </td>
                      ))}
                      <td className="text-center p-2 bg-[#f5f5f5]/40">
                        {(data?.rows || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTableRow(rowIdx)}
                            className="text-[#5c5c5c] hover:text-[#bf2131] transition-colors p-1"
                            title="Delete Row"
                          >
                            <FiTrash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TYPE 7: KATEX MATH FORMULA */}
        {type === "math" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                LaTeX Expression String{" "}
                <span className="text-[#bf2131]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., \int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}"
                value={data?.formula || ""}
                onChange={(e) => onUpdateData({ formula: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2.5 text-xs font-mono text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Render Mode
              </label>
              <label className="flex items-center space-x-2.5 bg-[#f5f5f5]/60 border border-[#383939]/30 px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={data?.displayMode !== false}
                  onChange={(e) =>
                    onUpdateData({ displayMode: e.target.checked })
                  }
                  className="w-4 h-4 text-[#bf2131] rounded focus:ring-[#bf2131]"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                  Block Display Mode
                </span>
              </label>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
                Algorithmic Description / Legend
              </label>
              <input
                type="text"
                placeholder="Explain the mathematical model or variables shown above..."
                value={data?.description || ""}
                onChange={(e) => onUpdateData({ description: e.target.value })}
                className="w-full bg-[#f5f5f5]/60 border border-[#383939]/30 rounded-lg px-3.5 py-2 text-xs text-[#2b2c2c] focus:outline-none focus:ring-2 focus:ring-[#bf2131]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionCard;
