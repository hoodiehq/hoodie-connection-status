module.exports = reset

var Promise = require('lie')
var cache = require('./utils/cache')

function reset (state) {
  state.timestamp = undefined
  state.error = undefined
  cache.set(state)

  if (state.request) {
    state.request.abort()
  }

  return Promise.resolve().then(function () {
    state.emitter.emit('reset')
  })
}
