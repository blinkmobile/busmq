/* eslint-disable no-console */
'use strict';

const Bus = require('busmq');
const test = require('ava');

const server = require('./helpers/server.js');
const FED_PATH = require('../plugins/bus/index.js').FED_PATH;

const PORT = 3002; // unique per test file
const origin = server.getOrigin({ PORT });

const SECRET = process.env.BUSMQ_SECRET || 'mysecret';

// https://github.com/blinkmobile/no-polling-example/blob/master/client/index.js

if (server.hasRedis()) {
  test.before(() => server.start({ PORT }));
  test.after(() => server.stop());

  const BUS_URL = `${origin}${FED_PATH}`;
  const SUBJECT = __filename;

  let bus;

  test.serial.cb('bus emits "online" event', (t) => {
    bus = Bus.create({
      federate: {
        poolSize: 1,
        secret: SECRET,
        urls: [ BUS_URL ]
      }
    });
    bus.on('online', () => {
      t.end();
    });
  });

  let fed;
  let pubsub;

  test.serial.cb('federation emits "ready" event', (t) => {
    fed = bus.federate(bus.pubsub(SUBJECT), BUS_URL);

    [
      'fail',
      'error',
      'reconnecting',
      'unauthorized'
    ].forEach((event) => {
      fed.on(event, () => {
        console.error(`bus.federate(): ${event}`);
        t.end(new Error(`bus.federate(): ${event}`));
      });
    });

    fed.on('ready', (ps) => {
      pubsub = ps;
      t.end();
    });
  });

  test.serial.cb('pubsub emits "subscribed" event', (t) => {
    pubsub.on('subscribed', () => {
      t.end();
    });
    pubsub.subscribe();
  });

  test.serial.cb('pubsub emits "message" event', (t) => {
    const MSG = 'hello, world';
    pubsub.on('message', (msg) => {
      t.is(msg, MSG);
      t.end();
    });
    pubsub.publish(MSG);
  });
} else {
  console.warn('BusMQ tests skipped: no TEST_ORIGIN or REDIS_PORT_6379_ADDR');
  test('', () => {});
}
