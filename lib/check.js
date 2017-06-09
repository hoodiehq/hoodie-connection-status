module.exports = check

var nextTick = require('next-tick')
var internals = module.exports.internals = {}
internals.cache = require('./utils/cache')
internals.request = require('./utils/request')

function check (state) {
  return state.ready

  .then(function () {
    if (state.request) {
      state.request.abort()
    }

    state.request = internals.request({
      method: state.method,
      url: state.url,
      timeout: state.timeout
    })

    // once request finishes, remove it from state
    return state.request

    .then(function () {
      delete state.request
      state.timestamp = new Date().toISOString()

      if (state.error) {
        nextTick(function () {
          state.emitter.emit('reconnect')
        })
        delete state.error
      }
    })

    .catch(function (error) {
      delete state.request
      state.timestamp = new Date().toISOString()

      if (!state.error) {
        nextTick(function () {
          state.emitter.emit('disconnect')
        })
      }
      state.error = {
        name: error.name,
        message: error.message,
        code: error.code
      }
    })

    .then(function () {
      return internals.cache.set(state)
    })

    .then(function () {
      if (state.error) {
        throw state.error
      }
    })
  })
}
