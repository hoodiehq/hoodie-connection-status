# hoodie-client-connection-status

> hoodie.connectionStatus API for the browser

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-client-connection-status.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-client-connection-status)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-client-connection-status/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-client-connection-status?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-client-connection-status.svg)](https://david-dm.org/hoodiehq/hoodie-client-connection-status)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-client-connection-status/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-client-connection-status#info=devDependencies)

# THIS IS WORK IN PROGRESS

https://github.com/hoodiehq/hoodie-client/issues/6

## Example

```js
var connectionStatus = new ConnectionStatus('https://example.com/ping')

connectionStatus.on('disconnected', showOfflineNotification)
connectionStatus.on('reconnected reset', hideOfflineNotification)

myOtherRemoteApiThing.on('error', connectionStatus.check)
```

## API

### Constructor

```js
var connectionStatus = new ConnectionStatus(options)
```

`options` can either be a URL string, or an object with the following keys:

- `url` **_required_** (String)  
  Full url to send pings to
- `method` (String, _default: `'HEAD'`_)  
  Must be valid http verb like `'GET'` or `'POST'` (case insensitive)
- `interval` (Integer > 0 or Object, _default: undefined_)
  If set to a number, it will immediately start to send requests to the given
  URL. Different intervals can be set based on connection status by setting
  `interval` to an object with `connected` and `disconnected` keys.
- `cache` (false or Object, _default: { prefix: 'connection_', timeout: undefined }_)  
  a connection stores it internal state to localStorage (one per URL). If set to false,
  nothing is persisted. `prefix` (String, _default: 'connection_'_) will be used as the localStorage key
  prefix, followed by `url`. `timeout` (Number, _default: undefined_) is the time in ms after which a
  cache shall be invalidated. When invalidated on initialisation, a `reset` event gets triggered on next tick.

Example

```js
var connectionStatus = new ConnectionStatus('https://example.com/ping')

connectionStatus.on('disconnected', showOfflineNotification)
connectionStatus.check()
```

### connectionStatus.ok (Boolean, read-only)

- `undefined` if no status yet,
- `true` last check responded ok
- `false` if last check failed

### connectionStatus.check(options) (Function --> Promise)

- `interval` (Integer > 0 or Object, _default: undefined_)  
  If set to a number, it will immediately start to send requests to the given
  URL. Different intervals can be set based on connection status by setting
  `interval` to an object with `connected` and `disconnected` keys.
- `timeout` (Integer > 0 or Object, _default: 10000_)  
  Time in ms after which a ping shall be aborted with a `timeout` error

Promise resolves without value. It rejects with one of the following errors

- `TimeoutError`, `error.status` is `0`
- `ServerError`, `error.status` is status returned from server
- `ConnectionError` (Server could not be reached), `error.status` is `undefined`

To stop an existing interval, call `connectionStatus.check()` without interval.

Example

```js
connectionStatus.check()

.then(function () {
  // Connection is good, connectionStatus.ok is true
})

.catch(function () {
  // Cannot connect to server, connectionStatus.ok is false
})
```

### connectionStatus.reset(options) (Function --> Promise)

**NOTE: THIS IS TO BE DONE [#1](https://github.com/hoodiehq/hoodie-client-connection-status/issues/1)**

Clears status & cache, aborts all pending requests.
`options` as the same as in [Constructor](#Constructor)

Example

```js
connectionStatus.reset(options).then(function () {
  connectionStatus.ok === undefined // true
})
```

### Events

- 'disconnected'  
  Triggered if ping failed and `connectionStatus.ok` isn’t `false`
- 'reconnected'  
  Triggered if ping succeeded and `connectionStatus.ok` is `false`
- 'reset'  
  Triggered if `connectionStatus.reset()` called, or cache invalidated

Example

```js
connectionStatus.on('disconnected', handler)
connectionStatus.on('reconnected', handler)
connectionStatus.on('reset', handler)
```

## Testing

Local setup

```
git clone git@github.com:hoodiehq/hoodie-client-connection-status.git
cd hoodie-client-connection-status
npm install
```

Run all tests and code style checks

```
npm test
```

Run all tests on file change

```
npm run test:watch
```

Run specific tests only

```
node tests/specs # run unit tests
node tests/specs/check # run .check() unit tests
node tests/integration/walktrough # run walktrough integration test
# PROTIP™ Pipe output through a [pretty reporter](https://www.npmjs.com/package/tape#pretty-reporters)
```

## License

[Apache-2.0](https://github.com/hoodiehq/hoodie/blob/master/LICENSE)
