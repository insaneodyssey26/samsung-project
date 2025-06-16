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
    <View style={[styles.container, { backgroundColor: colors.background }]}>      <LinearGradient
        colors={colors.headerBackground}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="notifications" size={24} color={colors.headerText} style={styles.headerIcon} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: colors.headerText }]}>Active Alerts</Text>
            <Text style={[styles.subtitle, { color: colors.headerSecondary }]}>
              {alerts.length > 0 ? `${alerts.length} alert${alerts.length > 1 ? 's' : ''}` : 'All systems normal'}
            </Text>
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
                <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
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
                      size={20} 
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
  },  header: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.9,
  },  content: {
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
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  emptyStateStats: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emptyStateStatsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // Alert Card Styles
  alertCard: {
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
    padding: 20,
    paddingBottom: 12,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  dismissButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  alertContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  alertMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  alertValues: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  alertValueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertValueLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertValueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertThresholdText: {
    fontSize: 14,
  },
  alertAction: {
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  alertTimestamp: {
    fontSize: 12,
    textAlign: 'right',
    fontStyle: 'italic',
  },

  // Legacy styles (keeping for compatibility)
  alertDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
