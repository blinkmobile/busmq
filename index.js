'use strict';

const http = require('http');

const Hapi = require('hapi');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const httpServer = new http.Server();

const server = new Hapi.Server();
server.connection({
  autoListen: false,
  listener: httpServer
});

const onHapiStarted = (err) => {
  if (err) {
    throw err;
  }
  server.log([], { msg: `Hapi.js service started: ${server.info.url}` });
};

const onPluginsRegistered = (err) => {
  if (err) {
    throw err;
  }

  server.start(onHapiStarted);
};

const AUTH_NAME = 'auth-match-secret';
const onAuthRegistered = (err) => {
  if (err) {
    throw err;
  }

  server.auth.strategy(AUTH_NAME, AUTH_NAME);

  server.register([
    {
      // good is a plugin that exposes a logging framework
      register: require('good'),
      options: {
        ops: {
          interval: 15e3 // log memory/uptime/load every 15 seconds
        },
        reporters: {
          console: [{
            // good-console is a stdout-default for good
            module: 'good-console'
          }, 'stdout']
        }
      }
    }
  ].concat(
    // only load our Hapi plugins if Redis is available
    process.env.REDIS_PORT_6379_ADDR ? [
      {
        register: require('./plugins/bus/index.js'),
        options: {
          listener: httpServer
        }
      },
      {
        register: require('./plugins/publish/index.js'),
        options: {
          auth: AUTH_NAME
        }
      }
    ] : []
  ), onPluginsRegistered);
};

/* entry point */

httpServer.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  server.log([], { msg: `HTTP service started on port ${PORT}` });

  server.register(require('./plugins/auth/index.js'), onAuthRegistered);
});

