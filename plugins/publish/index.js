'use strict';

const Boom = require('boom');

function handler (server, bus, pubsubs, request, reply) {
  // unparsed Hapi payloads are Buffers, not strings
  if (Buffer.isBuffer(request.payload)) {
    request.payload = request.payload.toString();
  }
  if (!request.payload || typeof request.payload !== 'string') {
    return reply(Boom.badRequest(`${request.method} body missing`));
  }
  let obj;
  try {
    obj = JSON.parse(request.payload);
  } catch (err) {
    return reply(Boom.badData(`${request.method} body is not valid JSON`, err));
  }
  if (!obj || Array.isArray(obj) || typeof obj !== 'object') {
    return reply(Boom.badData(`${request.method} body JSON is not an Object`, typeof obj));
  }
  // okay, we received a valid JSON Object
  // open a pubsub for the desired topic
  const { topic } = request.params;
  let pubsub = pubsubs.get(topic);
  if (!pubsub) {
    pubsub = bus.pubsub(topic);
    pubsubs.set(topic, pubsub);
  }
  // publish to pubsub
  pubsub.publish(JSON.stringify(obj));
  return reply();
}

function register (server, options = {}, next) {
  const { bus } = server.plugins.bus;
  const pubsubs = new Map();

  server.route({
    method: 'POST',
    path: '/publish/{topic}',
    // our handler calls `server.log()`
    // so hardwire our `server`, but expose expected fn (request, reply)
    handler: handler.bind(null, server, bus, pubsubs),
    config: {
      payload: {
        output: 'data',
        parse: false
        // disable built-in parser, as proper headers might be absent
      }
    }
  });

  next();
}

register.attributes = {
  dependencies: ['bus'],
  name: 'publish',
  version: '0.0.1'
};
module.exports = { handler, register };
