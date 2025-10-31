// src/screens/MeetingApprovalScreen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
import { Button, ActivityIndicator, Card } from "react-native-paper";
import api from "../api/axiosConfig";

export default function MeetingApprovalScreen({ route, navigation }) {
  const { meetingId } = route.params;
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeeting();
  }, []);

  const fetchMeeting = async () => {
    try {
      const res = await api.get(`/meetings/${meetingId}/`);
      setMeeting(res.data);
    } catch (err) {
      Alert.alert("Error", "Failed to load meeting details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      const res = await api.post(`/meetings/${meetingId}/approve/`, { action });
      Alert.alert("Success", res.data.message, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to update approval status");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!meeting) return <Text>No data found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{meeting.title}</Text>
          <Text>Date: {meeting.meeting_date}</Text>
          <Text>Status: {meeting.status}</Text>
          <Text>Approval: {meeting.approval_status}</Text>
          <Text>Created by: {meeting.user_name}</Text>
          <Text>Details: {meeting.description}</Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          onPress={() => handleAction("approve")}
          style={[styles.button, { backgroundColor: "green" }]}
        >
          Approve
        </Button>
        <Button
          mode="contained"
          onPress={() => handleAction("reject")}
          style={[styles.button, { backgroundColor: "red" }]}
        >
          Reject
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: { flex: 0.48 },
});
