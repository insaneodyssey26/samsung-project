import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LocationScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location Tracking</Text>
        <Text style={styles.subtitle}>Monitor patient location and movement</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>📍 Current Location</Text>
          <Text style={styles.locationText}>
            123 Main Street, Cityville
          </Text>
          <Text style={styles.timestamp}>
            Last updated: 2 minutes ago
          </Text>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>🏠 Safe Zones</Text>
          <Text style={styles.locationText}>
            Home, Hospital, Pharmacy
          </Text>
          <Text style={styles.status}>
            Currently in: Home
          </Text>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>🚶 Activity Today</Text>
          <Text style={styles.locationText}>
            Steps: 2,847 • Distance: 1.2 km
          </Text>
          <Text style={styles.status}>
            Last movement: 15 minutes ago
          </Text>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>⚠️ Emergency Location</Text>
          <Text style={styles.locationText}>
            Shares real-time location during emergencies
          </Text>
          <Text style={styles.status}>
            Status: Enabled
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
