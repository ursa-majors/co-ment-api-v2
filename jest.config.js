module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/index.js'
  ],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  roots: [
    '<rootDir>/src/',
    '<rootDir>/spec/'
  ],
  testEnvironment: 'node',
  verbose: true,
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/'
  ]
}
