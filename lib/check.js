module.exports = check

var internals = module.exports.internals = {}
internals.cache = require('./utils/cache')
internals.request = require('./utils/request')

function check (state) {
  if (state.request) {
    state.request.abort()
  }

  state.request = internals.request({
    method: state.method,
    url: state.url,
    timeout: state.timeout
  })

  // once request finishes, remove it from state
  state.request.catch(function (error) {
    delete state.request
    state.timestamp = new Date().toISOString()
    handleError(state, error)
  })

  return state.request.then(function () {
    delete state.request
    state.timestamp = new Date().toISOString()

    if (state.error) {
      process.nextTick(function () {
        state.emitter.emit('reconnect')
      })
      delete state.error
    }

    internals.cache.set(state)
  })
}

function handleError (state, error) {
  if (!state.error) {
    process.nextTick(function () {
      state.emitter.emit('disconnect')
    })
  }
  state.error = error
  internals.cache.set(state, error)
}
