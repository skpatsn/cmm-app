// src/screens/MeetingListScreen.tsx
import React, { useState, useEffect, useContext } from "react";
import { FlatList, View, Alert } from "react-native";
import { Card, Button, Text } from "react-native-paper";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://127.0.0.1:8000/api";

const getAuthHeaders = async () => {
  const storedUser = await AsyncStorage.getItem("user");
  if (!storedUser) return {};
  const { token } = JSON.parse(storedUser);
  return { Authorization: `Bearer ${token}` };
};
export default function MeetingListScreen({ navigation }: any) {
  const { token } = useContext(AuthContext);
  const [meetings, setMeetings] = useState<any[]>([]);

  const fetchMeetings = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get<any[]>(`${API_BASE}/meetings/`, { headers });
      setMeetings(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to fetch meetings. Please login again.");
    }
  };

  const deleteMeeting = async (id: number) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this meeting?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_BASE}/meetings/${id}/`, { headers });
            Alert.alert("Deleted", "Meeting removed successfully.");
            fetchMeetings();
          } catch (err) {
            Alert.alert("Error", "Failed to delete meeting.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <FlatList
      data={meetings}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={{ margin: 10, padding: 10 }}>
          <Text variant="titleMedium">{item.client_name}</Text>
          <Text>{item.meeting_date} | {item.meeting_purpose}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Button onPress={() => navigation.navigate("MeetingForm", { meeting: item })}>Edit</Button>
            <Button onPress={() => deleteMeeting(item.id)} textColor="red">Delete</Button>
          </View>
        </Card>
      )}
    />
  );
}
// This screen lists all meetings fetched from the backend API.
// Users can edit or delete meetings, with authentication handled via AuthContext.