import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AlertsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Alerts</Text>
        <Text style={styles.subtitle}>Emergency notifications and warnings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>🚨 Emergency Alerts</Text>
          <Text style={styles.alertDescription}>
            Critical health readings that require immediate attention
          </Text>
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚠️ Warning Alerts</Text>
          <Text style={styles.alertDescription}>
            Health readings outside normal ranges
          </Text>
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>📊 Trend Alerts</Text>
          <Text style={styles.alertDescription}>
            Significant changes in health patterns
          </Text>
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>🔋 Device Alerts</Text>
          <Text style={styles.alertDescription}>
            Low battery and connectivity issues
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
  alertCard: {
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
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
