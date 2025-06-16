import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
    // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
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
  };  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };  const openAlertDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    
    // Reset animations to initial state before showing modal
    slideAnim.setValue(SCREEN_HEIGHT);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    contentOpacity.setValue(0);
    
    setModalVisible(true);
    
    // Start all animations together with proper timing for smoothness
    Animated.sequence([
      // Start backdrop fade immediately
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Modal slide and scale with slight delay for better visual flow
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 50);
    
    // Content fade in after modal movement starts
    setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();
    }, 150);
  };
  const closeAlertDetails = () => {
    // Start content fade out immediately
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Smooth exit animation with proper sequencing
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 350,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 350,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
        setSelectedAlert(null);
      });
    }, 50);
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
          </View>        ) : (
          // Active Alerts - Compact Tiles
          <View style={styles.alertsGrid}>            {alerts.map((alert) => (
              <TouchableOpacity 
                key={alert.id} 
                style={styles.alertTile}
                onPress={() => openAlertDetails(alert)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[colors.cardBackground, colors.surface]}
                  style={styles.alertTileGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                
                {/* Compact Alert Header */}
                <View style={styles.alertTileHeader}>
                  <View style={styles.alertTileLeft}>
                    <LinearGradient
                      colors={getAlertColor(alert.type, alert.priority)}
                      style={styles.alertTileIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons 
                        name={getAlertIcon(alert.type)} 
                        size={16} 
                        color="#ffffff" 
                      />
                    </LinearGradient>
                    <View style={styles.alertTileInfo}>
                      <Text style={[styles.alertTileTitle, { color: colors.text }]} numberOfLines={1}>
                        {alert.title}
                      </Text>
                      <Text style={[styles.alertTileValue, { color: colors.textSecondary }]} numberOfLines={1}>
                        {alert.value || 'See details'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.alertTileRight}>
                    <View style={[styles.alertTilePriority, { 
                      backgroundColor: getAlertColor(alert.type, alert.priority)[0] 
                    }]}>
                      <Text style={styles.alertTilePriorityText}>
                        {getPriorityText(alert.priority)[0]}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
                      style={styles.alertTileDismiss}
                    >
                      <Ionicons name="close" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>                {/* Time indicator */}
                <View style={styles.alertTileTime}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.alertTileTimeText, { color: colors.textMuted }]}>
                    {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                {/* Tap indicator */}
                <View style={styles.alertTapIndicator}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={colors.textMuted} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Alert Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeAlertDetails}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalBackdrop,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.modalBackdropTouch}
              activeOpacity={1}
              onPress={closeAlertDetails}
            />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              }
            ]}
          >            {selectedAlert && (
              <Animated.View style={[styles.modalContent, { opacity: contentOpacity }]}>
                {/* Modal Handle */}
                <View style={styles.modalHandle}>
                  <View style={styles.modalHandleBar} />
                </View>
                
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <LinearGradient
                      colors={getAlertColor(selectedAlert.type, selectedAlert.priority)}
                      style={styles.modalIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons 
                        name={getAlertIcon(selectedAlert.type)} 
                        size={28} 
                        color="#ffffff" 
                      />
                    </LinearGradient>
                    <View style={styles.modalTitleContainer}>
                      <Text style={styles.modalTitle}>{selectedAlert.title}</Text>
                      <LinearGradient
                        colors={getAlertColor(selectedAlert.type, selectedAlert.priority)}
                        style={styles.modalPriorityBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.modalPriorityText}>
                          {getPriorityText(selectedAlert.priority)}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>
                  <TouchableOpacity onPress={closeAlertDetails} style={styles.modalCloseButton}>
                    <Ionicons name="close" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Modal Body */}
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                    {selectedAlert.message}
                  </Text>
                  
                  {selectedAlert.value && (
                    <View style={styles.modalValues}>
                      <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                        Current Readings
                      </Text>
                      <View style={styles.modalValueItem}>
                        <Text style={[styles.modalValueLabel, { color: colors.textMuted }]}>
                          Current Value:
                        </Text>
                        <Text style={[styles.modalValueText, { color: colors.text }]}>
                          {selectedAlert.value}
                        </Text>
                      </View>
                      {selectedAlert.threshold && (
                        <View style={styles.modalValueItem}>
                          <Text style={[styles.modalValueLabel, { color: colors.textMuted }]}>
                            Normal Range:
                          </Text>
                          <Text style={[styles.modalThresholdText, { color: colors.textMuted }]}>
                            {selectedAlert.threshold}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {selectedAlert.action && (
                    <View style={styles.modalAction}>
                      <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                        Recommended Action
                      </Text>
                      <LinearGradient
                        colors={['#fef3c7', '#fde68a']}
                        style={styles.modalActionContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons name="information-circle" size={20} color="#d97706" />
                        <Text style={styles.modalActionText}>{selectedAlert.action}</Text>
                      </LinearGradient>
                    </View>
                  )}

                  <View style={styles.modalFooter}>
                    <View style={styles.modalTimestamp}>
                      <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                      <Text style={[styles.modalTimestampText, { color: colors.textMuted }]}>
                        Alert generated at {selectedAlert.timestamp.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Modal Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalDismissButton, { backgroundColor: colors.surface }]}
                    onPress={() => {
                      dismissAlert(selectedAlert.id);
                      closeAlertDetails();
                    }}
                  >                    <Text style={[styles.modalDismissButtonText, { color: colors.text }]}>
                      Dismiss Alert
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </Modal>
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

  // Compact Alert Tiles
  alertsGrid: {
    flex: 1,
  },
  alertTile: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    backgroundColor: '#ffffff',
    minHeight: 80,
  },  alertTileExpanded: {
    minHeight: 'auto',
  },
  alertTileGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  alertTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  alertTileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertTileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  alertTileInfo: {
    flex: 1,
  },
  alertTileTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
    color: '#1f2937',
  },
  alertTileValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  alertTileRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTilePriority: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertTilePriorityText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  alertTileDismiss: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  alertTileTime: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  alertTileTimeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#9ca3af',
  },
  alertTapIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    padding: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    position: 'relative',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdropTouch: {
    flex: 1,
  },  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
    // Add a subtle border for better definition
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    // Ensure smooth rendering
    overflow: 'hidden',
  },modalContent: {
    flex: 1,
  },
  modalHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
    color: '#1f2937',
  },
  modalPriorityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalPriorityText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalCloseButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 24,
  },
  modalMessage: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 24,
    color: '#4b5563',
    fontWeight: '500',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  modalValues: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  modalValueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalValueLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalValueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.3,
  },
  modalThresholdText: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '500',
  },
  modalAction: {
    marginBottom: 24,
  },
  modalActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
  },
  modalActionText: {
    fontSize: 15,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  modalFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  modalTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTimestampText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#9ca3af',
    fontWeight: '500',
  },
  modalActions: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  modalDismissButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalDismissButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
