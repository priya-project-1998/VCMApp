import NetInfo from '@react-native-community/netinfo';
import { Alert, ToastAndroid, Platform } from 'react-native';

/**
 * NetworkUtils - Utility functions for handling network connectivity
 * This file provides reusable functions for checking network status and handling offline scenarios
 */

class NetworkUtils {
  static isConnected = true;
  static listeners = [];

  /**
   * Initialize network listener
   * Call this once in your app's root component
   */
  static initialize() {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type:', state.type);
      console.log('Is connected?', state.isConnected);
      
      this.isConnected = state.isConnected;
      
      // Notify all listeners about network change
      this.listeners.forEach(listener => listener(state.isConnected));
    });

    return unsubscribe;
  }

  /**
   * Add a listener for network status changes
   * @param {Function} callback - Function to call when network status changes
   * @returns {Function} - Unsubscribe function
   */
  static addNetworkListener(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Get current network status
   * @returns {Promise<boolean>} - Promise that resolves to connection status
   */
  static async getCurrentNetworkStatus() {
    try {
      const state = await NetInfo.fetch();
      console.log('Current network state:', state);
      this.isConnected = state.isConnected;
      return state.isConnected;
    } catch (error) {
      console.log('Error fetching network status:', error);
      return false;
    }
  }

  /**
   * Check if device is connected to internet
   * @returns {boolean} - Current connection status
   */
  static isOnline() {
    return this.isConnected;
  }

  /**
   * Show offline message as alert
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   */
  static showOfflineAlert(title = 'No Internet Connection', message = 'Please check your internet connection and try again.') {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Show offline message as toast (Android) or alert (iOS)
   * @param {string} message - Message to display
   */
  static showOfflineToast(message = 'No internet connection. Please connect to refresh.') {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Offline', message);
    }
  }

  /**
   * Check network and execute callback if online, show message if offline
   * @param {Function} onlineCallback - Function to execute when online
   * @param {string} offlineMessage - Message to show when offline
   * @param {boolean} useToast - Whether to use toast instead of alert for offline message
   * @returns {Promise<boolean>} - Whether the operation was executed
   */
  static async executeIfOnline(onlineCallback, offlineMessage = 'This action requires an internet connection.', useToast = true) {
    const isOnline = await this.getCurrentNetworkStatus();
    
    if (isOnline) {
      try {
        await onlineCallback();
        return true;
      } catch (error) {
        console.log('Error executing online callback:', error);
        return false;
      }
    } else {
      if (useToast) {
        this.showOfflineToast(offlineMessage);
      } else {
        this.showOfflineAlert('Offline', offlineMessage);
      }
      return false;
    }
  }

  /**
   * Get network type information
   * @returns {Promise<Object>} - Network state object
   */
  static async getNetworkInfo() {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        type: state.type, // wifi, cellular, none, etc.
        isInternetReachable: state.isInternetReachable,
        details: state.details
      };
    } catch (error) {
      console.log('Error getting network info:', error);
      return {
        isConnected: false,
        type: 'none',
        isInternetReachable: false,
        details: null
      };
    }
  }

  /**
   * Show detailed network status
   * Useful for debugging
   */
  static async showNetworkStatus() {
    const networkInfo = await this.getNetworkInfo();
    const statusMessage = `
Connection: ${networkInfo.isConnected ? 'Connected' : 'Disconnected'}
Type: ${networkInfo.type}
Internet Reachable: ${networkInfo.isInternetReachable}
    `.trim();

    Alert.alert('Network Status', statusMessage);
  }
}

export default NetworkUtils;