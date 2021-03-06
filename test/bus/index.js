/* eslint-disable no-console */
'use strict';

// const { Server } = require('http');

const Bus = require('busmq');
// const sinon = require('sinon');
const test = require('ava');

const server = require('../helpers/server.js');
const { FED_PATH } = require('../../plugins/bus/index.js');

const PORT = 3004; // unique per test file
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

/* leave this test out for now */
// test('plugin calls server.register() and next()', (t) => {
//   const server = {
//     expose: sinon.stub(),
//     route: sinon.stub()
//   };
//   const next = sinon.stub();

//   register(server, { listener: new Server() }, next);

//   t.truthy(server.expose.calledOnce);
//   t.truthy(server.route.calledOnce);
//   t.truthy(next.calledOnce);
// });

