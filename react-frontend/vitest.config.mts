import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['{src,tests}/**/*.test.{js,jsx,ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    server: {
      deps: {
        // Ensure engine.io-client gets bundled by Vite so that our
        // resolve.alias rules below take effect.
        inline: ['socket.io-client', 'engine.io-client'],
      },
    },
  },

  resolve: {
    alias: [
      // Force engine.io-client to use the browser websocket implementation,
      // which is also compatible with Node 21+. Otherwise, it will use the 'ws'
      // package, which is not intercepted by MSW.
      {
        find: /(^|\/)websocket\.node\.js$/,
        replacement: "$1websocket.js",
      },
    ],
  },
})
