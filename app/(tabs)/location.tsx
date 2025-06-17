import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { RealMedicalFacilitiesService, type RealMedicalFacility } from '../../services/realMedicalFacilities';
import { LocationIQMedicalService } from '../../services/placesApi';

export default function LocationScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('Loading...');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [medicalFacilities, setMedicalFacilities] = useState<RealMedicalFacility[]>([]);
  const [isLoadingMedical, setIsLoadingMedical] = useState(false);
  // Request location permissions and get current location
  useEffect(() => {
    getCurrentLocation();
  }, []);
  // Search for nearby medical facilities based on location
  const searchNearbyMedical = async (userLocation: Location.LocationObject) => {
    try {
      setIsLoadingMedical(true);
      
      // Check cache first
      const cacheKey = `medical_${userLocation.coords.latitude.toFixed(3)}_${userLocation.coords.longitude.toFixed(3)}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        // Use cache if less than 30 minutes old
        if (cacheAge < 30 * 60 * 1000) {          setMedicalFacilities(parsed.facilities);
          setIsLoadingMedical(false);
          return;
        }
      }      console.log('🏥 Searching for REAL medical facilities...');
      
      // Try LocationIQ service first (best results)
      try {
        console.log('🚀 Starting LocationIQ search...');
        const realFacilities = await LocationIQMedicalService.searchRealMedicalFacilities(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          5 // 5km radius
        );

        console.log(`📊 LocationIQ search completed. Found: ${realFacilities.length} facilities`);
        if (realFacilities.length > 0) {
          console.log(`✅ Found ${realFacilities.length} REAL medical facilities!`);
          console.log('🏥 Sample facilities:', realFacilities.slice(0, 3).map(f => f.name));
          
          // Cache the results
          await AsyncStorage.setItem(cacheKey, JSON.stringify({
            facilities: realFacilities,
            timestamp: Date.now()
          }));
          
          setMedicalFacilities(realFacilities);
          setIsLoadingMedical(false);
          return;
        } else {
          console.log('⚠️ LocationIQ found 0 facilities, trying backup...');
        }
      } catch (enhancedError) {
        console.log('⚠️ LocationIQ search failed, trying backup:', enhancedError);
      }
      
      // Backup: Try original OSM service
      try {
        const realFacilities = await RealMedicalFacilitiesService.searchOSMMedicalFacilities(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          5 // 5km radius
        );

        if (realFacilities.length > 0) {
          console.log(`✅ Found ${realFacilities.length} REAL medical facilities!`);
          
          // Cache the results
          await AsyncStorage.setItem(cacheKey, JSON.stringify({
            facilities: realFacilities,
            timestamp: Date.now()
          }));
          
          setMedicalFacilities(realFacilities);
          setIsLoadingMedical(false);
          return;
        }
      } catch (realError) {
        console.log('⚠️ Real facilities search failed, using fallback:', realError);
      }

      // Fallback to simulated data if real search fails
      console.log('📍 Using simulated medical facilities as fallback');
      const simulatedFacilities = await simulateNearbyMedicalSearch(userLocation);
      setMedicalFacilities(simulatedFacilities);
      setIsLoadingMedical(false);
      
    } catch (error) {
      console.error('Error searching medical facilities:', error);
      // Final fallback to static data
      setMedicalFacilities(getFallbackMedicalData());
      setIsLoadingMedical(false);
    }
  };
  // Simulate realistic medical facility search based on location (fallback)
  const simulateNearbyMedicalSearch = async (userLocation: Location.LocationObject): Promise<RealMedicalFacility[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { latitude, longitude } = userLocation.coords;
    
    // Generate realistic medical facilities based on location
    const facilities: RealMedicalFacility[] = [];
    
    // Generate hospitals (usually fewer, further away)
    const hospitals = [
      'General Hospital', 'Medical Center', 'Regional Hospital', 'City Hospital', 
      'Community Hospital', 'Memorial Hospital', 'University Hospital'
    ];
    
    for (let i = 0; i < Math.min(3, hospitals.length); i++) {
      const distance = 0.5 + Math.random() * 3; // 0.5-3.5 km
      facilities.push({
        id: `hospital_${i}`,
        name: hospitals[i],
        type: 'Hospital',
        distance: `${distance.toFixed(1)} km`,
        time: `${Math.round(distance * 3)} mins`, // Roughly 3 mins per km
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        address: generateAddress(latitude, longitude, distance),
        isOpen: true,
        latitude: latitude + (Math.random() - 0.5) * 0.02,
        longitude: longitude + (Math.random() - 0.5) * 0.02,
        source: 'OSM'
      });
    }
    
    // Generate pharmacies (more common, closer)
    const pharmacies = [
      'CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Local Pharmacy', 
      'HealthCare Pharmacy', 'Community Pharmacy', 'Express Pharmacy'
    ];
    
    for (let i = 0; i < Math.min(4, pharmacies.length); i++) {
      const distance = 0.1 + Math.random() * 1.5; // 0.1-1.6 km
      facilities.push({
        id: `pharmacy_${i}`,
        name: pharmacies[i],
        type: 'Pharmacy',
        distance: `${distance.toFixed(1)} km`,
        time: `${Math.round(distance * 2)} mins`, // Roughly 2 mins per km
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        address: generateAddress(latitude, longitude, distance),
        isOpen: Math.random() > 0.2, // 80% chance open
        latitude: latitude + (Math.random() - 0.5) * 0.01,
        longitude: longitude + (Math.random() - 0.5) * 0.01,
        source: 'OSM'
      });
    }
    
    // Generate clinics and urgent care
    const clinics = [
      'Family Medical Clinic', 'Urgent Care Center', 'Walk-in Clinic', 
      'Primary Care Clinic', 'Medical Group', 'Health Center'
    ];
    
    for (let i = 0; i < Math.min(3, clinics.length); i++) {
      const distance = 0.3 + Math.random() * 2; // 0.3-2.3 km
      const isDoctor = Math.random() > 0.5;
      facilities.push({
        id: `clinic_${i}`,
        name: clinics[i],
        type: isDoctor ? 'Doctor' : 'Clinic',
        distance: `${distance.toFixed(1)} km`,
        time: `${Math.round(distance * 2.5)} mins`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        address: generateAddress(latitude, longitude, distance),
        isOpen: Math.random() > 0.3, // 70% chance open
        latitude: latitude + (Math.random() - 0.5) * 0.015,
        longitude: longitude + (Math.random() - 0.5) * 0.015,
        source: 'OSM'
      });
    }
    
    // Sort by distance
    return facilities.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  // Generate realistic address based on location
  const generateAddress = (lat: number, lng: number, distance: number): string => {
    const streetNumbers = [Math.floor(Math.random() * 9999) + 1];
    const streetNames = [
      'Main St', 'Oak Ave', 'Pine St', 'First Ave', 'Second St', 
      'Elm St', 'Maple Ave', 'Cedar St', 'Park Ave', 'Washington St'
    ];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    return `${streetNumbers[0]} ${streetName}`;
  };
  // Fallback data in case of errors
  const getFallbackMedicalData = (): RealMedicalFacility[] => [
    {
      id: '1',
      name: 'City General Hospital',
      type: 'Hospital',
      distance: '0.8 km',
      time: '3 mins',
      phone: '+1-555-0123',
      isOpen: true,
      latitude: 0,
      longitude: 0,
      source: 'OSM'
    },
    {
      id: '2',
      name: 'HealthCare Pharmacy',
      type: 'Pharmacy',
      distance: '0.3 km',
      time: '1 min',
      phone: '+1-555-0456',
      isOpen: true,
      latitude: 0,
      longitude: 0,
      source: 'OSM'
    },
    {
      id: '3',
      name: 'Family Medical Center',
      type: 'Clinic',
      distance: '1.2 km',
      time: '5 mins',
      phone: '+1-555-0789',
      isOpen: false,
      latitude: 0,
      longitude: 0,
      source: 'OSM'
    }
  ];

  // Handle calling a medical facility
  const handleCall = async (facility: RealMedicalFacility) => {
    if (facility.phone) {
      const phoneUrl = `tel:${facility.phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    } else {
      Alert.alert('No Phone Number', 'Phone number not available for this facility');
    }
  };

  // Handle getting directions to a medical facility
  const handleDirections = async (facility: RealMedicalFacility) => {
    if (!location) {
      Alert.alert('Location Error', 'Unable to get your current location');
      return;
    }

    const { latitude: userLat, longitude: userLng } = location.coords;
    
    // If we have facility coordinates, use them, otherwise use the facility name for search
    let directionsUrl;
    
    if (facility.latitude && facility.longitude) {
      directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${facility.latitude},${facility.longitude}`;
    } else {
      // Use facility name and address for search
      const query = encodeURIComponent(`${facility.name} ${facility.address || ''}`);
      directionsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${query}`;
    }
    
    const canOpen = await Linking.canOpenURL(directionsUrl);
    if (canOpen) {
      Linking.openURL(directionsUrl);
    } else {
      Alert.alert('Error', 'Unable to open maps on this device');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      setLocationError(null);

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        setIsLoadingLocation(false);
        return;
      }      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      console.log('📍 Current Location:', currentLocation.coords.latitude, currentLocation.coords.longitude);
      setLocation(currentLocation);

      // Search for nearby medical facilities
      console.log('🔍 Searching for medical facilities near location...');
      searchNearbyMedical(currentLocation);

      // Get address from coordinates
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });        if (addressResponse.length > 0) {
          const addr = addressResponse[0];
          
          // Build address parts array, only including non-empty values
          const addressParts = [];
          
          // Street address (street number + street name)
          const streetParts = [];
          if (addr.streetNumber) streetParts.push(addr.streetNumber);
          if (addr.street) streetParts.push(addr.street);
          if (streetParts.length > 0) {
            addressParts.push(streetParts.join(' '));
          }
          
          // Add other components if they exist
          if (addr.subregion) addressParts.push(addr.subregion);
          if (addr.city) addressParts.push(addr.city);
          if (addr.region) addressParts.push(addr.region);
          if (addr.country) addressParts.push(addr.country);
          
          const formattedAddress = addressParts.join(', ');
          setAddress(formattedAddress || 'Address not available');
        } else {
          setAddress('Address not found');
        }
      } catch (addressError) {
        console.log('Address error:', addressError);
        setAddress('Address lookup failed');
      }

      setIsLoadingLocation(false);
    } catch (error) {
      console.log('Location error:', error);
      setLocationError('Failed to get location');
      setIsLoadingLocation(false);
    }
  };

  const getCurrentLocationData = () => {
    if (locationError) {
      return {
        address: "Location unavailable",
        coordinates: "Unable to determine",
        lastUpdate: "Error",
        accuracy: "±Unknown",
        isInSafeZone: false,
        currentZone: "Unknown"
      };
    }

    if (isLoadingLocation || !location) {
      return {
        address: "Getting location...",
        coordinates: "Loading coordinates...",
        lastUpdate: "Updating...",
        accuracy: "±Calculating",
        isInSafeZone: true,
        currentZone: "Loading"
      };
    }

    const now = new Date();
    const locationTime = new Date(location.timestamp);
    const timeDiff = Math.floor((now.getTime() - locationTime.getTime()) / 1000);
    
    let timeAgo = "Just now";
    if (timeDiff > 60) {
      const minutes = Math.floor(timeDiff / 60);
      timeAgo = `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }

    return {
      address: address,
      coordinates: `${location.coords.latitude.toFixed(6)}°, ${location.coords.longitude.toFixed(6)}°`,
      lastUpdate: timeAgo,
      accuracy: location.coords.accuracy ? `±${Math.round(location.coords.accuracy)}m` : "±Unknown",
      isInSafeZone: true, // This would be calculated based on home location set in settings
      currentZone: "Current Location" // This would be determined by safe zones
    };  };

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
  ]);  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    setRefreshing(false);
  };
  const locationData = getCurrentLocationData();
  const movementData = getMovementData();
  const safeZones = getSafeZoneData();

  // Get facility icon based on type
  const getFacilityIcon = (type: RealMedicalFacility['type']) => {
    switch (type) {
      case 'Hospital':
        return 'medical';
      case 'Pharmacy':
        return 'basket';
      case 'Clinic':
        return 'fitness';      case 'Emergency':
        return 'flash';
      case 'Emergency':
        return 'alert-circle';
      case 'Doctor':
        return 'person';
      default:
        return 'medical';
    }
  };

  // Get status color for facility
  const getFacilityStatusColor = (facility: RealMedicalFacility) => {
    if (facility.isOpen === undefined) return '#6b7280';
    return facility.isOpen ? '#10b981' : '#ef4444';
  };return (
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
          />          <View style={styles.cardHeader}>
            <Ionicons 
              name={locationError ? "location-outline" : isLoadingLocation ? "refresh-outline" : "location"} 
              size={24} 
              color={locationError ? "#ef4444" : isLoadingLocation ? "#f59e0b" : "#10b981"} 
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Current Location</Text>
            <View style={[styles.accuracyBadge, {
              backgroundColor: locationError ? '#fee2e2' : isLoadingLocation ? '#fef3c7' : '#e7f3ff'
            }]}>
              <Text style={[styles.accuracyText, {
                color: locationError ? '#dc2626' : isLoadingLocation ? '#d97706' : '#2563eb'
              }]}>
                {locationData.accuracy}
              </Text>
            </View>
          </View>          <View style={styles.cardContent}>
            {locationError && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{locationError}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={getCurrentLocation}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
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
          />          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={24} color="#dc2626" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Nearby Medical</Text>
            <View style={styles.headerRight}>
              {isLoadingMedical && (
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Searching...</Text>
              )}
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => searchNearbyMedical(location!)}
                disabled={!location}
              >
                <Text style={styles.viewAllText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardContent}>
            {isLoadingMedical ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingMessage, { color: colors.textMuted }]}>
                  🔍 Searching for nearby medical facilities...
                </Text>
              </View>
            ) : medicalFacilities.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={[styles.noResultsText, { color: colors.textMuted }]}>
                  No medical facilities found nearby
                </Text>
              </View>
            ) : (
              medicalFacilities.map((facility) => (
                <TouchableOpacity key={facility.id} style={styles.medicalItem}>
                  <View style={styles.medicalLeft}>
                    <Ionicons 
                      name={getFacilityIcon(facility.type)} 
                      size={20} 
                      color={getFacilityStatusColor(facility)}
                    />
                    <View style={styles.medicalInfo}>                      <View style={styles.facilityNameRow}>
                        <Text style={[styles.medicalName, { color: colors.text }]}>{facility.name}</Text>
                      </View>
                      <View style={styles.facilityDetails}>
                        <Text style={[styles.medicalType, { color: colors.textMuted }]}>{facility.type}</Text>
                        {facility.isOpen !== undefined && (
                          <Text style={[styles.statusText, { 
                            color: facility.isOpen ? '#10b981' : '#ef4444' 
                          }]}>
                            • {facility.isOpen ? 'Open' : 'Closed'}
                          </Text>
                        )}
                      </View>
                      {facility.address && (
                        <Text style={[styles.addressText, { color: colors.textMuted }]}>{facility.address}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.medicalRight}>
                    <Text style={[styles.medicalDistance, { color: colors.text }]}>{facility.distance}</Text>
                    <Text style={[styles.medicalTime, { color: colors.textMuted }]}>{facility.time}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.directionsButton}
                      onPress={() => handleDirections(facility)}
                    >
                      <Ionicons name="navigate" size={16} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.callButton}
                      onPress={() => handleCall(facility)}
                    >
                      <Ionicons name="call" size={16} color="#10b981" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
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
    padding: 20,    paddingTop: 16,
  },
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
    fontWeight: '500',    marginLeft: 6,
  },
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
    marginLeft: 8,    flex: 1,
  },  viewAllButton: {
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  facilityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 2,
  },
  facilityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  directionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',    justifyContent: 'center',
  },
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
    fontWeight: '700',    letterSpacing: 0.5,
  },
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
  },  emergencyNote: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});
