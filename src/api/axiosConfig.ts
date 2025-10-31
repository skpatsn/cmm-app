

// src/api/axiosInstance.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

//  Attach JWT token before each request
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("jwt_access"); // match your login key name
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Failed to attach token:", err);
  }
  return config;
});

//  Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized — JWT may be expired or invalid.");
      // Optional: trigger re-login or refresh token
    }
    return Promise.reject(error);
  }
);

export default api;








// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
//   headers: { "Content-Type": "application/json" },
//   timeout: 15000,
// });

// api.interceptors.request.use(async (config) => {
//   const tokenData = await AsyncStorage.getItem("jwt_access"); // store JWT as 'jwt_access'
//   if (tokenData) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${tokenData}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.warn("Unauthorized! JWT may be expired.");
//       // optionally redirect to login
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

