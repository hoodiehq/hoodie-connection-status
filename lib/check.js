module.exports = check

var Promise = require('lie')

var internals = module.exports.internals = {}
internals.nets = require('nets')
internals.cache = require('./utils/cache')

function check (state, options) {
  options = parse(options)

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
        handleError(state, error, options)
        return reject(error)
      }

      if (response.statusCode >= 400) {
        error = new Error('Server error')
        error.name = 'ServerError'
        error.code = response.statusCode
        handleError(state, error, options)
        return reject(error)
      }

      if (state.error) {
        state.emitter.emit('reconnect')
        delete state.error
      }

      internals.cache.set(state)
      handleInterval(state, options)

      resolve()
    })
  })
}

function parse (options) {
  if (!options) {
    return {}
  }

  return options
}

function handleError (state, error, options) {
  if (!state.error) {
    state.emitter.emit('disconnect')
  }
  state.error = error
  internals.cache.set(state, error)
  handleInterval(state, options)
}

function handleInterval (state, options) {
  if (options.interval) {
    // we use setTimeout on purpose, we don't want to send requests each
    // x seconds, but rather set a timeout for x seconds after each response
    // but we use `interval` as variable as the effect is the same
    state.interval = setTimeout(check, options.interval, state, options)
    return
  }

  if (state.interval) {
    clearTimeout(state.interval)
    delete state.interval
  }
}
