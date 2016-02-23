'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.register = register;

var _util = require('util');

var _SerialConnection = require('./SerialConnection');

/**
 *
**/
function register(component, options) {
    return new Promise(function (resolve, reject) {

        component.plugins.serial = new _SerialConnection.SerialConnection(process.env.ARDUINO_COM);

        component.plugins.serial.on('value', function (key, value) {

            var sensors = component.get('sensors', {});
            var sensor = sensors[key] || null;

            if (sensor === null) {
                return console.log('unknown sensor', key, value);
            }

            var topic = (0, _util.format)('dev/{$componentId}/%s/%s', sensor.type, sensor.name);
            var payload = JSON.stringify({
                source: component.componentId,
                value: value,
                date: new Date()
            });

            component.publish(topic, payload, { retain: sensor.retain }).then(function () {
                console.log('%s %s set to %s', sensor.type, sensor.name, value);
            }).catch(function (err) {
                console.error('unable to publish sensor update:', err.message);
            });
        });
    });
}