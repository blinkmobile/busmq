'use strict';

const http = require('http');
const https = require('https');

const Hapi = require('hapi');

const HTTP_PORT = parseInt(process.env.HTTP_PORT, 10) || 3000;
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT, 10) || 3443;

const server = new Hapi.Server();

let lex;
let httpServer;
let httpsServer;
if (process.env.LETSENCRYPT_DOMAIN) {
  // setup HTTPS with LetsEncrypt
  const { getAcmeResponder, getLEX } = require('./plugins/letsencrypt/index.js');
  // https://github.com/Daplie/letsencrypt-hapi
  lex = getLEX();
  httpsServer = https.createServer(lex.httpsOptions);
  // setup HTTP->HTTPS redirect
  // do not expose Hapi.js to HTTP
  httpServer = http.createServer(getAcmeResponder(lex, (req, res) => {
    res.setHeader('Location', 'https://' + req.headers.host + req.url);
    res.statusCode = 302;
    res.end('<!-- Hello Developer Person! Please use HTTPS instead -->');
  })).listen(HTTP_PORT);
} else {
  // setup a broken HTTPS listener, does not work
  httpsServer = https.createServer({});
  httpServer = http.createServer();
  // expose Hapi.js to HTTP, no redirect
  server.connection({
    listener: httpServer,
    port: HTTP_PORT
  });
}

// expose Hapi.js to HTTPS
server.connection({
  listener: httpsServer,
  port: HTTPS_PORT,
  tls: true
});

const onHapiStarted = (err) => {
  if (err) {
    throw err;
  }
  server.connections.forEach((connection) => {
    server.log([], { msg: `Hapi.js service started: ${connection.info.url}` });
  });
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
    },
    require('inert'),
    {
      register: require('hapi-and-healthy'),
      options: {
        env: process.env.NODE_ENV || 'development',
        // path: '/service-status',
        test: {
          features: [
            // check features and dependencies
            (cb) => {
              const { bus } = server.plugins.bus;
              if (bus && bus.isOnline()) {
                cb();
              } else {
                cb(new Error('BusMQ offline'));
              }
            }
          ],
          node: [
            // check just this node for health, not DBs, etc
            (cb) => {
              if (server.plugins.bus.bus) {
                cb();
              } else {
                cb(new Error('BusMQ plugin not ready'));
              }
            }
          ]
        }
      }
    },
    require('./plugins/public/index.js')
  ].concat(

    // only load our Hapi plugins if Redis is available
    process.env.REDIS_PORT_6379_ADDR ? [
      {
        register: require('./plugins/bus/index.js'),
        options: {
          listener: process.env.LETSENCRYPT_DOMAIN ? httpsServer : httpServer
        }
      },
      {
        register: require('./plugins/publish/index.js'),
        options: {
          auth: AUTH_NAME
        }
      }
    ] : [],

    // only load our LetsEncrypt plugin if configured
    process.env.LETSENCRYPT_DOMAIN ? [
      {
        register: require('./plugins/letsencrypt/index.js'),
        options: {
          lex
        }
      }
    ] : []

  ), onPluginsRegistered);
};

/* entry point */

server.register(require('./plugins/auth/index.js'), onAuthRegistered);

