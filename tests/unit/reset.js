var simple = require('simple-mock')
var test = require('tape')

var reset = require('../../lib/reset')

test('reset abort request', function (t) {
  t.plan(1)

  var state = {
    ready: Promise.resolve(),
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: {
      emit: simple.stub()
    },
    request: {
      abort: simple.stub()
    },
    cache: {
      unset: simple.stub().resolveWith()
    }
  }

  reset(state)

  .then(function () {
    t.is(state.request.abort.callCount, 1, 'request aborted')
  })

  .catch(t.error)
})

test('reset interval to default', function (t) {
  var intervalValue = 30000
  var state = {
    ready: Promise.resolve(),
    method: 'HEAD',
    url: 'https://example.com/ping',
    emitter: {
      emit: simple.stub()
    },
    cache: {
      unset: simple.stub().resolveWith()
    }
  }
  var options = {
    interval: intervalValue
  }

  reset(state, options)

  .then(function () {
    t.is(state.interval.connected, intervalValue, 'interval.connected reset')
    t.is(state.interval.disconnected, intervalValue, 'interval.connected reset')

    t.end()
  })

  .catch(t.error)
})
