import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function LocationScreen() {
  const { colors } = useTheme();  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.headerBackground}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="location" size={28} color={colors.headerText} style={styles.headerIcon} />
          <View>
            <Text style={[styles.title, { color: colors.headerText }]}>Location Tracking</Text>
            <Text style={[styles.subtitle, { color: colors.headerSecondary }]}>Monitor patient location and movement</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>        <View style={styles.locationCard}>
          <LinearGradient
            colors={[colors.cardBackground, colors.surface]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color="#4CAF50" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Current Location</Text>
          </View>
          <Text style={[styles.locationText, { color: colors.text }]}>
            123 Main Street, Cityville
          </Text>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            Last updated: 2 minutes ago
          </Text>
        </View>

        <View style={styles.locationCard}>
          <LinearGradient
            colors={[colors.cardBackground, colors.surface]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="home-outline" size={20} color="#2196F3" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Safe Zones</Text>
          </View>
          <Text style={[styles.locationText, { color: colors.text }]}>
            Home, Hospital, Pharmacy
          </Text>
          <Text style={[styles.status, { color: '#4CAF50' }]}>
            Currently in: Home
          </Text>
        </View>

        <View style={styles.locationCard}>
          <LinearGradient
            colors={[colors.cardBackground, colors.surface]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="walk-outline" size={20} color="#FF9800" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Activity Today</Text>
          </View>
          <Text style={[styles.locationText, { color: colors.text }]}>
            Steps: 2,847 • Distance: 1.2 km
          </Text>
          <Text style={[styles.status, { color: '#4CAF50' }]}>
            Last movement: 15 minutes ago
          </Text>
        </View>

        <View style={styles.locationCard}>
          <LinearGradient
            colors={[colors.cardBackground, colors.surface]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle-outline" size={20} color="#F44336" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Emergency Location</Text>
          </View>
          <Text style={[styles.locationText, { color: colors.text }]}>
            Shares real-time location during emergencies
          </Text>
          <Text style={[styles.status, { color: '#4CAF50' }]}>
            Status: Enabled
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  locationCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  timestamp: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
