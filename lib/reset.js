module.exports = reset

var Promise = require('lie')
var cache = require('./utils/cache')

function reset (state) {
  state.timestamp = undefined
  state.error = undefined
  cache.set(state)
  return Promise.resolve()
}
