'use strict';

import { format } from 'util';

import { Component } from 'novus-component';
import { SerialConnection } from './lib/SerialConnection';

import * as SwitchControl from './lib/SwitchControl';

// --------

const fatalError = function(type, err) {
	console.error('FATAL ERROR for %s: %s', type, err.message);
	process.exit(-1);
};

// --------

const component = new Component('serialtomqtt3', {
	url: 'mqtt://192.168.2.3'
});

const serial = new SerialConnection('COM3');

component.route([
	{
		route: 'sys/settings/{$componentId}/#key',
		handler: function(packet) {
			let key = packet.params.key.join('/');
			let value = JSON.parse(packet.payload.toString());
			component.set(key, value);
		}
	},
	{
		route: 'dev/{$componentId}/actuators/+type/+name/status',
		handler: function(packet) {
			let key = [ 'status', packet.params.type, packet.params.name ].join(':');
			component.set(key, JSON.parse(packet.payload.toString()));
		}
	},
	{
		route: 'dev/{$componentId}/actuators/switch/+name',
		handler: function(packet) {

			let name = packet.params.name;
			let switchInfo = SwitchControl.findByName(component.get('actuators/switches', []), name);

			let key = [ 'status', 'switch', name ].join(':');
			let switchStatus = component.get(key);

			if(switchInfo === null || switchStatus === null) {
				return console.log('unknown switch', name);
			}

			let payload = JSON.parse(packet.payload.toString());
			let newStatus = (payload.status == 'on') ? 1 : 0;

			if(switchStatus.status == payload.status) {
				return console.log('switch %s is already %s', name, payload.status);
			}

			let command = 'S ' + switchInfo.groupId + switchInfo.switchId + newStatus;
			const publishStatusUpdate = () => {
				let statusTopic = format('dev/{$componentId}/actuators/switch/%s/status', name);
				let statusInfo = JSON.stringify({
					source: payload.source || 'unknown',
					status: payload.status,
					date: payload.date || new Date()
				});
				return component.publish(statusTopic, statusInfo, { retain: true });
			};

			serial.writeCommand(command)
				.then(publishStatusUpdate)
				.then(() => {
					console.log('switch %s set to %s', switchInfo.name, payload.status);
				})
				.catch((err) => {
					console.error('write error', err.message);
				});

		}
	}
]);

serial.on('value', (key, value) => {

	let sensors = component.get('sensors', {});
	let sensor = sensors[key] || null;

	if(sensor === null) {
		return console.log('unknown sensor', key, value);
	}

	let topic = format('dev/{$componentId}/%s/%s', sensor.type, sensor.name);
	let payload = JSON.stringify({
		source: component._componentId,
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

Promise.all([ component.start(), serial.open() ])
	.then(() => {
		console.log('Component and Serial open');

    serial.on('error', (err) => {
      console.error('Serial error:', err.message);
    });

    serial.on('close', () => {
      console.log('ERR: Serial connection closed');
      process.exit(-1);
    });

    component.on('error', (err) => {
      console.error('Component error:', err.message);
    });

    component.on('close', () => {
      console.error('ERR: Component connection closed');
      process.exit(-1);
    });
	})
	.catch((err) => {
		fatalError('start', err);
	});
