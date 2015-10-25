var EventEmitter = require('events').EventEmitter

var lolex = require('lolex')
var simple = require('simple-mock')
var test = require('tape')

var check = require('../../lib/check')

test('check() with 200 response', function (t) {
  t.plan(5)

  // mocks
  var clock = lolex.install(0)
  simple.mock(check.internals.cache, 'set').callFn(function (state, error) {
    t.pass('sets cache')
    t.is(state.url, 'https://example.com/ping', 'passes state to cache')
    t.is(arguments.length, 1, 'passes no error')
  })
  simple.mock(check.internals, 'nets').callbackWith(null, {
    statusCode: 200
  })

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping'
  }

  check(state)

    .then(function () {
      t.ok(check.internals.nets.callCount, 1, 'request sent')
      t.is(state.timestamp, '1970-01-01T00:00:00.000Z', 'sets state.timestamp')
    })

    .catch(t.fail)

    // cleanup mocks
    .then(function () {
      clock.uninstall()
      simple.restore()
    })
})

test('check() with 500 response', function (t) {
  t.plan(9)

  // mocks
  var clock = lolex.install(0)
  simple.mock(check.internals.cache, 'set').callFn(function (state, error) {
    t.pass('sets cache')
    t.is(state.url, 'https://example.com/ping', 'passes state to cache')
    t.is(error.name, 'ServerError', 'passes error')
  })
  simple.mock(check.internals, 'nets').callbackWith(null, {
    statusCode: 500
  })

  var emitter = new EventEmitter()
  emitter.on('disconnected', function () {
    t.pass('"disconnected" event emitted')
  })

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter
  }
  check(state)

    .then(function () {
      t.fail('promise should reject')
    })

    .catch(function (error) {
      t.ok(check.internals.nets.callCount, 1, 'request sent')
      t.is(error.name, 'ServerError', 'error is ServerError')
      t.is(error.code, 500, 'error.code is 500')
      t.is(state.timestamp, '1970-01-01T00:00:00.000Z', 'sets state.timestamp')
      t.is(error.name, 'ServerError', 'sets state.error')
    })

    // cleanup mocks
    .then(function () {
      clock.uninstall()
      simple.restore()
    })
})

test('check() with connection error', function (t) {
  t.plan(6)

  // mocks
  var emitter = {emit: function () {}}
  simple.mock(check.internals.cache, 'set').callFn(function (state, error) {
    t.pass('sets cache')
    t.is(state.url, 'https://example.com/ping', 'passes state to cache')
    t.is(error.name, 'ConnectionError', 'passes error to cache')
  })
  simple.mock(check.internals, 'nets').callbackWith(new Error('Oops'))

  check({
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter
  })

    .then(function () {
      t.fail('promise should reject')
    })

    .catch(function (error) {
      t.is(error.name, 'ConnectionError', 'error is ConnectionError')
      t.is(error.code, undefined, 'error.code is undefined')
      t.ok(check.internals.nets.callCount, 1, 'request sent')
    })

    // cleanup mocks
    .then(function () {
      simple.restore()
    })
})

test('check() with POST method', function (t) {
  t.plan(1)

  // mocks
  simple.mock(check.internals.cache, 'set').callFn(function () {})
  simple.mock(check.internals, 'nets').callbackWith(null, {})

  check({
    method: 'POST',
    url: 'https://example.com/ping'
  })

    .then(function () {
      t.is(check.internals.nets.lastCall.arg.method, 'POST', 'request sent with POST')
    })

    .catch(t.fail)

    // cleanup mocks
    .then(function () {
      simple.restore()
    })
})

test('check() with timeout', function (t) {
  t.plan(3)

  // mocks
  var emitter = {emit: function () {}}
  simple.mock(check.internals.cache, 'set').callFn(function () {})
  simple.mock(check.internals, 'nets').callbackWith({code: 'ETIMEDOUT'})

  check({
    method: 'HEAD',
    timeout: 1000,
    url: 'https://example.com/ping',
    emitter: emitter
  })

    .then(function () {
      t.fail('promise should reject')
    })

    .catch(function (error) {
      t.is(error.name, 'TimeoutError', 'error is TimeoutError')
      t.is(error.code, undefined, 'error.code is undefined')
      t.is(check.internals.nets.lastCall.arg.timeout, 1000, 'request sent with timeout')
    })

    // cleanup mocks
    .then(function () {
      simple.restore()
    })
})

test('check() with 200 response when state.error is set', function (t) {
  t.plan(3)

  // mocks
  simple.mock(check.internals.cache, 'set').callFn(function () {})
  simple.mock(check.internals, 'nets').callbackWith(null, {})
  var emitter = new EventEmitter()
  emitter.on('reconnected', function () {
    t.pass('"reconnected" event emitted')
  })

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    error: { name: 'FooError' },
    emitter: emitter
  }

  check(state)

    .then(function () {
      t.is(check.internals.nets.callCount, 1, 'request sent')
      t.is(state.error, undefined, 'removes state.error')
    })

    .catch(t.fail)

    // cleanup mocks
    .then(function () {
      simple.restore()
    })
})

test('check() with interval & 200 response', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter
  }

  simple.mock(check.internals.cache, 'set').callFn(function () {})
  simple.mock(check.internals, 'nets').callbackWith(null, {
    statusCode: 200
  })

  check(state, {
    interval: 1000
  })

    .then(function () {
      t.ok(state.interval, 'state.interval is set')
      clock.tick(1000)
      t.is(check.internals.nets.callCount, 2, '2 requests sent')
    })

    .catch(t.fail)

    // cleanup
    .then(function () {
      clearTimeout(state.interval)
      simple.restore()
      clock.uninstall()
    })
})

test('check() with interval & 500 error response', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter
  }

  simple.mock(check.internals.cache, 'set').callFn(function () {})
  simple.mock(check.internals, 'nets').callbackWith(null, {
    statusCode: 500
  })

  check(state, {
    interval: 1000
  })

    .catch(function () {
      t.ok(state.interval, 'state.interval is set')
      clock.tick(1000)
      t.is(check.internals.nets.callCount, 2, '2 requests sent')
    })

    // cleanup
    .then(function () {
      clearTimeout(state.interval)
      simple.restore()
      clock.uninstall()
    })
})

test('check() with existing interval', function (t) {
  t.plan(2)

  var clock = lolex.install(0)
  var emitter = {emit: function () {}}

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: emitter,
    interval: setTimeout(function () {
      t.fail('timeout should not be called')
    }, 1000)
  }

  setTimeout(function () {
    t.pass('sanity check: 1000ms passed')
  }, 1000)

  simple.mock(check.internals.cache, 'set').callFn(function () {})
  simple.mock(check.internals, 'nets').callbackWith(null, {
    statusCode: 200
  })

  check(state)

    .then(function () {
      t.is(state.interval, undefined, 'state.interval has been removed')
      clock.tick(1000)
    })

    .catch(t.fail)

    // cleanup
    .then(function () {
      clearTimeout(state.interval)
      simple.restore()
      clock.uninstall()
    })
})
