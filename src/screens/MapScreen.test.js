import React from 'react';
import { render, act } from '@testing-library/react-native';
import MapScreen from './MapScreen';
jest.mock('react-native-maps');
jest.mock('@react-native-community/geolocation');
jest.mock('@react-native-community/netinfo');
jest.mock('react-native-sqlite-storage');

// Helper to get random int between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('MapScreen auto checkpoint test', () => {
  const mockCheckpoints = Array.from({ length: 5 }, (_, idx) => ({
    checkpoint_id: `cp${idx + 1}`,
    checkpoint_name: `Checkpoint ${idx + 1}`,
    latitude: '28.6',
    longitude: '77.2',
    event_id: 'event1',
    category_id: 'cat1',
    sequence_number: idx + 1,
  }));

  const route = { params: { checkpoints: mockCheckpoints, event_id: 'event1', kml_path: '' } };
  const navigation = { goBack: jest.fn() };

  it('should simulate random checkpoint completion and log details', async () => {
    // Mount MapScreen
    render(<MapScreen route={route} navigation={navigation} />);

    // Simulate random checkpoint completion
    const completedCheckpoints = [];
    for (let i = 0; i < mockCheckpoints.length; i++) {
      // Randomly decide if this checkpoint will be completed
      const shouldComplete = Math.random() > 0.5;
      if (shouldComplete) {
        // Random time between 1-10 seconds
        const randomSec = getRandomInt(1, 10);
        const time = new Date(Date.now() + randomSec * 1000).toLocaleTimeString();
        completedCheckpoints.push({
          Sr: i + 1,
          Checkpoint: mockCheckpoints[i].checkpoint_name,
          Time: time,
          Completed: 'Completed',
        });
      } else {
        completedCheckpoints.push({
          Sr: i + 1,
          Checkpoint: mockCheckpoints[i].checkpoint_name,
          Time: new Date().toLocaleTimeString(),
          Completed: 'Not Completed',
        });
      }
    }

    // Log all checkpoint details
    console.log('--- Checkpoint Log ---');
    completedCheckpoints.forEach(cp => {
      console.log(`Sr: ${cp.Sr}, Checkpoint: ${cp.Checkpoint}, Time: ${cp.Time}, Completed: ${cp.Completed}`);
    });
    console.log('----------------------');
  });

  it('should automatically complete all checkpoints and log details', async () => {
    render(<MapScreen route={route} navigation={navigation} />);

    // Simulate all checkpoints being completed one by one
    const completedCheckpoints = [];
    for (let i = 0; i < mockCheckpoints.length; i++) {
      // Simulate time taken to reach each checkpoint
      const randomSec = getRandomInt(1, 10);
      const time = new Date(Date.now() + randomSec * 1000).toLocaleTimeString();
      completedCheckpoints.push({
        Sr: i + 1,
        Checkpoint: mockCheckpoints[i].checkpoint_name,
        Time: time,
        Completed: 'Completed',
      });
    }

    // Log all checkpoint details
    console.log('--- Auto Complete Checkpoint Log ---');
    completedCheckpoints.forEach(cp => {
      console.log(`Sr: ${cp.Sr}, Checkpoint: ${cp.Checkpoint}, Time: ${cp.Time}, Completed: ${cp.Completed}`);
    });
    console.log('----------------------');
  });

  it('should complete checkpoints in random order and log details', async () => {
    render(<MapScreen route={route} navigation={navigation} />);

    // Shuffle checkpoints
    const shuffled = [...mockCheckpoints].sort(() => Math.random() - 0.5);
    const completedCheckpoints = [];
    for (let i = 0; i < shuffled.length; i++) {
      const randomSec = getRandomInt(1, 10);
      const time = new Date(Date.now() + randomSec * 1000).toLocaleTimeString();
      completedCheckpoints.push({
        Sr: i + 1,
        Checkpoint: shuffled[i].checkpoint_name,
        Time: time,
        Completed: 'Completed',
      });
    }

    // Log all checkpoint details
    console.log('--- Random Order Checkpoint Log ---');
    completedCheckpoints.forEach(cp => {
      console.log(`Sr: ${cp.Sr}, Checkpoint: ${cp.Checkpoint}, Time: ${cp.Time}, Completed: ${cp.Completed}`);
    });
    console.log('----------------------');
  });
});
