'use strict';

const sinon = require('sinon');
const test = require('ava');

const { handler } = require('../../plugins/publish/index.js');

let bus;
let pubsubs;
let pubsub;
let reply;
let server;

test.beforeEach(() => {
  bus = {};
  pubsubs = new Map();
  pubsub = { publish: sinon.stub() };
  pubsubs.set('topic', pubsub);
  reply = sinon.stub();
  server = { log: sinon.stub() };
});

test('no body is an error', (t) => {
  let called = false;
  handler(server, bus, pubsubs, {
    params: { topic: 'topic' },
    payload: ''
  }, (result) => {
    called = true;
    t.truthy(result instanceof Error);
  });
  t.truthy(called);
});

test('non-JSON body is an error', (t) => {
  let called = false;
  handler(server, bus, pubsubs, {
    params: { topic: 'topic' },
    payload: '<xml />'
  }, (result) => {
    called = true;
    t.truthy(result instanceof Error);
  });
  t.truthy(called);
});

test('non-Object JSON is an error', (t) => {
  [null, 123, true, 'abc', []].forEach((value) => {
    let called = false;
    handler(server, bus, pubsubs, {
      params: { topic: 'topic' },
      payload: JSON.stringify(value)
    }, (result) => {
      called = true;
      t.truthy(result instanceof Error);
    });
    t.truthy(called);
  });
});

test('valid JSON Object calls pubsub.publish()', (t) => {
  handler(server, bus, pubsubs, {
    params: { topic: 'topic' },
    payload: JSON.stringify({})
  }, reply);
  t.truthy(pubsub.publish.called);
});

test('valid JSON Object generates non-Error response', (t) => {
  handler(server, bus, pubsubs, {
    params: { topic: 'topic' },
    payload: JSON.stringify({})
  }, reply);
  t.truthy(reply.called);
});

test('valid JSON Object in Buffer generates non-Error response', (t) => {
  handler(server, bus, pubsubs, {
    params: { topic: 'topic' },
    payload: new Buffer(JSON.stringify({}))
  }, reply);
  t.truthy(reply.called);
});
