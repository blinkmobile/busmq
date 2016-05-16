'use strict';

const Bus = require('busmq');

function getOnlineBus (url, secret) {
  return new Promise((resolve, reject) => {
    const bus = Bus.create({
      federate: {
        poolSize: 1,
        secret,
        urls: [ url ]
      }
    });
    bus.on('online', () => {
      resolve(bus);
    });
    bus.on('error', (err) => {
      reject(err);
    });
    bus.connect();
  });
}

function getReadyFederatedPubSub (bus, url, subject) {
  return new Promise((resolve, reject) => {
    const fed = bus.federate(bus.pubsub(subject), url);
    fed.on('ready', (pubsub) => {
      pubsub.fed = fed;
      resolve(pubsub);
    });
    bus.on('error', (err) => {
      reject(err);
    });
  });
}

function getSubscribedPubSub (pubsub) {
  return new Promise((resolve, reject) => {
    pubsub.on('subscribed', () => {
      resolve(pubsub);
    });
    pubsub.subscribe();
  });
}

module.exports = {
  getOnlineBus,
  getReadyFederatedPubSub,
  getSubscribedPubSub
};
