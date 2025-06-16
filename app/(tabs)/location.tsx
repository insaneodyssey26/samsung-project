import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function LocationScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for health-related location features
  const getCurrentLocationData = () => ({
    address: "123 Main Street, Cityville",
    coordinates: "40.7128° N, 74.0060° W",
    lastUpdate: "2 mins ago",
    accuracy: "±3 meters",
    isInSafeZone: true,
    currentZone: "Home"
  });

  const getMedicalNearbyData = () => ([
    { id: 1, type: "Hospital", name: "City General Hospital", distance: "0.8 km", time: "3 mins", phone: "+1-555-0123" },
    { id: 2, type: "Pharmacy", name: "HealthCare Pharmacy", distance: "0.3 km", time: "1 min", phone: "+1-555-0456" },
    { id: 3, type: "Clinic", name: "Family Medical Center", distance: "1.2 km", time: "5 mins", phone: "+1-555-0789" }
  ]);

  const getMovementData = () => ({
    steps: 2847,
    distance: "1.2 km",
    calories: 142,
    activeTime: "45 min",
    lastMovement: "15 mins ago",
    posture: "Sitting",
    fallRisk: "Low"
  });

  const getSafeZoneData = () => ([
    { id: 1, name: "Home", status: "current", radius: "50m", alerts: true },
    { id: 2, name: "Hospital", status: "away", radius: "100m", alerts: true },
    { id: 3, name: "Pharmacy", status: "away", radius: "30m", alerts: false },
    { id: 4, name: "Family House", status: "away", radius: "75m", alerts: true }
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const locationData = getCurrentLocationData();
  const medicalNearby = getMedicalNearbyData();
  const movementData = getMovementData();
  const safeZones = getSafeZoneData();  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Professional Header */}
      <LinearGradient
        colors={['#ffffff', '#fafafa']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <LinearGradient
                colors={locationData.isInSafeZone ? ['#059669', '#047857'] : ['#dc2626', '#ef4444']}
                style={[styles.locationIndicator, {
                  shadowColor: locationData.isInSafeZone ? '#059669' : '#dc2626',
                }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name={locationData.isInSafeZone ? "shield-checkmark-outline" : "alert-circle-outline"} 
                  size={20} 
                  color="#ffffff" 
                />
              </LinearGradient>
              <View style={styles.titleTextContainer}>
                <Text style={styles.title}>Location & Safety</Text>
                <Text style={styles.subtitle}>Real-time tracking and monitoring</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >        {/* Current Location Card */}
        <View style={styles.locationCard}>
          <LinearGradient
            colors={['#ffffff', '#fafafa']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={24} color="#10b981" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Current Location</Text>
            <View style={styles.accuracyBadge}>
              <Text style={styles.accuracyText}>{locationData.accuracy}</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.locationAddress, { color: colors.text }]}>
              {locationData.address}
            </Text>
            <Text style={[styles.coordinates, { color: colors.textMuted }]}>
              {locationData.coordinates}
            </Text>
            <View style={styles.locationMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  Updated {locationData.lastUpdate}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                <Text style={[styles.metaText, { color: "#10b981" }]}>
                  In {locationData.currentZone}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Movement & Activity Card */}
        <View style={styles.locationCard}>
          <LinearGradient
            colors={['#ffffff', '#fafafa']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="walk" size={24} color="#3b82f6" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Activity & Movement</Text>
            <View style={[styles.riskBadge, { 
              backgroundColor: movementData.fallRisk === 'Low' ? '#dcfce7' : '#fee2e2' 
            }]}>
              <Text style={[styles.riskText, { 
                color: movementData.fallRisk === 'Low' ? '#166534' : '#dc2626' 
              }]}>
                {movementData.fallRisk} Risk
              </Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.activityGrid}>
              <View style={styles.activityItem}>
                <Text style={[styles.activityValue, { color: colors.text }]}>{movementData.steps}</Text>
                <Text style={[styles.activityLabel, { color: colors.textMuted }]}>Steps</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={[styles.activityValue, { color: colors.text }]}>{movementData.distance}</Text>
                <Text style={[styles.activityLabel, { color: colors.textMuted }]}>Distance</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={[styles.activityValue, { color: colors.text }]}>{movementData.calories}</Text>
                <Text style={[styles.activityLabel, { color: colors.textMuted }]}>Calories</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={[styles.activityValue, { color: colors.text }]}>{movementData.activeTime}</Text>
                <Text style={[styles.activityLabel, { color: colors.textMuted }]}>Active</Text>
              </View>
            </View>
            <View style={styles.postureInfo}>
              <Ionicons name="body" size={16} color="#f59e0b" />
              <Text style={[styles.postureText, { color: colors.textMuted }]}>
                Current posture: {movementData.posture} • Last movement: {movementData.lastMovement}
              </Text>
            </View>
          </View>
        </View>

        {/* Medical Nearby Card */}
        <View style={styles.locationCard}>
          <LinearGradient
            colors={['#ffffff', '#fafafa']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={24} color="#dc2626" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Nearby Medical</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            {medicalNearby.map((place) => (
              <TouchableOpacity key={place.id} style={styles.medicalItem}>
                <View style={styles.medicalLeft}>
                  <Ionicons 
                    name={place.type === 'Hospital' ? 'medical' : place.type === 'Pharmacy' ? 'basket' : 'fitness'} 
                    size={20} 
                    color="#6b7280" 
                  />
                  <View style={styles.medicalInfo}>
                    <Text style={[styles.medicalName, { color: colors.text }]}>{place.name}</Text>
                    <Text style={[styles.medicalType, { color: colors.textMuted }]}>{place.type}</Text>
                  </View>
                </View>
                <View style={styles.medicalRight}>
                  <Text style={[styles.medicalDistance, { color: colors.text }]}>{place.distance}</Text>
                  <Text style={[styles.medicalTime, { color: colors.textMuted }]}>{place.time}</Text>
                </View>
                <TouchableOpacity style={styles.callButton}>
                  <Ionicons name="call" size={16} color="#10b981" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Safe Zones Card */}
        <View style={styles.locationCard}>
          <LinearGradient
            colors={['#ffffff', '#fafafa']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Safe Zones</Text>
            <TouchableOpacity style={styles.manageButton}>
              <Text style={styles.manageText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            {safeZones.map((zone) => (
              <View key={zone.id} style={styles.zoneItem}>
                <View style={styles.zoneLeft}>
                  <View style={[styles.zoneStatus, {
                    backgroundColor: zone.status === 'current' ? '#10b981' : '#d1d5db'
                  }]} />
                  <View style={styles.zoneInfo}>
                    <Text style={[styles.zoneName, { color: colors.text }]}>{zone.name}</Text>
                    <Text style={[styles.zoneRadius, { color: colors.textMuted }]}>
                      Radius: {zone.radius}
                    </Text>
                  </View>
                </View>
                <View style={styles.zoneRight}>
                  <View style={[styles.alertToggle, {
                    backgroundColor: zone.alerts ? '#10b981' : '#d1d5db'
                  }]}>
                    <Text style={[styles.alertToggleText, {
                      color: zone.alerts ? '#ffffff' : '#6b7280'
                    }]}>
                      {zone.alerts ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Actions Card */}
        <View style={styles.locationCard}>
          <LinearGradient
            colors={['#ffffff', '#fafafa']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Emergency Location</Text>
          </View>
          <View style={styles.cardContent}>
            <TouchableOpacity style={styles.emergencyButton}>
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.emergencyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="send" size={20} color="#ffffff" />
                <Text style={styles.emergencyText}>Share Live Location</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.emergencyNote, { color: colors.textMuted }]}>
              Instantly shares real-time location with emergency contacts during medical emergencies
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Professional Header Styles
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },  titleTextContainer: {
    alignItems: 'center',
    marginLeft: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  locationCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
    letterSpacing: -0.2,
  },
  cardContent: {
    padding: 20,
    paddingTop: 16,
  },
  // Current Location Styles
  accuracyBadge: {
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  coordinates: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  locationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  // Activity Styles
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityItem: {
    alignItems: 'center',
    flex: 1,
  },
  activityValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  postureText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  // Medical Nearby Styles
  viewAllButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  medicalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  medicalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicalInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicalName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  medicalType: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  medicalRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  medicalDistance: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  medicalTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Safe Zones Styles
  manageButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  manageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  zoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  zoneStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  zoneRadius: {
    fontSize: 12,
    fontWeight: '500',
  },
  zoneRight: {
    alignItems: 'flex-end',
  },
  alertToggle: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  alertToggleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Emergency Styles
  emergencyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  emergencyNote: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
});
