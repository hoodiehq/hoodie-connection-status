module.exports = stopChecking

function stopChecking (state) {
  clearTimeout(state.interval)
  delete state.interval
}
