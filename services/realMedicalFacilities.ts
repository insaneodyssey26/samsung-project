// Free OpenStreetMap medical facilities service
// No API key required - completely free!

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
  source: 'OSM' | 'Google' | 'Nominatim' | 'Overpass' | 'LocationIQ';
}

export class RealMedicalFacilitiesService {
  
  /**
   * Search for real medical facilities using OpenStreetMap (FREE)
   */
  static async searchOSMMedicalFacilities(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5
  ): Promise<RealMedicalFacility[]> {
    try {
      console.log(`🔍 Searching real medical facilities near ${latitude}, ${longitude}`);
      
      // Overpass API query for medical facilities
      const overpassQuery = `
        [out:json][timeout:25];
        (
          nwr["amenity"="hospital"](around:${radiusKm * 1000},${latitude},${longitude});
          nwr["amenity"="pharmacy"](around:${radiusKm * 1000},${latitude},${longitude});
          nwr["amenity"="clinic"](around:${radiusKm * 1000},${latitude},${longitude});
          nwr["amenity"="doctors"](around:${radiusKm * 1000},${latitude},${longitude});
          nwr["amenity"="dentist"](around:${radiusKm * 1000},${latitude},${longitude});
          nwr["healthcare"="hospital"](around:${radiusKm * 1000},${latitude},${longitude});
          nwr["healthcare"="clinic"](around:${radiusKm * 1000},${latitude},${longitude});
          nwr["healthcare"="pharmacy"](around:${radiusKm * 1000},${latitude},${longitude});
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
        throw new Error(`OSM API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📍 Found ${data.elements?.length || 0} real medical facilities`);

      if (!data.elements || data.elements.length === 0) {
        console.log('⚠️ No real facilities found');
        return [];
      }

      // Convert OSM data to our format
      const facilities: RealMedicalFacility[] = data.elements
        .filter((element: any) => element.tags?.name)
        .map((element: any): RealMedicalFacility | null => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          
          if (!lat || !lon) return null;

          const distance = this.calculateDistance(latitude, longitude, lat, lon);
          
          return {
            id: `osm_${element.id}`,
            name: element.tags.name,
            type: this.getOSMFacilityType(element.tags),
            latitude: lat,
            longitude: lon,
            distance: `${distance.toFixed(1)} km`,
            time: `${Math.round(distance * 3)} mins`,
            phone: element.tags.phone,
            address: this.buildOSMAddress(element.tags),
            isOpen: this.parseOpeningHours(element.tags.opening_hours),
            source: 'OSM'
          };
        })
        .filter((facility: RealMedicalFacility | null): facility is RealMedicalFacility => facility !== null)
        .sort((a: RealMedicalFacility, b: RealMedicalFacility) => parseFloat(a.distance) - parseFloat(b.distance))
        .slice(0, 15);

      console.log(`✅ Processed ${facilities.length} real medical facilities`);
      return facilities;

    } catch (error) {
      console.error('❌ Error fetching real medical facilities:', error);
      throw error;
    }
  }

  private static getOSMFacilityType(tags: any): RealMedicalFacility['type'] {
    if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') return 'Hospital';
    if (tags.amenity === 'pharmacy' || tags.healthcare === 'pharmacy') return 'Pharmacy';
    if (tags.amenity === 'dentist') return 'Dentist';
    if (tags.amenity === 'doctors' || tags.healthcare === 'clinic') return 'Doctor';
    if (tags.amenity === 'clinic') return 'Clinic';
    if (tags.emergency === 'yes') return 'Emergency';
    return 'Clinic';
  }

  private static buildOSMAddress(tags: any): string {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    return parts.join(', ') || 'Address not available';
  }

  private static parseOpeningHours(openingHours?: string): boolean | undefined {
    if (!openingHours) return undefined;
    if (openingHours.includes('24/7')) return true;
    return undefined;
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
}

export type { RealMedicalFacility };
