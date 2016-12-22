var Store = require('async-get-set-store')
var test = require('tape')

var store = new Store('connection_https://example.com/ping')

var ConnectionStatus = require('../../client')

test('connection.reset() resets the state', function (t) {
  t.plan(2)

  store.set({
    timestamp: new Date()
  })

  .then(function () {
    return new ConnectionStatus({
      url: 'https://example.com/ping'
    }).ready
  })

  .then(function (connectionStatus) {
    t.is(connectionStatus.ok, true, 'connection status is connected')

    return connectionStatus.reset()

    .then(function () {
      t.is(connectionStatus.ok, undefined, 'connection status is disconnected')
    })
  })

  .catch(t.error)
})

test('connection.reset() resets the timestamp', function (t) {
  t.plan(3)

  store.set({
    timestamp: new Date()
  })

  .then(function () {
    return new ConnectionStatus({
      url: 'https://example.com/ping'
    }).ready
  })

  .then(function (connectionStatus) {
    t.is(connectionStatus.ok, true, 'connection status is connected')

    return connectionStatus.reset()

    .then(function () {
      t.is(connectionStatus.ok, undefined, 'connection status is disconnected')

      return store.set({
        timestamp: new Date()
      })
    })

    .then(function () {
      return new ConnectionStatus({
        url: 'https://example.com/ping'
      }).ready
    })

    .then(function (connectionStatus) {
      t.is(connectionStatus.ok, true, 'connection status is reconnected')
    })
  })

  .catch(t.error)
})

test('connection.reset() resets any errors', function (t) {
  t.plan(3)

  store.set({
    error: new Error('no soup for you')
  })

  .then(function () {
    return new ConnectionStatus({
      url: 'https://example.com/ping'
    }).ready
  })

  .then(function (connectionStatus) {
    connectionStatus.on('reset', function () {
      t.pass('connectionStatus "reset" event triggered')
    })

    t.is(connectionStatus.ok, undefined, 'connection status is in error')

    connectionStatus.reset()

    .then(function () {
      return store.set({
        timestamp: new Date()
      })
    })

    .then(function () {
      return new ConnectionStatus({
        url: 'https://example.com/ping'
      }).ready
    })

    .then(function (connectionStatus) {
      t.is(connectionStatus.ok, true, 'connection status is fine now')
    })
  })

  .catch(t.error)
})

test('connection.reset() aborts requests', function (t) {
  t.plan(4)

  store.unset()

  .then(function () {
    return new ConnectionStatus({
      url: 'https://abort-example.com/ping'
    }).ready
  })

  .then(function (connectionStatus) {
    connectionStatus.check()

    .catch(function (error) {
      t.is(error.name, 'AbortError', '.check() rejects with AbortError')
      t.is(error.message, 'Aborted', '.check() rejects with message "Aborted"')
      t.is(error.code, 0, '.check() rejects with code 0')
    })

    .catch(t.error)

    connectionStatus.reset()

    .then(function () {
      t.pass('reset resolves')
    })
  })
})
