'use strict';

const fetch = require('node-fetch');
const test = require('ava');

const busHelper = require('../helpers/bus.js');

const server = require('../helpers/server.js');
const { FED_PATH } = require('../../plugins/bus/index.js');

const PORT = 3008; // unique per test file
const origin = server.getOrigin({ PORT });
const SECRET = process.env.BUSMQ_SECRET || 'mysecret';

const data = {
  person: 123,
  location: 456
};

if (server.hasRedis()) {
  const PUBSUB_URL = `${origin}${FED_PATH}`;
  const TOPIC = 'topic';

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

  test.serial.cb('POST /publish -> pubsub RE: "raw" -> subscriber', (t) => {
    t.context.pubsub.on('message', (msg) => {
      t.deepEqual(data, JSON.parse(msg));
      t.end();
    });
    fetch(`${origin}/publish/${TOPIC}`, {
      method: 'POST',
      headers: {
        Authorization: SECRET
      },
      body: JSON.stringify(data)
    });
  });

  test('POST /publish without Authorization header', (t) => {
    return fetch(`${origin}/publish/noauth`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((res) => t.is(res.status, 401));
  });

  test('POST /publish with Authorization: blah', (t) => {
    return fetch(`${origin}/publish/badauth`, {
      method: 'POST',
      headers: {
        Authorization: 'blah'
      },
      body: JSON.stringify(data)
    })
      .then((res) => t.is(res.status, 403));
  });

  test(`POST /publish with Authorization: ${SECRET}`, (t) => {
    return fetch(`${origin}/publish/goodauth`, {
      method: 'POST',
      headers: {
        Authorization: SECRET
      },
      body: JSON.stringify(data)
    })
      .then((res) => t.is(res.status, 200));
  });
} else {
  test('', () => {});
}
