/**
 * NetworkUtils Test Documentation
 * 
 * This file contains examples and test scenarios for the NetworkUtils class
 * You can use these examples to test the network functionality in your app
 */

import NetworkUtils from './NetworkUtils';

// Example 1: Basic network status check
export const testBasicNetworkCheck = async () => {
  const isOnline = await NetworkUtils.getCurrentNetworkStatus();
  console.log('Current network status:', isOnline ? 'Online' : 'Offline');
  return isOnline;
};

// Example 2: Execute function only if online
export const testExecuteIfOnline = async () => {
  const result = await NetworkUtils.executeIfOnline(
    async () => {
      console.log('This function runs only when online');
      // Your API call or online-only operation here
      return 'Operation completed successfully';
    },
    'This operation requires an internet connection to complete.'
  );
  
  return result;
};

// Example 3: Show network status alert
export const testShowNetworkStatus = async () => {
  await NetworkUtils.showNetworkStatus();
};

// Example 4: Get detailed network information
export const testGetNetworkInfo = async () => {
  const networkInfo = await NetworkUtils.getNetworkInfo();
  console.log('Detailed network info:', networkInfo);
  return networkInfo;
};

// Example 5: Show offline message (Toast or Alert)
export const testOfflineMessage = () => {
  NetworkUtils.showOfflineToast('You are currently offline. Please connect to continue.');
};

// Example 6: Show offline alert
export const testOfflineAlert = () => {
  NetworkUtils.showOfflineAlert(
    'Connection Required',
    'This feature requires an active internet connection. Please check your network settings.'
  );
};

/**
 * How to integrate NetworkUtils in your screens:
 * 
 * 1. Import NetworkUtils:
 *    import NetworkUtils from '../utils/NetworkUtils';
 * 
 * 2. Initialize in useEffect:
 *    useEffect(() => {
 *      NetworkUtils.initialize();
 *      const unsubscribe = NetworkUtils.addNetworkListener((isOnline) => {
 *        setIsOnline(isOnline);
 *      });
 *      return () => unsubscribe();
 *    }, []);
 * 
 * 3. Check before API calls:
 *    const makeAPICall = async () => {
 *      const isConnected = await NetworkUtils.getCurrentNetworkStatus();
 *      if (!isConnected) {
 *        NetworkUtils.showOfflineToast('Please connect to the internet');
 *        return;
 *      }
 *      // Make your API call here
 *    };
 * 
 * 4. Use executeIfOnline for cleaner code:
 *    const handleRefresh = () => {
 *      NetworkUtils.executeIfOnline(
 *        () => fetchData(),
 *        'Refresh requires internet connection'
 *      );
 *    };
 */

export default {
  testBasicNetworkCheck,
  testExecuteIfOnline,
  testShowNetworkStatus,
  testGetNetworkInfo,
  testOfflineMessage,
  testOfflineAlert,
};