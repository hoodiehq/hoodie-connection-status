var test = require('tape')

var isChecking = require('../../lib/isChecking')

test('isChecking() when indeed checking', function (t) {
  function check () {
    return
  }

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    interval: setTimeout(check, 5000, {}, {})
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
