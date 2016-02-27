module.exports = reset

var Promise = require('lie')
var cache = require('./utils/cache')

function reset (state, o) {
  var options = o || {}
  state.timestamp = undefined
  state.error = undefined

  if (typeof options.interval === 'number') {
    var intervalTimeValue = options.interval
    state.interval = {
      connected: intervalTimeValue,
      disconnected: intervalTimeValue
    }
  }

  cache.set(state)

  if (state.request) {
    state.request.abort()
  }

  return Promise.resolve().then(function () {
    state.emitter.emit('reset')
  })
}
