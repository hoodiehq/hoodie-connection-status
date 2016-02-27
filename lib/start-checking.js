module.exports = startChecking

var internals = module.exports.internals = {}
internals.check = require('./check')
internals.getOk = require('./get-ok')

function startChecking (state, options) {
  options = parse(options)
  handleInterval(state, options)
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
    state.checkTimeout = setTimeout(function () {
      var checkAgain = handleInterval.bind(null, state, options)
      internals.check(state, options).then(checkAgain, checkAgain)
    }, timeout)
  }
}

function parse (options) {
  if (!options) {
    return {}
  }

  return options
}
