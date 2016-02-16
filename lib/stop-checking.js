module.exports = stopChecking

function stopChecking (state) {
  clearTimeout(state.checkTimeout)
  delete state.checkTimeout
}
