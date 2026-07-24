import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiExternalLink,
  FiArrowRight,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiFileText,
} from "react-icons/fi";

// Strictly load KaTeX components dynamically with ssr: false to prevent SSR hydration mismatches
const InlineMath = dynamic(
  () => import("react-katex").then((mod) => mod.InlineMath),
  { ssr: false },
);

const BlockMath = dynamic(
  () => import("react-katex").then((mod) => mod.BlockMath),
  { ssr: false },
);

const SectionRenderer = ({ sections = [] }) => {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  /**
   * INTERNAL HELPER 1: Tokenizes text strings to detect inline ($ ... $) and block ($$ ... $$) KaTeX math.
   * Preserves standard Editor.js inline HTML formatting (bold, italic, links) for non-math segments.
   */
  const renderTextWithMath = (text) => {
    if (!text || typeof text !== "string") return "";

    const mathRegex = /(\$\$.*?\$\$|\$.*?\$)/g;
    const segments = text.split(mathRegex);

    return segments.map((segment, index) => {
      if (segment.startsWith("$$") && segment.endsWith("$$")) {
        const mathContent = segment.slice(2, -2).trim();
        return <BlockMath key={index} math={mathContent} />;
      } else if (segment.startsWith("$") && segment.endsWith("$")) {
        const mathContent = segment.slice(1, -1).trim();
        return <InlineMath key={index} math={mathContent} />;
      }

      return <span key={index} dangerouslySetInnerHTML={{ __html: segment }} />;
    });
  };

  /**
   * INTERNAL HELPER 2: Recursively renders list items (supports simple strings and @editorjs/nested-list structures).
   * Renders nested <ul className="ml-6 list-disc"> or <ol className="ml-6 list-decimal"> cleanly without breaking hierarchy.
   */
  const renderListItem = (item, idx, isOrdered = false) => {
    if (typeof item === "string") {
      return (
        <li key={idx} className="pl-1.5 my-1 leading-relaxed">
          {renderTextWithMath(item)}
        </li>
      );
    }

    if (typeof item === "object" && item !== null) {
      const contentText = item.content || item.text || "";
      const subItems = item.items || [];
      const NestedTag = isOrdered ? "ol" : "ul";
      const nestedStyles = isOrdered
        ? "ml-6 list-decimal space-y-1 mt-1.5 text-base sm:text-lg text-[#2b2c2c]/90 marker:text-[#bf2131] marker:font-bold"
        : "ml-6 list-disc space-y-1 mt-1.5 text-base sm:text-lg text-[#2b2c2c]/90 marker:text-[#bf2131]";

      return (
        <li key={idx} className="pl-1.5 my-1.5 space-y-1.5 leading-relaxed">
          <div className="font-medium text-[#2b2c2c]">
            {renderTextWithMath(contentText)}
          </div>
          {subItems.length > 0 && (
            <NestedTag className={nestedStyles}>
              {subItems.map((sub, sIdx) =>
                renderListItem(sub, sIdx, isOrdered),
              )}
            </NestedTag>
          )}
        </li>
      );
    }

    return null;
  };

  /**
   * INTERNAL HELPER 3: Natively maps and renders Editor.js JSON block arrays using Tailwind CSS.
   */
  const renderEditorBlocks = (blocks = []) => {
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;

    return (
      <div className="space-y-4 font-sans">
        {blocks.map((block, index) => {
          const { type, data, id } = block;
          const blockKey = id || `block-${index}`;

          return (
            <div key={blockKey} className="block-segment">
              {/* Headings (h1 - h6) */}
              {type === "header" &&
                (() => {
                  const level = data?.level || 2;
                  const headerText = renderTextWithMath(data?.text || "");
                  const baseStyles =
                    "font-bold tracking-tight text-[#2b2c2c] mt-6 mb-3";

                  switch (level) {
                    case 1:
                      return (
                        <h1
                          className={`${baseStyles} text-3xl sm:text-4xl font-extrabold border-b border-black/10 pb-3 mt-8`}
                        >
                          {headerText}
                        </h1>
                      );
                    case 2:
                      return (
                        <h2
                          className={`${baseStyles} text-2xl sm:text-3xl border-b border-black/10 pb-2 mt-7`}
                        >
                          {headerText}
                        </h2>
                      );
                    case 3:
                      return (
                        <h3
                          className={`${baseStyles} text-xl sm:text-2xl mt-5`}
                        >
                          {headerText}
                        </h3>
                      );
                    case 4:
                      return (
                        <h4 className={`${baseStyles} text-lg sm:text-xl mt-4`}>
                          {headerText}
                        </h4>
                      );
                    case 5:
                      return (
                        <h5
                          className={`${baseStyles} text-base sm:text-lg font-semibold mt-3`}
                        >
                          {headerText}
                        </h5>
                      );
                    case 6:
                      return (
                        <h6
                          className={`${baseStyles} text-sm sm:text-base font-semibold uppercase tracking-wider text-black/60 mt-3`}
                        >
                          {headerText}
                        </h6>
                      );
                    default:
                      return (
                        <h2 className={`${baseStyles} text-2xl`}>
                          {headerText}
                        </h2>
                      );
                  }
                })()}

              {/* Paragraphs */}
              {type === "paragraph" && (
                <p className="text-base sm:text-lg text-[#2b2c2c]/90 leading-relaxed my-3">
                  {renderTextWithMath(data?.text || "")}
                </p>
              )}

              {/* Lists (Ordered & Unordered with Nested Support) */}
              {(type === "list" || type === "nestedlist") &&
                (() => {
                  const isOrdered = data?.style === "ordered";
                  const items = data?.items || [];
                  const ListTag = isOrdered ? "ol" : "ul";
                  const listStyles = isOrdered
                    ? "list-decimal pl-6 space-y-2 my-4 text-base sm:text-lg text-[#2b2c2c]/90 marker:text-[#bf2131] marker:font-bold"
                    : "list-disc pl-6 space-y-2 my-4 text-base sm:text-lg text-[#2b2c2c]/90 marker:text-[#bf2131]";

                  return (
                    <ListTag className={listStyles}>
                      {items.map((item, idx) =>
                        renderListItem(item, idx, isOrdered),
                      )}
                    </ListTag>
                  );
                })()}

              {/* Quotes */}
              {type === "quote" && (
                <blockquote className="border-l-4 border-[#bf2131] bg-black/5 p-4 sm:p-6 my-6 rounded-r-xl italic text-[#2b2c2c]/90 shadow-sm">
                  <p className="mb-2 text-base sm:text-lg">
                    {renderTextWithMath(data?.text || "")}
                  </p>
                  {data?.caption && (
                    <cite className="block text-xs not-italic text-black/60 font-bold uppercase tracking-wider mt-2">
                      — {renderTextWithMath(data.caption)}
                    </cite>
                  )}
                </blockquote>
              )}

              {/* Table Blocks embedded directly inside Rich Text slices */}
              {type === "table" && (
                <div className="overflow-x-auto my-6 rounded-xl border border-black/10 shadow-sm">
                  <table className="w-full text-left border-collapse text-sm sm:text-base">
                    {data?.withHeadings && data?.content?.length > 0 && (
                      <thead className="bg-[#383939] text-white">
                        <tr>
                          {data.content[0].map((cell, cIdx) => (
                            <th
                              key={cIdx}
                              className="p-3.5 font-semibold tracking-wide border-b border-white/10"
                            >
                              {renderTextWithMath(cell)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody className="divide-y divide-black/10 bg-white">
                      {(data?.withHeadings
                        ? data.content.slice(1)
                        : data?.content || []
                      ).map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={
                            rIdx % 2 === 0
                              ? "bg-white"
                              : "bg-black/[0.02] hover:bg-black/[0.04] transition-colors"
                          }
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-3.5 text-[#2b2c2c]/90 border-r border-black/5 last:border-r-0"
                            >
                              {renderTextWithMath(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * INTERNAL HELPER 4: Resolves styling configuration for callout boxes.
   */
  const getCalloutConfig = (style) => {
    switch (style) {
      case "info":
        return {
          container:
            "border-blue-500 bg-[#383939] text-blue-200 border-l-4 shadow-lg",
          icon: <FiInfo className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />,
          badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        };
      case "warning":
        return {
          container:
            "border-amber-500 bg-[#383939] text-amber-200 border-l-4 shadow-lg",
          icon: (
            <FiAlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          ),
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "success":
        return {
          container:
            "border-green-500 bg-[#383939] text-green-200 border-l-4 shadow-lg",
          icon: (
            <FiCheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
          ),
          badge: "bg-green-500/20 text-green-300 border-green-500/30",
        };
      default:
        return {
          container:
            "border-blue-500 bg-[#383939] text-blue-200 border-l-4 shadow-lg",
          icon: <FiInfo className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />,
          badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        };
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 font-sans">
      {/* Safely inject KaTeX CSS stylesheet */}
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        />
      </Head>

      {sections.map((section, index) => {
        const { id, type, data } = section;
        const sectionKey = id || `slice-${index}`;

        return (
          <motion.section
            key={sectionKey}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="section-slice w-full"
          >
            {/* TYPE 1: RICH TEXT SLICE */}
            {type === "rich-text" && (
              <div className="max-w-4xl mx-auto space-y-4">
                {data?.heading && (
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b2c2c] tracking-tight border-b border-black/10 pb-3">
                    {data.heading}
                  </h2>
                )}

                {data?.content && (
                  <div
                    className="prose max-w-none text-base sm:text-lg text-[#2b2c2c]/90 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                  />
                )}

                {data?.blocks &&
                  Array.isArray(data.blocks) &&
                  data.blocks.length > 0 && (
                    <div className="pt-2">
                      {renderEditorBlocks(data.blocks)}
                    </div>
                  )}
              </div>
            )}

            {/* TYPE 2: CALLOUT BOX SLICE */}
            {type === "callout-box" &&
              (() => {
                const styleConfig = getCalloutConfig(data?.style);
                return (
                  <div
                    className={`max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl border ${styleConfig.container} transition-all`}
                  >
                    <div className="flex items-start space-x-4 sm:space-x-5">
                      {styleConfig.icon}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          {data?.title ? (
                            <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-snug">
                              {data.title}
                            </h3>
                          ) : (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${styleConfig.badge}`}
                            >
                              {data?.style || "Info"} Notice
                            </span>
                          )}
                        </div>

                        <div className="text-sm sm:text-base leading-relaxed text-white/90 whitespace-pre-wrap">
                          {renderTextWithMath(data?.text || "")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* TYPE 3: FILE DOWNLOAD BUTTON SLICE */}
            {type === "file-download" && (
              <div className="max-w-4xl mx-auto bg-[#383939] border border-[#bf2131] p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all hover:shadow-2xl">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-widest text-[#bf2131] bg-black/30 px-2.5 py-1 rounded">
                    <FiFileText className="w-3.5 h-3.5 shrink-0" />
                    <span>Document Attachment</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                    {data?.label || "Download Attached Document"}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {data?.description ||
                      "Download attached document to view detailed technical specifications, architectural diagrams, and SLA guidelines."}
                  </p>
                </div>

                <a
                  href={data?.fileUrl || "#"}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-[#bf2131] hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 text-sm uppercase tracking-wider w-full sm:w-auto justify-center"
                >
                  <FiDownload className="w-5 h-5 animate-bounce" />
                  <span>{data?.label || "Download File"}</span>
                </a>
              </div>
            )}

            {/* TYPE 4: SMART IMAGE RENDERING SLICE (Full-Width Hero vs. Split Column) */}
            {type === "image-content" &&
              (() => {
                const titleText = data?.title || data?.heading || "";
                const bodyText = data?.text || data?.textContent || "";
                const isFullWidthHero = !titleText.trim() && !bodyText.trim();

                // CASE A: Full-Width Hero Banner (When BOTH title and text are empty/falsy)
                if (isFullWidthHero) {
                  return (
                    <div className="w-full">
                      {data?.imageUrl && (
                        <img
                          src={data.imageUrl}
                          alt={data?.alt || "Hero banner"}
                          className="w-full h-[40vh] md:h-[65vh] object-cover rounded-xl shadow-2xl my-6"
                        />
                      )}
                    </div>
                  );
                }

                // CASE B: Split 2-Column Section (When title OR text exists)
                return (
                  <div className="max-w-6xl mx-auto py-4 sm:py-6">
                    <div
                      className={`flex flex-col md:flex-row gap-8 lg:gap-12 items-center ${
                        data?.alignment === "image-right"
                          ? "md:flex-row-reverse"
                          : ""
                      }`}
                    >
                      {/* Image Asset Column */}
                      <div className="w-full md:w-1/2">
                        {data?.imageUrl ? (
                          <img
                            src={data.imageUrl}
                            alt={data?.alt || titleText || "Section image"}
                            className="w-full h-auto max-h-[480px] object-cover rounded-xl shadow-lg"
                          />
                        ) : (
                          <div className="w-full h-64 bg-black/5 rounded-xl border border-dashed border-black/20 flex items-center justify-center text-xs text-black/50">
                            No image asset provided
                          </div>
                        )}
                      </div>

                      {/* Content Narrative Column */}
                      <div className="w-full md:w-1/2 space-y-4">
                        {titleText && (
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b2c2c] tracking-tight leading-tight">
                            {renderTextWithMath(titleText)}
                          </h2>
                        )}

                        {bodyText && (
                          <div className="text-base sm:text-lg text-[#2b2c2c]/90 leading-relaxed whitespace-pre-wrap">
                            {renderTextWithMath(bodyText)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* TYPE 5: CTA BUTTON SLICE */}
            {type === "cta-button" && (
              <div className="max-w-4xl mx-auto py-4 flex items-center justify-center">
                <Link
                  href={data?.link || data?.url || "#"}
                  className={`group inline-flex items-center space-x-2.5 px-8 py-4 rounded-xl font-bold text-sm sm:text-base tracking-wide uppercase transition-all transform hover:-translate-y-0.5 shadow-lg ${
                    data?.style === "outline"
                      ? "bg-transparent hover:bg-[#2b2c2c] text-[#2b2c2c] hover:text-white border-2 border-[#2b2c2c]"
                      : "bg-[#bf2131] hover:bg-red-700 text-white"
                  }`}
                >
                  <span>{data?.label || "Click Here"}</span>
                  {(data?.link || data?.url) &&
                  (data.link || data.url).startsWith("http") ? (
                    <FiExternalLink className="w-4 h-4 transform group-hover:scale-110 transition-transform" />
                  ) : (
                    <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  )}
                </Link>
              </div>
            )}

            {/* TYPE 6: TABLE SPREADSHEET SLICE */}
            {type === "table" && (
              <div className="max-w-5xl mx-auto space-y-3">
                <div className="overflow-x-auto rounded-2xl border border-black/10 shadow-sm bg-white">
                  <table className="w-full text-left border-collapse text-sm sm:text-base">
                    {data?.headers &&
                      Array.isArray(data.headers) &&
                      data.headers.length > 0 && (
                        <thead className="bg-[#383939] text-white font-semibold">
                          <tr>
                            {data.headers.map((header, hIdx) => (
                              <th
                                key={hIdx}
                                className="p-4 border-r border-white/10 last:border-r-0 tracking-wide"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}

                    <tbody className="divide-y divide-black/10">
                      {data?.rows &&
                      Array.isArray(data.rows) &&
                      data.rows.length > 0 ? (
                        data.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={
                              rIdx % 2 === 0
                                ? "bg-white"
                                : "bg-black/[0.02] hover:bg-black/[0.04] transition-colors"
                            }
                          >
                            {Array.isArray(row) &&
                              row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="p-4 text-[#2b2c2c]/90 border-r border-black/5 last:border-r-0 font-medium"
                                >
                                  {cell}
                                </td>
                              ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={data?.headers?.length || 1}
                            className="p-8 text-center text-black/50 italic"
                          >
                            No table data rows populated.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TYPE 7: KATEX MATH FORMULA SLICE */}
            {type === "math" && (
              <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-black/10 shadow-sm text-center space-y-4">
                <div className="py-2 overflow-x-auto text-lg sm:text-2xl text-[#2b2c2c]">
                  {data?.displayMode !== false ? (
                    <BlockMath math={data?.formula || "E = mc^2"} />
                  ) : (
                    <InlineMath math={data?.formula || "E = mc^2"} />
                  )}
                </div>

                {data?.description && (
                  <p className="text-xs sm:text-sm text-black/60 italic font-medium max-w-xl mx-auto border-t border-black/10 pt-3">
                    {data.description}
                  </p>
                )}
              </div>
            )}
          </motion.section>
        );
      })}
    </div>
  );
};

export default SectionRenderer;
