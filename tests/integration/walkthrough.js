var nock = require('nock')
var store = require('humble-localstorage')
var test = require('tape')

var ConnectionStatus = require('../../client')

test('Walkthrough', function (t) {
  store.clear()
  t.plan(5)

  var serverMock = nock('https://example.com')

  // Create a Connection instance for example.com without existing cache
  var connectionStatus = new ConnectionStatus('https://example.com/ping')

  // connectionStatus.ok is set to undefined
  t.is(connectionStatus.ok, undefined, 'connectionStatus.ok is undefined')

  // Check connection, will return 200 OK
  serverMock.head('/ping').once().reply(200)
  connectionStatus.check()

  .then(function () {
    // connectionStatus.ok set to `true`
    t.is(connectionStatus.ok, true, 'connectionStatus.ok is true')

    // Check again, this time server returns 500 error
    serverMock.head('/ping').once().reply(500)
    return connectionStatus.check()
  })

  .catch(function () {
    // connectionStatus.ok is set to false
    t.is(connectionStatus.ok, false, 'connectionStatus.ok is false')
  })

  .then(function () {
    // Create a new instance for same URL,
    // connectionStatus.ok is set to false due to cache
    var connectionStatus2 = new ConnectionStatus('https://example.com/ping')
    t.is(connectionStatus2.ok, false, 'connection status persisted for same URL')

    // Create another instance for different url,
    // connectionStatus.ok is set to undefined as cache is url-dependent
    var connectionStatus3 = new ConnectionStatus('https://example.com/pong')
    t.is(connectionStatus3.ok, undefined, 'connection status persisted for same URL only')
  })
})
