'use strict';

var _novusComponent = require('novus-component');

var _ConfigPlugin = require('./plugins/ConfigPlugin');

var ConfigPlugin = _interopRequireWildcard(_ConfigPlugin);

var _SerialPlugin = require('./plugins/SerialPlugin');

var SerialPlugin = _interopRequireWildcard(_SerialPlugin);

var _RelayPlugin = require('./plugins/RelayPlugin');

var RelayPlugin = _interopRequireWildcard(_RelayPlugin);

var _CommandPlugin = require('./plugins/CommandPlugin');

var CommandPlugin = _interopRequireWildcard(_CommandPlugin);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 *
**/
var component = new _novusComponent.Component(process.env.SERIAL_COMPONENT_ID, {
  url: process.env.MQTT_BROKER_URL,
  username: process.env.SERIAL_COMPONENT_ID,
  password: new Buffer(process.env.SERIAL_COMPONENT_PASSWORD)
});

/**
 * Register plugins
**/
component.register([{
  register: ConfigPlugin
}, {
  register: SerialPlugin,
  options: {
    port: process.env.ARDUINO_COM
  }
}, {
  register: RelayPlugin
}, {
  register: CommandPlugin
}]);