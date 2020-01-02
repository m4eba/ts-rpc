
module.exports = {
  testPathIgnorePatterns: [
    '/node_modules',
    'cli/__tests__/common/'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: {
        target: 'es2018'
      }
    }
  }
};
