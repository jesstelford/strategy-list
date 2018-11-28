// From https://spectrum.chat/zeit/general/unable-to-import-module-now-launcher-error~2662f0ba-4186-402f-b1db-2e3c43d8689a?m=MTU0MjcyOTQ3NzkxMQ==
const { PHASE_PRODUCTION_SERVER } =
  process.env.NODE_ENV === 'development'
    ? {}
    : require('next-server/constants');

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_PRODUCTION_SERVER) {
    // Config used to run in production.
    return {};
  }

  const withCSS = require('@zeit/next-css');

  return withCSS();
};
