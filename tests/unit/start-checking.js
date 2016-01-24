var lolex = require('lolex')
var simple = require('simple-mock')
var test = require('tape')

var startChecking = require('../../lib/start-checking')

test('startChecking() with interval & 200 response', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter
  }

  simple.mock(startChecking.internals, 'check').callFn(function () {
    return { then: function (success) { success() } }
  })

  startChecking(state, {
    interval: 1000
  })

  t.ok(state.interval, 'state.interval is set')
  clock.tick(2000)
  t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

  clearTimeout(state.interval)
  simple.restore()
  clock.uninstall()
})

test('startChecking() with interval & 500 error response', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter
  }

  simple.mock(startChecking.internals, 'check').callFn(function () {
    return { then: function (success, error) { error() } }
  })

  startChecking(state, {
    interval: 1000
  })

  t.ok(state.interval, 'state.interval is set')
  clock.tick(2000)
  t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

  clearTimeout(state.interval)
  simple.restore()
  clock.uninstall()
})

test('startChecking() with invalid options', function (t) {
  t.plan(1)

  var state = {}

  startChecking(state)

  t.notOk(state.interval, 'state.interval is not set')
})
