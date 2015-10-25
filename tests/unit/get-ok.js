var test = require('tape')

var getOk = require('../../lib/get-ok')

test('ok with empty state', function (t) {
  var ok = getOk({})

  t.is(ok, undefined, 'ok is undefined')

  t.end()
})

test('ok with state.timestamp', function (t) {
  var ok = getOk({
    timestamp: 'something'
  })

  t.is(ok, true, 'ok is true')

  t.end()
})

test('ok with state.timestamp & state.error', function (t) {
  var ok = getOk({
    timestamp: 'something',
    error: 'some error'
  })

  t.is(ok, false, 'ok is false')

  t.end()
})
