// __mocks__/react-native-sqlite-storage.js
const mockDB = {
  transaction: jest.fn((cb) => cb({ executeSql: jest.fn() })),
};

export default {
  openDatabase: jest.fn(() => mockDB),
};
