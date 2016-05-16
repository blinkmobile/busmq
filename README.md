# blinkmobile / busmq

a minimal service exposing a federated BusMQ bus with publishing via HTTP

[![Build Status](https://travis-ci.org/blinkmobile/busmq.svg?branch=master)](https://travis-ci.org/blinkmobile/busmq)



## Environment Variables

For connection details, we follow Docker's [legacy container link](https://docs.docker.com/engine/userguide/networking/default_network/dockerlinks/) conventions, instead of inventing our own approach.


### BUSMQ_SECRET

Specifies the shared secret required to connect to the bus. Defaults to "mysecret".


### REDIS_PORT_6379_ADDR

Specifies the Redis hostname or IP address. Defaults to "redis".


### REDIS_PORT_6379_TCP

Specifies the Redis port number. Defaults to "6379".


### TEST_ORIGIN

Specifies the web service to use for tests. Used during `npm test`.
Our tests assume that the web service has Redis settings, too.

## Related

- https://github.com/capriza/node-busmq

- http://hapijs.com/
