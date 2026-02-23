import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:4000';

/**
 * Make an API request with automatic JWT token injection
 */
async function request(endpoint, options = {}) {
  try {
    // Get token from storage
    const token = await AsyncStorage.getItem('userToken');

    // Set up headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add token to Authorization header if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      await AsyncStorage.removeItem('userToken');
      throw new Error('Unauthorized - token expired');
    }

    // Parse JSON response
    const data = await response.json();

    // Check if response is ok
    if (!response.ok) {
      throw new Error(data.error || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * GET request
 */
export async function get(endpoint) {
  return request(endpoint, {
    method: 'GET',
  });
}

/**
 * POST request
 */
export async function post(endpoint, body) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 */
export async function put(endpoint, body) {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function del(endpoint) {
  return request(endpoint, {
    method: 'DELETE',
  });
}

export default {
  get,
  post,
  put,
  del,
};

