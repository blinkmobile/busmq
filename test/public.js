/* eslint-disable no-console */
'use strict';

const fetch = require('node-fetch');
const test = require('ava');

const server = require('./helpers/server.js');

const PORT = 3006; // unique per test file
const origin = server.getOrigin({ PORT });

test.before(() => server.start({ PORT }));
test.after(() => server.stop());

test('GET /.keep => 200', (t) => {
  return fetch(`${origin}/.keep`)
    .then((res) => t.is(res.status, 200));
});
