'use strict';

const path = require('path');

// http://hapijs.com/tutorials/serving-files

function register (server, options, next) {
  server.route({
    config: {
      auth: false
    },
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        lookupCompressed: true,
        path: path.join(__dirname, '..', '..', 'public'),
        showHidden: true
      }
    }
  });

  next();
}

register.attributes = {
  dependencies: ['inert'],
  name: 'public',
  version: '0.0.1'
};
module.exports = { register };
