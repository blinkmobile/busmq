'use strict';

const childProcess = require('child_process');

let server;

function getOrigin ({ PORT }) {
  if (process.env.TEST_ORIGIN) {
    return process.env.TEST_ORIGIN;
  }
  if (process.env.LETSENCRYPT_DOMAIN) {
    return `https://localhost:${PORT}`;
  }
  return `http://localhost:${PORT + 1}`;
}

function hasRedis () {
  return process.env.TEST_ORIGIN || process.env.REDIS_PORT_6379_ADDR;
}

function start ({ PORT }) {
  if (process.env.TEST_ORIGIN) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    server = childProcess.fork('../index.js', {
      env: {
        HTTP_PORT: PORT + 1,
        HTTPS_PORT: PORT
      }
    });
    setTimeout(() => resolve(), 2e3);
  });
}

function stop () {
  if (server) {
    server.kill();
  }
}

module.exports = {
  getOrigin,
  hasRedis,
  start,
  stop
};
