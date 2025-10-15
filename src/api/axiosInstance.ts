// src/api/axiosInstance.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const getBaseURL = () => {
  // Web uses 127.0.0.1, devices use LAN IP — adjust if you test on device.
  if (Platform.OS === "web") return "http://127.0.0.1:8000/api/";
  return "http://127.0.0.1:8000/api/"; // change to your machine LAN IP if testing on phone
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // allowAbsoluteUrls true if needed by axios shim in RN web
});

// Interceptor: attach latest token from AsyncStorage on every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token"); // IMPORTANT: key = "token"
      if (token) {
        // DRF TokenAuthentication expects: "Token <token>"
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Token ${token}`;
      } else {
        // ensure header removed if no token
        if (config.headers) delete config.headers.Authorization;
      }
    } catch (err) {
      // silent fallback
      console.warn("axios interceptor read token failed", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
