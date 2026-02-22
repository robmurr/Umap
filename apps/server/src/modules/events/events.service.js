import { getEventsNearby } from './events.repository.js';

/**
 * Fetch nearby events based on coordinates and radius
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 1000)
 * @returns {Promise<Object>} Response object with events and metadata
 */
async function fetchNearbyEvents(lat, lng, radius = 1000) {
  try {
    const events = await getEventsNearby(lat, lng, radius);

    return {
      success: true,
      count: events.length,
      radius,
      center: { latitude: lat, longitude: lng },
      events,
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
}

export { fetchNearbyEvents };
