// src/utils/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RootNavigation from "../navigation/RootNavigator"; // optional helper RootNavigator
import { Alert } from "react-native";

const API_BASE = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token dynamically before each request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      Alert.alert("Session expired", "Please login again.");
      RootNavigation.navigate("Login");
    }
    return Promise.reject(err);
  }
);

export default api;
