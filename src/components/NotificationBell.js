import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NotificationBell = ({ notificationCount = 0 }) => {
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    // Navigate to notifications screen
    navigation.navigate('Notifications');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleNotificationPress}
      activeOpacity={0.7}
    >
      <View style={styles.bellContainer}>
        {/* Bell Icon using Unicode */}
        <Text style={styles.bellIcon}>🔔</Text>
        
        {/* Notification Badge */}
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
    padding: 8,
  },
  bellContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 24,
    color: '#feb47b',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default NotificationBell;
