module.exports = {
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/element-symbol-puzzle/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
};
