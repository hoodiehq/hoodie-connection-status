# hoodie-connection-status

> hoodie.connectionStatus API for the browser

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-connection-status.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-connection-status)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-connection-status/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-connection-status?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-connection-status.svg)](https://david-dm.org/hoodiehq/hoodie-connection-status)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-connection-status/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-connection-status#info=devDependencies)

`hoodie-connection-status` is a JavaScript library for the browser. It
allows to check a connection, and emits `disconnect` & `reconnect` events if
the request status changes. Status is persisted in `localStorage`.

## Example

```js
var connectionStatus = new ConnectionStatus('https://example.com/ping')

connectionStatus.on('disconnect', showOfflineNotification)
connectionStatus.on('reconnect reset', hideOfflineNotification)

myOtherRemoteApiThing.on('error', connectionStatus.check)
```

## API

- [Constructor](#constructor)
- [connectionStatus.ok](#connectionstatusok)
- [connectionStatus.check()](#connectionstatuscheck)
- [connectionStatus.startChecking()](#connectionstatusstartchecking)
- [connectionStatus.stopChecking()](#connectionstatusstopchecking)
- [connectionStatus.reset()](#connectionstatusreset)
- [Events](#events)

### Constructor

```js
new ConnectionStatus(options)
```

<table>
  <thead>
    <tr>
      <th align="left">Argument</th>
      <th align="left">Type</th>
      <th align="left">Description</th>
      <th align="left">Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left">options.url</th>
    <td>String</td>
    <td>Full url to send pings to</td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left">options.method</th>
    <td>String</td>
    <td>
      Defaults to <em>HEAD</em>. Must be valid http verb like <code>'GET'</code>
      or <code>'POST'</code> (case insensitive)
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.interval</th>
    <td>Number</td>
    <td>
      Interval in ms. If set a request is send immediately. The interval starts
      after each request response. Can also be set to an object to differentiate
      intervals by connection status, see below
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.interval.connected</th>
    <td>Number</td>
    <td>
      Interval in ms while <code>connectionStatus.ok</code> is not
      <code>false</code>. If set, a request is send immediately. The
      interval starts after each request response.<br>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.interval.disconnected</th>
    <td>Number</td>
    <td>
      Interval in ms while <code>connectionStatus.ok</code> is
      <code>false</code>. If set, a request is send immediately. The
      interval starts after each request response.<br>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.cache</th>
    <td>Object or false</td>
    <td>
      Defaults to <code>{ prefix: 'connection_' }</code>.
      If set to false, nothing is persisted.
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.cache.prefix</th>
    <td>String</td>
    <td>
      Defaults to <code>'connection_'</code>. will be used as the localStorage
      key prefix, followed by <code>options.url</code>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.cache.timeout</th>
    <td>Number</td>
    <td>
      time in ms after which a cache shall be invalidated. When invalidated on
      initialisation, a <code>reset</code> event gets triggered on next tick.
    </td>
    <td>No</td>
  </tr>
</table>

Example

```js
var connectionStatus = new ConnectionStatus('https://example.com/ping')

connectionStatus.on('disconnect', showOfflineNotification)
connectionStatus.check()
```

### connectionStatus.ok

_Read-only_

```js
connectionStatus.ok
```

- Returns `undefined` if no status yet
- Returns `true` last check responded ok
- Returns `false` if last check failed

The state is persisted in cache.

### connectionStatus.isChecking

_Read-only_

```js
connectionStatus.isChecking
```

Returns `true` if connection is checked continuously, otherwise `false`.
The state is persisted in cache.

### connectionStatus.check(options)

```js
connectionStatus.check(options)
```

<table>
  <thead>
    <tr>
      <th align="left">Argument</th>
      <th align="left">Type</th>
      <th align="left">Description</th>
      <th align="left">Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left">options.timeout</th>
    <td>Number</td>
    <td>
      Time in ms after which a ping shall be aborted with a
      <code>timeout</code> error
    </td>
    <td>No</td>
  </tr>
</table>

Resolves without value.

Rejects with:

<table>
  <thead>
    <tr>
      <th align="left">
        name
      </th>
      <th align="left">
        status
      </th>
      <th align="left">
        message
      </th>
    </tr>
  </thead>
  <tr>
    <th align="left">TimeoutError</th>
    <td>0</td>
    <td>Connection timeout</td>
  </tr>
  <tr>
    <th align="left">ServerError</th>
    <td><em>as returned by server</em></td>
    <td><em>as returned by server</em></td>
  </tr>
  <tr>
    <th align="left">ConnectionError</th>
    <td><code>undefined</code></td>
    <td>Server could not be reached</td>
  </tr>
</table>

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

### connectionStatus.startChecking(options)

Starts checking connection continuously

```js
connectionStatus.startChecking(options)
```

<table>
  <thead>
    <tr>
      <th align="left">Argument</th>
      <th align="left">Type</th>
      <th align="left">Description</th>
      <th align="left">Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left">options.interval</th>
    <td>Number</td>
    <td>
      Interval in ms. The interval starts after each request response.
      Can also be set to an object to differentiate interval
      by connection state, see below
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left">options.interval.connected</th>
    <td>Number</td>
    <td>
      Interval in ms while <code>connectionStatus.ok</code> is not
      <code>false</code>. The interval starts after each request response.<br>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.interval.disconnected</th>
    <td>Number</td>
    <td>
      Interval in ms while <code>connectionStatus.ok</code> is
      <code>false</code>. The interval starts after each request response.<br>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.timeout</th>
    <td>Number</td>
    <td>
      Time in ms after which a ping shall be aborted with a
      <code>timeout</code> error
    </td>
    <td>No</td>
  </tr>
</table>

Returns `connectionStatus` API

Example

```js
connectionStatus.startChecking({interval: 30000})
  .on('disconnect', showOfflineNotification)
```

### connectionStatus.stopChecking()

Stops checking connection continuously.

```js
connectionStatus.stopChecking()
```

Returns `connectionStatus` API

### connectionStatus.reset(options)

Clears status & cache, aborts all pending requests.

```js
connectionStatus.reset(options)
```

`options` is the same as in [Constructor](#constructor)

Resolves without values. Does not reject.

Example

```js
connectionStatus.reset(options).then(function () {
  connectionStatus.ok === undefined // true
})
```

### Events

<table>
  <tr>
    <th align="left">disconnect</th>
    <td>
      Ping fails and <code>connectionStatus.ok</code> isn’t <code>false</code>
    </td>
  </tr>
  <tr>
    <th align="left">reconnect</th>
    <td>
      Ping succeeds and <code>connectionStatus.ok</code> is <code>false</code>
    </td>
  </tr>
  <tr>
    <th align="left">reset</th>
    <td>
      Cache invalidated on initialisation or
      <code>connectionStatus.reset()</code> called
    </td>
  </tr>
</table>

Example

```js
connectionStatus.on('disconnect', function () {})
connectionStatus.on('reconnect', function () {})
connectionStatus.on('reset', function () {})
```

## Testing

Local setup

```
git clone git@github.com:hoodiehq/hoodie-connection-status.git
cd hoodie-connection-status
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
node tests/integration/walkthrough # run walkthrough integration test
# PROTIP™ Pipe output through a [pretty reporter](https://www.npmjs.com/package/tape#pretty-reporters)
```

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
