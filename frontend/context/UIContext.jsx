import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";

const UIContext = createContext(null);

/**
 * Custom Hook: Access the floating toast notification stack globally.
 * Usage: const showToast = useToast(); showToast('Saved successfully!', 'success');
 */
export const useToast = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useToast must be used within a UIProvider");
  }
  return context.showToast;
};

/**
 * Custom Hook: Access the custom confirmation modal overlay globally.
 * Usage: const showConfirm = useModal(); showConfirm({ title: 'Delete?', message: '...', onConfirm: () => {} });
 */
export const useModal = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useModal must be used within a UIProvider");
  }
  return context.showConfirm;
};

export const UIProvider = ({ children }) => {
  // --- TOAST NOTIFICATION STATE & ACTIONS ---
  const [toasts, setToasts] = useState([]);

  // 1. Prevent SSR hydration mismatch for dynamic portals/toasts
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

      // Automatically dismiss toast after 5,000 milliseconds
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast],
  );

  // --- CONFIRMATION MODAL STATE & ACTIONS ---
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm Action",
    cancelText: "Cancel",
    onConfirm: null,
    onCancel: null,
  });

  const showConfirm = useCallback(
    ({
      title,
      message,
      onConfirm,
      onCancel,
      confirmText = "Confirm Action",
      cancelText = "Cancel",
    }) => {
      setModalState({
        isOpen: true,
        title: title || "Are you sure?",
        message: message || "Please confirm to proceed with this action.",
        confirmText,
        cancelText,
        onConfirm: typeof onConfirm === "function" ? onConfirm : null,
        onCancel: typeof onCancel === "function" ? onCancel : null,
      });
    },
    [],
  );

  const handleConfirmClick = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    closeModal();
  };

  const handleCancelClick = () => {
    if (modalState.onCancel) {
      modalState.onCancel();
    }
    closeModal();
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Helper to resolve toast border and icon styling by type
  const getToastStyling = (type) => {
    switch (type) {
      case "success":
        return {
          border: "border-emerald-500",
          icon: <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
        };
      case "error":
        return {
          border: "border-[#bf2131]",
          icon: <FiAlertCircle className="w-5 h-5 text-[#bf2131] shrink-0" />,
        };
      case "info":
      default:
        return {
          border: "border-blue-500",
          icon: <FiInfo className="w-5 h-5 text-blue-400 shrink-0" />,
        };
    }
  };

  return (
    <UIContext.Provider value={{ showToast, showConfirm }}>
      {/* 1. CRITICAL: {children} MUST be rendered first and identically on server and client */}
      {children}

      {/* 2. Wrap client-only portals in isMounted to completely prevent hydration mismatches */}
      {isMounted && (
        <>
          {/* TOP-RIGHT FLOATING TOAST STACK */}
          <div className="fixed top-4 right-4 z-[60] space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0 font-sans select-none">
            <AnimatePresence mode="popLayout">
              {toasts.map((toast) => {
                const styling = getToastStyling(toast.type);

                return (
                  <motion.div
                    key={toast.id}
                    layout
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`bg-[#383939] text-white p-4 rounded-lg shadow-2xl border-l-4 ${styling.border} pointer-events-auto flex justify-between items-center space-x-3`}
                  >
                    <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                      {styling.icon}
                      <p className="text-xs sm:text-sm font-medium text-white/90 leading-snug break-words flex-1">
                        {toast.message}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeToast(toast.id)}
                      className="text-white/60 hover:text-white p-1 rounded transition-colors shrink-0"
                      aria-label="Close notification"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* CUSTOM CONFIRMATION MODAL OVERLAY */}
          <AnimatePresence>
            {modalState.isOpen && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 font-sans select-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-[#2b2c2c] border border-[#383939] rounded-xl max-w-md w-full p-6 text-white space-y-6 shadow-2xl relative overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#bf2131]/15 border border-[#bf2131]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <FiAlertTriangle className="w-5 h-5 text-[#bf2131]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                        {modalState.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                        {modalState.message}
                      </p>
                    </div>
                  </div>

                  {/* Modal Action Controls */}
                  <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className="px-4 py-2.5 bg-[#383939] hover:bg-white/15 text-white text-xs font-semibold uppercase tracking-wider rounded-lg border border-white/20 transition-colors shadow-sm"
                    >
                      {modalState.cancelText}
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmClick}
                      className="px-5 py-2.5 bg-[#bf2131] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      {modalState.confirmText}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </UIContext.Provider>
  );
};
