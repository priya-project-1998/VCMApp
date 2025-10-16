import { Platform, NativeModules } from 'react-native';

// Enhanced Voice Alert Utility with sound for Android only
// Using native sound module to avoid dependency issues
class EnhancedVoiceAlertUtils {
  constructor() {
    // Initialize sound objects
    this.sounds = {};
    this.isAndroid = Platform.OS === 'android';
    
    // Define the event types
    this.eventTypes = {
      EVENT_START: 'event_start',
      CHECKPOINT: 'checkpoint',
      EVENT_END: 'event_end',
      OVER_SPEED: 'over_speed',
      TIME_FRAME_LIMIT: 'time_frame_limit'
    };
    
    // Pre-load sounds on Android only
    if (this.isAndroid) {
      console.log('EnhancedVoiceAlertUtils initialized - using native sound module');
    }
  }
  
  // Play alert with sound only for Android
  playAlert(eventType) {
    // Only play on Android
    if (!this.isAndroid) return;
    
    //console.log(`Playing sound alert for: ${eventType}`);
    
    // Safe wrapper function that never throws or rejects
    const safePlay = async (soundName) => {
      try {
        // First safely release any previous sounds
        await this.release();
        
        // After release, play the new sound if module exists
        if (NativeModules.SoundModule) {
          try {
            const result = await NativeModules.SoundModule.playSound(soundName);
            //console.log('Sound played successfully:', result);
          } catch (playError) {
            // Just log errors but don't propagate them
            console.log(`Non-critical error playing sound ${soundName}:`, playError);
          }
        }
      } catch (error) {
        // This should never happen with our safe release() method, but just in case
        console.log(`Safely handled error in playAlert sequence:`, error);
      }
    };
    
    // Convert EVENT_START to event_start format for file names
    const soundName = eventType.toLowerCase();
    
    // Call our safe wrapper
    safePlay(soundName);
  }
  
  // Event start notification
  notifyEventStart() {
    if (this.isAndroid) {
      //console.log('Playing event start alert');
      this.playAlert(this.eventTypes.EVENT_START);
    }
  }
  
  // Checkpoint reached notification
  notifyCheckpoint() {
    if (this.isAndroid) {
      console.log('Playing checkpoint alert');
      this.playAlert(this.eventTypes.CHECKPOINT);
    }
  }
  
  // Event end notification
  notifyEventEnd() {
    if (this.isAndroid) {
      console.log('Playing event end alert');
      this.playAlert(this.eventTypes.EVENT_END);
    }
  }
  
  // Over speed notification
  notifyOverSpeed() {
    if (this.isAndroid) {
      //console.log('Playing over speed alert');
      this.playAlert(this.eventTypes.OVER_SPEED);
    }
  }
  
  // Time frame limit notification
  notifyTimeFrameLimit() {
    if (this.isAndroid) {
      console.log('Playing time frame limit alert');
      this.playAlert(this.eventTypes.TIME_FRAME_LIMIT);
    }
  }
  
  // Release resources when app is closing or component unmounts
  release() {
    // Return a promise for proper chaining
    return new Promise((resolve) => {
      if (!this.isAndroid) {
        // Resolve immediately on non-Android platforms
        resolve("Not on Android platform");
        return;
      }
      
      // Stop any sound playback
      if (!NativeModules.SoundModule) {
        // No sound module available
        resolve("SoundModule not available");
        return;
      }
      
      // Safe wrapper for stopSound that never rejects
      const safeStopSound = () => {
        // Create a timeout to ensure we always resolve
        const timeoutId = setTimeout(() => {
          console.warn('SoundModule.stopSound timed out, resolving anyway');
          resolve("Timeout - resolved anyway");
        }, 1000); // 1 second timeout
        
        try {
          // Call stopSound and handle the Promise safely
          NativeModules.SoundModule.stopSound()
            .then(result => {
              clearTimeout(timeoutId);
              //console.log('Sound stopped successfully:', result);
              resolve(result);
            })
            .catch(() => {
              // This should never happen now with our improved native module
              clearTimeout(timeoutId);
              console.log('Safely handled stopSound rejection');
              resolve("Handled stopSound rejection");
            });
        } catch (err) {
          // Handle any synchronous errors
          clearTimeout(timeoutId);
          console.log('Safely handled stopSound exception:', err);
          resolve("Handled stopSound exception");
        }
      };
      
      // Call our safe wrapper
      safeStopSound();
    });
  }
  
  // Force stop any ongoing sound playback
  forceStop() {
    if (!this.isAndroid) return Promise.resolve("Not on Android platform");
    return this.release();
  }
  
  // Stop speaking (alias for release)
  stopSpeaking() {
    if (!this.isAndroid) return Promise.resolve("Not on Android platform");
    return this.release();
  }
  
  // Set volume level (0.0 - 1.0)
  setVolume(volume = 1.0) {
    return new Promise((resolve) => {
      if (!this.isAndroid) {
        resolve("Not on Android platform");
        return;
      }
      
      if (!NativeModules.SoundModule) {
        resolve("SoundModule not available");
        return;
      }
      
      // Safe wrapper for setVolume that never rejects
      const safeSetVolume = () => {
        // Create a timeout to ensure we always resolve
        const timeoutId = setTimeout(() => {
          console.log('setVolume timed out, resolving anyway');
          resolve("Timeout - resolved anyway");
        }, 1000); // 1 second timeout
        
        try {
          // Ensure volume is between 0.0 and 1.0
          const safeVolume = Math.max(0.0, Math.min(1.0, volume));
          
          NativeModules.SoundModule.setVolume(safeVolume)
            .then((result) => {
              clearTimeout(timeoutId);
              console.log(`Volume set to ${safeVolume}`);
              resolve(result);
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              console.log('Safely handled setVolume rejection:', error);
              resolve("Handled setVolume rejection");
            });
        } catch (err) {
          clearTimeout(timeoutId);
          console.log('Safely handled setVolume exception:', err);
          resolve("Handled setVolume exception");
        }
      };
      
      // Call our safe wrapper
      safeSetVolume();
    });
  }
  
  // Compatibility methods with existing voice utils
  announceEventStart() {
    this.notifyEventStart();
  }
  
  announceEventFinish() {
    this.notifyEventEnd();
  }
  
  announceEventAborted() {
    this.notifyEventEnd();
  }
  
  announceCheckpointComplete() {
    this.notifyCheckpoint();
  }
  
  announceOverspeed() {
    this.notifyOverSpeed();
  }
  
  announceTimeWarning() {
    this.notifyTimeFrameLimit();
  }
  
  testAllAlerts() {
    if (!this.isAndroid) return;
    
    console.log('Testing all alerts');
    setTimeout(() => this.notifyEventStart(), 0);
    setTimeout(() => this.notifyCheckpoint(), 2000);
    setTimeout(() => this.notifyOverSpeed(), 4000);
    setTimeout(() => this.notifyTimeFrameLimit(), 6000);
    setTimeout(() => this.notifyEventEnd(), 8000);
  }
  
  // Alias for release method to match the function call in MapScreen.js
  cleanup() {
    // This method should never reject, it always resolves
    return this.release()
      .then(result => {
        console.log('Sound cleanup completed:', result);
        return result;
      })
      .catch(() => {
        // This should never happen with our safe release implementation
        // but we add this as an extra safety layer
        console.log('Safely handled unexpected error during cleanup');
        return "Safely handled cleanup error";
      });
  }
}

// Export singleton instance
export default new EnhancedVoiceAlertUtils();
