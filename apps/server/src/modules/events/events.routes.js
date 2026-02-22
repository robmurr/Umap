import express from 'express';
import { fetchNearbyEvents } from './events.service.js';

const router = express.Router();

/**
 * GET /events
 * Query nearby events by latitude, longitude, and radius
 * Query params:
 *   - lat (required): Latitude
 *   - lng (required): Longitude
 *   - radius (optional): Search radius in meters (default: 1000)
 */
router.get('/', async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;

    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing required query parameters: lat and lng',
      });
    }

    // Validate latitude and longitude are numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid lat or lng: must be numbers',
      });
    }

    // Validate latitude range
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: 'Invalid latitude: must be between -90 and 90',
      });
    }

    // Validate longitude range
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid longitude: must be between -180 and 180',
      });
    }

    // Parse radius and validate
    const searchRadius = radius ? parseInt(radius, 10) : 1000;

    if (isNaN(searchRadius) || searchRadius <= 0) {
      return res.status(400).json({
        error: 'Invalid radius: must be a positive number',
      });
    }

    // Fetch nearby events
    const result = await fetchNearbyEvents(latitude, longitude, searchRadius);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Route error:', error);
    return res.status(500).json({
      error: 'Failed to fetch nearby events',
      message: error.message,
    });
  }
});

export default router;
