import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from '../services/api';

const INITIAL_LOCATION = {
  latitude: 40.7128,
  longitude: -73.9352,
};

export default function MapScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation] = useState(INITIAL_LOCATION);

  // Fetch events on mount
  useEffect(() => {
    fetchNearbyEvents();
  }, []);

  const fetchNearbyEvents = async () => {
    try {
      setLoading(true);
      const response = await get(
        `/events?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=5000`
      );

      setEvents(response.events || []);
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

  const renderEventItem = ({ item }) => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      item.latitude,
      item.longitude
    );

    return (
      <View style={styles.eventCard}>
        <Text style={styles.eventName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.eventDescription}>{item.description}</Text>
        )}
        <View style={styles.eventDetails}>
          {item.start_time && (
            <Text style={styles.eventTime}>
              📅 {new Date(item.start_time).toLocaleDateString()}
            </Text>
          )}
          <Text style={styles.eventDistance}>📍 {distance.toFixed(1)} km away</Text>
        </View>
      </View>
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UMap</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      <View style={styles.locationInfo}>
        <Text style={styles.locationText}>
          📍 New York, NY • {userLocation.latitude}, {userLocation.longitude}
        </Text>
      </View>

      {/* Events List */}
      {events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events found nearby</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.eventCount}>
          {events.length} event{events.length !== 1 ? 's' : ''} nearby
        </Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchNearbyEvents}
        >
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e3f2fd',
    borderBottomWidth: 1,
    borderBottomColor: '#90caf9',
  },
  locationText: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
  },
  eventCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  eventTime: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  eventDistance: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
