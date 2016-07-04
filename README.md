# blinkmobile / busmq [![Build Status](https://travis-ci.org/blinkmobile/busmq.svg?branch=master)](https://travis-ci.org/blinkmobile/busmq)

a minimal service exposing a federated BusMQ bus with publishing via HTTP

- Docker image: https://hub.docker.com/r/blinkmobile/busmq/


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


### GET /service-status

See upstream [hapi-and-healthy](https://github.com/atomantic/hapi-and-healthy).

No authentication required.


## BusMQ Publish / Subscribe Topics


### system.marco.polo

This service responds to "marco" messages with a "polo" message.
We recommend that clients using this topic behave this way, too.

This topic is useful for rough census and basic heart-beat functionality.


## Environment Variables

For connection details, we follow Docker's [legacy container link](https://docs.docker.com/engine/userguide/networking/default_network/dockerlinks/) conventions, instead of inventing our own approach.


### BUSMQ_SECRET

Specifies the shared secret required to connect. Defaults to "mysecret".
We **highly recommend** that you customise this value for production use.


### HTTP_PORT and HTTPS_PORT

Specifies the ports to bind HTTP and HTTPS listeners to. Defaults to 80 and 443. Useful to change these for testing purposes.


### LETSENCRYPT_DOMAIN

Specifies the domain name to register for a LetsEncrypt certificate. This will use the LetsEncrypt staging environment if NODE_ENV is not "production". If this is not set, then the web service will use unencrypted HTTP.


### LETSENCRYPT_EMAIL

Specifies a contact email address to register with LetsEncrypt.


### NODE_ENV

Set this to "production" to enable live production deployment features.


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
