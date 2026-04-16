import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import type GeoJSON from 'geojson';

// Replace with your Mapbox public token (pk.xxx) from mapbox.com/account/access-tokens
// Add your Mapbox public token here (pk.xxx) from https://account.mapbox.com/access-tokens
Mapbox.setAccessToken('YOUR_MAPBOX_PUBLIC_TOKEN');

// NYC bounding box: SW corner to NE corner
const NYC_BOUNDS = {
  ne: [-73.7, 40.92],
  sw: [-74.26, 40.49],
};

// NYC center coordinates
const NYC_CENTER: [number, number] = [-74.006, 40.7128];

// World polygon with NYC hole — masks everything outside the NYC bounds
const NYC_MASK_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      // Outer ring: entire world
      [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
      // Inner ring (hole): NYC bounds — winding order must be opposite
      [[-74.26, 40.49], [-74.26, 40.92], [-73.7, 40.92], [-73.7, 40.49], [-74.26, 40.49]],
    ],
  },
};

const PIZZA_PLACES = [
  {id: '1', name: "Lombardi's", coordinate: [-73.9969, 40.7217] as [number, number]},
  {id: '2', name: "Joe's Pizza", coordinate: [-74.0025, 40.7302] as [number, number]},
  {id: '3', name: 'Di Fara Pizza', coordinate: [-73.9614, 40.6248] as [number, number]},
];

function App() {
  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        <Mapbox.Camera
          zoomLevel={11}
          centerCoordinate={NYC_CENTER}
          maxBounds={NYC_BOUNDS}
          minZoomLevel={3}
          maxZoomLevel={18}
        />
        <Mapbox.ShapeSource id="nycMaskSource" shape={NYC_MASK_GEOJSON}>
          <Mapbox.FillLayer
            id="nycMaskLayer"
            style={{fillColor: '#1a1a2e', fillOpacity: 0.85}}
          />
        </Mapbox.ShapeSource>
        {PIZZA_PLACES.map(place => (
          <Mapbox.PointAnnotation
            key={place.id}
            id={place.id}
            coordinate={place.coordinate}>
            <View style={styles.marker}>
              <Text style={styles.markerText}>🍕</Text>
            </View>
            <Mapbox.Callout title={place.name} />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 28,
  },
});

export default App;