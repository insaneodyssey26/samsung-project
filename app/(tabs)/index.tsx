import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

// Classic Medical-Style Line Chart
interface ClassicLineChartProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const ClassicLineChart = ({ 
  data, 
  color, 
  width = 220, 
  height = 50 
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
      {/* Grid lines for professional look */}
      <View style={styles.gridContainer}>
        <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '25%' }]} />
        <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '50%' }]} />
        <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '75%' }]} />
      </View>
      
      {/* Data line segments */}
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
              }
            ]}
          />
        );
      })}
    </View>
  );
};

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

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
      case 'rising': return '#FF9800';
      case 'falling': return '#2196F3';
      default: return '#4CAF50'; // stable is green
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
    if (hr < 60) return { status: 'Low', color: '#FF9800', alert: true };
    if (hr > 100) return { status: 'High', color: '#F44336', alert: true };
    return { status: 'Normal', color: '#4CAF50', alert: false };
  };

  const getSpO2Status = (spo2: number) => {
    if (spo2 < 95) return { status: 'Low', color: '#F44336', alert: true };
    if (spo2 >= 95 && spo2 <= 100) return { status: 'Normal', color: '#4CAF50', alert: false };
    return { status: 'High', color: '#FF9800', alert: false };
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 36.1) return { status: 'Low', color: '#2196F3', alert: false };
    if (temp > 37.2) return { status: 'High', color: '#F44336', alert: true };
    return { status: 'Normal', color: '#4CAF50', alert: false };
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

  // Count active alerts
  const activeAlerts = [heartRateStatus, spO2Status, temperatureStatus]
    .filter(status => status.alert).length;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Health Dashboard</Text>
          <View style={styles.batteryContainer}>
            <Text style={styles.batteryText}>{healthData.batteryLevel}%</Text>
            <View style={[
              styles.batteryIcon, 
              { backgroundColor: healthData.batteryLevel > 20 ? '#4CAF50' : '#F44336' }
            ]} />
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.lastUpdate}>Last update: {healthData.lastUpdate}</Text>
          <View style={styles.alertSummary}>
            {activeAlerts > 0 ? (
              <Text style={styles.alertSummaryText}>
                ⚠️ {activeAlerts} Alert{activeAlerts > 1 ? 's' : ''}
              </Text>
            ) : (
              <Text style={styles.noAlertText}>✅ All Normal</Text>
            )}
          </View>
          <View style={styles.deviceStatusHeader}>
            <View style={[styles.statusDot, { backgroundColor: deviceStatusInfo.color }]} />
            <Text style={styles.deviceStatusText}>{healthData.deviceStatus}</Text>
          </View>
        </View>
        <View style={styles.emergencyContainer}>
          <Text style={styles.emergencyButton} onPress={handleEmergencyCall}>
            🚨 Emergency Call
          </Text>
          <Text style={styles.emergencyNote}>
            {healthData.emergencyContactsCount} contacts available
          </Text>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        {/* Heart Rate Card */}
        <View style={[
          styles.metricCard, 
          heartRateStatus.alert && styles.alertCard
        ]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Heart Rate</Text>
            <View style={styles.trendIndicator}>
              {heartRateStatus.alert && <Text style={styles.alertIcon}>⚠️</Text>}
              <View style={[styles.trendBadge, { backgroundColor: getTrendColor(heartRateInsights.trend) }]}>
                <Text style={styles.trendIcon}>{getTrendIcon(heartRateInsights.trend)}</Text>
                <Text style={styles.trendText}>
                  {getTrendLabel(heartRateInsights.trend)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.metricValue}>{healthData.heartRate}</Text>
            <Text style={styles.metricUnit}>BPM</Text>
          </View>
          <ClassicLineChart 
            data={trendData.heartRate}
            color={heartRateStatus.color}
            width={220}
            height={45}
          />
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: heartRateStatus.color }]} />
            <Text style={styles.statusTextNew}>{heartRateStatus.status}</Text>
          </View>
          <View style={styles.insightsContainer}>
            <Text style={styles.insightText}>24h Avg: {heartRateInsights.average24h} BPM</Text>
            <Text style={styles.rangeText}>Normal: 60-100 BPM</Text>
            <Text style={styles.timestampText}>Updated: {healthData.timestamp}</Text>
          </View>
        </View>

        {/* SpO2 Card */}
        <View style={[
          styles.metricCard,
          spO2Status.alert && styles.alertCard
        ]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>SpO₂</Text>
            <View style={styles.trendIndicator}>
              {spO2Status.alert && <Text style={styles.alertIcon}>⚠️</Text>}
              <View style={[styles.trendBadge, { backgroundColor: getTrendColor(spO2Insights.trend) }]}>
                <Text style={styles.trendIcon}>{getTrendIcon(spO2Insights.trend)}</Text>
                <Text style={styles.trendText}>
                  {getTrendLabel(spO2Insights.trend)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.metricValue}>{healthData.spO2}</Text>
            <Text style={styles.metricUnit}>%</Text>
          </View>
          <ClassicLineChart 
            data={trendData.spO2}
            color={spO2Status.color}
            width={220}
            height={45}
          />
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: spO2Status.color }]} />
            <Text style={styles.statusTextNew}>{spO2Status.status}</Text>
          </View>
          <View style={styles.insightsContainer}>
            <Text style={styles.insightText}>24h Avg: {spO2Insights.average24h}%</Text>
            <Text style={styles.rangeText}>Normal: 95-100%</Text>
            <Text style={styles.timestampText}>Updated: {healthData.timestamp}</Text>
          </View>
        </View>

        {/* Temperature Card */}
        <View style={[
          styles.metricCard,
          temperatureStatus.alert && styles.alertCard
        ]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Temperature</Text>
            <View style={styles.trendIndicator}>
              {temperatureStatus.alert && <Text style={styles.alertIcon}>⚠️</Text>}
              <View style={[styles.trendBadge, { backgroundColor: getTrendColor(temperatureInsights.trend) }]}>
                <Text style={styles.trendIcon}>{getTrendIcon(temperatureInsights.trend)}</Text>
                <Text style={styles.trendText}>
                  {getTrendLabel(temperatureInsights.trend)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.metricValue}>{healthData.temperature}</Text>
            <Text style={styles.metricUnit}>°C</Text>
          </View>
          <ClassicLineChart 
            data={trendData.temperature}
            color={temperatureStatus.color}
            width={220}
            height={45}
          />
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: temperatureStatus.color }]} />
            <Text style={styles.statusTextNew}>{temperatureStatus.status}</Text>
          </View>
          <View style={styles.insightsContainer}>
            <Text style={styles.insightText}>24h Avg: {temperatureInsights.average24h}°C</Text>
            <Text style={styles.rangeText}>Normal: 36.1-37.2°C</Text>
            <Text style={styles.timestampText}>Updated: {healthData.timestamp}</Text>
          </View>
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
    fontSize: 15,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
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
    color: '#555',
    fontWeight: '600',
  },
  metricsContainer: {
    padding: 16,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
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
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 6,
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
    backgroundColor: '#e8e8e8',
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
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
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
    borderTopColor: '#f0f0f0',
  },
  insightText: {
    fontSize: 13,
    color: '#444',
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
    color: '#555',
    marginRight: 4,
    fontWeight: '500',
  },
  batteryIcon: {
    width: 20,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  emergencyContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  emergencyButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  emergencyNote: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  alertCard: {
    borderWidth: 2,
    borderColor: '#FF9800',
    backgroundColor: '#fff8e1',
  },
  alertIcon: {
    fontSize: 12,
    marginRight: 4,
    lineHeight: 16,
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  alertSummary: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  alertSummaryText: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '700',
  },
  noAlertText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '700',
  },
});
