module.exports = request

var internals = module.exports.internals = {}
internals.nets = require('nets')

function request (options) {
  var requestState
  var _reject
  var promise = new Promise(function (resolve, reject) {
    _reject = reject
    requestState = internals.nets({
      method: options.method,
      url: options.url,
      timeout: options.timeout,
      // Turn off the use of Buffer in nets
      // in order to make this module compatible
      // for Webpack builds.
      // see: https://github.com/maxogden/nets
      encoding: undefined
    }, function (error, response, body) {
      if (error) {
        error.name = error.code === 'ETIMEDOUT' ? 'TimeoutError' : 'ConnectionError'
        error.code = undefined
        return reject(error)
      }

      if (response.statusCode >= 400) {
        error = new Error('Server error')
        error.name = 'ServerError'
        error.code = response.statusCode
        return reject(error)
      }

      resolve()
    })
  })

  promise.abort = function () {
    try {
      requestState.abort()
    } catch (error) {}
    var error = new Error('Aborted')
    error.name = 'AbortError'
    error.code = 0
    _reject(error)
  }

  return promise
}
