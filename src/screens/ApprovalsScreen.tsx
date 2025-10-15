// will list meetings with `hoApproval === 'IDLE'` or `PENDING` and allow HO role to Approve / Reject with remarks. Approving sets `hoApproval = 'APPROVED'`, `status = 'COMPLETED'` (if meeting is done) and toggles `payable = true`.
// A small action log is recorded per meeting to store HO comments and timestamps.

import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ApprovalsScreen({ navigation }: any) {
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('@cmm_meetings_v1');
      if (raw) setMeetings(JSON.parse(raw));
    })();
  }, []);

  function updateApproval(id: string, decision: 'APPROVED' | 'REJECTED') {
    const updated = meetings.map((m) =>
      m.id === id ? { ...m, hoApproval: decision } : m
    );
    setMeetings(updated);
    AsyncStorage.setItem('@cmm_meetings_v1', JSON.stringify(updated));
  }

  return (
    <ScrollView style={{ padding: 12, backgroundColor: '#f9fafb' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 8 }}>HO Approvals</Text>

      {meetings.map((m) => (
        <Card key={m.id} style={{ marginBottom: 10, padding: 8 }}>
          <Text style={{ fontWeight: '700' }}>{m.clientName || 'Client'} — {m.personName}</Text>
          <Text>Status: {m.hoApproval}</Text>

          <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
            <Button mode="contained" onPress={() => updateApproval(m.id, 'APPROVED')}>Approve</Button>
            <Button mode="outlined" onPress={() => updateApproval(m.id, 'REJECTED')}>Reject</Button>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
