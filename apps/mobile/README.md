# UMap Mobile App

React Native Expo app for discovering events near you.

## Setup

### Install dependencies
```bash
cd apps/mobile
npm install
```

### Start the app
```bash
npm start
```

Then choose:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

### Backend Connection

The app connects to the Node.js backend running on:
```
http://localhost:4000
```

Make sure the backend server is running before testing the app.

## Project Structure

```
src/
├── screens/
│   ├── LoginScreen.js      # Login form
│   └── MapScreen.js        # Map with event markers
├── services/
│   └── api.js              # Axios configuration with JWT interceptor
└── navigation/
    └── Navigation.js       # React Navigation setup
```

## Features

- **Login Screen**: Email/password authentication (demo mode)
- **Map Screen**: Shows nearby events as map markers
- **Event Details**: Tap markers to see event information
- **JWT Token**: Automatically attached to API requests
- **AsyncStorage**: Stores user token locally

## API Endpoints

- `GET /events?lat={lat}&lng={lng}&radius={radius}` - Get nearby events
- `GET /health` - Health check
- `POST /auth/login` - Login (placeholder)

## Notes

- The login uses a mock token for demo purposes
- Update the API base URL in `src/services/api.js` for production
- Add real authentication when backend is ready
