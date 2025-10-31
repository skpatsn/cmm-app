



// src/services/meetingsService.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://127.0.0.1:8000/api/";

const getAuthHeaders = async () => {
  const storedUser = await AsyncStorage.getItem("user");
  if (!storedUser) return {};
  const { token } = JSON.parse(storedUser);
  return { Authorization: `Token ${token}` };
};

// Fetch all meetings for current user
export const getMeetingsForUser = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}meetings/`, { headers });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error fetching user meetings:", error);
    return [];
  }
};
 
// ✅ Fetch only pending meetings (for HO/MGMT)
export const getPendingMeetings = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}meetings/pending/`, { headers });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error fetching pending meetings:", error);
    return [];
  }
};

// Approve a meeting
export const approveMeeting = async (meetingId: number, remarks = "") => {
  try {
    const headers = await getAuthHeaders();
    const payload = { approval: "APPROVED", remarks };
    const response = await axios.post(`${BASE_URL}meetings/${meetingId}/approve/`, payload, { headers });
    return response.data;
  } catch (error) {
    console.error("❌ Error approving meeting:", error);
    throw error;
  }
};

// Create new meeting
export const createMeeting = async (meetingData: any) => {
  try {
    const headers = await getAuthHeaders();
    const { status, ...payload } = meetingData;
    const response = await axios.post(`${BASE_URL}meetings/`, payload, { headers });
    return response.data;
  } catch (error: any) {
    console.error("❌ Error creating meeting:", error.response?.data || error.message);
    throw error;
  }
};

// Optional interface for clarity
export interface Meeting {
  id: number;
  meeting_id?: string;
  meeting_title?: string;
  meeting_date?: string;
  status?: string;
  approval_status?: string;
  client_name?: string;
  contact_person?: string;
  start_time?: string;
  [key: string]: any;
}




















// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useCallback, useEffect } from 'react';
// import api from '../api/axiosConfig';
// const BASE_URL = 'http://127.0.0.1:8000/api/';

// const getAuthHeaders = async () => {
//   const storedUser = await AsyncStorage.getItem("user");
//   if (!storedUser) return {};
//   const { token } = JSON.parse(storedUser);
//   return { Authorization: `Token ${token}` }; // DRF TokenAuth
// };

// // Fetch meetings visible to user
// export const getMeetingsForUser = async () => {
//   try {
//     const headers = await getAuthHeaders();
//     const response = await axios.get(`${BASE_URL}meetings/`, { headers });
//     return Array.isArray(response.data) ? response.data : [];
//   } catch (error) {
//     console.error('❌ Error fetching user meetings:', error);
//     return [];
//   }
// };

// // Fetch pending meetings (for HO/MGMT approval)
// // export const getPendingMeetings = async () => {
// //   try {
// //     const headers = await getAuthHeaders();
// //     const response = await axios.get(`${BASE_URL}meetings/pending/`, { headers });
// //     return Array.isArray(response.data) ? response.data : [];
// //   } catch (error) {
// //     console.error('❌ Error fetching pending meetings:', error);
// //     return [];
// //   }
// // };
//   export const getPendingMeetings = useCallback(async () => {
//     try {
//       const res = await api.get("/meetings");
//       return res.data;

//      } catch (error) {
//     console.error("Error fetching pending meetings:", error);
//     return []; // ✅ return empty array to keep types happy
//   }
//   }, []); // no changing dependencies

//   useEffect(() => {
//     getPendingMeetings();
//   }, [getPendingMeetings]);
// // Approve a meeting
// export const approveMeeting = async (meetingId: number, remarks = '') => {
//   try {
//     const headers = await getAuthHeaders();
//     const payload = { approval: 'APPROVED', remarks };
//     const response = await axios.post(`${BASE_URL}meetings/${meetingId}/approve/`, payload, { headers });
//     return response.data;
//   } catch (error) {
//     console.error('❌ Error approving meeting:', error);
//     throw error;
//   }
// };

// // Create new meeting
// export const createMeeting = async (meetingData: any) => {
//   try {
//     const headers = await getAuthHeaders();
//     // Remove 'status' as DRF serializer handles it
//     const { status, ...payload } = meetingData;
//     const response = await axios.post(`${BASE_URL}meetings/`, payload, { headers });
//     return response.data;
//   } catch (error: any) {
//     console.error('❌ Error creating meeting:', error.response?.data || error.message);
//     throw error;
//   }
// };

// export interface Meeting {
//   id: number;
//   meeting_title?: string;
//   meeting_date?: string;
//   status?: string;
//   approval_status?: string;
//   [key: string]: any;
// }




// // src/services/meetingsService.ts
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'http://127.0.0.1:8000/api/';

// // Read token from storage for every API call
// const getAuthHeaders = async () => {
//   const storedUser = await AsyncStorage.getItem("user");
//   if (!storedUser) return {};
//   const { token } = JSON.parse(storedUser);
//   return { Authorization: `Token ${token}` }; // DRF TokenAuthentication
// };

// // --- List all meetings (with optional filters in frontend) ---
// export const getMeetingsForUser = async () => {
//   try {
//     const headers = await getAuthHeaders();
//     const response = await axios.get(`${BASE_URL}meetings/`, { headers });
//     return Array.isArray(response.data) ? response.data : [];
//   } catch (error) {
//     console.error("❌ Error fetching meetings:", error);
//     return [];
//   }
// };

// // --- Approve meeting (for approver roles like HO/MGMT) ---
// export const approveMeeting = async (meetingId: number) => {
//   try {
//     const headers = await getAuthHeaders();
//     const response = await axios.post(`${BASE_URL}meetings/${meetingId}/approve/`, {}, { headers });
//     return response.data;
//   } catch (error) {
//     console.error('❌ Error approving meeting:', error);
//     throw error;
//   }
// };


















// // src/services/meetingsService.ts
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'http://127.0.0.1:8000/api/';

// // Read token from storage for every API call
// // const getAuthHeaders = async () => {
// //   const storedUser = await AsyncStorage.getItem("user");
// //   if (!storedUser) {
// //     console.log("No stored user found");
// //     return {};
// //   }
// //   const { token } = JSON.parse(storedUser);
// //   return { Authorization: `Bearer ${token}` };
// // };
// const getAuthHeaders = async () => {
//   const storedUser = await AsyncStorage.getItem("user");
//   if (!storedUser) {
//     console.log("No stored user found");
//     return {};
//   }
//   const { token } = JSON.parse(storedUser);
//   return { Authorization: `Token ${token}` }; // <--- DRF TokenAuthentication requires 'Token'
// };
// export const getMeetingsForUser = async () => {
//   try {
//     const headers = await getAuthHeaders();
//     const response = await axios.get(`${BASE_URL}meetings/my/`, { headers });
//     return Array.isArray(response.data) ? response.data : [];
//   } catch (error) {
//     console.error("❌ Error fetching user meetings:", error);
//     return [];
//   }
// };

// export const getUpcomingMeetings = async () => {
//   try {
//     const headers = await getAuthHeaders();
//     const response = await axios.get(`${BASE_URL}meetings/upcoming/`, { headers });
//     return Array.isArray(response.data) ? response.data : [];
//   } catch (error) {
//     console.error('❌ Error fetching upcoming meetings:', error);
//     return [];
//   }
// };

// export const getCompletedMeetings = async () => {
//   try {
//     const headers = await getAuthHeaders();
//     const response = await axios.get(`${BASE_URL}meetings/completed/`, { headers });
//     return Array.isArray(response.data) ? response.data : [];
//   } catch (error) {
//     console.error('❌ Error fetching completed meetings:', error);
//     return [];
//   }
// };
