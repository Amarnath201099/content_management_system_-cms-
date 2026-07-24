import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../store/slices/authSlice";
import {
  FiLogIn,
  FiLock,
  FiMail,
  FiAlertCircle,
  FiBookOpen,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading, error } = useSelector(
    (state) => state.auth,
  );

  // Ephemeral React local state for form inputs and visibility toggle
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Role-based routing upon authentication (handles pre-hydrated HTTP-only cookie sessions)
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsRedirecting(true);
      if (user.role === "admin" || user.role === "editor") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, router]);

  // Clear any existing Redux auth errors on unmount or initial render
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear error banner immediately when user modifies input fields
  const handleInputChange = (setter, value) => {
    if (error) {
      dispatch(clearError());
    }
    setter(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      const payload = await dispatch(
        loginUser({ email: email.trim(), password }),
      ).unwrap();

      const loggedInUser = payload.user;
      setIsRedirecting(true);

      if (loggedInUser.role === "admin" || loggedInUser.role === "editor") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login attempt failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans select-none">
      {/* Back to Public Page Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 px-4 sm:px-0">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-text hover:text-brand-red transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Public Page</span>
        </Link>
      </div>

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center shadow-lg">
            <FiBookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-dark-card tracking-tight">
          Sign In to DevDocs
        </h2>
        <p className="mt-2 text-center text-sm text-muted-text">
          Access your personalized dashboard, documentation tracking, or editor
          workspace.
        </p>
      </div>

      {/* Card Body */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-dark-card text-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-muted-text/20">
          {/* Error Banner */}
          {error && !isRedirecting && (
            <div className="mb-6 bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start space-x-3 animate-in fade-in duration-200">
              <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-light-bg/80"
              >
                Email Address
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiMail className="h-4 w-4 text-muted-text" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading || isRedirecting}
                  value={email}
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  placeholder="you@domain.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-dark-nav border border-muted-text/30 rounded-lg text-white placeholder-muted-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-light-bg/80"
              >
                Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 text-muted-text" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading || isRedirecting}
                  value={password}
                  onChange={(e) =>
                    handleInputChange(setPassword, e.target.value)
                  }
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-dark-nav border border-muted-text/30 rounded-lg text-white placeholder-muted-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-text hover:text-white transition-colors focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || isRedirecting}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FiLogIn className="w-4 h-4" />
                <span>
                  {isRedirecting
                    ? "Redirecting..."
                    : loading
                      ? "Authenticating..."
                      : "Sign In"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
