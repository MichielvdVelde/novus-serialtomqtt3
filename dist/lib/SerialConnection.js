'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SerialConnection = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _serialport = require('serialport');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SerialConnection = exports.SerialConnection = function (_EventEmitter) {
	_inherits(SerialConnection, _EventEmitter);

	function SerialConnection(port) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, SerialConnection);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SerialConnection).call(this));

		_this._port = port;
		options.parser = _serialport.parsers.readline('\r\n');
		_this._options = options;

		_this._serialport = null;
		return _this;
	}

	/**
  * Returns true if the serial connection is open
 **/


	_createClass(SerialConnection, [{
		key: 'isOpen',
		value: function isOpen() {
			return this._serialport !== null && this._serialport.isOpen();
		}

		/**
   * Open the serial connection
  **/

	}, {
		key: 'open',
		value: function open() {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				if (_this2.isOpen()) {
					return reject(new Error('serial connection already opened'));
				}

				_this2._serialport = new _serialport.SerialPort(_this2._port, _this2._options, false);

				_this2._serialport.open(function (error) {
					if (error) return reject(error);
					_this2._attachListeners();
					return resolve();
				});
			});
		}

		/**
   * Write a command to the serial connection
  **/

	}, {
		key: 'writeCommand',
		value: function writeCommand(cmd) {
			var _this3 = this;

			var drain = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			return new Promise(function (resolve, reject) {
				if (!_this3.isOpen()) {
					return reject(new Error('serial connection not open'));
				}
				_this3._serialport.write(cmd, function (err) {
					if (err) return reject(err);
					if (!drain) return resolve();

					_this3._serialport.drain(function (err) {
						if (err) return reject(err);
						return resolve();
					});
				});
			});
		}

		/**
   * Attach event listeners to serialport
  **/

	}, {
		key: '_attachListeners',
		value: function _attachListeners() {
			var _this4 = this;

			var onData = function onData(data) {

				var values = {};
				var last = '';
				data = data.split(' ');
				for (var i = 0; i < data.length; i++) {
					if (i % 2) {
						_this4.emit('value', last, data[i]);
					}
					last = data[i];
				}
			};

			var onError = function onError(error) {
				_this4.emit('error', error);
			};

			var onClose = function onClose() {
				_this4.emit('close');
				_this4._serialport = null;
			};

			this._serialport.on('data', onData);
			this._serialport.on('error', onError);
			this._serialport.once('close', onClose);
		}
	}]);

	return SerialConnection;
}(_events.EventEmitter);