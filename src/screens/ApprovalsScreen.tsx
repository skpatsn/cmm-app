// src/screens/ApprovalsScreen.tsx

import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, RefreshControl, Alert } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axiosConfig";



interface Meeting {
  id: number;
  client_name: string;
  contact_person: string;
  meeting_date?: string;
  meeting_purpose?: string;
  status: string;
  approval_status: string;
  // add more fields as needed
}


export default function ApprovalsScreen({ navigation }: any) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔹 Load meetings from API or local cache
  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      // const res = await api.get("/meetings/pending/");
      // setMeetings(res.data as any[]);
      // setMeetings(res.data);
      const res = await api.get<Meeting[]>("/meetings/pending/");
      setMeetings(res.data);
      
      await AsyncStorage.setItem("@cmm_meetings_v1", JSON.stringify(res.data));
    } catch (err) {
      console.log("Offline fallback, using local storage...");
      const raw = await AsyncStorage.getItem("@cmm_meetings_v1");
      if (raw) setMeetings(JSON.parse(raw));
      else Alert.alert("Error", "Failed to load pending meetings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMeetings();
  };

  // 🔹 Approve / Reject actions
  const updateApproval = async (meetingId: string, action: "approve" | "reject") => {
    try {
      const res = await api.post(`/meetings/${meetingId}/approve/`, { action });
      Alert.alert("Success", res.data.message);
      loadMeetings(); // refresh after update
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update approval status");
    }
  };

  // 🔹 Open full detail
  const openMeetingDetail = (meeting: any) => {
    navigation.navigate("MeetingApproval", { meetingId: meeting.id });
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView
      style={{ padding: 12, backgroundColor: "#f9fafb" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
        Pending Approvals
      </Text>

      {meetings.length === 0 && <Text>No pending meetings found.</Text>}

      {meetings.map((m) => (
        <Card
          key={m.id}
          style={{ marginBottom: 10, padding: 8 }}
          onPress={() => openMeetingDetail(m)}
        >
          <Text style={{ fontWeight: "700" }}>
            {m.clientName || m.title || "Meeting"} — {m.personName || m.user_name}
          </Text>
          <Text>Status: {m.status}</Text>
          <Text>Approval: {m.approval_status}</Text>

          <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
            <Button
              mode="contained"
              onPress={() => updateApproval(m.id, "approve")}
            >
              Approve
            </Button>
            <Button
              mode="outlined"
              onPress={() => updateApproval(m.id, "reject")}
            >
              Reject
            </Button>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
