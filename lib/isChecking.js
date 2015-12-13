module.exports = isChecking

function isChecking (state) {
  return !!state.interval
}
