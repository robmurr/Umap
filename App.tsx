import React from 'react';
import {StyleSheet, View} from 'react-native';
import Mapbox from '@rnmapbox/maps';

// Replace with your Mapbox public token (pk.xxx) from mapbox.com/account/access-tokens
// Add your Mapbox public token here (pk.xxx) from https://account.mapbox.com/access-tokens
Mapbox.setAccessToken('YOUR_MAPBOX_PUBLIC_TOKEN');

function App() {
  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} />
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
});

export default App;