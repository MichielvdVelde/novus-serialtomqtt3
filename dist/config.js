'use strict';

var _novusComponent = require('novus-component');

var SETTINGS = [{
  topic: 'sys/settings/{$componentId}/actuators/switches',
  value: [{
    name: 'main_light',
    display_name: 'Main light',
    status: ['on', 'off'],
    groupId: 4,
    switchId: 2
  }, {
    name: 'space_heater',
    display_name: 'Space heater',
    status: ['on', 'off'],
    groupId: 4,
    switchId: 1
  }]
}, {
  topic: 'sys/settings/{$componentId}/sensors',
  value: {
    TMP: {
      type: 'sensor',
      retain: true,
      name: 'temperature',
      display_name: 'Temperature',
      unit: 'degrees-celcius',
      symbol: '&deg; C',
      decimals: 1
    },
    HUM: {
      type: 'sensor',
      retain: true,
      name: 'humidity',
      display_name: 'Relative humidity',
      unit: 'percent',
      symbol: '%',
      decimals: 1
    },
    LDR: {
      type: 'sensor',
      retain: true,
      name: 'light',
      display_name: 'Light',
      unit: null,
      symbol: null,
      decimals: 0
    },
    SND: {
      type: 'event',
      retain: false,
      name: 'sound',
      display_name: 'Sound',
      unit: null,
      symbol: null,
      decimals: 0
    },
    IR: {
      type: 'event',
      retain: false,
      name: 'infrared',
      display_name: 'Remote',
      unit: null,
      symbol: null,
      decimals: 0
    }
  }
}];

var component = new _novusComponent.Component('serialtomqtt3', {
  url: 'mqtt://192.168.2.3',
  clientId: 'serialtomqtt3-config'
});

component.route([{
  route: 'sys/settings/{$componentId}/actuators/switches',
  handler: function handler(packet) {
    console.log();
    console.log(packet.topic, packet.payload.toString());
  }
}, {
  route: 'sys/settings/{$componentId}/sensors',
  handler: function handler(packet) {
    console.log();
    console.log(packet.topic, packet.payload.toString());
  }
}]);

var onStart = function onStart() {

  console.log('Started');
  console.log();

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var setting = _step.value;

      component.publish(setting.topic, JSON.stringify(setting.value), { retain: true }).then(function () {
        console.log('Set %s', setting.topic);
      }).catch(function (err) {
        console.error('Error settings %s: %a', setting.topic, err.message);
      });
    };

    for (var _iterator = SETTINGS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  console.log();
  console.log('All settings set');

  component.end().then(function () {
    console.log();
    console.log('Component closed');
  }).catch(function (err) {
    console.error();
    console.error('Unable to close component:', err.message);
  });
};

component.start().then(onStart);