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
  t.is(options.cache.prefix, 'connection_', 'options.cache defaults to { prefix: "connection_", timeout: undefined }')
  t.is(options.cache.timeout, undefined, 'options.cache defaults to { prefix: "connection_", timeout: undefined }')
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
