'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;

var _util = require('util');

function register(component, options) {
  return new Promise(function (resolve, reject) {

    //
    var processSwitchCommand = function processSwitchCommand(packet) {
      var name = packet.params.name;
      var mySwitch = component.methods.getSwitchByName(name);

      if (mySwitch === null) {
        // No such switch found
        return;
      }

      //
      var payload = JSON.parse(packet.payload.toString());
      var status = payload.status == 'on' ? 1 : 0;
      var command = (0, _util.format)('S %d%d%d', mySwitch.groupId, mySwitch.switchId, status);

      // Write the command over serial
      component.plugins.serial.writeCommand(command).then(function () {
        // Succeeded
      }).catch(function (err) {
        // Failed
        console.error('Serial writeCommand failed:', err.message);
      });
    };

    // Add route
    component.route({
      route: 'dev/{$componentId}/actuators/switch/+name',
      handler: processSwitchCommand
    });

    return resolve();
  });
}