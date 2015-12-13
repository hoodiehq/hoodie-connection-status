var test = require('tape')

var stopChecking = require('../../lib/stopChecking')

test('stopChecking() when state has interval', function (t) {
  function check () {
    return
  }

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    interval: setTimeout(check, 5000, {}, {})
  }

  stopChecking(state)

  t.is(state.interval, undefined, 'timeout cleared')
  t.end()
})
