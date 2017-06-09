module.exports = parseOptions

var Store = require('async-get-set-store')
var nextTick = require('next-tick')

var cache = require('./cache')

var DEFAULTS = {
  cache: {},
  cacheTimeout: 7200000, // 2h in milliseconds
  method: 'HEAD',
  checkTimeout: undefined,
  interval: {
    connected: undefined,
    disconnected: undefined
  }
}

function parseOptions (options) {
  var url = typeof options === 'string' ? options : options && options.url

  if (!url) {
    throw new TypeError('Connection: url must be set')
  }

  if (typeof options === 'string') {
    options = {}
  }

  if (options.cache === undefined) {
    options.cache = new Store('connection_' + url)
  }

  if (typeof options.interval === 'number') {
    var intervalTimeValue = options.interval
    options.interval = {
      connected: intervalTimeValue,
      disconnected: intervalTimeValue
    }
  }

  var state = {
    url: url,
    cache: options.cache,
    method: options.method || DEFAULTS.method,
    checkTimeout: options.checkTimeout || DEFAULTS.checkTimeout,
    interval: options.interval || DEFAULTS.interval,
    cacheTimeout: options.cacheTimeout || DEFAULTS.cacheTimeout,
    ready: cache.get({
      cache: options.cache
    })
      .then(function (cache) {
        if (cache.timestamp) {
          var cachedTime = +new Date(cache.timestamp)
          var currentTime = +new Date()
          if (state.cacheTimeout && currentTime >= cachedTime + state.cacheTimeout) {
            nextTick(function () {
              state.emitter.emit('reset', cache)
            })
          } else {
            state.error = cache.error
            state.timestamp = cache.timestamp
          }
        }
      })
      .catch(function (error) {
        error.name = 'SetupError'
        error.message = 'Error while initialising: ' + error.message
        throw error
      })
  }

  return state
}
