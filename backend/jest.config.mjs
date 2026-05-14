export default {
  testEnvironment: "node",
  globalSetup: "<rootDir>/jest.global-setup.js",
  globalTeardown: "<rootDir>/jest.global-teardown.js",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {},
};
