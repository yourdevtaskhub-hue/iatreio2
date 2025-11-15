import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for timezone integration tests
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'doctor-zurich',
      use: {
        ...devices['Desktop Chrome'],
        timezoneId: 'Europe/Zurich',
        locale: 'en-US',
      },
    },
    {
      name: 'patient-athens',
      use: {
        ...devices['Desktop Chrome'],
        timezoneId: 'Europe/Athens',
        locale: 'en-US',
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});

