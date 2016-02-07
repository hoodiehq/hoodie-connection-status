module.exports = request

var nets = require('nets')
var Promise = require('lie')

function request (options) {
  var requestState
  var _reject
  var promise = new Promise(function (resolve, reject) {
    _reject = reject
    requestState = nets({
      method: options.method,
      url: options.url,
      timeout: options.timeout
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
