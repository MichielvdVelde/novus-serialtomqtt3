'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;

var _util = require('util');

function register(component, options) {
  return new Promise(function (resolve, reject) {

    component.plugins.serial.on('value', function (key, value) {

      // Find the right sensor
      var sensor = component.methods.getSensorByKey(key);
      if (sensor === null) {
        // No sensor found for this key
        return;
      }

      // Create the topic and payload
      var topic = (0, _util.format)('dev/{$componentId}/sensors/%s', sensor.name);
      var payload = {
        source: component.componentId,
        value: value,
        date: new Date()
      };

      // Publish the sensor reading
      component.publish(topic, JSON.stringify(payload));
    });

    return resolve();
  });
}