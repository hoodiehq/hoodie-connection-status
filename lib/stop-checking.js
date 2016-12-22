module.exports = stopChecking

function stopChecking (state) {
  return state.ready

  .then(function () {
    clearTimeout(state.checkTimeout)
    delete state.checkTimeout
  })
}
