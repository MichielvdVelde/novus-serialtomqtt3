'use strict';

import { format } from 'util';

export function register(component, options) {
  return new Promise((resolve, reject) => {

    component.plugins.serial.on('value', (key, value) => {

      // Find the right sensor
      const sensor = component.methods.getSensorByKey(key);
      if(sensor === null) {
        // No sensor found for this key
        return;
      }

      // Create the topic and payload
      const topic = format('dev/{$componentId}/sensors/%s', sensor.name);
      const payload = {
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
