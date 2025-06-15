import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
  // Mock health data for development
  const healthData = {
    heartRate: 72,
    spO2: 98,
    temperature: 36.5,
    deviceStatus: 'Connected',
    lastUpdate: '2 mins ago'
  };

  // Mock trend data (last 10 readings)
  const trendData = {
    heartRate: [68, 70, 72, 69, 71, 73, 72, 74, 71, 72],
    spO2: [97, 98, 99, 98, 97, 98, 99, 98, 97, 98],
    temperature: [36.3, 36.4, 36.5, 36.4, 36.6, 36.5, 36.4, 36.5, 36.6, 36.5],
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
        <View style={styles.headerInfo}>
          <Text style={styles.lastUpdate}>Last update: {healthData.lastUpdate}</Text>
          <View style={styles.deviceStatusHeader}>
            <View style={[styles.statusDot, { backgroundColor: deviceStatusInfo.color }]} />
            <Text style={styles.deviceStatusText}>{healthData.deviceStatus}</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        {/* Heart Rate Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Heart Rate</Text>
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
          <Text style={styles.rangeText}>Normal: 60-100 BPM</Text>
        </View>

        {/* SpO2 Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>SpO₂</Text>
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
          <Text style={styles.rangeText}>Normal: 95-100%</Text>
        </View>

        {/* Temperature Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Temperature</Text>
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
          <Text style={styles.rangeText}>Normal: 36.1-37.2°C</Text>
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
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  deviceStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceStatusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
});
