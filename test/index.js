'use strict';

const childProcess = require('child_process');
// const path = require('path');

const fetch = require('node-fetch');
const test = require('ava');

const PORT = 3001;
const origin = `http://localhost:${PORT}`;

let server;

test.before.cb((t) => {
  server = childProcess.fork('../index.js', {
    env: { PORT }
  });
  setTimeout(t.end, 2e3);
});

test.after(() => {
  if (server) {
    server.kill();
  }
});

test('server started, no ECONNREFUSED error', () => fetch(origin));
// rejects with a ECONNREFUSED error if something went wrong

test('GET / => 404', (t) => {
  return fetch(origin)
    .then((res) => t.is(res.status, 404));
});
