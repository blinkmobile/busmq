/* eslint-disable no-console */
'use strict';

const fetch = require('node-fetch');
const test = require('ava');

const server = require('./helpers/server.js');

const PORT = 3001; // unique per test file
const origin = server.getOrigin({ PORT });

test.before(() => server.start({ PORT }));
test.after(() => server.stop());

test('server started, no ECONNREFUSED error', () => fetch(origin));
// rejects with a ECONNREFUSED error if something went wrong

test('GET / => 404', (t) => {
  return fetch(origin)
    .then((res) => t.is(res.status, 404));
});
