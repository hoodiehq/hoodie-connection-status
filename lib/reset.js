module.exports = reset

var cache = require('./utils/cache')

function reset (state, o) {
  return state.ready

  .then(function () {
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

    if (state.request) {
      state.request.abort()
    }

    return cache.unset(state)
  })

  .then(function () {
    state.emitter.emit('reset')
  })
}
