# Network Detection Implementation Guide

## Overview
This implementation adds comprehensive online/offline detection to your React Native app. Users will only be able to refresh events when connected to the internet, and will see appropriate messages when offline.

## Files Added/Modified

### 1. NetworkUtils.js (`src/utils/NetworkUtils.js`)
A reusable utility class for network detection that can be used across your app.

**Key Features:**
- Real-time network status monitoring
- Cross-platform offline alerts (Toast for Android, Alert for iOS)
- Helper functions for conditional API calls
- Detailed network information retrieval

### 2. HomeScreen.js (Modified)
Updated to integrate network detection with the following changes:
- Network status monitoring with visual indicators
- Conditional API calls based on connectivity
- Offline-specific UI states and messages
- Network status indicator in the header

### 3. AndroidManifest.xml (Modified)
Added `ACCESS_NETWORK_STATE` permission for Android network detection.

## How It Works

### 1. Network Status Monitoring
```javascript
// Automatically initializes on app start
NetworkUtils.initialize();

// Listen for network changes
const unsubscribe = NetworkUtils.addNetworkListener((isOnline) => {
  setIsOnline(isOnline);
});
```

### 2. Conditional API Calls
```javascript
// Before making API calls
const isConnected = await NetworkUtils.getCurrentNetworkStatus();
if (!isConnected) {
  NetworkUtils.showOfflineToast('Please connect to the internet');
  return;
}
// Proceed with API call
```

### 3. Visual Indicators
- **Online**: Green indicator showing "🟢 Online"
- **Offline**: Red indicator showing "🔴 Offline"
- **Empty State**: Different messages for offline vs no events

## User Experience

### When Online:
- Normal app functionality
- API calls work as expected
- Pull-to-refresh functions normally
- Green online indicator in header

### When Offline:
- Pull-to-refresh shows alert: "Please connect to the internet to refresh events"
- API calls show toast: "Unable to refresh events. Please check your internet connection"
- Empty state shows offline message with "Check Network Status" button
- Red offline indicator in header

## Testing Scenarios

### 1. Start App Offline
- App shows offline indicator
- Empty state displays offline message
- Pull-to-refresh shows connection required alert

### 2. Go Offline While Using App
- Indicator changes to red offline status
- Subsequent refresh attempts show offline messages
- Existing events remain visible

### 3. Come Back Online
- Indicator changes to green online status
- Pull-to-refresh works normally
- Can fetch fresh events

### 4. Network Errors During API Calls
- Detects if error is network-related
- Shows appropriate error messages
- Distinguishes between network errors and API errors

## Reusability

The NetworkUtils class can be easily integrated into other screens:

```javascript
// In any screen component
import NetworkUtils from '../utils/NetworkUtils';

// Check before any network operation
const handleSomeAction = async () => {
  const executed = await NetworkUtils.executeIfOnline(
    () => performNetworkAction(),
    'This action requires internet connection'
  );
};
```

## Benefits

1. **Better UX**: Users get clear feedback about connectivity issues
2. **Prevents Errors**: Avoids unnecessary API calls when offline
3. **Consistent Messaging**: Standardized offline messages across the app
4. **Reusable**: Can be easily added to other screens
5. **Visual Feedback**: Real-time network status indicator
6. **Platform Optimized**: Uses appropriate message types for Android/iOS

## Future Enhancements

- Add offline data caching
- Implement retry mechanisms when coming back online
- Add bandwidth detection for slower connections
- Queue API calls for when connection returns