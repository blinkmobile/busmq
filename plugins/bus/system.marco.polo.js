// https://github.com/blinkmobile/no-polling-example/blob/master/client/index.js

const TOPIC = 'system.marco.polo';
const MARCO = 'marco';
const POLO = 'polo';

function systemMarcoPolo (bus) {
  const pubsub = bus.pubsub(TOPIC);

  pubsub.on('message', (msg) => {
    if (msg === MARCO) {
      pubsub.publish(POLO);
    }
  });

  pubsub.subscribe();
}

module.exports = {
  TOPIC, MARCO, POLO,
  systemMarcoPolo
};
