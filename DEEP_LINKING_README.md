# Deep Linking Implementation for Event Sharing

This implementation adds deep linking functionality to share events with automatic app detection and Play Store redirection.

## Features

### ✅ Event Sharing
- Users can share events from EventStartScreen
- Generates smart links that work on both mobile and web
- Share message includes event name, venue, date, and join link

### ✅ Deep Link Handling
- **App Installed**: Opens the app directly with event details
- **App Not Installed**: Redirects to Play Store/App Store
- **Web Fallback**: Shows web landing page with download options

### ✅ Cross-Platform Support
- Android: Uses custom scheme `vcmapp://` and HTTPS links
- iOS: Universal Links with associated domains
- Web: Fallback landing page

## Implementation Details

### 1. Deep Link URLs

**App Scheme:**
```
vcmapp://event/{eventId}?name={eventName}&venue={venue}&date={date}
```

**Web Fallback:**
```
https://vcmapp.com/event/{eventId}?name={eventName}&venue={venue}&date={date}
```

### 2. Share Message Format
```
Check out this event: Trail Hunt
Venue: Indore
Date: 2025-10-02

Join here: https://vcmapp.com/event/123?name=Trail%20Hunt&venue=Indore&date=2025-10-02
```

### 3. Flow Diagram

```
User Clicks Share Link
        ↓
Check if VCM App is installed
        ↓
┌─────────────────┬─────────────────┐
│   App Installed │ App Not Installed│
│        ↓        │        ↓        │
│  Open VCM App   │  Redirect to    │
│  Show Join      │  Play Store     │
│  Event Screen   │  or Web Page    │
└─────────────────┴─────────────────┘
```

## Files Modified/Created

### Core Implementation
- `src/screens/JoinEventScreen.js` - New screen for handling event joins
- `src/utils/deepLinkUtils.js` - Utility functions for deep link handling
- `src/navigation/AppNavigator.js` - Added deep link configuration
- `src/screens/EventStartScreen.js` - Updated share functionality
- `App.js` - Added deep link event listeners

### Platform Configuration
- `android/app/src/main/AndroidManifest.xml` - Added intent filters
- `ios/VCMApp/Info.plist` - Added URL schemes and associated domains

### Web Fallback
- `web-landing/event.html` - Landing page for web users

## Usage

### Sharing an Event
```javascript
import { generateShareMessage } from '../utils/deepLinkUtils';

const shareEvent = async (eventData) => {
  const shareData = generateShareMessage(eventData);
  
  await Share.share({
    message: shareData.message,
    url: shareData.url,
    title: shareData.title,
  });
};
```

### Handling Deep Links
```javascript
import { handleIncomingDeepLink } from '../utils/deepLinkUtils';

// In App.js
useEffect(() => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleIncomingDeepLink(url, navigationRef);
  });
  
  return () => subscription?.remove();
}, []);
```

## Testing Deep Links

### Android
```bash
# Test deep link
adb shell am start \
  -W -a android.intent.action.VIEW \
  -d "vcmapp://event/123?name=Test%20Event&venue=Test%20Venue&date=2025-10-02" \
  com.vcmapp
```

### iOS
```bash
# Test deep link in simulator
xcrun simctl openurl booted "vcmapp://event/123?name=Test%20Event&venue=Test%20Venue&date=2025-10-02"
```

### Web Testing
```javascript
// Test in browser console
window.location.href = 'vcmapp://event/123?name=Test%20Event&venue=Test%20Venue&date=2025-10-02';
```

## Deployment Requirements

### Android
1. Update `android:exported="true"` in MainActivity
2. Add intent filters for custom scheme and HTTPS
3. Upload to Play Store with correct package name

### iOS
1. Configure associated domains in Apple Developer Console
2. Add universal links capability
3. Upload to App Store

### Web
1. Host landing page at `https://vcmapp.com/event/`
2. Configure server to handle dynamic routes
3. Add apple-app-site-association file for iOS

## Security Considerations

- Validate all deep link parameters
- Sanitize user input from URLs
- Check authentication before joining events
- Rate limit deep link processing

## Future Enhancements

1. **QR Code Generation** - Generate QR codes for events
2. **Social Media Integration** - Custom sharing for WhatsApp, Telegram
3. **Analytics** - Track deep link usage and conversion rates
4. **Dynamic Links** - Use Firebase Dynamic Links for better reliability
5. **Offline Support** - Cache event data for offline viewing

## Troubleshooting

### Common Issues

1. **Deep link not working**: Check if URL scheme is registered correctly
2. **App not opening**: Verify intent filters in AndroidManifest.xml
3. **iOS not working**: Check associated domains configuration
4. **Web fallback not loading**: Verify CORS and server configuration

### Debug Commands

```bash
# Android: Check intent filters
adb shell dumpsys package com.vcmapp | grep -A 5 -B 5 vcmapp

# iOS: Check URL schemes
xcrun simctl list devices
```

## Support

For issues or questions about the deep linking implementation, please check:
1. React Navigation docs for deep linking
2. Android intent filter documentation  
3. iOS universal links documentation
4. Test with actual devices, not just simulators
