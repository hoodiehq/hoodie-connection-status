var simple = require('simple-mock')
var test = require('tape')

var request = require('../../lib/utils/request')

test('request resolves when no error is given', function (t) {
  t.plan(2)

  simple.mock(request.internals, 'nets').callFn(function (options, callback) {
    callback(null, {})
  })

  request({})

    .catch(function () {
      t.fail('should not be rejected')
    })

    .then(function () {
      t.is(request.internals.nets.callCount, 1, 'nets request sent')
      t.pass('promise should resolve')
    })

    .then(function () {
      simple.restore()
    })
})

test('request rejects with error', function (t) {
  t.plan(4)

  simple.mock(request.internals, 'nets').callFn(function (options, callback) {
    callback(new Error('oops'))
  })

  request({})

    .then(function () {
      t.fail('promise should not resolve')
    })

    .catch(function (error) {
      t.pass('should be rejected')
      t.is(request.internals.nets.callCount, 1, 'nets request sent')
      t.is(error.code, undefined, 'should be an undefined code')
      t.is(error.name, 'ConnectionError', 'gets set to ConnectionError')
    })

    .then(function () {
      simple.restore()
    })
})

test('request rejects with error code 500', function (t) {
  t.plan(4)

  simple.mock(request.internals, 'nets').callFn(function (options, callback) {
    callback(null, { statusCode: 500 })
  })

  request({})

    .then(function () {
      t.fail('promise should not resolve')
    })

    .catch(function (error) {
      t.pass('should be rejected')
      t.is(request.internals.nets.callCount, 1, 'nets request sent')
      t.is(error.code, 500, 'should return 500 code')
      t.is(error.name, 'ServerError', 'should be a ServerError')
    })

    .then(function () {
      simple.restore()
    })
})

test('request rejects with error code ETIMEDOUT', function (t) {
  t.plan(4)

  simple.mock(request.internals, 'nets').callFn(function (options, callback) {
    callback({ code: 'ETIMEDOUT' }, {})
  })

  request({})

    .then(function () {
      t.fail('promise should not resolve')
    })

    .catch(function (error) {
      t.pass('should be rejected')
      t.is(request.internals.nets.callCount, 1, 'nets request sent')
      t.is(error.code, undefined, 'should return undefined code')
      t.is(error.name, 'TimeoutError', 'should be rejected as a TimeoutError')
    })

    .then(function () {
      simple.restore()
    })
})
