/**
 * Jest Configuration
 * 
 * This file configures Jest for testing the Express API
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Coverage settings
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js', // Exclude main entry point from coverage
    ],

    // Test patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/?(*.)+(spec|test).js'
    ],

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Clear mocks between tests
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};
