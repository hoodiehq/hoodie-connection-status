var store = require('humble-localstorage')
var test = require('tape')

var ConnectionStatus = require('../../client')

test('connection.reset() resets the state', function (t) {
  t.plan(2)

  store.setObject('connection_https://example.com/ping', {
    timestamp: new Date()
  })

  var connectionStatus = new ConnectionStatus({
    url: 'https://example.com/ping'
  })

  t.is(connectionStatus.ok, true, 'connection status is connected')

  connectionStatus.reset().then(function () {
    t.is(connectionStatus.ok, undefined, 'connection status is disconnected')
  }).catch(function (err) {
    t.fail(err)
  })
})

test('connection.reset() resets the timestamp', function (t) {
  t.plan(3)

  store.setObject('connection_https://example.com/ping', {
    timestamp: new Date()
  })

  var connectionStatus = new ConnectionStatus({
    url: 'https://example.com/ping'
  })

  t.is(connectionStatus.ok, true, 'connection status is connected')

  connectionStatus.reset().then(function () {
    t.is(connectionStatus.ok, undefined, 'connection status is disconnected')

    store.setObject('connection_https://example.com/ping', {
      timestamp: new Date()
    })
    connectionStatus = new ConnectionStatus({
      url: 'https://example.com/ping'
    })

    t.is(connectionStatus.ok, true, 'connection status is reconnected')
  }).catch(function (err) {
    t.fail(err)
  })
})

test('connection.reset() resets any errors', function (t) {
  t.plan(3)

  store.setObject('connection_https://example.com/ping', {
    error: new Error('no soup for you')
  })

  var connectionStatus = new ConnectionStatus({
    url: 'https://example.com/ping'
  })

  connectionStatus.on('reset', function () {
    t.pass('connectionStatus "reset" event triggered')
  })

  t.is(connectionStatus.ok, undefined, 'connection status is in error')
  connectionStatus.reset().then(function () {
    store.setObject('connection_https://example.com/ping', {
      timestamp: new Date()
    })
    connectionStatus = new ConnectionStatus({
      url: 'https://example.com/ping'
    })

    t.is(connectionStatus.ok, true, 'connection status is fine now')
  }).catch(function (err) {
    t.fail(err)
  })
})

test('connection.reset() aborts requests', function (t) {
  t.plan(4)

  var connectionStatus = new ConnectionStatus({
    url: 'https://abort-example.com/ping'
  })

  connectionStatus.check()

  .catch(function (error) {
    t.is(error.name, 'AbortError', '.check() rejects with AbortError')
    t.is(error.message, 'Aborted', '.check() rejects with message "Aborted"')
    t.is(error.code, 0, '.check() rejects with code 0')
  })

  connectionStatus.reset().then(function () {
    t.pass('reset resolves')
  })
})
