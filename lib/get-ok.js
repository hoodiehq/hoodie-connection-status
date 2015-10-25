module.exports = getOk

function getOk (state) {
  if (state.timestamp === undefined) {
    return undefined
  }

  return state.error === undefined
}
