import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import PageBuilder from "../../../components/admin/page-builder/PageBuilder";
import { fetchDocuments } from "../../../store/slices/contentSlice";
import api from "../../../utils/api";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

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
    if (!id || authLoading || !isAuthenticated) return;
    setLoadingDoc(true);
    api
      .get(`/content/${id}`)
      .then((res) => {
        setInitialData(res.data.data);
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
  }, [id, authLoading, isAuthenticated]);

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
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl border border-red-200 max-w-md w-full text-center space-y-4 shadow-lg">
          <FiAlertCircle className="w-10 h-10 text-[#bf2131] mx-auto" />
          <h3 className="font-extrabold text-lg text-[#2b2c2c]">
            Failed to Load Document
          </h3>
          <p className="text-xs text-[#5c5c5c]">{error}</p>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="w-full py-2.5 bg-[#383939] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
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
