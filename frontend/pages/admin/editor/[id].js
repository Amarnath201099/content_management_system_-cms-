import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import PageBuilder from "../../../components/admin/page-builder/PageBuilder";
import { fetchDocuments } from "../../../store/slices/contentSlice";
import api from "../../../utils/api";
import { FiRefreshCw, FiAlertCircle, FiShield } from "react-icons/fi";

const EditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    user,
    loading: authLoading,
  } = useSelector((state) => state.auth);

  const [initialData, setInitialData] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (user && user.role !== "admin" && user.role !== "editor") {
      router.push("/");
    } else {
      dispatch(fetchDocuments({ limit: 100, published: "all" }));
    }
  }, [isAuthenticated, user, authLoading, router, dispatch]);

  useEffect(() => {
    if (!id || authLoading || !isAuthenticated || !user) return;
    setLoadingDoc(true);

    api
      .get(`/content/${id}`)
      .then((res) => {
        const doc = res.data.data;

        /**
         * CRITICAL FIX: RBAC Permission Guard
         * If the user is an Editor (not an Admin), strictly verify that their ID
         * matches either the original author or someone in the assignedEditors array!
         */
        if (user.role === "editor") {
          const userId = user.id || user._id;

          // Check author match
          const authorId =
            typeof doc.author === "object" ? doc.author?._id : doc.author;
          const isAuthor = authorId?.toString() === userId?.toString();

          // Check assigned editors match
          const isAssigned = (doc.assignedEditors || []).some((ed) => {
            const edId = typeof ed === "object" ? ed?._id : ed;
            return edId?.toString() === userId?.toString();
          });

          // Block access if neither condition is met
          if (!isAuthor && !isAssigned) {
            setError(
              "Access Denied: You have not been assigned authoring permissions for this document.",
            );
            setInitialData(null);
            return;
          }
        }

        setInitialData(doc);
        setError(null);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load document for editing.",
        );
      })
      .finally(() => {
        setLoadingDoc(false);
      });
  }, [id, authLoading, isAuthenticated, user]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center space-y-3 font-sans">
        <FiRefreshCw className="w-8 h-8 text-[#bf2131] animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
          Verifying Editor Session...
        </p>
      </div>
    );
  }

  if (loadingDoc) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center space-y-3 font-sans">
        <FiRefreshCw className="w-8 h-8 text-[#bf2131] animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
          Loading Document Slices...
        </p>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4 font-sans select-none animate-in zoom-in-95 duration-200">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-red-200 max-w-md w-full text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-[#bf2131] flex items-center justify-center mx-auto shadow-inner">
            {error.includes("Access Denied") ? (
              <FiShield className="w-7 h-7" />
            ) : (
              <FiAlertCircle className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="font-extrabold text-xl text-[#2b2c2c]">
              {error.includes("Access Denied")
                ? "Unauthorized Workspace"
                : "Failed to Load Document"}
            </h3>
            <p className="text-xs text-[#5c5c5c] leading-relaxed max-w-sm mx-auto">
              {error}
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/dashboard")}
            className="w-full py-3 bg-[#383939] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageBuilder
      initialData={initialData}
      onSaveSuccess={() => router.push("/admin/dashboard")}
      onCancel={() => router.push("/admin/dashboard")}
    />
  );
};

export default EditPage;
