'use strict';

var _util = require('util');

var _novusComponent = require('novus-component');

var _SerialConnection = require('./lib/SerialConnection');

var _SwitchControl = require('./lib/SwitchControl');

var SwitchControl = _interopRequireWildcard(_SwitchControl);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// --------

var fatalError = function fatalError(type, err) {
	console.error('FATAL ERROR for %s: %s', type, err.message);
	process.exit(-1);
};

// --------

var component = new _novusComponent.Component('serialtomqtt3', {
	url: 'mqtt://192.168.2.3'
});

var serial = new _SerialConnection.SerialConnection('COM3');

component.route([{
	route: 'sys/settings/{$componentId}/#key',
	handler: function handler(packet) {
		var key = packet.params.key.join('/');
		var value = JSON.parse(packet.payload.toString());
		component.set(key, value);
	}
}, {
	route: 'dev/{$componentId}/actuators/+type/+name/status',
	handler: function handler(packet) {
		var key = ['status', packet.params.type, packet.params.name].join(':');
		component.set(key, JSON.parse(packet.payload.toString()));
	}
}, {
	route: 'dev/{$componentId}/actuators/switch/+name',
	handler: function handler(packet) {

		var name = packet.params.name;
		var switchInfo = SwitchControl.findByName(component.get('actuators/switches', []), name);

		var key = ['status', 'switch', name].join(':');
		var switchStatus = component.get(key);

		if (switchInfo === null || switchStatus === null) {
			return console.log('unknown switch', name);
		}

		var payload = JSON.parse(packet.payload.toString());
		var newStatus = payload.status == 'on' ? 1 : 0;

		if (switchStatus.status == payload.status) {
			return console.log('switch %s is already %s', name, payload.status);
		}

		var command = 'S ' + switchInfo.groupId + switchInfo.switchId + newStatus;
		var publishStatusUpdate = function publishStatusUpdate() {
			var statusTopic = (0, _util.format)('dev/{$componentId}/actuators/switch/%s/status', name);
			var statusInfo = JSON.stringify({
				source: payload.source || 'unknown',
				status: payload.status,
				date: payload.date || new Date()
			});
			return component.publish(statusTopic, statusInfo, { retain: true });
		};

		serial.writeCommand(command).then(publishStatusUpdate).then(function () {
			console.log('switch %s set to %s', switchInfo.name, payload.status);
		}).catch(function (err) {
			console.error('write error', err.message);
		});
	}
}]);

serial.on('value', function (key, value) {

	var sensors = component.get('sensors', {});
	var sensor = sensors[key] || null;

	if (sensor === null) {
		return console.log('unknown sensor', key, value);
	}

	var topic = (0, _util.format)('dev/{$componentId}/%s/%s', sensor.type, sensor.name);
	var payload = JSON.stringify({
		source: component._componentId,
		value: value,
		date: new Date()
	});

	component.publish(topic, payload, { retain: sensor.retain }).then(function () {
		console.log('%s %s set to %s', sensor.type, sensor.name, value);
	}).catch(function (err) {
		console.error('unable to publish sensor update:', err.message);
	});
});

Promise.all([component.start(), serial.open()]).then(function () {
	console.log('Component and Serial open');

	serial.on('error', function (err) {
		console.error('Serial error:', err.message);
	});

	serial.on('close', function () {
		console.log('ERR: Serial connection closed');
		process.exit(-1);
	});

	component.on('error', function (err) {
		console.error('Component error:', err.message);
	});

	component.on('close', function () {
		console.error('ERR: Component connection closed');
		process.exit(-1);
	});
}).catch(function (err) {
	fatalError('start', err);
});