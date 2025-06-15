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

  // Function to get health status and color
  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { status: 'Low', color: '#FF9800' };
    if (hr > 100) return { status: 'High', color: '#F44336' };
    return { status: 'Normal', color: '#4CAF50' };
  };

  const getSpO2Status = (spo2: number) => {
    if (spo2 < 95) return { status: 'Low', color: '#F44336' };
    if (spo2 >= 95 && spo2 <= 100) return { status: 'Normal', color: '#4CAF50' };
    return { status: 'High', color: '#FF9800' };
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 36.1) return { status: 'Low', color: '#2196F3' };
    if (temp > 37.2) return { status: 'High', color: '#F44336' };
    return { status: 'Normal', color: '#4CAF50' };
  };

  const getDeviceStatus = (status: string) => {
    if (status === 'Connected') return { status: 'Connected', color: '#4CAF50' };
    if (status === 'Disconnected') return { status: 'Disconnected', color: '#F44336' };
    return { status: 'Unknown', color: '#FF9800' };
  };

  const heartRateStatus = getHeartRateStatus(healthData.heartRate);
  const spO2Status = getSpO2Status(healthData.spO2);
  const temperatureStatus = getTemperatureStatus(healthData.temperature);
  const deviceStatusInfo = getDeviceStatus(healthData.deviceStatus);

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
          <View style={styles.valueContainer}>
            <Text style={styles.metricValue}>{healthData.heartRate}</Text>
            <Text style={styles.metricUnit}>BPM</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: heartRateStatus.color }]} />
            <Text style={styles.statusTextNew}>{heartRateStatus.status}</Text>
          </View>
          <Text style={styles.rangeText}>Normal: 60-100 BPM</Text>
        </View>

        {/* SpO2 Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>SpO₂</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.metricValue}>{healthData.spO2}</Text>
            <Text style={styles.metricUnit}>%</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: spO2Status.color }]} />
            <Text style={styles.statusTextNew}>{spO2Status.status}</Text>
          </View>
          <Text style={styles.rangeText}>Normal: 95-100%</Text>
        </View>

        {/* Temperature Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Temperature</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.metricValue}>{healthData.temperature}</Text>
            <Text style={styles.metricUnit}>°C</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: temperatureStatus.color }]} />
            <Text style={styles.statusTextNew}>{temperatureStatus.status}</Text>
          </View>
          <Text style={styles.rangeText}>Normal: 36.1-37.2°C</Text>
        </View>

        {/* Device Status Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Device Status</Text>
          <View style={styles.valueContainer}>
            <Text style={[styles.metricValue, { fontSize: 20 }]}>{healthData.deviceStatus}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: deviceStatusInfo.color }]} />
            <Text style={styles.statusTextNew}>{deviceStatusInfo.status}</Text>
          </View>
          <Text style={styles.rangeText}>BLE Connection</Text>
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
    marginLeft: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusTextNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rangeText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});
