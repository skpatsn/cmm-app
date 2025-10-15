import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function ReportsScreen({ navigation, route }: any) {
  const { id } = route.params || {};

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text variant="headlineMedium">Reports</Text>
      <Text>Report ID: {id || 'N/A'}</Text>

      <Button mode="contained" style={{ marginTop: 16 }} onPress={() => navigation.goBack()}>
        Back to Dashboard
      </Button>
    </View>
  );
}
