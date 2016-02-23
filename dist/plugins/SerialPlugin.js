'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;

var _novusSerialconnection = require('novus-serialconnection');

function register(component, options) {

  // Create the serial connecion
  component.plugins.serial = new _novusSerialconnection.SerialConnection(options.port);

  // Open the serial connection
  return component.plugins.serial.open();
}