var EventEmitter = require('events').EventEmitter

var test = require('tape')

var on = require('../../lib/on')
var off = require('../../lib/off')

test('emitter off', function (t) {
  t.plan(1)

  var state = {
    emitter: new EventEmitter()
  }

  on(state, 'test', function () {})
  off(state, 'test', function () {})

  t.equals(state.emitter.listenerCount(), 0)
})
