module.exports = on

function on (state, eventName, handler) {
  state.emitter.on(eventName, handler)

  return this
}
