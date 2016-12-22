var lolex = require('lolex')
var simple = require('simple-mock')
var test = require('tape')

var startChecking = require('../../lib/start-checking')

test('startChecking() with checkTimeout & 200 response', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    ready: Promise.resolve(),
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter,
    timestamp: 'something',
    cache: {
      set: simple.stub().resolveWith()
    }
  }

  simple.mock(startChecking.internals, 'check').callFn(function () {
    return { then: function (success) { success() } }
  })

  startChecking(state, {
    interval: {
      connected: 1000
    }
  })

  .then(function () {
    t.ok(state.checkTimeout, 'state.checkTimeout is set')
    clock.tick(2000)
    t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

    clearTimeout(state.checkTimeout)
    simple.restore()
    clock.uninstall()
  })

  .catch(t.error)
})

test('startChecking() with checkTimeout & 200 response with number interval', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    ready: Promise.resolve(),
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

  .then(function () {
    t.ok(state.checkTimeout, 'state.checkTimeout is set')
    clock.tick(2000)
    t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

    clearTimeout(state.checkTimeout)
    simple.restore()
    clock.uninstall()
  })

  .catch(t.error)
})

test('startChecking() with checkTimeout & 500 error response', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    ready: Promise.resolve(),
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

  .then(function () {
    t.ok(state.checkTimeout, 'state.checkTimeout is set')
    clock.tick(6000)
    t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

    clearTimeout(state.checkTimeout)
    simple.restore()
    clock.uninstall()
  })

  .catch(t.error)
})

test('startChecking() with invalid state', function (t) {
  t.plan(1)

  var state = {
    ready: Promise.resolve()
  }

  startChecking(state)

  .then(function () {
    t.notOk(state.checkTimeout, 'state.checkTimeout is not set')
  })

  .catch(t.error)
})

test('startChecking() with default interval of 30s & 200 response', function (t) {
  t.plan(5)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    ready: Promise.resolve(),
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter,
    timestamp: 'something',
    cache: {
      set: simple.stub().resolveWith()
    }
  }

  simple.mock(startChecking.internals, 'check').callFn(function () {
    return { then: function (success) { success() } }
  })

  startChecking(state)

  .then(function () {
    t.ok(state.checkTimeout, 'state.checkTimeout is set')
    clock.tick(1)
    t.is(startChecking.internals.check.callCount, 1, '1 requests sent')
    t.is(startChecking.internals.check.lastCall.args[0], state, '1 requests sent')
    clock.tick(29998)
    t.is(startChecking.internals.check.callCount, 1, '1 requests sent')
    clock.tick(1)
    t.is(startChecking.internals.check.callCount, 2, '2 requests sent')

    clearTimeout(state.checkTimeout)
    simple.restore()
    clock.uninstall()
  })

  .catch(t.error)
})
