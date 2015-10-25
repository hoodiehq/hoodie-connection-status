var test = require('tape')

var ConnectionStatus = require('../../index')

test('Instance', function (t) {
  var connectionStatus = new ConnectionStatus('https://example.com/ping')

  t.ok(connectionStatus.hasOwnProperty('ok'), 'connectionStatus.ok exists')
  t.is(connectionStatus.ok, undefined, 'connectionStatus.ok is undefined')
  connectionStatus.ok = 'funky'
  t.is(connectionStatus.ok, undefined, 'connectionStatus.ok cannot be changed')
  t.is(typeof connectionStatus.check, 'function', 'connectionStatus.check is function')
  t.is(typeof connectionStatus.on, 'function', 'connectionStatus.on is function')
  t.is(typeof connectionStatus.off, 'function', 'connectionStatus.off is function')

  t.end()
})
