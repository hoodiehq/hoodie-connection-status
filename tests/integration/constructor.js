var Store = require('async-get-set-store')
var test = require('tape')

var ConnectionStatus = require('../../client')
var store = new Store('connection_https://example.com/ping')

test('Instance', function (t) {
  store.unset()

  .then(function () {
    var connectionStatus = new ConnectionStatus('https://example.com/ping')

    t.is(typeof connectionStatus.ready.then, 'function', 'connectionStatus.ready is a promise')
    connectionStatus.ready = 'funky'
    t.isNot(connectionStatus.ready, 'funky', 'connectionStatus.ready cannot be changed')

    t.ok(connectionStatus.hasOwnProperty('ok'), 'connectionStatus.ok exists')
    t.is(connectionStatus.ok, undefined, 'connectionStatus.ok is undefined')
    connectionStatus.ok = 'funky'
    t.is(connectionStatus.ok, undefined, 'connectionStatus.ok cannot be changed')

    t.ok(connectionStatus.hasOwnProperty('isChecking'), 'connectionStatus.isChecking exists')
    t.is(connectionStatus.isChecking, false, 'connectionStatus.isChecking is false')
    connectionStatus.isChecking = 'funky'
    t.isNot(connectionStatus.isChecking, 'funky', 'connectionStatus.isChecking cannot be changed')

    t.is(typeof connectionStatus.check, 'function', 'connectionStatus.check is function')
    t.is(typeof connectionStatus.startChecking, 'function', 'connectionStatus.startChecking is function')
    t.is(typeof connectionStatus.stopChecking, 'function', 'connectionStatus.stopChecking is function')
    t.is(typeof connectionStatus.on, 'function', 'connectionStatus.on is function')
    t.is(typeof connectionStatus.off, 'function', 'connectionStatus.off is function')

    t.end()
  })

  .catch(t.error)
})
