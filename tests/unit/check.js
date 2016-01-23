var EventEmitter = require('events').EventEmitter

var lolex = require('lolex')
var Promise = require('lie')
var simple = require('simple-mock')
var test = require('tape')

var check = require('../../lib/check')

test('check() with 200 response', function (t) {
  t.plan(4)

  // mocks
  var clock = lolex.install(0)
  simple.mock(check.internals.cache, 'set').callFn(function (state, error) {
    t.pass('sets cache')
    t.is(state.url, 'https://example.com/ping', 'passes state to cache')
    t.is(arguments.length, 1, 'passes no error')
  })
  simple.mock(check.internals, 'request').returnWith({
    then: function (callback) {
      callback({
        statusCode: 200
      })
      return Promise.resolve()
    },
    catch: function () {},
    abort: 'request abort method'
  })

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping'
  }

  check(state)

    .then(function () {
      t.is(state.timestamp, '1970-01-01T00:00:00.000Z', 'sets state.timestamp')
    })

    // cleanup mocks
    .then(function () {
      clock.uninstall()
      simple.restore()
    })
})

test('check() with bad state request', function (t) {
  t.plan(2)

  var emitter = new EventEmitter()
  emitter.on('disconnect', function () {
    t.pass('"disconnect" event emitted')
  })

  var state = {
    method: 'HEAD',
    url: 'http://',
    emitter: emitter
  }

  check(state)

    .then(function () {
      t.fail('promise should reject')
    })

    .catch(function (error) {
      t.notOk(error.code)
    })
})

test('check() with 500 response', function (t) {
  t.plan(8)

  // mocks
  var clock = lolex.install(0)
  simple.mock(check.internals.cache, 'set').callFn(function (state, error) {
    t.pass('sets cache')
    t.is(state.url, 'https://example.com/ping', 'passes state to cache')
    t.is(error.name, 'ServerError', 'passes error')
  })
  simple.mock(check.internals, 'request').rejectWith({
    name: 'ServerError',
    code: 500
  })

  var emitter = new EventEmitter()
  emitter.on('disconnect', function () {
    t.pass('"disconnect" event emitted')
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
  t.plan(5)

  // mocks
  var emitter = {emit: function () {}}
  simple.mock(check.internals.cache, 'set').callFn(function (state, error) {
    t.pass('sets cache')
    t.is(state.url, 'https://example.com/ping', 'passes state to cache')
    t.is(error.name, 'ConnectionError', 'passes error to cache')
  })
  simple.mock(check.internals, 'request').rejectWith({
    name: 'ConnectionError'
  })

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
  simple.mock(check.internals, 'request').resolveWith({})

  check({
    method: 'POST',
    url: 'https://example.com/ping'
  })

    .then(function () {
      t.is(check.internals.request.lastCall.arg.method, 'POST', 'request sent with POST')
    })

    .catch(t.error)

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
  simple.mock(check.internals, 'request').rejectWith({
    name: 'TimeoutError'
  })

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
      t.is(check.internals.request.lastCall.arg.timeout, 1000, 'request sent with timeout')
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
  simple.mock(check.internals, 'request').resolveWith({})
  var emitter = new EventEmitter()
  emitter.on('reconnect', function () {
    t.pass('"reconnect" event emitted')
  })

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    error: { name: 'FooError' },
    emitter: emitter
  }

  check(state)

    .then(function () {
      t.is(check.internals.request.callCount, 1, 'request sent')
      t.is(state.error, undefined, 'removes state.error')
    })

    .catch(t.error)

    // cleanup mocks
    .then(function () {
      simple.restore()
    })
})

test('check() will abort existing request', function (t) {
  t.plan(2)

  // mocks
  simple.mock(check.internals.cache, 'set').callFn(function () {})
  simple.mock(check.internals, 'request').returnWith({
    then: function (callback) {
      callback({
        statusCode: 200
      })
      return Promise.resolve()
    },
    catch: function () {},
    abort: 'request abort method'
  })

  var abortStub = simple.stub()
  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    request: {
      abort: abortStub
    }
  }

  check(state)

    .then(function () {
      t.is(abortStub.callCount, 1)
      t.is(state.request, undefined, 'removes request from state')
    })

    .catch(t.error)

    .then(function () {
      simple.restore()
    })
})
