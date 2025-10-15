// src/api/axiosConfig.ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // Change to your production API URL if needed
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor to attach token
api.interceptors.request.use(
  async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    try {
      const tokenData = await AsyncStorage.getItem("user");
      let token: string | null = null;

      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        token = parsed.token ?? null;
      }

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Token ${token}`;
      } else {
        console.warn("⚠️ No token found in AsyncStorage.");
      }
    } catch (error) {
      console.error("Failed to attach token:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response) {
      console.error("API Response Error:", error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Optional: auto-logout user or refresh token
        console.warn("Unauthorized! Token may be invalid.");
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;



// // src/api/axiosConfig.ts
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
//   headers: { "Content-Type": "application/json" },
//   timeout: 15000, // 15 seconds timeout
// });

// // Attach token from AsyncStorage (matches AuthContext "user" key)
// api.interceptors.request.use(async (config) => {
//   try {
//     const tokenData = await AsyncStorage.getItem("user"); // ✅ stored as JSON in AuthContext
//     let token: string | null = null;

//     if (tokenData) {
//       const parsed = JSON.parse(tokenData);
//       token = parsed.token ?? null;
//     }

//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Token ${token}`;
//     } else {
//       console.warn("⚠️ No token found in AsyncStorage.");
//     }
//   } catch (error) {
//     console.error("Failed to attach token:", error);
//   }

//   return config;
// });

// // Optional: global response interceptor for handling 401 / logout
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       console.warn("⚠️ Token expired or unauthorized request.");
//       // Optional: you can trigger logout from AuthContext here if needed
//       // Example:
//       // const { logout } = useContext(AuthContext);
//       // await logout();
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;





// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
//   headers: { "Content-Type": "application/json" },
// });

// api.interceptors.request.use(async (config) => {
//   const user = await AsyncStorage.getItem("user");
//   if (user) {
//     const { token } = JSON.parse(user);
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;




// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
//   headers: { "Content-Type": "application/json" },
// });

// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("userToken");
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Token ${token}`;
//   }
//   return config;
// });

// export default api;
