export default {
  testDir: "./tests",
  webServer: {
    command: "npm run dev -- --port 4173",
    url: "http://127.0.0.1:4173/@vite/client",
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 1100 }
  }
};
