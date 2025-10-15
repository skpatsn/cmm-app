import axios from "axios";
import { BASE_URL } from "../constants/config";

export const loginUser = async (username: string, password: string, role: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/accounts/login/`, {
      username,
      password,
      role,
    });
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error?.response?.data || error.message);
    return { message: "Server error" };
  }
};
