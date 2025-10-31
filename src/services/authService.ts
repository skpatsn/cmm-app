
// src/services/authService.ts
import axios from "axios";
import { BASE_URL } from "../constants/config";

/**
 * Login user via Django SimpleJWT endpoint
 */
export const loginUser = async (username: string, password: string, role: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/token/`, {
      username,
      password,
    });

    const { access, refresh } = response.data;

    // Optional: if your backend still uses role logic, handle that separately
    return {
      token: access,
      refreshToken: refresh,
      username,
      role,
    };
  } catch (error: any) {
    console.error("Login error:", error?.response?.data || error.message);
    return {
      message: error.response?.data?.detail || "Invalid credentials",
    };
  }
};

/**
 * Refresh token when expired
 */
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
      refresh: refreshToken,
    });
    return response.data.access;
  } catch (error) {
    console.error("Token refresh failed:", error?.response?.data || error.message);
    return null;
  }
};






// import axios from "axios";
// import { BASE_URL } from "../constants/config";

// export const loginUser = async (username: string, password: string, role: string) => {
//   try {
//     const response = await axios.post(`${BASE_URL}/accounts/login/`, {
//       username,
//       password,
//       role,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Login error:", error?.response?.data || error.message);
//     return { message: "Server error" };
//   }
// };
