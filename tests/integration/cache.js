var lolex = require('lolex')
var Store = require('async-get-set-store')
var test = require('tape')

var ConnectionStatus = require('../../client')
var store = new Store('connection_https://example.com/ping')

test('instance for example.com/ping without cached connection status', function (t) {
  store.unset()

  .then(function () {
    return new ConnectionStatus('https://example.com/ping').ready
  })

  .then(function (connectionStatus) {
    t.is(connectionStatus.ok, undefined, 'connection status is undefined')

    t.end()
  })
})

test('instance for example.com/ping with cached connection status', function (t) {
  store.set({
    timestamp: new Date()
  })

  .then(function () {
    return new ConnectionStatus('https://example.com/ping').ready
  })

  .then(function (connectionStatus) {
    t.is(connectionStatus.ok, true, 'connection status read from cache')

    t.end()
  })
})

test('instance for example.com/ping with outdated cached connection status', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var oneDayInMs = 86400000

  store.set({
    timestamp: new Date()
  })

  .then(function () {
    clock.tick(oneDayInMs + 1)

    return new ConnectionStatus({
      url: 'https://example.com/ping',
      cacheTimeout: oneDayInMs
    }).ready
  })

  .then(function (connectionStatus) {
    t.is(connectionStatus.ok, undefined, 'connection status not read from outdated cache')
    connectionStatus.on('reset', function () {
      t.pass('"reset" event triggered')
    })

    clock.uninstall()
  })
})
