/* eslint-disable no-console */
'use strict';

const test = require('ava');

const busHelper = require('../helpers/bus.js');
const server = require('../helpers/server.js');
const { FED_PATH } = require('../../plugins/bus/index.js');
const { TOPIC, MARCO, POLO } = require('../../plugins/bus/system.marco.polo.js');

const PORT = 3010; // unique per test file
const origin = server.getOrigin({ PORT });

const SECRET = process.env.BUSMQ_SECRET || 'mysecret';

// https://github.com/blinkmobile/no-polling-example/blob/master/client/index.js

if (server.hasRedis()) {
  test.before(() => server.start({ PORT }));
  test.after(() => server.stop());

  const PUBSUB_URL = `${origin}${FED_PATH}`;

  let bus;
  test.before(() => {
    return busHelper.getOnlineBus(PUBSUB_URL, SECRET)
      .then((b) => {
        bus = b;
      });
  });

  test.beforeEach((t) => {
    return busHelper.getReadyFederatedPubSub(bus, PUBSUB_URL, TOPIC)
      .then(busHelper.getSubscribedPubSub)
      .then((pubsub) => {
        t.context.pubsub = pubsub;
      });
  });

  test.afterEach((t) => {
    t.context.pubsub.unsubscribe();
    t.context.pubsub.fed.close();
  });

  test.after(() => {
    bus.disconnect();
  });

  test.serial.cb('"marco" message gets "polo" response', (t) => {
    t.context.pubsub.on('message', (msg) => {
      if (msg === POLO) {
        t.end();
      }
    });
    t.context.pubsub.publish(MARCO);
  });
} else {
  console.warn('BusMQ tests skipped: no TEST_ORIGIN or REDIS_PORT_6379_ADDR');
  test('', () => {});
}
