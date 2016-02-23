'use strict';

import { format } from 'util';

export function register(component, options) {
  return new Promise((resolve, reject) => {

    //
    const processSwitchCommand = function(packet) {
      const name = packet.params.name;
      const mySwitch = component.methods.getSwitchByName(name);

      if(mySwitch === null) {
        // No such switch found
        return;
      }

      //
      let payload = JSON.parse(packet.payload.toString());
      let status = (payload.status == 'on') ? 1 : 0;
      let command = format('S %d%d%d', mySwitch.groupId, mySwitch.switchId, status);

      // Write the command over serial
      component.plugins.serial.writeCommand(command)
        .then(() => {
          // Succeeded
        })
        .catch((err) => {
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
