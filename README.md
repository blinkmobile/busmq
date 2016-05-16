# blinkmobile / busmq

a minimal service exposing a federated BusMQ bus with publishing via HTTP

[![Build Status](https://travis-ci.org/blinkmobile/busmq.svg?branch=master)](https://travis-ci.org/blinkmobile/busmq)


## Web Service API


### GET /bus/federated

This is a WebSockets endpoint, used with federated [BusMQ](https://github.com/capriza/node-busmq).
You may also access this via the [BusMQ browser library](https://github.com/capriza/node-busmq#browser-support).

Clients must specify a matching secret string when connecting via federated BusMQ, see BUSMQ_SECRET below.


### POST /publish/{topic}

Publish the POST body (which must be valid JSON) to the BusMQ pub/sub topic matching the provided `{topic}` URL path segment.

Clients must specify a matching Authorization header value when making HTTP requests, see BUSMQ_SECRET below.

For example:

```
Authorization: mysecret
```


## Environment Variables

For connection details, we follow Docker's [legacy container link](https://docs.docker.com/engine/userguide/networking/default_network/dockerlinks/) conventions, instead of inventing our own approach.


### BUSMQ_SECRET

Specifies the shared secret required to connect. Defaults to "mysecret".
We **highly recommend** that you customise this value for production use.


### REDIS_PORT_6379_ADDR

Specifies the Redis hostname or IP address. No default. Mandatory.


### REDIS_PORT_6379_TCP

Specifies the Redis port number. Defaults to "6379".


### TEST_ORIGIN

Specifies the web service to use for tests. Used during `npm test`.
Our tests assume that the web service has Redis settings, too.

## Related

- https://github.com/capriza/node-busmq

- http://hapijs.com/
