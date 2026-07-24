import React from "react";
import dynamic from "next/dynamic";

// Rule 3: Load Editor.js client component with ssr: false to prevent window is not defined errors
const ClientEditor = dynamic(() => import("./EditorComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-light-bg border border-muted-text/20 rounded-xl p-8 flex flex-col items-center justify-center space-y-3 animate-pulse">
      <div className="w-8 h-8 rounded-full border-4 border-brand-red border-t-transparent animate-spin"></div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
        Initializing Dynamic Block Editor...
      </p>
    </div>
  ),
});

const EditorWrapper = ({ initialData, onChange }) => {
  return <ClientEditor initialData={initialData} onChange={onChange} />;
};

export default EditorWrapper;
