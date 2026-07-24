import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // Automatically sends and receives HTTP-Only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
