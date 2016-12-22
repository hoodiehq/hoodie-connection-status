var nock = require('nock')
var Store = require('async-get-set-store')
var test = require('tape')

var ConnectionStatus = require('../../client')
var store = new Store('connection_https://example.com/ping')

test('Events', function (t) {
  t.plan(2)

  nock('https://example.com')
    .head('/ping').reply(200)
    .head('/ping').reply(500)
    .head('/ping').reply(200)

  store.unset()

  .then(function () {
    var connectionStatus = new ConnectionStatus('https://example.com/ping')

    function disconnect () {
      t.pass('disconnect')
    }
    function reconnect () {
      t.pass('reconnect')
      connectionStatus.stopChecking()
    }

    connectionStatus.on('disconnect', disconnect)
    connectionStatus.on('reconnect', reconnect)

    // connect initially
    connectionStatus.startChecking({checkTimeout: 100})
  })

  .catch(t.error)
})
