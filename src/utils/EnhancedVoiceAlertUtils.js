import { Platform, Alert, Vibration } from 'react-native';
import Tts from 'react-native-tts';

// Enhanced Voice Alert Utility with actual Text-to-Speech
class EnhancedVoiceAlertUtils {
  constructor() {
    this.isEnabled = true;
    this.lastAnnouncementTime = 0;
    this.isSpeaking = false;
    this.ttsReady = false;
    
    // Initialize Speech settings with delay
    this.initializeSpeechAsync();
  }

  // Initialize TTS settings asynchronously
  async initializeSpeechAsync() {
    try {
      // Wait a bit for TTS to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if TTS is available
      const voices = await Tts.voices();
      console.log('🔊 TTS voices available:', voices.length);
      
      // Initialize TTS settings
      await Tts.setDefaultRate(0.6); // Slightly slower for clarity
      await Tts.setDefaultPitch(1.0); // Normal pitch
      await Tts.setDefaultLanguage('en-US'); // English
      
      // Set up TTS event listeners
      Tts.addEventListener('tts-start', () => {
        this.isSpeaking = true;
        console.log('🔊 TTS Started');
      });
      
      Tts.addEventListener('tts-finish', () => {
        this.isSpeaking = false;
        console.log('🔊 TTS Finished');
      });
      
      Tts.addEventListener('tts-cancel', () => {
        this.isSpeaking = false;
        console.log('🔊 TTS Cancelled');
      });
      
      this.ttsReady = true;
      console.log('🔊 Enhanced Voice Alert Utils initialized with TTS successfully');
    } catch (error) {
      console.log('Error initializing TTS:', error);
      this.ttsReady = false;
    }
  }

  // Generic announce method with actual speech
  announce(message, priority = 'normal') {
    if (!this.isEnabled) return;

    const now = Date.now();
    
    // ✅ Reduced minimum delay for more responsive alerts
    const minDelay = priority === 'high' ? 100 : 1000; // Reduced delays
    if (now - this.lastAnnouncementTime < minDelay && priority !== 'high') {
      console.log('Voice alert skipped (too frequent):', message);
      return;
    }

    this.lastAnnouncementTime = now;

    // Console log for debugging
    console.log(`🔊 [ENHANCED VOICE ALERT ${priority.toUpperCase()}]: ${message}`);

    // ✅ Stop any current speech immediately before new announcement
    if (this.isSpeaking) {
      this.forceStop();
    }

    // Speak the message
    this.speakMessage(message, priority);
    
    // Add vibration for tactile feedback
    this.addVibrationFeedback(priority);
  }

  // Speak the message using TTS
  async speakMessage(message, priority = 'normal') {
    try {
      // Check if TTS is ready
      if (!this.ttsReady) {
        console.log('🔊 TTS not ready yet, using fallback');
        this.fallbackAnnouncement(message, priority);
        return;
      }

      // ✅ Force stop any current speech immediately
      if (this.isSpeaking) {
        await Tts.stop();
        this.isSpeaking = false;
      }

      // Configure speech rate and pitch based on priority
      const rate = priority === 'high' ? 0.8 : 0.7; // ✅ Slightly faster for more responsive feedback
      const pitch = priority === 'high' ? 1.2 : 1.0; // Higher pitch for urgent messages

      // Set rate and pitch for this message
      await Tts.setDefaultRate(rate);
      await Tts.setDefaultPitch(pitch);

      this.isSpeaking = true;

      // Start speaking with proper promise handling
      try {
        await Tts.speak(message);
        console.log('🔊 Speech initiated:', message.substring(0, 30) + '...');
      } catch (speechError) {
        this.isSpeaking = false;
        console.log('🔊 Speech error:', speechError);
        
        // Fallback to basic announcement if TTS fails
        this.fallbackAnnouncement(message, priority);
      }

    } catch (error) {
      console.log('Error in speakMessage:', error);
      this.isSpeaking = false;
      
      // Fallback to basic announcement
      this.fallbackAnnouncement(message, priority);
    }
  }

  // Fallback announcement if TTS fails
  fallbackAnnouncement(message, priority) {
    console.log(`🔊 [FALLBACK VOICE ALERT ${priority.toUpperCase()}]: ${message}`);
    
    // ✅ No persistent Alert dialog - just console log
    // Alert dialogs stay on screen and don't auto-dismiss, so we avoid them
    if (__DEV__) {
      console.log(`🔊 [DEV FALLBACK]: ${message}`);
    }
  }

  // Add vibration feedback based on priority
  addVibrationFeedback(priority = 'normal') {
    try {
      if (priority === 'high') {
        // Urgent pattern for high priority alerts
        Vibration.vibrate([0, 300, 100, 300, 100, 600]);
      } else {
        // Gentle pattern for normal alerts
        Vibration.vibrate([0, 150, 50, 150]);
      }
    } catch (error) {
      console.log('Error with vibration:', error);
    }
  }

  // 1. Event Start Voice Alert
  announceEventStart(eventName) {
    const message = `This event has started. Welcome to ${eventName || 'your event'}. Drive safely and follow the checkpoints.`;
    this.announce(message, 'high');
  }

  // 2. Checkpoint Completion Voice Alert  
  announceCheckpointComplete(checkpointName, completedCount, totalCount) {
    const message = `Checkpoint ${checkpointName || 'reached'} completed successfully. ${completedCount} of ${totalCount} checkpoints finished.`;
    this.announce(message, 'normal');
  }

  // 3. Overspeed Voice Alert
  announceOverspeed(currentSpeed, speedLimit) {
    const message = `You are driving at ${currentSpeed} kilometers per hour. Speed limit is ${speedLimit}. Please reduce your speed immediately.`;
    this.announce(message, 'high');
  }

  // 4. Event Finish Voice Alert
  announceEventFinish(totalCheckpoints, duration) {
    const message = `Congratulations! Event completed successfully. You have finished all ${totalCheckpoints} checkpoints. Well done and drive safely.`;
    this.announce(message, 'high');
  }

  // 5. Time Limit Warning (15 minutes before)
  announceTimeWarning(remainingMinutes) {
    const message = `Time alert! You have ${remainingMinutes} minutes remaining to complete the event. Please continue to the next checkpoint.`;
    this.announce(message, 'high');
  }

  // Additional helpful announcements
  announceLocationFound() {
    const message = 'Current location found successfully.';
    this.announce(message, 'normal');
  }

  announceLocationError() {
    const message = 'Unable to get your current location. Please check your GPS settings.';
    this.announce(message, 'normal');
  }

  announceEventAborted() {
    const message = 'Event has been aborted. Thank you for participating.';
    this.announce(message, 'high');
  }

  announceSOSActivated() {
    const message = 'Emergency S.O.S activated. Calling event organizer.';
    this.announce(message, 'high');
  }

  // Test all voice alerts with actual speech
  testAllAlerts() {
    console.log('🔊 Testing all enhanced voice alerts with actual speech...');
    
    // Show immediate feedback
    Alert.alert(
      '🔊 Enhanced Voice Alert Test',
      'Testing all 5 voice alerts with actual speech synthesis. Listen for the spoken messages.',
      [{ text: 'Start Test', onPress: () => this.runTestSequence() }]
    );
  }

  // Run the test sequence
  runTestSequence() {
    this.announceEventStart('Test Event');
    
    setTimeout(() => {
      this.announceCheckpointComplete('Test Checkpoint Alpha', 1, 5);
    }, 6000);
    
    setTimeout(() => {
      this.announceOverspeed(80, 60);
    }, 12000);
    
    setTimeout(() => {
      this.announceTimeWarning(15);
    }, 18000);
    
    setTimeout(() => {
      this.announceEventFinish(5, '1 hour 30 minutes');
    }, 24000);

    // Final completion message
    setTimeout(() => {
      Alert.alert(
        '🔊 Enhanced Voice Test Complete',
        'All voice alerts with speech synthesis have been tested. You should have heard actual spoken messages.',
        [{ text: 'Excellent!' }]
      );
    }, 30000);
  }

  // Stop current speech immediately
  async stopSpeaking() {
    try {
      if (this.ttsReady && this.isSpeaking) {
        await Tts.stop();
        // Force immediate stop
        this.isSpeaking = false;
      }
      console.log('🔊 Speech stopped immediately');
    } catch (error) {
      console.log('Error stopping speech:', error);
      this.isSpeaking = false;
    }
  }

  // ✅ Additional stop method for immediate response
  async stop() {
    await this.stopSpeaking();
  }

  // ✅ Force stop all TTS activity immediately
  async forceStop() {
    try {
      this.isSpeaking = false;
      if (this.ttsReady) {
        await Tts.stop();
      }
      console.log('🔊 All speech activity force stopped');
    } catch (error) {
      console.log('Error in force stop:', error);
      this.isSpeaking = false;
    }
  }

  // Enable/disable voice alerts
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopSpeaking();
    }
    console.log(`🔊 Enhanced voice alerts ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get current speaking status
  isSpeakingNow() {
    return this.isSpeaking;
  }

  // Cleanup method
  async cleanup() {
    // ✅ Force stop all speech immediately
    await this.forceStop();
    
    // Remove TTS event listeners
    try {
      if (this.ttsReady) {
        Tts.removeAllListeners('tts-start');
        Tts.removeAllListeners('tts-finish');
        Tts.removeAllListeners('tts-cancel');
      }
    } catch (error) {
      console.log('Error removing TTS listeners:', error);
    }
    
    this.ttsReady = false;
    this.isSpeaking = false;
    console.log('🔊 Enhanced Voice Alert Utils cleaned up completely');
  }
}

// Export singleton instance
export default new EnhancedVoiceAlertUtils();
