import { ScrollView, StyleSheet, Text, View, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface Alert {
  id: string;
  type: 'emergency' | 'warning' | 'trend' | 'device';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  value?: string;
  threshold?: string;
  action?: string;
}

export default function AlertsScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Mock health data (in real app, this would come from a context or API)
  const getCurrentHealthData = () => ({
    heartRate: 105, // High heart rate to trigger alert
    spO2: 94, // Low SpO2 to trigger alert
    temperature: 36.5,
    deviceStatus: 'Connected',
    batteryLevel: 15, // Low battery for demo
    lastUpdate: '2 mins ago',
  });

  // Function to check for active alerts based on health data
  const checkForAlerts = () => {
    const healthData = getCurrentHealthData();
    const newAlerts: Alert[] = [];

    // Heart Rate Alerts
    if (healthData.heartRate > 100) {
      newAlerts.push({
        id: 'hr-high',
        type: 'emergency',
        title: 'High Heart Rate',
        message: 'Heart rate is significantly elevated above normal range.',
        timestamp: new Date(),
        priority: 'high',
        value: `${healthData.heartRate} BPM`,
        threshold: 'Normal: 60-100 BPM',
        action: 'Seek immediate medical attention if symptoms persist'
      });
    } else if (healthData.heartRate < 60) {
      newAlerts.push({
        id: 'hr-low',
        type: 'warning',
        title: 'Low Heart Rate',
        message: 'Heart rate is below normal range.',
        timestamp: new Date(),
        priority: 'medium',
        value: `${healthData.heartRate} BPM`,
        threshold: 'Normal: 60-100 BPM',
        action: 'Monitor closely and consult healthcare provider'
      });
    }

    // SpO2 Alerts
    if (healthData.spO2 < 95) {
      newAlerts.push({
        id: 'spo2-low',
        type: 'emergency',
        title: 'Low Blood Oxygen',
        message: 'Blood oxygen saturation is critically low.',
        timestamp: new Date(),
        priority: 'high',
        value: `${healthData.spO2}%`,
        threshold: 'Normal: 95-100%',
        action: 'Seek immediate medical attention'
      });
    }

    // Temperature Alerts
    if (healthData.temperature > 37.2) {
      newAlerts.push({
        id: 'temp-high',
        type: 'warning',
        title: 'Elevated Temperature',
        message: 'Body temperature is above normal range.',
        timestamp: new Date(),
        priority: 'medium',
        value: `${healthData.temperature}°C`,
        threshold: 'Normal: 36.1-37.2°C',
        action: 'Monitor temperature and stay hydrated'
      });
    } else if (healthData.temperature < 36.1) {
      newAlerts.push({
        id: 'temp-low',
        type: 'warning',
        title: 'Low Temperature',
        message: 'Body temperature is below normal range.',
        timestamp: new Date(),
        priority: 'medium',
        value: `${healthData.temperature}°C`,
        threshold: 'Normal: 36.1-37.2°C',
        action: 'Keep warm and monitor temperature'
      });
    }

    // Device Alerts
    if (healthData.batteryLevel < 20) {
      newAlerts.push({
        id: 'battery-low',
        type: 'device',
        title: 'Low Battery',
        message: 'Wearable device battery is running low.',
        timestamp: new Date(),
        priority: 'low',
        value: `${healthData.batteryLevel}%`,
        threshold: 'Recommended: >20%',
        action: 'Charge your device soon'
      });
    }

    if (healthData.deviceStatus !== 'Connected') {
      newAlerts.push({
        id: 'device-disconnected',
        type: 'device',
        title: 'Device Disconnected',
        message: 'Wearable device is not connected.',
        timestamp: new Date(),
        priority: 'medium',
        value: healthData.deviceStatus,
        threshold: 'Expected: Connected',
        action: 'Check device connection and bluetooth'
      });
    }

    setAlerts(newAlerts);
  };

  useEffect(() => {
    checkForAlerts();
    // In real app, this would be updated when health data changes
    const interval = setInterval(checkForAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    checkForAlerts();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'emergency': return 'alert-circle';
      case 'warning': return 'warning';
      case 'trend': return 'trending-up';
      case 'device': return 'hardware-chip';
    }
  };
  
  const getAlertColor = (type: Alert['type'], priority: Alert['priority']): [string, string] => {
    if (priority === 'high') return ['#dc2626', '#ef4444'];
    if (priority === 'medium') return ['#d97706', '#f59e0b'];
    return ['#2563eb', '#3b82f6'];
  };

  const getPriorityText = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high': return 'CRITICAL';
      case 'medium': return 'WARNING';
      case 'low': return 'INFO';
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Professional Header */}
      <LinearGradient
        colors={['#ffffff', '#fafafa']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <LinearGradient
                  colors={alerts.length > 0 ? ['#ef4444', '#dc2626'] : ['#059669', '#047857']}
                  style={[styles.alertIndicator, {
                    shadowColor: alerts.length > 0 ? '#ef4444' : '#059669',
                  }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons 
                    name={alerts.length > 0 ? "alert-circle-outline" : "shield-checkmark-outline"} 
                    size={20} 
                    color="#ffffff" 
                  />
                </LinearGradient>
                <View style={styles.titleTextContainer}>
                  <Text style={styles.title}>Health Alerts</Text>
                  <Text style={styles.subtitle}>Real-time monitoring system</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, {
                backgroundColor: alerts.length > 0 ? '#ef4444' : '#22c55e'
              }]} />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>Status</Text>
                <Text style={[styles.statusValue, {
                  color: alerts.length > 0 ? '#dc2626' : '#16a34a'
                }]}>
                  {alerts.length > 0 ? 'ACTIVE' : 'NORMAL'}
                </Text>
              </View>
            </View>
            
            {alerts.length > 0 && (
              <View style={styles.alertsBadge}>
                <LinearGradient
                  colors={['#fef2f2', '#fee2e2']}
                  style={styles.badgeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.badgeNumber}>{alerts.length}</Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.statText}>Last check: {getCurrentHealthData().lastUpdate}</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Ionicons name="pulse-outline" size={16} color="#6b7280" />
            <Text style={styles.statText}>Monitoring active</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {alerts.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#f0fdf4', '#dcfce7']}
              style={styles.emptyStateCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.emptyIconContainer}>
                <Ionicons name="checkmark-circle" size={72} color="#22c55e" />
              </View>
              <Text style={styles.emptyStateTitle}>All Clear!</Text>
              <Text style={styles.emptyStateMessage}>
                No active health alerts at this time. Your vital signs are within normal ranges.
              </Text>
              <View style={styles.emptyStateStats}>
                <Text style={styles.emptyStateStatsText}>
                  Last check: {getCurrentHealthData().lastUpdate}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          // Active Alerts
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <LinearGradient
                colors={[colors.cardBackground, colors.surface]}
                style={styles.alertCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              {/* Alert Header */}
              <View style={styles.alertHeader}>
                <View style={styles.alertHeaderLeft}>
                  <LinearGradient
                    colors={getAlertColor(alert.type, alert.priority)}
                    style={styles.alertIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons 
                      name={getAlertIcon(alert.type)} 
                      size={22} 
                      color="#ffffff" 
                    />
                  </LinearGradient>
                  <View style={styles.alertTitleContainer}>
                    <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
                    <LinearGradient
                      colors={getAlertColor(alert.type, alert.priority)}
                      style={styles.priorityBadge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.priorityText}>{getPriorityText(alert.priority)}</Text>
                    </LinearGradient>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => dismissAlert(alert.id)}
                  style={styles.dismissButton}
                >
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Alert Content */}
              <View style={styles.alertContent}>
                <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
                  {alert.message}
                </Text>
                
                {alert.value && (
                  <View style={styles.alertValues}>
                    <View style={styles.alertValueItem}>
                      <Text style={[styles.alertValueLabel, { color: colors.textMuted }]}>Current Value:</Text>
                      <Text style={[styles.alertValueText, { color: colors.text }]}>{alert.value}</Text>
                    </View>
                    {alert.threshold && (
                      <View style={styles.alertValueItem}>
                        <Text style={[styles.alertValueLabel, { color: colors.textMuted }]}>Normal Range:</Text>
                        <Text style={[styles.alertThresholdText, { color: colors.textMuted }]}>{alert.threshold}</Text>
                      </View>
                    )}
                  </View>
                )}

                {alert.action && (
                  <View style={styles.alertAction}>
                    <LinearGradient
                      colors={['#fef3c7', '#fde68a']}
                      style={styles.actionContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="information-circle" size={16} color="#d97706" />
                      <Text style={styles.actionText}>{alert.action}</Text>
                    </LinearGradient>
                  </View>
                )}

                <Text style={[styles.alertTimestamp, { color: colors.textMuted }]}>
                  {alert.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Modern Professional Header
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIndicator: {
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
  },
  titleTextContainer: {
    flex: 1,
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
  headerRight: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusTextContainer: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  alertsBadge: {
    marginTop: 4,
  },
  badgeGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fecaca',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: -0.2,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  statSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 16,
  },
  content: {
    padding: 12,
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateCard: {
    width: '100%',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.1)',
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  emptyStateStats: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.2)',
    width: '100%',
  },
  emptyStateStatsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Alert Card Styles - Modern Medical Design
  alertCard: {
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    backgroundColor: '#ffffff',
  },
  alertCardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 20,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.3,
    color: '#1f2937',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dismissButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  alertContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  alertMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#4b5563',
    fontWeight: '500',
  },
  alertValues: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  alertValueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertValueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertValueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  alertThresholdText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  alertAction: {
    marginBottom: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
  },
  actionText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  alertTimestamp: {
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '500',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
