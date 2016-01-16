module.exports = startChecking

var internals = module.exports.internals = {}
internals.check = require('./check')

function startChecking (state, options) {
  options = parse(options)
  handleInterval(state, options)
}

function handleInterval (state, options) {
  if (options.interval) {
    // we use setTimeout on purpose, we don't want to send requests each
    // x seconds, but rather set a timeout for x seconds after each response
    // but we use `interval` as variable as the effect is the same
    state.interval = setTimeout(function () {
      var checkAgain = handleInterval.bind(null, state, options)
      internals.check(state, options).then(checkAgain, checkAgain)
    }, options.interval)
  }
}

function parse (options) {
  if (!options) {
    return {}
  }

  return options
}
