var simple = require('simple-mock')
var test = require('tape')

var reset = require('../../lib/reset')

test('reset abort request', function (t) {
  t.plan(1)

  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    cache: {},
    emitter: {
      emit: simple.stub()
    },
    request: {
      abort: simple.stub()
    }
  }

  reset(state)

  t.is(state.request.abort.callCount, 1, 'request aborted')
})

test('reset interval to default', function (t) {
  var intervalValue = 30000
  var state = {
    method: 'HEAD',
    url: 'https://example.com/ping',
    cache: {}
  }
  var options = {
    interval: intervalValue
  }

  reset(state, options)

  t.is(state.interval.connected, intervalValue, 'interval.connected reset')
  t.is(state.interval.disconnected, intervalValue, 'interval.connected reset')

  t.end()
})
