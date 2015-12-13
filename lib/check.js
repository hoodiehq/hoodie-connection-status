module.exports = check

var Promise = require('lie')

var internals = module.exports.internals = {}
internals.nets = require('nets')
internals.cache = require('./utils/cache')

function check (state) {
  return new Promise(function (resolve, reject) {
    internals.nets({
      method: state.method,
      url: state.url,
      timeout: state.timeout
    }, function (error, response, body) {
      state.timestamp = new Date().toISOString()

      if (error) {
        error.name = error.code === 'ETIMEDOUT' ? 'TimeoutError' : 'ConnectionError'
        error.code = undefined
        handleError(state, error)
        return reject(error)
      }

      if (response.statusCode >= 400) {
        error = new Error('Server error')
        error.name = 'ServerError'
        error.code = response.statusCode
        handleError(state, error)
        return reject(error)
      }

      if (state.error) {
        state.emitter.emit('reconnect')
        delete state.error
      }

      internals.cache.set(state)

      resolve()
    })
  })
}

function handleError (state, error) {
  if (!state.error) {
    state.emitter.emit('disconnect')
  }
  state.error = error
  internals.cache.set(state, error)
}
