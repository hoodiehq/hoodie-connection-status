var test = require('tape')

var parseOptions = require('../../lib/utils/parse-options')

test('parseOptions("https://example.com/ping")', function (t) {
  var options = parseOptions('https://example.com/ping')
  t.is(options.url, 'https://example.com/ping', 'options.url is set')

  t.end()
})

test('parseOptions({url: "https://example.com/ping"})', function (t) {
  var options = parseOptions({ url: 'https://example.com/ping' })
  t.is(options.url, 'https://example.com/ping', 'options.url is set')
  t.is(options.method, 'HEAD', 'options.method defaults to "HEAD"')
  t.ok(options.hasOwnProperty('interval'), 'options.interval is set')
  t.is(options.interval, undefined, 'options.interval defaults to undefined')
  t.is(options.cache.prefix, 'connection_', 'options.cache defaults to { prefix: "connection_", timeout: undefined }')
  t.is(options.cache.timeout, undefined, 'options.cache defaults to { prefix: "connection_", timeout: undefined }')

  t.end()
})

test('parseOptions({})', function (t) {
  t.throws(parseOptions.bind(null, {}), 'throws if options invalid')

  t.end()
})
