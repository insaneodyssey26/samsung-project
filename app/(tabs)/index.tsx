import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DashboardScreen() {
  // Mock health data for development
  const healthData = {
    heartRate: 72,
    spO2: 98,
    temperature: 36.5,
    deviceStatus: 'Connected',
    lastUpdate: '2 mins ago'
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Dashboard</Text>
        <Text style={styles.lastUpdate}>Last update: {healthData.lastUpdate}</Text>
      </View>

      <View style={styles.metricsContainer}>
        {/* Heart Rate Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Heart Rate</Text>
          <Text style={styles.metricValue}>{healthData.heartRate}</Text>
          <Text style={styles.metricUnit}>BPM</Text>
        </View>

        {/* SpO2 Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>SpO₂</Text>
          <Text style={styles.metricValue}>{healthData.spO2}</Text>
          <Text style={styles.metricUnit}>%</Text>
        </View>

        {/* Temperature Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Temperature</Text>
          <Text style={styles.metricValue}>{healthData.temperature}</Text>
          <Text style={styles.metricUnit}>°C</Text>
        </View>

        {/* Device Status Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Device Status</Text>
          <Text style={[styles.metricValue, styles.statusText]}>{healthData.deviceStatus}</Text>
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
  lastUpdate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metricsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  metricUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusText: {
    fontSize: 18,
    color: '#4CAF50',
  },
});
