const LOCATIONIQ_API_KEY = 'pk.c374d72a740f6880fcfad8cdf4508854';

interface RealMedicalFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Pharmacy' | 'Clinic' | 'Doctor' | 'Dentist' | 'Emergency';
  latitude: number;
  longitude: number;
  distance: string;
  time: string;
  phone?: string;
  address?: string;
  isOpen?: boolean;
  rating?: number;
  website?: string;
  source: 'OSM' | 'Nominatim' | 'Overpass' | 'LocationIQ' | 'Community' | 'Google';
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  types: string[];
  business_status?: string;
  opening_hours?: {
    open_now: boolean;
  };
}

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  opening_hours?: {
    open_now: boolean;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address?: string;
  vicinity?: string;
  types: string[];
}

export class LocationIQMedicalService {
  
  // Google Places API methods for enhanced facility data
  static async searchGooglePlaces(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5
  ): Promise<RealMedicalFacility[]> {
    const allFacilities: RealMedicalFacility[] = [];
    const radius = Math.min(radiusKm * 1000, 50000); // Convert to meters, max 50km
    
    // Search for different types of medical facilities
    const medicalTypes = [
      'hospital',
      'pharmacy',
      'doctor',
      'dentist',
      'health'
    ];

    for (const type of medicalTypes) {
      try {
        console.log(`🔍 Searching Google Places for: ${type}`);
        
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results) {
          console.log(`📍 Google Places found ${data.results.length} ${type} facilities`);
          
          for (const place of data.results) {
            // Get detailed information including phone number
            const detailedPlace = await this.getGooglePlaceDetails(place.place_id);
            
            if (detailedPlace) {
              const distance = this.calculateDistance(
                latitude, longitude,
                detailedPlace.geometry.location.lat,
                detailedPlace.geometry.location.lng
              );
              
              const facility: RealMedicalFacility = {
                id: `google_${detailedPlace.place_id}`,
                name: detailedPlace.name,
                type: this.getMedicalTypeFromGoogle(detailedPlace.types),
                latitude: detailedPlace.geometry.location.lat,
                longitude: detailedPlace.geometry.location.lng,
                distance: `${distance.toFixed(1)} km`,
                time: `${Math.round(distance * 3)} mins`,
                phone: detailedPlace.formatted_phone_number || detailedPlace.international_phone_number,
                address: detailedPlace.formatted_address || detailedPlace.vicinity,
                isOpen: detailedPlace.opening_hours?.open_now,
                rating: detailedPlace.rating,
                website: detailedPlace.website,
                source: 'Google'
              };
              
              allFacilities.push(facility);
            }
          }
        } else {
          console.log(`⚠️ Google Places API error for ${type}:`, data.status, data.error_message);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Google Places search failed for ${type}:`, error);
      }
    }
    
    return this.removeDuplicates(allFacilities);
  }

  static async getGooglePlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const fields = 'place_id,name,formatted_phone_number,international_phone_number,website,rating,opening_hours,geometry,formatted_address,vicinity,types';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        return data.result;
      } else {
        console.log(`⚠️ Google Place Details error for ${placeId}:`, data.status);
        return null;
      }
    } catch (error) {
      console.log(`❌ Google Place Details failed for ${placeId}:`, error);
      return null;
    }
  }

  static getMedicalTypeFromGoogle(types: string[]): RealMedicalFacility['type'] {
    const typeMap: Record<string, RealMedicalFacility['type']> = {
      'hospital': 'Hospital',
      'pharmacy': 'Pharmacy',
      'doctor': 'Doctor',
      'dentist': 'Dentist',
      'health': 'Clinic',
      'medical_center': 'Clinic',
      'physiotherapist': 'Clinic',
      'veterinary_care': 'Clinic'
    };

    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }
    
    // Default classification based on name patterns
    const typeString = types.join(' ').toLowerCase();
    if (typeString.includes('hospital')) return 'Hospital';
    if (typeString.includes('pharmacy')) return 'Pharmacy';
    if (typeString.includes('dentist') || typeString.includes('dental')) return 'Dentist';
    if (typeString.includes('doctor') || typeString.includes('physician')) return 'Doctor';
    
    return 'Clinic';
  }

  private static async searchLocationIQ(
    latitude: number, 
    longitude: number, 
    radiusKm: number
  ): Promise<RealMedicalFacility[]> {
    const medicalTypes = [
      'hospital',
      'pharmacy', 
      'clinic',
      'doctors',
      'dentist',
      'health'
    ];
    
    const allResults: RealMedicalFacility[] = [];
    
    for (const type of medicalTypes) {
      try {
        const url = `https://us1.locationiq.com/v1/nearby.php?` +
          `key=${LOCATIONIQ_API_KEY}&` +
          `lat=${latitude}&lon=${longitude}&` +
          `tag=amenity:${type}&` +
          `radius=${radiusKm * 1000}&` +
          `format=json&limit=20`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.log(`LocationIQ ${type} search failed: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          for (const place of data) {
            if (place.display_name && place.lat && place.lon) {
              const distance = this.calculateDistance(
                latitude, longitude, 
                parseFloat(place.lat), 
                parseFloat(place.lon)
              );
              
              allResults.push({
                id: `liq_${place.place_id || place.osm_id}`,
                name: this.cleanLocationIQName(place.display_name),
                type: this.getMedicalTypeFromLocationIQ(type, place.display_name),
                latitude: parseFloat(place.lat),
                longitude: parseFloat(place.lon),
                distance: `${distance.toFixed(1)} km`,
                time: `${Math.round(distance * 3)} mins`,
                address: place.display_name,
                phone: place.phone,
                source: 'LocationIQ'
              });
            }
          }        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`LocationIQ search failed for ${type}:`, error);
      }
    }
      return allResults;
  }
  
  private static async searchOSMOverpass(
    latitude: number, 
    longitude: number, 
    radiusKm: number
  ): Promise<RealMedicalFacility[]> {
    const overpassQuery = `
      [out:json][timeout:30];
      (
        nwr["amenity"="hospital"](around:${radiusKm * 1000},${latitude},${longitude});
        nwr["amenity"="pharmacy"](around:${radiusKm * 1000},${latitude},${longitude});
        nwr["amenity"="clinic"](around:${radiusKm * 1000},${latitude},${longitude});
        nwr["amenity"="doctors"](around:${radiusKm * 1000},${latitude},${longitude});
        nwr["amenity"="dentist"](around:${radiusKm * 1000},${latitude},${longitude});
        nwr["healthcare"](around:${radiusKm * 1000},${latitude},${longitude});
        nwr["emergency"="yes"](around:${radiusKm * 1000},${latitude},${longitude});
        nwr["medical"](around:${radiusKm * 1000},${latitude},${longitude});
      );
      out center meta;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      return [];
    }

    return data.elements
      .filter((element: any) => element.tags?.name)
      .map((element: any): RealMedicalFacility | null => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        
        if (!lat || !lon) return null;

        const distance = this.calculateDistance(latitude, longitude, lat, lon);
        
        return {
          id: `osm_${element.id}`,
          name: element.tags.name,
          type: this.getMedicalTypeFromOSM(element.tags),
          latitude: lat,
          longitude: lon,
          distance: `${distance.toFixed(1)} km`,
          time: `${Math.round(distance * 3)} mins`,
          phone: element.tags.phone,
          address: this.formatOSMAddress(element.tags),
          isOpen: this.parseOpeningHours(element.tags.opening_hours),
          source: 'OSM'
        };
      })      .filter(Boolean) as RealMedicalFacility[];
  }
  
  private static async searchNominatim(
    latitude: number, 
    longitude: number, 
    radiusKm: number
  ): Promise<RealMedicalFacility[]> {
    const searchTerms = ['hospital', 'pharmacy', 'clinic', 'medical center', 'urgent care'];
    const allResults: RealMedicalFacility[] = [];
    
    for (const term of searchTerms) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(term)}&` +
          `lat=${latitude}&lon=${longitude}&` +
          `addressdetails=1&limit=10&format=json&` +
          `bounded=1&viewbox=${longitude - 0.1},${latitude + 0.1},${longitude + 0.1},${latitude - 0.1}`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'MedicalApp/1.0 (medical facility search)'
          }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        for (const result of data) {
          const distance = this.calculateDistance(
            latitude, longitude, 
            parseFloat(result.lat), 
            parseFloat(result.lon)
          );
          
          if (distance <= radiusKm) {
            allResults.push({
              id: `nom_${result.place_id}`,
              name: result.display_name.split(',')[0],
              type: this.getMedicalTypeFromNominatim(result),
              latitude: parseFloat(result.lat),
              longitude: parseFloat(result.lon),
              distance: `${distance.toFixed(1)} km`,
              time: `${Math.round(distance * 3)} mins`,
              address: result.display_name,
              source: 'Nominatim'
            });
          }        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`Nominatim search failed for ${term}:`, error);
      }
    }
      return allResults;
  }
  private static cleanLocationIQName(displayName: string): string {
    const parts = displayName.split(',');
    return parts[0].trim();
  }
    private static getMedicalTypeFromLocationIQ(searchType: string, displayName: string): RealMedicalFacility['type'] {
    const name = displayName.toLowerCase();
    
    if (searchType === 'hospital') return 'Hospital';
    if (searchType === 'pharmacy') return 'Pharmacy';
    if (searchType === 'dentist') return 'Dentist';
    if (searchType === 'doctors') return 'Doctor';
    
    if (name.includes('hospital') || name.includes('medical center')) return 'Hospital';
    if (name.includes('pharmacy') || name.includes('drugstore')) return 'Pharmacy';
    if (name.includes('dental') || name.includes('dentist')) return 'Dentist';
    if (name.includes('doctor') || name.includes('physician') || name.includes('dr.')) return 'Doctor';
    if (name.includes('emergency') || name.includes('urgent')) return 'Emergency';
    
    return 'Clinic';
  }
  
  private static getMedicalTypeFromOSM(tags: any): RealMedicalFacility['type'] {
    if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') return 'Hospital';
    if (tags.amenity === 'pharmacy' || tags.healthcare === 'pharmacy') return 'Pharmacy';
    if (tags.amenity === 'dentist') return 'Dentist';
    if (tags.amenity === 'doctors') return 'Doctor';
    if (tags.emergency === 'yes') return 'Emergency';
    return 'Clinic';
  }
  
  private static getMedicalTypeFromNominatim(result: any): RealMedicalFacility['type'] {
    const name = result.display_name.toLowerCase();
    if (name.includes('hospital')) return 'Hospital';
    if (name.includes('pharmacy')) return 'Pharmacy';
    if (name.includes('dental') || name.includes('dentist')) return 'Dentist';
    if (name.includes('doctor') || name.includes('physician')) return 'Doctor';
    if (name.includes('emergency') || name.includes('urgent')) return 'Emergency';
    return 'Clinic';
  }
  
  private static formatOSMAddress(tags: any): string {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    return parts.join(' ') || '';
  }
    private static parseOpeningHours(openingHours?: string): boolean | undefined {
    if (!openingHours) return undefined;
    return !openingHours.toLowerCase().includes('closed');
  }
    private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private static removeDuplicates(facilities: RealMedicalFacility[]): RealMedicalFacility[] {
    const seen = new Set();
    return facilities.filter(facility => {
      const key = `${facility.name}_${facility.latitude.toFixed(4)}_${facility.longitude.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  private static sortByDistance(facilities: RealMedicalFacility[]): RealMedicalFacility[] {
    return facilities.sort((a, b) => {
      const distanceA = parseFloat(a.distance);
      const distanceB = parseFloat(b.distance);
      return distanceA - distanceB;
    });
  }

  // Enhanced main search method that tries Google Places first  // Enhanced main search method that tries Google Places first
  static async searchRealMedicalFacilities(    latitude: number, 
    longitude: number, 
    radiusKm: number = 5
  ): Promise<RealMedicalFacility[]> {
    const allFacilities: RealMedicalFacility[] = [];
    
    try {
      console.log(`🔍 Searching REAL medical facilities near ${latitude}, ${longitude}`);      // 1. Try Google Places API first (best data quality and phone numbers)
      if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY') {
        console.log(`🔑 Using Google Places API Key: ${GOOGLE_PLACES_API_KEY.substring(0, 8)}...`);
        try {
          const googleFacilities = await this.searchGooglePlaces(latitude, longitude, radiusKm);
          console.log(`📍 Google Places found: ${googleFacilities.length} facilities`);
          allFacilities.push(...googleFacilities);
          
          // If we got good results from Google, we can return early or supplement with other sources
          if (googleFacilities.length >= 5) {
            console.log(`✅ Got sufficient results from Google Places (${googleFacilities.length})`);
            return this.sortByDistance(allFacilities);
          }
        } catch (error) {
          console.log('⚠️ Google Places failed:', error);
        }
      } else {
        console.log('⚠️ Google Places API key not configured');
      }

      // 2. Try LocationIQ if we need more results
      if (LOCATIONIQ_API_KEY && LOCATIONIQ_API_KEY.startsWith('pk.')) {
        console.log(`🔑 Using LocationIQ API Key: ${LOCATIONIQ_API_KEY.substring(0, 8)}...`);
        try {
          const locationIQFacilities = await this.searchLocationIQ(latitude, longitude, radiusKm);
          console.log(`📍 LocationIQ found: ${locationIQFacilities.length} facilities`);
          allFacilities.push(...locationIQFacilities);
        } catch (error) {
          console.log('⚠️ LocationIQ failed:', error);
        }      } else {
        console.log('⚠️ LocationIQ API key not configured');
      }
      
      // 3. Try OSM Overpass as additional source
      if (allFacilities.length < 8) {
        try {
          const osmFacilities = await this.searchOSMOverpass(latitude, longitude, radiusKm);
          console.log(`📍 OSM Overpass found: ${osmFacilities.length} facilities`);
          allFacilities.push(...osmFacilities);      } catch (error) {
          console.log('⚠️ OSM Overpass failed:', error);
        }      }
      
      // 4. Use Nominatim as final fallback
      if (allFacilities.length < 5) {
        try {
          const nominatimFacilities = await this.searchNominatim(latitude, longitude, radiusKm);
          console.log(`📍 Nominatim found: ${nominatimFacilities.length} facilities`);
          allFacilities.push(...nominatimFacilities);
        } catch (error) {
          console.log('⚠️ Nominatim failed:', error);        }
      }
        // Remove duplicates and sort by distance
      const uniqueFacilities = this.removeDuplicates(allFacilities);      const sortedFacilities = this.sortByDistance(uniqueFacilities);
      
      console.log(`✅ Total REAL facilities found: ${sortedFacilities.length}`);
      return sortedFacilities.slice(0, 20);
      
    } catch (error) {
      console.error('Error in searchRealMedicalFacilities:', error);
      return [];    }
  }
}
