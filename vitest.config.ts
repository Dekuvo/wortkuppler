// vite.config.ts
// https://github.com/wd-David/svelte-component-test-recipes?tab=readme-ov-file#setup
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { configDefaults, type UserConfig as VitestConfig } from 'vitest/config';

const config: UserConfig & { test: VitestConfig['test'] } = {
  plugins: [sveltekit()],
  define: {
    // Eliminate in-source test code
    'import.meta.vitest': 'undefined'
  },
  test: {
    // jest like globals
    globals: true,
    environment: 'jsdom',
    // in-source testing
    includeSource: ['src/**/*.{js,ts,svelte}'],
    // Add @testing-library/jest-dom matchers & mocks of SvelteKit modules
    setupFiles: ['./vitest-setup.ts'],
    // Exclude files in v8
    coverage: {
      provider: 'v8',
      exclude: ['vitest-setup.ts']
    },
    // Exclude playwright tests folder
    exclude: [...configDefaults.exclude, 'tests']
  }
};

export default config;