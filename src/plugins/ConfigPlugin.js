'use strict';

export function register(component, options) {
  return new Promise((resolve, reject) => {

    /**
     * Store a system setting
     * NOTE: Payload is assumed to be JSON!
    **/
    const storeSystemSetting = function(packet) {
      let key = [ 'system' ].concat(packet.param.key).join('/');
      let value = JSON.parse(packet.payload.toString());
      component.set(key, value);
    };

    /**
     * Store a device setting
     * NOTE: Payload is assumed to be JSON!
    **/
    const storeDeviceSetting = function(packet) {
      let key = [ 'device' ].concat(packet.param.key).join('/');
      let value = JSON.parse(packet.payload.toString());
      component.set(key, value);
    };

    /**
     * Register routes
    **/
    component.route([
      {
        route: 'sys/settings/#key',
        handler: storeSystemSetting
      },
      {
        register: 'dev/{$componentId}/settings/#key',
        handler: storeDeviceSetting
      }
    ]);

    /**
     * Method to match a sensor key to sensor settings
    **/
    component.methods.getSensorByKey = function(key) {
      let sensors = component.get('device/sensors', []);
      return sensors[key] || null;
    };

    /**
     * Get switch settings by name
    **/
    component.methods.getSwitchByName = function(name) {
      let switches = component.get('device/actuators/switches', {});
      for(let sw of switches) {
        if(sw.name == name) {
          return sw;
        }
      }
      return null;
    };

    return resolve();

  });
}
