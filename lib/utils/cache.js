module.exports = {
  get: getCache,
  set: setCache,
  unset: clearCache
}

function setCache (state) {
  if (state.cache === false) {
    return Promise.resolve()
  }

  var data = {
    timestamp: state.timestamp,
    error: state.error
  }

  return state.cache.set(data)
}

function getCache (state) {
  if (state.cache === false) {
    return Promise.resolve({})
  }

  return state.cache.get()

  .then(function (data) {
    return data
  })
}

function clearCache (state) {
  if (state.cache === false) {
    return Promise.resolve()
  }

  return state.cache.unset()
}
