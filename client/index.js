module.exports = Connection

var EventEmitter = require('events').EventEmitter

var check = require('../lib/check')
var startChecking = require('../lib/start-checking')
var stopChecking = require('../lib/stop-checking')
var isChecking = require('../lib/is-checking')
var getOk = require('../lib/get-ok')
var on = require('../lib/on')
var off = require('../lib/off')
var reset = require('../lib/reset')

var parseOptions = require('../lib/utils/parse-options')

function Connection (options) {
  var state = parseOptions(options)

  state.emitter = new EventEmitter()

  var api = {
    get ready () {
      return state.ready.then(function () { return api })
    },
    get ok () {
      return getOk(state)
    },
    get isChecking () {
      return isChecking(state)
    },
    check: check.bind(null, state),
    stopChecking: stopChecking.bind(null, state),
    startChecking: startChecking.bind(null, state),
    on: on.bind(null, state),
    off: off.bind(null, state),
    reset: reset.bind(null, state)
  }

  return api
}
