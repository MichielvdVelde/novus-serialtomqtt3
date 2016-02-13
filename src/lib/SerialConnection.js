'use strict';

import { EventEmitter } from 'events';
import { SerialPort, parsers } from 'serialport';

export class SerialConnection extends EventEmitter {

	constructor(port, options = {}) {
		super();
		this._port = port;
		options.parser = parsers.readline('\r\n');
		this._options = options;

		this._serialport = null;
	}

	/**
	 * Returns true if the serial connection is open
	**/
	isOpen() {
		return this._serialport !== null && this._serialport.isOpen();
	}

	/**
	 * Open the serial connection
	**/
	open() {
		return new Promise((resolve, reject) => {
			if(this.isOpen()) {
				return reject(new Error('serial connection already opened'));
			}

			this._serialport = new SerialPort(this._port, this._options, false);

			this._serialport.open((error) => {
				if(error) return reject(error);
				this._attachListeners();
				return resolve();
			});
		});
	}

	/**
	 * Write a command to the serial connection
	**/
	writeCommand(cmd, drain = true) {
		return new Promise((resolve, reject) => {
			if(!this.isOpen()) {
				return reject(new Error('serial connection not open'));
			}
			this._serialport.write(cmd, (err) => {
				if(err) return reject(err);
				if(!drain) return resolve();

        this._serialport.drain((err) => {
          if(err) return reject(err);
          return resolve();
        });
			});
		});
	}

	/**
	 * Attach event listeners to serialport
	**/
	_attachListeners() {

		const onData = (data) => {

			let values = {};
			let last = '';
			data = data.split(' ');
			for(let i = 0; i < data.length; i++) {
				if(i % 2) {
					this.emit('value', last, data[i]);
				}
				last = data[i];
			}
		};

		const onError = (error) => {
			this.emit('error', error);
		};

		const onClose = () => {
			this.emit('close');
			this._serialport = null;
		};

		this._serialport.on('data', onData);
		this._serialport.on('error', onError);
		this._serialport.once('close', onClose);
	}
}
