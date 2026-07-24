import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async Thunk: Fetch Navigation Tree (Lightweight published hierarchy for Navbar)
export const fetchNavigation = createAsyncThunk(
  "content/fetchNavigation",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/content/navigation");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
      );
    }
  },
);

// Async Thunk: Fetch All Documents (with pagination, filtering, and search)
export const fetchDocuments = createAsyncThunk(
  "content/fetchDocuments",
  async (
    { search = "", page = 1, limit = 50, published = "all" },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get("/content", {
        params: { search, page, limit, published },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
      );
    }
  },
);

// Async Thunk: Fetch Single Document by Slug
export const fetchDocumentBySlug = createAsyncThunk(
  "content/fetchDocumentBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/content/${slug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
      );
    }
  },
);

const initialState = {
  navigationTree: [],
  documents: [],
  activeDocument: null,
  searchQuery: "",
  page: 1,
  totalPages: 1,
  totalDocs: 0,
  loading: false,
  error: null,
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.page = 1; // Reset to first page on search query change
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearActiveDocument: (state) => {
      state.activeDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Navigation Tree
      .addCase(fetchNavigation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNavigation.fulfilled, (state, action) => {
        state.loading = false;
        state.navigationTree = action.payload.data;
      })
      .addCase(fetchNavigation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Documents List
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.data;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalDocs = action.payload.total;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Document
      .addCase(fetchDocumentBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.activeDocument = action.payload.data;
      })
      .addCase(fetchDocumentBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.activeDocument = null;
      });
  },
});

export const { setSearchQuery, setPage, clearActiveDocument } =
  contentSlice.actions;
export default contentSlice.reducer;
