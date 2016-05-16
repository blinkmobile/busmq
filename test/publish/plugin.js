'use strict';

const sinon = require('sinon');
const test = require('ava');

const { register } = require('../../plugins/publish/index.js');

test('plugin calls server.register() and next()', (t) => {
  const server = {
    plugins: { bus: { bus: {} } },
    route: sinon.stub()
  };
  const next = sinon.stub();

  register(server, null, next);

  t.truthy(server.route.calledOnce);
  t.truthy(next.calledOnce);
});
