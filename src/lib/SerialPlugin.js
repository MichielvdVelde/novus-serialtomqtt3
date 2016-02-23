'use strict';

import { format } from 'util';

import { SerialConnection } from './SerialConnection';

/**
 *
**/
export function register(component, options) {
  return new Promise(function(resolve, reject) {

    component.plugins.serial = new SerialConnection(options.port);

    component.plugins.serial.on('value', (key, value) => {

    	let sensors = component.get('sensors', {});
    	let sensor = sensors[key] || null;

    	if(sensor === null) {
    		return console.log('unknown sensor', key, value);
    	}

    	let topic = format('dev/{$componentId}/%s/%s', sensor.type, sensor.name);
    	let payload = JSON.stringify({
    		source: component.componentId,
    		value: value,
    		date: new Date()
    	});

    	component.publish(topic, payload, { retain: sensor.retain })
    		.then(() => {
    			console.log('%s %s set to %s', sensor.type, sensor.name, value);
    		})
    		.catch((err) => {
    			console.error('unable to publish sensor update:', err.message);
    		});

    });
  });
}
