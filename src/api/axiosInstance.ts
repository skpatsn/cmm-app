

// src/api/axiosInstance.ts
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    let token: string | null = null;

    if (Platform.OS === "web") {
      //  Web uses localStorage
      token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    } else {
      //  Mobile uses AsyncStorage
      token = await AsyncStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;






// // src/api/axiosInstance.ts
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Platform } from "react-native";

// type SafeAxiosConfig = Parameters<typeof axios.interceptors.request.use>[0] extends (
//   onFulfilled: infer F
// ) => any
//   ? F extends (config: infer C) => any
//     ? C
//     : any
//   : any;

// const getBaseURL = () =>
//   Platform.OS === "web"
//     ? "http://127.0.0.1:8000/api/"
//     : "http://127.0.0.1:8000/api/";

// const api = axios.create({
//   baseURL: getBaseURL(),
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// // ✅ Request interceptor
// api.interceptors.request.use(
//   async (config: SafeAxiosConfig) => {
//     const token = await AsyncStorage.getItem("token");
//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     } else if (config.headers) {
//       delete config.headers.Authorization;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;

