'use strict';

const Boom = require('boom');

const SECRET = process.env.BUSMQ_SECRET || 'mysecret';
const SCHEME_NAME = 'auth-match-secret';

function authenticate (request, reply) {
  const { authorization } = request.headers;
  if (!authorization) {
    return reply(Boom.unauthorized());
  }
  if (authorization !== SECRET) {
    return reply(Boom.forbidden());
  }
  return reply.continue({ credentials: {} });
}

function scheme (server, options) {
  return { authenticate };
}

function register (plugin, options, next) {
  plugin.auth.scheme(SCHEME_NAME, scheme);
  next();
}
register.attributes = {
  name: SCHEME_NAME,
  once: true,
  version: '0.0.1'
};

module.exports = { authenticate, register, scheme };
