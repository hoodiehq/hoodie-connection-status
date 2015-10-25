module.exports = parseOptions

var DEFAULTS = {
  cache: {
    prefix: 'connection_',
    timeout: undefined
  },
  method: 'HEAD',
  interval: undefined
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
    options.cache = {}
  }

  if (options.cache.prefix === undefined) {
    options.cache.prefix = DEFAULTS.cache.prefix
  }
  if (options.cache.timeout === undefined) {
    options.cache.timeout = DEFAULTS.cache.timeout
  }

  return {
    url: url,
    method: options.method || DEFAULTS.method,
    interval: options.interval || DEFAULTS.interval,
    cache: options.cache
  }
}
