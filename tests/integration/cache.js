var lolex = require('lolex')
var store = require('humble-localstorage')
var test = require('tape')

var ConnectionStatus = require('../../client')

test('instance for example.com/ping without cached connection status', function (t) {
  var connectionStatus = new ConnectionStatus('https://example.com/ping')
  t.is(connectionStatus.ok, undefined, 'connection status is undefined')

  t.end()
})

test('instance for example.com/ping with cached connection status', function (t) {
  store.setObject('connection_https://example.com/ping', {
    timestamp: new Date()
  })
  var connectionStatus = new ConnectionStatus('https://example.com/ping')
  t.is(connectionStatus.ok, true, 'connection status read from cache')
  store.clear()

  t.end()
})

test('instance for example.com/ping with outdated cached connection status', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var oneDayInMs = 86400000

  store.setObject('connection_https://example.com/ping', {
    timestamp: new Date()
  })
  clock.tick(oneDayInMs)

  var connectionStatus = new ConnectionStatus({
    url: 'https://example.com/ping',
    cache: {
      timeout: oneDayInMs
    }
  })
  t.is(connectionStatus.ok, undefined, 'connection status not read from outdated cache')
  connectionStatus.on('reset', function () {
    t.pass('"reset" event triggered')
  })

  store.clear()
  clock.uninstall()
})
