import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";

const EditorComponent = ({ initialData, onChange }) => {
  const editorRef = useRef(null);
  const isReady = useRef(false);

  useEffect(() => {
    // Initialize Editor.js only if it hasn't been initialized already
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editorjs-container",
        placeholder:
          "Type or paste your documentation here. Use $ ... $ for inline KaTeX math formulas or $$ ... $$ for display block math...",
        data: initialData || { blocks: [] },
        tools: {
          header: {
            class: Header,
            inlineToolbar: ["link"],
            config: {
              placeholder: "Section Header",
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
              withHeadings: true,
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: "Enter quote text or highlight...",
              captionPlaceholder: "Quote author or reference...",
            },
          },
        },
        onReady: () => {
          isReady.current = true;
        },
        onChange: async (api) => {
          if (onChange && isReady.current) {
            try {
              const savedData = await api.saver.save();
              onChange(savedData);
            } catch (error) {
              console.error("Editor.js save extraction error:", error);
            }
          }
        },
      });

      editorRef.current = editor;
    }

    // Cleanup function on component unmount
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
        isReady.current = false;
      }
    };
  }, []); // Run once on mount

  return (
    <div className="w-full min-h-[400px] bg-white border border-muted-text/30 rounded-xl p-6 shadow-sm focus-within:ring-2 focus-within:ring-brand-red focus-within:border-transparent transition-all">
      <div id="editorjs-container" className="prose max-w-none font-sans" />
    </div>
  );
};

export default EditorComponent;
