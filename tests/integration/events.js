var store = require('humble-localstorage')
var nock = require('nock')
var test = require('tape')

var ConnectionStatus = require('../../client')

test('Events', function (t) {
  t.plan(2)

  var serverMock = nock('https://example.com')

  var connectionStatus = new ConnectionStatus('https://example.com/ping')

  function disconnect () {
    t.pass('disconnect')
  }
  function reconnect () {
    t.pass('reconnect')
    connectionStatus.stopChecking()
    store.clear()
  }

  connectionStatus.on('disconnect', disconnect)
  connectionStatus.on('reconnect', reconnect)

  serverMock.head('/ping').once().reply(200)
  serverMock.head('/ping').once().reply(500)
  serverMock.head('/ping').once().reply(200)

  // connect initially
  connectionStatus.startChecking({checkTimeout: 100})
})
