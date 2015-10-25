module.exports = off

function off (state, eventName, handler) {
  state.emitter.removeListener(eventName, handler)

  return this
}
