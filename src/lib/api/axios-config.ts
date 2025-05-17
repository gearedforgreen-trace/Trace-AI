import axios from "axios";

// Create a base API URL from environment variable
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
