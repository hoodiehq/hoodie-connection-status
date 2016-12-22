var nock = require('nock')
var Store = require('async-get-set-store')
var test = require('tape')

var ConnectionStatus = require('../../client')
var store = new Store('connection_https://example.com/ping')

test('Walkthrough', function (t) {
  t.plan(5)

  nock('https://example.com')
    .head('/ping').reply(200)
    .head('/ping').reply(500)

  store.unset()

  .then(function () {
    // Create a Connection instance for example.com without existing cache
    return new ConnectionStatus('https://example.com/ping').ready
  })

  .then(function (connectionStatus) {
    // connectionStatus.ok is set to undefined
    t.is(connectionStatus.ok, undefined, 'connectionStatus.ok is undefined')

    // Check connection, will return 200 OK
    connectionStatus.check()

    .then(function () {
      // connectionStatus.ok set to `true`
      t.is(connectionStatus.ok, true, 'connectionStatus.ok is true')

      // Check again, this time server returns 500 error
      return connectionStatus.check()
    })

    .catch(function () {
      // connectionStatus.ok is set to false
      t.is(connectionStatus.ok, false, 'connectionStatus.ok is false')
    })

    .then(function () {
      // Create a new instance for same URL,
      // connectionStatus.ok is set to false due to cache
      return new ConnectionStatus('https://example.com/ping').ready
    })

    .then(function (connectionStatus2) {
      t.is(connectionStatus2.ok, false, 'connection status persisted for same URL')

      // Create another instance for different url,
      // connectionStatus.ok is set to undefined as cache is url-dependent
      return new ConnectionStatus('https://example.com/pong').ready
    })

    .then(function (connectionStatus3) {
      t.is(connectionStatus3.ok, undefined, 'connection status persisted for same URL only')
    })
  })

  .catch(t.error)
})
