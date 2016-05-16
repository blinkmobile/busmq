'use strict';

const childProcess = require('child_process');

let server;

function getOrigin ({ PORT }) {
  return process.env.TEST_ORIGIN || `http://localhost:${PORT}`;
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
      env: { PORT }
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
