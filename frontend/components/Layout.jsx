import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchDocuments } from "../store/slices/contentSlice";
import Navbar from "./nav/Navbar";
import Footer from "./Footer";

const Layout = ({ children, showSidebar = true }) => {
  const dispatch = useDispatch();

  // Ensure sidebar documentation list is pre-populated
  useEffect(() => {
    dispatch(fetchDocuments({ limit: 100, published: true }));
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-light-bg">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <main
          className={`flex-1 p-6 sm:p-8 overflow-x-hidden ${showSidebar ? "bg-white shadow-sm" : ""}`}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
