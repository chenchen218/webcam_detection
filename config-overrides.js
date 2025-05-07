// config-overrides.js
module.exports = function override(config, env) {
  // Add fallback for 'fs' module - this tells Webpack to treat 'fs' as an empty module
  // when building for the browser, which is what face-api.js needs to avoid the error.
  config.resolve.fallback = {
    ...config.resolve.fallback, // Preserve other fallbacks if they exist
    fs: false,
  };

  // You might need other fallbacks if more Node.js core module errors appear later, e.g.:
  // "path": require.resolve("path-browserify"),
  // "crypto": require.resolve("crypto-browserify"),
  // "stream": require.resolve("stream-browserify"),
  // "http": require.resolve("stream-http"),
  // "https": require.resolve("https-browserify"),
  // "os": require.resolve("os-browserify/browser"),
  // "assert": require.resolve("assert/"),
  // "url": require.resolve("url/")

  // If you needed to install packages like path-browserify, etc., make sure they are
  // in devDependencies. For just 'fs': false, no extra packages are needed.

  return config;
};
