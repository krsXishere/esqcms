module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    testTimeout: 30000,
    setupFilesAfterEnv: ['./tests/setup.js'],
};
