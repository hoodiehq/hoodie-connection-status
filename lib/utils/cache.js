module.exports = {
  get: getCache,
  set: setCache
}

var internals = module.exports.internals = {}
internals.store = require('humble-localstorage')

function setCache (state, error) {
  if (state.cache === false) {
    return
  }

  var data = {
    timestamp: state.timestamp,
    error: state.error
  }
  var key = state.cache.prefix + state.url

  internals.store.setObject(key, data)
}

function getCache (state) {
  if (state.cache === false) {
    return
  }

  var key = state.cache.prefix + state.url

  return internals.store.getObject(key)
}
