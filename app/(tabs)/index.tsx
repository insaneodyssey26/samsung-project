import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, ColorValue, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Line Chart with Gradients
interface ClassicLineChartProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  borderColor?: ColorValue;
}

const ClassicLineChart = ({ 
  data, 
  color, 
  width = 220, 
  height = 50,
  borderColor = '#e8e8e8'
}: ClassicLineChartProps) => {
  if (!data || data.length < 2) return null;
  
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const valueRange = maxValue - minValue || 1;
  const padding = 4;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = padding + (1 - (value - minValue) / valueRange) * (height - 2 * padding);
    return { x, y };
  });

  return (
    <View style={[styles.classicChart, { width, height }]}>
      {/* Gradient background */}
      <LinearGradient
        colors={[color + '20', color + '05']}
        style={styles.chartGradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Grid lines for professional look */}
      <View style={styles.gridContainer}>
        <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '25%', backgroundColor: borderColor }]} />
        <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '50%', backgroundColor: borderColor }]} />
        <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '75%', backgroundColor: borderColor }]} />
      </View>
      
      {/* Data line segments with enhanced styling */}
      {points.slice(0, -1).map((point, index) => {
        const nextPoint = points[index + 1];
        const lineWidth = Math.sqrt(
          Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
        );
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
        
        return (
          <View
            key={`segment-${index}`}
            style={[
              styles.dataLine,
              {
                width: lineWidth,
                left: point.x,
                top: point.y,
                backgroundColor: color,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: '0 50%',
                height: 3, // Slightly thicker line
                shadowColor: color,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.4,
                shadowRadius: 2,
                elevation: 2,
              }
            ]}
          />
        );
      })}
      
      {/* Data points with glow effect */}
      {points.map((point, index) => (
        <View
          key={`point-${index}`}
          style={[
            styles.dataPoint,
            {
              left: point.x - 3,
              top: point.y - 3,
              backgroundColor: color,
              borderColor: borderColor,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 4,
              elevation: 4,
            }
          ]}
        />
      ))}
    </View>
  );
};

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for heart rate
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(pulse, 1000); // Pause between beats
      });
    };
    pulse();
  }, [pulseAnim]);

  // Floating animation for cards
  useEffect(() => {
    const float = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start(float);
    };
    float();
  }, [floatAnim]);

  // Mock health data for development
  const healthData = {
    heartRate: 72,
    spO2: 98,
    temperature: 36.5,
    deviceStatus: 'Connected',
    lastUpdate: '2 mins ago',
    batteryLevel: 85,
    emergencyContactsCount: 2,
    timestamp: new Date().toLocaleTimeString()
  };

  // Mock trend data (last 10 readings)
  const trendData = {
    heartRate: [68, 70, 72, 69, 71, 73, 72, 74, 71, 72],
    spO2: [97, 98, 99, 98, 97, 98, 99, 98, 97, 98],
    temperature: [36.3, 36.4, 36.5, 36.4, 36.6, 36.5, 36.4, 36.5, 36.6, 36.5],
  };

  // Enhanced data insights
  const getDataInsights = (currentValue: number, trendArray: number[]) => {
    if (trendArray.length < 2) return { trend: 'stable', change: 0, average24h: currentValue };
    
    const lastValue = trendArray[trendArray.length - 2];
    const change = currentValue - lastValue;
    const average24h = Math.round((trendArray.reduce((sum, val) => sum + val, 0) / trendArray.length) * 10) / 10;
    
    let trend = 'stable';
    if (change > 1) trend = 'rising';
    else if (change < -1) trend = 'falling';
    
    return { trend, change, average24h };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '▲';
      case 'falling': return '▼';
      default: return '●'; // stable indicator
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return '#FF6B6B'; // Coral red
      case 'falling': return '#4ECDC4'; // Turquoise
      default: return '#45B7D1'; // Sky blue
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'rising': return 'Rising';
      case 'falling': return 'Falling';
      default: return 'Stable';
    }
  };

  // Emergency button handler
  const handleEmergencyCall = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // In a real app, this would trigger emergency calling
    alert('Emergency services would be contacted in a real app');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Add haptic feedback for refresh action
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Calculate insights
  const heartRateInsights = getDataInsights(healthData.heartRate, trendData.heartRate);
  const spO2Insights = getDataInsights(healthData.spO2, trendData.spO2);
  const temperatureInsights = getDataInsights(healthData.temperature, trendData.temperature);

  // Function to get health status and color
  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { status: 'Low', color: '#FFA07A', alert: true }; // Light salmon
    if (hr > 100) return { status: 'High', color: '#FF6B6B', alert: true }; // Coral red
    return { status: 'Normal', color: '#98D8C8', alert: false }; // Mint green
  };

  const getSpO2Status = (spo2: number) => {
    if (spo2 < 95) return { status: 'Low', color: '#FF6B6B', alert: true }; // Coral red
    if (spo2 >= 95 && spo2 <= 100) return { status: 'Normal', color: '#98D8C8', alert: false }; // Mint green
    return { status: 'High', color: '#FFA07A', alert: false }; // Light salmon
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 36.1) return { status: 'Low', color: '#87CEEB', alert: false }; // Sky blue
    if (temp > 37.2) return { status: 'High', color: '#FF6B6B', alert: true }; // Coral red
    return { status: 'Normal', color: '#98D8C8', alert: false }; // Mint green
  };

  const getDeviceStatus = (status: string) => {
    if (status === 'Connected') return { status: 'Connected', color: '#98D8C8' }; // Mint green
    if (status === 'Disconnected') return { status: 'Disconnected', color: '#FF6B6B' }; // Coral red
    return { status: 'Unknown', color: '#FFA07A' }; // Light salmon
  };

  const heartRateStatus = getHeartRateStatus(healthData.heartRate);
  const spO2Status = getSpO2Status(healthData.spO2);
  const temperatureStatus = getTemperatureStatus(healthData.temperature);
  const deviceStatusInfo = getDeviceStatus(healthData.deviceStatus);

  // Count active alerts
  const activeAlerts = [heartRateStatus, spO2Status, temperatureStatus]
    .filter(status => status.alert).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={colors.headerBackground}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <Text style={[styles.title, { color: colors.headerText }]}>Health Dashboard</Text>
            <View style={styles.batteryContainer}>
              <Text style={[styles.batteryText, { color: colors.headerSecondary }]}>{healthData.batteryLevel}%</Text>
              <LinearGradient
                colors={healthData.batteryLevel > 20 ? ['#00ff87', '#60efff'] : ['#ff6b6b', '#ffa726']}
                style={styles.batteryIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.lastUpdate, { color: colors.headerSecondary }]}>Last update: {healthData.lastUpdate}</Text>
            <LinearGradient
              colors={activeAlerts > 0 ? ['#ff9800', '#ff5722'] : ['#4caf50', '#8bc34a']}
              style={styles.alertSummary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {activeAlerts > 0 ? (
                <Text style={styles.alertSummaryText}>
                  ⚠️ {activeAlerts} Alert{activeAlerts > 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.noAlertText}>✅ All Normal</Text>
              )}
            </LinearGradient>
            <View style={styles.deviceStatusHeader}>
              <LinearGradient
                colors={healthData.deviceStatus === 'Connected' ? ['#00ff87', '#60efff'] : ['#ff6b6b', '#ffa726']}
                style={styles.statusDot}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <Text style={[styles.deviceStatusText, { color: colors.headerSecondary }]}>{healthData.deviceStatus}</Text>
            </View>
          </View>
          <LinearGradient
            colors={colors.emergencyBackground}
            style={styles.emergencyContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.emergencyContent}>
              <View style={styles.emergencyIconContainer}>
                <Ionicons name="call" size={24} color="#ffffff" />
              </View>
              <View style={styles.emergencyTextContainer}>
                <Text style={styles.emergencyTitle}>Emergency Call</Text>
                <Text style={styles.emergencySubtitle}>Tap to contact emergency services</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleEmergencyCall} activeOpacity={0.8}>
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.emergencyButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <LinearGradient
                  colors={['#dc2626', '#ef4444', '#f87171']}
                  style={styles.emergencyButtonInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.emergencyButtonContent}>
                    <Ionicons name="call" size={20} color="#ffffff" style={styles.emergencyCallIcon} />
                    <Text style={styles.emergencyButtonText}>
                      CALL NOW
                    </Text>
                  </View>
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.emergencyNote}>
              {healthData.emergencyContactsCount} contacts available
            </Text>
          </LinearGradient>
        </LinearGradient>

        <View style={styles.metricsContainer}>
          {/* Heart Rate Card */}
          <Animated.View 
            style={[
              styles.metricCard, 
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
              heartRateStatus.alert && styles.alertCard,
              {
                transform: [{ 
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -2],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['#fef2f2', '#fee2e2']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricHeader}>
              <View style={styles.labelWithIcon}>
                <LinearGradient
                  colors={colors.heartRateIcon}
                  style={styles.iconBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Ionicons name="heart" size={22} color="#ffffff" style={styles.metricIcon} />
                  </Animated.View>
                </LinearGradient>
                <Text style={[styles.metricLabel, { color: colors.text }]}>Heart Rate</Text>
              </View>
              <LinearGradient
                colors={[getTrendColor(heartRateInsights.trend), getTrendColor(heartRateInsights.trend) + '80']}
                style={styles.trendBadgeSmall}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.trendIconSmall}>{getTrendIcon(heartRateInsights.trend)}</Text>
              </LinearGradient>
              {heartRateStatus.alert && <Text style={styles.alertIcon}>⚠️</Text>}
            </View>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.heartRate}</Text>
              <Text style={[styles.metricUnit, { color: colors.textMuted }]}>BPM</Text>
            </View>
            <ClassicLineChart 
              data={trendData.heartRate}
              color={heartRateStatus.color}
              borderColor={colors.border}
              width={220}
              height={45}
            />
            <View style={styles.statusContainer}>
              <LinearGradient
                colors={[heartRateStatus.color, heartRateStatus.color + '80']}
                style={styles.statusDot}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={[styles.statusTextNew, { color: colors.text }]}>{heartRateStatus.status}</Text>
              <Text style={[styles.trendTextInline, { color: colors.textMuted }]}>• {getTrendLabel(heartRateInsights.trend)}</Text>
            </View>
            <View style={styles.insightsContainer}>
              <Text style={[styles.insightText, { color: colors.textMuted }]}>24h Avg: {heartRateInsights.average24h} BPM</Text>
              <Text style={[styles.rangeText, { color: colors.textMuted }]}>Normal: 60-100 BPM</Text>
              <Text style={[styles.timestampText, { color: colors.textMuted }]}>Updated: {healthData.timestamp}</Text>
            </View>
          </Animated.View>

          {/* SpO2 Card */}
          <Animated.View 
            style={[
              styles.metricCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
              spO2Status.alert && styles.alertCard,
              {
                transform: [{ 
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -1],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['#eff6ff', '#dbeafe']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricHeader}>
              <View style={styles.labelWithIcon}>
                <LinearGradient
                  colors={colors.spO2Icon}
                  style={styles.iconBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="water" size={22} color="#ffffff" style={styles.metricIcon} />
                </LinearGradient>
                <Text style={[styles.metricLabel, { color: colors.text }]}>SpO₂</Text>
              </View>
              <LinearGradient
                colors={[getTrendColor(spO2Insights.trend), getTrendColor(spO2Insights.trend) + '80']}
                style={styles.trendBadgeSmall}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.trendIconSmall}>{getTrendIcon(spO2Insights.trend)}</Text>
              </LinearGradient>
              {spO2Status.alert && <Text style={styles.alertIcon}>⚠️</Text>}
            </View>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.spO2}</Text>
              <Text style={[styles.metricUnit, { color: colors.textMuted }]}>%</Text>
            </View>
            <ClassicLineChart 
              data={trendData.spO2}
              color={spO2Status.color}
              borderColor={colors.border}
              width={220}
              height={45}
            />
            <View style={styles.statusContainer}>
              <LinearGradient
                colors={[spO2Status.color, spO2Status.color + '80']}
                style={styles.statusDot}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={[styles.statusTextNew, { color: colors.text }]}>{spO2Status.status}</Text>
              <Text style={[styles.trendTextInline, { color: colors.textMuted }]}>• {getTrendLabel(spO2Insights.trend)}</Text>
            </View>
            <View style={styles.insightsContainer}>
              <Text style={[styles.insightText, { color: colors.textMuted }]}>24h Avg: {spO2Insights.average24h}%</Text>
              <Text style={[styles.rangeText, { color: colors.textMuted }]}>Normal: 95-100%</Text>
              <Text style={[styles.timestampText, { color: colors.textMuted }]}>Updated: {healthData.timestamp}</Text>
            </View>
          </Animated.View>

          {/* Temperature Card */}
          <Animated.View 
            style={[
              styles.metricCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
              temperatureStatus.alert && styles.alertCard,
              {
                transform: [{ 
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -1.5],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['#fffbeb', '#fef3c7']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricHeader}>
              <View style={styles.labelWithIcon}>
                <LinearGradient
                  colors={colors.temperatureIcon}
                  style={styles.iconBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="thermometer" size={22} color="#ffffff" style={styles.metricIcon} />
                </LinearGradient>
                <Text style={[styles.metricLabel, { color: colors.text }]}>Temperature</Text>
              </View>
              <LinearGradient
                colors={[getTrendColor(temperatureInsights.trend), getTrendColor(temperatureInsights.trend) + '80']}
                style={styles.trendBadgeSmall}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.trendIconSmall}>{getTrendIcon(temperatureInsights.trend)}</Text>
              </LinearGradient>
              {temperatureStatus.alert && <Text style={styles.alertIcon}>⚠️</Text>}
            </View>
            <View style={styles.valueContainer}>
              <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.temperature}</Text>
              <Text style={[styles.metricUnit, { color: colors.textMuted }]}>°C</Text>
            </View>
            <ClassicLineChart 
              data={trendData.temperature}
              color={temperatureStatus.color}
              borderColor={colors.border}
              width={220}
              height={45}
            />
            <View style={styles.statusContainer}>
              <LinearGradient
                colors={[temperatureStatus.color, temperatureStatus.color + '80']}
                style={styles.statusDot}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={[styles.statusTextNew, { color: colors.text }]}>{temperatureStatus.status}</Text>
              <Text style={[styles.trendTextInline, { color: colors.textMuted }]}>• {getTrendLabel(temperatureInsights.trend)}</Text>
            </View>
            <View style={styles.insightsContainer}>
              <Text style={[styles.insightText, { color: colors.textMuted }]}>24h Avg: {temperatureInsights.average24h}°C</Text>
              <Text style={[styles.rangeText, { color: colors.textMuted }]}>Normal: 36.1-37.2°C</Text>
              <Text style={[styles.timestampText, { color: colors.textMuted }]}>Updated: {healthData.timestamp}</Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lastUpdate: {
    fontSize: 15,
    color: '#ffffff',
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.9,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  deviceStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceStatusText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    opacity: 0.9,
  },
  metricsContainer: {
    padding: 16,
  },
  metricCard: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 24,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.1,
  },
  metricLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metricUnit: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '600',
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  statusTextNew: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  rangeText: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  graphContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  graphLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  graphBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 2,
  },
  chartContainer: {
    position: 'relative',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  chartDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  chartBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.1,
    borderRadius: 1,
  },
  classicChart: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  chartGradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  dataPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    opacity: 0.3,
  },
  gridLineHorizontal: {
    left: 0,
    right: 0,
    height: 1,
  },
  dataLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: '0 50%',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
    width: '100%',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minHeight: 24,
  },
  trendIcon: {
    fontSize: 10,
    marginRight: 4,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  insightsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  insightText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 13,
    color: '#ffffff',
    marginRight: 4,
    fontWeight: '600',
    opacity: 0.9,
  },
  batteryIcon: {
    width: 22,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  emergencyContainer: {
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '500',
  },
  emergencyButton: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  emergencyButtonInner: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCallIcon: {
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  emergencyNote: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.9,
  },
  alertCard: {
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  alertIcon: {
    fontSize: 12,
    marginRight: 4,
    lineHeight: 16,
  },
  timestampText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  alertSummary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  alertSummaryText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  noAlertText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendBadgeSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  trendIconSmall: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  trendTextInline: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    // Removed marginRight to center icon properly in circular background
  },
  iconBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  heartRateCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    backgroundColor: '#fefefe',
  },
  spO2Card: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    backgroundColor: '#fefefe',
  },
  temperatureCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
    backgroundColor: '#fefefe',
  },
});
