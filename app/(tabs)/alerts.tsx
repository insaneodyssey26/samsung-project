import { View, Text } from 'react-native';

export default function AlertsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Alerts</Text>
      <Text>Emergency alerts will go here</Text>
    </View>
  );
}
