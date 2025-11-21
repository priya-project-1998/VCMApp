// __mocks__/@react-native-community/netinfo.js
export default {
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
};
