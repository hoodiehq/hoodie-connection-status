var test = require('tape')

var isChecking = require('../../lib/is-checking')

test('isChecking() when indeed checking', function (t) {
  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    checkTimeout: 1
  }

  t.is(isChecking(state), true, 'is checking indeed')
  t.end()
})

test('isChecking() when not checking', function (t) {
  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping'
  }

  t.is(isChecking(state), false, 'nope not checking')
  t.end()
})
