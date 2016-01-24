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
