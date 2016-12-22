var simple = require('simple-mock')
var test = require('tape')

var parseOptions = require('../../lib/utils/parse-options')

test('parseOptions("https://example.com/ping")', function (t) {
  var options = parseOptions('https://example.com/ping')
  t.is(options.url, 'https://example.com/ping', 'options.url is set')

  t.end()
})

test('parseOptions({url: "https://example.com/ping"})', function (t) {
  var options = parseOptions({ url: 'https://example.com/ping' })
  var initialInterval = {
    connected: undefined,
    disconnected: undefined
  }
  t.is(options.url, 'https://example.com/ping', 'options.url is set')
  t.is(options.method, 'HEAD', 'options.method defaults to "HEAD"')
  t.ok(options.hasOwnProperty('checkTimeout'), 'options.checkTimeout is set')
  t.is(options.checkTimeout, undefined, 'options.checkTimeout defaults to undefined')
  t.is(options.cacheTimeout, 7200000, 'options.cacheTimeout defaults to 2h in ms')
  t.isEquivalent(options.interval, initialInterval, 'option.interval defaults to { interval: { connected, disconnected } }')

  t.end()
})

test('parseOptions({})', function (t) {
  t.throws(parseOptions.bind(null, {}), 'throws if options invalid')

  t.end()
})

test('parseOptions({url: "https://example.com/ping", interval: 30000})', function (t) {
  var intervalValue = 30000
  var options = parseOptions({
    url: 'https://example.com/ping',
    interval: intervalValue
  })
  var returnedOptions = {
    url: 'https://example.com/ping',
    interval: {
      connected: intervalValue,
      disconnected: intervalValue
    }
  }

  t.isEquivalent(options.interval, returnedOptions.interval, 'option.interval is converted from number to object')

  t.end()
})

test('parseOptions({url: "https://example.com/ping", cache: storeApi})', function (t) {
  var options = {
    url: 'https://example.com/ping',
    cache: {
      get: simple.stub().resolveWith({})
    }
  }
  var state = parseOptions(options)

  state.ready.then(function () {
    t.is(options.cache.get.callCount, 1)
    t.end()
  })

  .catch(t.error)
})

test('parseOptions with setup error', function (t) {
  var options = {
    url: 'https://example.com/ping',
    cache: {
      get: simple.stub().rejectWith(new Error('ooops'))
    }
  }
  var state = parseOptions(options)

  state.ready.catch(function () {
    t.is(options.cache.get.callCount, 1)
    t.end()
  })
})
