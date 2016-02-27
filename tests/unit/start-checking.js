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

test('startChecking() with invalid options', function (t) {
  t.plan(1)

  var state = {}

  startChecking(state)

  t.notOk(state.checkTimeout, 'state.checkTimeout is not set')
})
