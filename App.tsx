import React, {useState, useCallback} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import type GeoJSON from 'geojson';
import MAPBOX_ACCESS_TOKEN from './mapbox.config';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const NYC_BOUNDS = {
  ne: [-73.7, 40.92],
  sw: [-74.26, 40.49],
};

const NYC_CENTER: [number, number] = [-74.006, 40.7128];

const NYC_MASK_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
      [[-74.26, 40.49], [-74.26, 40.92], [-73.7, 40.92], [-73.7, 40.49], [-74.26, 40.49]],
    ],
  },
};

const PIZZA_PLACES = [
  {id: '1', name: "Lombardi's", coordinate: [-73.9969, 40.7217] as [number, number]},
  {id: '2', name: "Joe's Pizza", coordinate: [-74.0025, 40.7302] as [number, number]},
  {id: '3', name: 'Di Fara Pizza', coordinate: [-73.9614, 40.6248] as [number, number]},
];

const FULLY_VISIBLE_METERS = 500;
const INVISIBLE_METERS = 2000;

function haversineDistance(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number],
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function proximityOpacity(distance: number): number {
  if (distance <= FULLY_VISIBLE_METERS) return 1;
  if (distance >= INVISIBLE_METERS) return 0;
  return 1 - (distance - FULLY_VISIBLE_METERS) / (INVISIBLE_METERS - FULLY_VISIBLE_METERS);
}

type Screen = 'login' | 'map' | 'settings';

function LoginScreen({onEnter}: {onEnter: () => void}) {
  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginEmoji}>🎯</Text>
      <Text style={styles.loginTitle}>Seeker</Text>
      <Text style={styles.loginSubtitle}>New York City</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onEnter}>
        <Text style={styles.primaryButtonText}>Enter</Text>
      </TouchableOpacity>
    </View>
  );
}

function SettingsScreen({onBack}: {onBack: () => void}) {
  return (
    <View style={styles.settingsContainer}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>Settings</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionLabel}>ACCOUNT</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingsAvatar}>
            <Text style={styles.settingsAvatarText}>J</Text>
          </View>
          <View style={styles.settingsAccountInfo}>
            <Text style={styles.settingsAccountName}>Joe Lohman</Text>
            <Text style={styles.settingsAccountEmail}>jlohman1993@gmail.com</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionLabel}>PREFERENCES</Text>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsRowLabel}>Notifications</Text>
          <Text style={styles.settingsRowValue}>On</Text>
        </View>
        <View style={[styles.settingsRow, styles.settingsRowLast]}>
          <Text style={styles.settingsRowLabel}>Location</Text>
          <Text style={styles.settingsRowValue}>While Using</Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionLabel}>APP</Text>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsRowLabel}>Version</Text>
          <Text style={styles.settingsRowValue}>1.0.0</Text>
        </View>
        <View style={[styles.settingsRow, styles.settingsRowLast]}>
          <Text style={styles.settingsRowLabel}>Region</Text>
          <Text style={styles.settingsRowValue}>New York City</Text>
        </View>
      </View>
    </View>
  );
}

function MapScreen({onSettings}: {onSettings: () => void}) {
  const [mapActive, setMapActive] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  const handleLocationUpdate = useCallback((location: Mapbox.Location) => {
    const {longitude, latitude} = location.coords;
    setUserCoords([longitude, latitude]);
  }, []);

  return (
    <View style={styles.container}>
      {mapActive ? (
        <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
          <Mapbox.Camera
            zoomLevel={11}
            centerCoordinate={NYC_CENTER}
            maxBounds={NYC_BOUNDS}
            minZoomLevel={3}
            maxZoomLevel={18}
          />
          <Mapbox.UserLocation onUpdate={handleLocationUpdate} />
          <Mapbox.ShapeSource id="nycMaskSource" shape={NYC_MASK_GEOJSON}>
            <Mapbox.FillLayer
              id="nycMaskLayer"
              style={{fillColor: '#1a1a2e', fillOpacity: 0.85}}
            />
          </Mapbox.ShapeSource>
          {PIZZA_PLACES.map(place => {
            const opacity = userCoords
              ? proximityOpacity(haversineDistance(userCoords, place.coordinate))
              : 1;
            return (
              <Mapbox.PointAnnotation
                key={place.id}
                id={place.id}
                coordinate={place.coordinate}>
                <View style={[styles.marker, {opacity}]}>
                  <Text style={styles.markerText}>🍕</Text>
                </View>
                <Mapbox.Callout title={place.name} />
              </Mapbox.PointAnnotation>
            );
          })}
        </Mapbox.MapView>
      ) : (
        <View style={styles.mapSuspended} />
      )}

      {!mapActive && (
        <View style={styles.exploreOverlay}>
          <View style={styles.exploreCard}>
            <Text style={styles.exploreEmoji}>🎯</Text>
            <Text style={styles.exploreTitle}>Ready to Seek?</Text>
            <Text style={styles.exploreSubtitle}>Discover hidden spots across NYC</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setMapActive(true)}>
              <Text style={styles.primaryButtonText}>Explore</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.settingsFab} onPress={onSettings}>
        <Text style={styles.settingsFabIcon}>⚙</Text>
      </TouchableOpacity>
    </View>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('login');

  if (screen === 'login') {
    return <LoginScreen onEnter={() => setScreen('map')} />;
  }
  if (screen === 'settings') {
    return <SettingsScreen onBack={() => setScreen('map')} />;
  }
  return <MapScreen onSettings={() => setScreen('settings')} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  // Login screen
  loginContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loginEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#8888aa',
    marginBottom: 32,
  },
  // Suspended map background before activation
  mapSuspended: {
    flex: 1,
    backgroundColor: '#0d1b2a',
  },
  // Overlay sits above the suspended map
  exploreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 12, 24, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreCard: {
    backgroundColor: 'rgba(20, 22, 40, 0.92)',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  exploreEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  exploreTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
  },
  exploreSubtitle: {
    fontSize: 14,
    color: '#7788aa',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  // Shared button
  primaryButton: {
    backgroundColor: '#e63946',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Map markers
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 28,
  },
  // Settings FAB (floating action button on map)
  settingsFab: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(18, 20, 38, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  settingsFabIcon: {
    fontSize: 20,
    color: '#e0e0f0',
    lineHeight: 22,
  },
  // Settings screen
  settingsContainer: {
    flex: 1,
    backgroundColor: '#0f1120',
    paddingTop: 52,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '300',
  },
  backButtonPlaceholder: {
    width: 36,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  settingsSection: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  settingsSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5566aa',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  settingsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  settingsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e63946',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  settingsAccountInfo: {
    flex: 1,
  },
  settingsAccountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 3,
  },
  settingsAccountEmail: {
    fontSize: 13,
    color: '#6677aa',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.07)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.07)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  settingsRowLast: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  settingsRowLabel: {
    fontSize: 15,
    color: '#d0d4f0',
  },
  settingsRowValue: {
    fontSize: 14,
    color: '#5566aa',
  },
});

export default App;