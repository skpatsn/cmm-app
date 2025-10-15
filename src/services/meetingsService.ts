// src/services/meetingsService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://127.0.0.1:8000/api/';

// Read token from storage for every API call
// const getAuthHeaders = async () => {
//   const storedUser = await AsyncStorage.getItem("user");
//   if (!storedUser) {
//     console.log("No stored user found");
//     return {};
//   }
//   const { token } = JSON.parse(storedUser);
//   return { Authorization: `Bearer ${token}` };
// };
const getAuthHeaders = async () => {
  const storedUser = await AsyncStorage.getItem("user");
  if (!storedUser) {
    console.log("No stored user found");
    return {};
  }
  const { token } = JSON.parse(storedUser);
  return { Authorization: `Token ${token}` }; // <--- DRF TokenAuthentication requires 'Token'
};
export const getMeetingsForUser = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}meetings/my/`, { headers });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error fetching user meetings:", error);
    return [];
  }
};

export const getUpcomingMeetings = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}meetings/upcoming/`, { headers });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching upcoming meetings:', error);
    return [];
  }
};

export const getCompletedMeetings = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}meetings/completed/`, { headers });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching completed meetings:', error);
    return [];
  }
};
