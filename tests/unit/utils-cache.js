var test = require('tape')

var cache = require('../../lib/utils/cache')
var origStoreGetObject = cache.internals.store.getObject
var origStoreSetObject = cache.internals.store.setObject

test('cache.get({cache: false})', function (t) {
  cache.internals.store.getObject = function () {
    cache.internals.store.getObject = origStoreGetObject
    t.fail('cache bypassed')
  }

  cache.get({cache: false})

  t.end()
})

test('cache.get({url: "foo-url", cache: {prefix: "prfx_"}})', function (t) {
  t.plan(3)

  cache.internals.store.getObject = function (key) {
    cache.internals.store.getObject = origStoreGetObject
    t.pass('state read from cache')
    t.is(key, 'prfx_foo-url', 'cache key')
    return 'funky'
  }

  var boogie = cache.get({url: 'foo-url', cache: { prefix: 'prfx_' }})
  t.is(boogie, 'funky', 'return object from cache')
})

test('cache.set({cache: false})', function (t) {
  cache.internals.store.setObject = function () {
    cache.internals.store.setObject = origStoreSetObject
    t.fail('cache bypassed')
  }

  cache.set({cache: false})

  t.end()
})

test('cache.set({timestamp: "foo", url: "foo-url", cache: {prefix: "prfx_"}})', function (t) {
  t.plan(3)

  cache.internals.store.setObject = function (key, data) {
    cache.internals.store.setObject = origStoreSetObject
    t.pass('state written to cache')
    t.is(key, 'prfx_foo-url', 'cache key')
    t.deepEqual(data, {timestamp: 'foo', error: undefined}, 'cache key')
  }

  cache.set({timestamp: 'foo', url: 'foo-url', cache: { prefix: 'prfx_' }})
})
