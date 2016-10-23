var lolex = require('lolex')
var simple = require('simple-mock')
var test = require('tape')

var startChecking = require('../../lib/start-checking')

test('startChecking() with checkTimeout & 200 response', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter,
    timestamp: 'something'
  }

  simple.mock(startChecking.internals, 'check').callFn(function () {
    return { then: function (success) { success() } }
  })

  startChecking(state, {
    interval: {
      connected: 1000
    }
  })

  t.ok(state.checkTimeout, 'state.checkTimeout is set')
  clock.tick(2000)
  t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

  clearTimeout(state.checkTimeout)
  simple.restore()
  clock.uninstall()
})

test('startChecking() with checkTimeout & 200 response with number interval', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter,
    timestamp: 'something'
  }

  simple.mock(startChecking.internals, 'check').callFn(function () {
    return { then: function (success) { success() } }
  })

  startChecking(state, {
    interval: 1000
  })

  t.ok(state.checkTimeout, 'state.checkTimeout is set')
  clock.tick(2000)
  t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

  clearTimeout(state.checkTimeout)
  simple.restore()
  clock.uninstall()
})

test('startChecking() with checkTimeout & 500 error response', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter,
    timestamp: 'something',
    error: 'some error'
  }

  simple.mock(startChecking.internals, 'check').callFn(function () {
    return { then: function (success, error) { error() } }
  })

  startChecking(state, {
    interval: {
      disconnected: 3000
    }
  })

  t.ok(state.checkTimeout, 'state.checkTimeout is set')
  clock.tick(6000)
  t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

  clearTimeout(state.checkTimeout)
  simple.restore()
  clock.uninstall()
})

test('startChecking() with invalid options', {skip: true}, function (t) {
  t.plan(1)

  var state = {}

  startChecking(state)

  t.notOk(state.checkTimeout, 'state.checkTimeout is not set')
})

test('startChecking() with default interval of 30s & 200 response', function (t) {
  t.plan(4)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter,
    timestamp: 'something'
  }

  simple.mock(startChecking.internals, 'check').callFn(function () {
    return { then: function (success) { success() } }
  })

  startChecking(state, {})

  t.ok(state.checkTimeout, 'state.checkTimeout is set')
  clock.tick(1)
  t.is(startChecking.internals.check.callCount, 1, '1 requests sent')
  clock.tick(29998)
  t.is(startChecking.internals.check.callCount, 1, '1 requests sent')
  clock.tick(1)
  t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

  clearTimeout(state.checkTimeout)
  simple.restore()
  clock.uninstall()
})
