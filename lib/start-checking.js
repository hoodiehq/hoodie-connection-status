module.exports = startChecking

var internals = module.exports.internals = {}
internals.check = require('./check')
internals.getOk = require('./get-ok')

function startChecking (state, options) {
  return state.ready

  .then(function () {
    options = parse(options)
    if (!state.method || !state.url) {
      return
    }

    handleInterval(state, options)
  })
}

function timeoutHandler (state, options) {
  var checkAgain = handleInterval.bind(null, state, options)
  internals.check(state, options).then(checkAgain, checkAgain)
}

function handleInterval (state, options) {
  var timeout
  var ok = internals.getOk(state)

  if (options.checkTimeout) {
    timeout = options.checkTimeout
  }

  if (options.interval) {
    if (typeof options.interval === 'number') {
      timeout = options.interval
    } else {
      // if ok is undefined, then we are unsure what the state is but it is most likely connected. So only when ok
      // is explicitly false do we want to use the disconnected interval
      timeout = (ok === false) ? options.interval.disconnected : options.interval.connected
    }
  }

  if (timeout) {
    // we use setTimeout on purpose, we don't want to send requests each
    // x seconds, but rather set a timeout for x seconds after each response
    // but we use `checkTimeout` as variable as the effect is the same
    state.checkTimeout = setTimeout(timeoutHandler, timeout, state, options)
    return
  }

  options.interval = 30000
  state.checkTimeout = setTimeout(timeoutHandler, 0, state, options)
}

function parse (options) {
  if (!options) {
    return {}
  }

  return options
}
