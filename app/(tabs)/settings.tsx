import { View, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Settings</Text>
      <Text>Caregivers and emergency contacts will go here</Text>
    </View>
  );
}
