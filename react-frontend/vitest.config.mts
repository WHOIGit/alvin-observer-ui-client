import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['{src,tests}/**/*.test.{js,jsx,ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
  },

  resolve: {
    alias: {
      // Use the bundled browser version of socket.io-client for tests. This
      // version uses the native WebSocket API which can be intercepted by MSW.
      // Otherwise, Engine.IO uses the `ws` package which cannot be intercepted.
      'socket.io-client': 'socket.io-client/dist/socket.io.js',

      // Use a cloned version of socket.io-binding that supports namespaces,
      // until it is merged upstream.
      '@mswjs/socket.io-binding': '@mswjs/socket.io-binding/src/index.ts',
    },
  },
})
