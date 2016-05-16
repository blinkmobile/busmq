'use strict';

const Bus = require('busmq');

const FED_PATH = '/bus/federated';
const SECRET = process.env.BUSMQ_SECRET || 'mysecret';

const REDIS_HOSTNAME = process.env.REDIS_PORT_6379_ADDR;
const REDIS_PORT = process.env.REDIS_PORT_6379_TCP || 6379;

function register (server, options = {}, next) {
  // https://github.com/blinkmobile/no-polling-example/blob/master/server/bus.js
  const bus = Bus.create({
    redis: `redis://${REDIS_HOSTNAME}:${REDIS_PORT}`,
    federate: {
      server: options.listener,
      secret: SECRET,
      path: FED_PATH
    }
  });
  const onBusOnline = () => {
    server.log(['bus'], { msg: 'BusMQ service online...' });
    bus.removeListener('online', onBusOnline);
    next();
  };
  bus.on('online', onBusOnline);
  bus.connect();

  server.expose('bus', bus);
}

register.attributes = {
  name: 'bus',
  once: true,
  version: '0.0.1'
};
module.exports = { FED_PATH, register };
