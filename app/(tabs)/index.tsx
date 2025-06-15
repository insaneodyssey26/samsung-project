import { Text, View } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Dashboard</Text>
      <Text>Health metrics will go here</Text>
    </View>
  );
}
