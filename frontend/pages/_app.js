import React, { useEffect } from "react";
import App from "next/app";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../store/store";
import { syncAuthState, fetchCurrentUser } from "../store/slices/authSlice";
import { UIProvider } from "../context/UIContext";
import axios from "axios";
import "../styles/globals.css";

// Client-side hydration helper to ensure session persistence across client transitions
const AuthHydrationWrapper = ({ children, initialUser }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // If no initial SSR session exists and Redux is not authenticated, verify via API
    if (!initialUser && !isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, initialUser, isAuthenticated]);

  return <>{children}</>;
};

function MyApp({ Component, pageProps }) {
  /**
   * CRITICAL HYDRATION FIX:
   * Synchronously pre-populate Redux store on BOTH Server and Client hydration.
   * Removing `typeof window === 'undefined'` ensures the browser hydrates against
   * the exact same authenticated Redux state that Node.js used during SSR!
   */
  if (pageProps.initialUser) {
    store.dispatch(syncAuthState({ user: pageProps.initialUser }));
  }

  return (
    <Provider store={store}>
      <UIProvider>
        <AuthHydrationWrapper initialUser={pageProps.initialUser}>
          <Component {...pageProps} />
        </AuthHydrationWrapper>
      </UIProvider>
    </Provider>
  );
}

// Server-Side Session Interceptor for Next.js Pages Router
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  let initialUser = null;

  // Execute strictly on the Node.js server during initial document load
  if (typeof window === "undefined" && appContext.ctx.req) {
    const cookieHeader = appContext.ctx.req.headers.cookie;

    if (cookieHeader) {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

        // Forward the incoming HTTP-only cookie from Next.js SSR to Express backend
        const response = await axios.get(`${apiUrl}/auth/me`, {
          headers: {
            Cookie: cookieHeader,
          },
          withCredentials: true,
        });

        if (response.data && response.data.success) {
          initialUser = response.data.user;
        }
      } catch (error) {
        // Cookie expired, invalid, or no active session exists
        initialUser = null;
      }
    }
  }

  return {
    pageProps: {
      ...appProps.pageProps,
      initialUser,
    },
  };
};

export default MyApp;
