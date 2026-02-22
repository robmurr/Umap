import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function MapScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation] = useState({
    latitude: 40.7128,
    longitude: -73.9352,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Fetch events on mount
  useEffect(() => {
    fetchNearbyEvents();
  }, []);

  const fetchNearbyEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events', {
        params: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          radius: 5000,
        },
      });

      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      navigation.replace('AuthStack');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UMap</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        initialRegion={userLocation}
        onMapReady={() => setMapReady(true)}
        showsUserLocation
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: parseFloat(event.latitude),
              longitude: parseFloat(event.longitude),
            }}
            title={event.name}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{event.name}</Text>
                {event.description && (
                  <Text style={styles.calloutDesc}>{event.description}</Text>
                )}
                {event.start_time && (
                  <Text style={styles.calloutTime}>
                    {new Date(event.start_time).toLocaleString()}
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.eventCount}>
          {events.length} event{events.length !== 1 ? 's' : ''} nearby
        </Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchNearbyEvents}
        >
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  refreshBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  callout: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 250,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  calloutDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutTime: {
    fontSize: 11,
    color: '#999',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
