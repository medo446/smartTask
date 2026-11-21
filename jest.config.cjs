module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  testMatch: ['**/tests/unit/**/*.test.js'],
  clearMocks: true
};
