'use strict';

const os = require('os');
const path = require('path');

let LEX = require('letsencrypt-express');
if (process.env.NODE_ENV !== 'production') {
  LEX = LEX.testing();
}

// http://hapijs.com/tutorials/serving-files

function getLEX () {
  const { LETSENCRYPT_DOMAIN, LETSENCRYPT_EMAIL } = process.env;
  if (!LETSENCRYPT_DOMAIN) {
    throw new Error('LETSENCRYPT_DOMAIN not set');
  }

  return LEX.create({
    configDir: path.join(os.homedir(), 'letsencrypt', 'etc'),
    approveRegistration: function (hostname, cb) {
      if (hostname !== LETSENCRYPT_DOMAIN) {
        cb(new Error(`letsencrypt: approveRegistration: ${hostname} !== ${LETSENCRYPT_DOMAIN}`));
        return;
      }
      cb(null, {
        domains: [ LETSENCRYPT_DOMAIN ],
        email: LETSENCRYPT_EMAIL || null,
        agreeTos: true
      });
    }
  });
}

function getAcmeResponder (lex, onRequest) {
  return LEX.createAcmeResponder(lex, onRequest);
}

function register (server, options, next) {
  options = options || {};
  let acmeResponder = getAcmeResponder(options.lex);

  server.route({
    config: {
      auth: false
    },
    method: 'GET',
    path: '/.well-known/acme-challenge',
    handler: (request, reply) => {
      const { req, res } = request.raw;
      reply.close(false);
      acmeResponder(req, res);
    }
  });

  next();
}

register.attributes = {
  name: 'letsencrypt',
  version: '0.0.1'
};
module.exports = {
  getAcmeResponder,
  getLEX,
  register
};
