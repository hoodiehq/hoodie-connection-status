var test = require('tape')

var stopChecking = require('../../lib/stop-checking')

test('stopChecking() when state has checkTimeout', function (t) {
  function check () {
    return
  }

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    checkTimeout: setTimeout(check, 5000, {}, {})
  }

  stopChecking(state)

  t.is(state.checkTimeout, undefined, 'timeout cleared')
  t.end()
})
