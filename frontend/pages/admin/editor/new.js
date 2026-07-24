import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import PageBuilder from "../../../components/admin/page-builder/PageBuilder";
import { fetchDocuments } from "../../../store/slices/contentSlice";
import { FiRefreshCw } from "react-icons/fi";

const CreateNewPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Extract loading state from auth slice
  const {
    isAuthenticated,
    user,
    loading: authLoading,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authLoading) return; // Wait for session verification on refresh

    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (user && user.role !== "admin" && user.role !== "editor") {
      router.push("/");
    } else {
      dispatch(fetchDocuments({ limit: 100, published: "all" }));
    }
  }, [isAuthenticated, user, authLoading, router, dispatch]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center space-y-3 font-sans">
        <FiRefreshCw className="w-8 h-8 text-[#bf2131] animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#2b2c2c]">
          Loading Editor Workspace...
        </p>
      </div>
    );
  }

  return (
    <PageBuilder
      initialData={null}
      onSaveSuccess={() => router.push("/admin/dashboard")}
      onCancel={() => router.push("/admin/dashboard")}
    />
  );
};

export default CreateNewPage;
