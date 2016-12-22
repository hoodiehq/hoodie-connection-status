var test = require('tape')

var cache = require('../../lib/utils/cache')

test('cache.get({cache: false})', function (t) {
  var state = {
    cache: false
  }

  cache.get(state)

  .then(function (result) {
    t.deepEqual(result, {}, 'resolves with empty object')

    t.end()
  })

  .catch(t.error)
})

test('cache.set({cache: false})', function (t) {
  var state = {
    cache: false
  }

  cache.set(state)

  .then(function () {
    t.pass('resolves')

    t.end()
  })

  .catch(t.error)
})

test('cache.unset({cache: false})', function (t) {
  var state = {
    cache: false
  }

  cache.unset(state)

  .then(function () {
    t.pass('resolves')

    t.end()
  })

  .catch(t.error)
})
