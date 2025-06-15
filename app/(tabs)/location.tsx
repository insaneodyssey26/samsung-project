import { View, Text } from 'react-native';

export default function LocationScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Location</Text>
      <Text>GPS tracking will go here</Text>
    </View>
  );
}
