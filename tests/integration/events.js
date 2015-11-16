var nock = require('nock')
var test = require('tape')
var lolex = require('lolex')

var ConnectionStatus = require('../../index')

test('Events', function (t) {
  t.plan(2)
  var clock = lolex.install()

  var serverMock = nock('https://example.com')

  var connectionStatus = new ConnectionStatus('https://example.com/ping')

  var disconnected = function () { t.pass('Disconnected') }
  var reconnected = function () { t.pass('Reconnected') }

  connectionStatus.on('disconnected', disconnected)
  connectionStatus.on('reconnected', reconnected)

  // connect initially
  serverMock.head('/ping').once().reply(200)
  connectionStatus.check({interval: 1000})

  // second request fails for disconnect
  clock.tick(500)
  serverMock.head('/ping').once().reply(500)
  clock.tick(1000)

  // third request succeeds for reconnect
  serverMock.head('/ping').once().reply(200)
  clock.tick(1000)

  connectionStatus.off('disconnected', disconnected)
  connectionStatus.off('reconnected', reconnected)

  // ensure .off works
  clock.tick(2000)

  clock.uninstall()
})
