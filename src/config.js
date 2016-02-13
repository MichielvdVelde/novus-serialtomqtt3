'use strict';

import { Component } from 'novus-component';

const SETTINGS = [
  {
    topic: 'sys/settings/{$componentId}/actuators/switches',
    value: [
      {
        name: 'main_light',
        display_name: 'Main light',
        status: [ 'on', 'off' ],
        groupId: 4,
        switchId: 2
      },
      {
        name: 'space_heater',
        display_name: 'Space heater',
        status: [ 'on', 'off' ],
        groupId: 4,
        switchId: 1
      }
    ]
  },
  {
    topic: 'sys/settings/{$componentId}/sensors',
    value: {
      TMP: {
        type: 'sensor',
				retain: true,
        name: 'temperature',
        display_name: 'Temperature',
        unit: 'degrees-celcius',
        symbol: '&deg; C',
        decimals: 1
      },
      HUM: {
        type: 'sensor',
				retain: true,
        name: 'humidity',
        display_name: 'Relative humidity',
        unit: 'percent',
        symbol: '%',
        decimals: 1
      },
      LDR: {
        type: 'sensor',
				retain: true,
        name: 'light',
        display_name: 'Light',
        unit: null,
        symbol: null,
        decimals: 0
      },
      SND: {
        type: 'event',
				retain: false,
        name: 'sound',
        display_name: 'Sound',
        unit: null,
        symbol: null,
        decimals: 0
      },
      IR: {
        type: 'event',
        retain: false,
        name: 'infrared',
        display_name: 'Remote',
        unit: null,
        symbol: null,
        decimals: 0
      }
    }
  }
];


const component = new Component('serialtomqtt3', {
  url: 'mqtt://192.168.2.3',
  clientId: 'serialtomqtt3-config'
});

component.route([{
  route: 'sys/settings/{$componentId}/actuators/switches',
  handler: function(packet) {
    console.log();
    console.log(packet.topic, packet.payload.toString());
  }
},
{
  route: 'sys/settings/{$componentId}/sensors',
  handler: function(packet) {
    console.log();
    console.log(packet.topic, packet.payload.toString());
  }
}]);

const onStart = function() {

  console.log('Started');
  console.log();

  for(let setting of SETTINGS) {
    component.publish(setting.topic, JSON.stringify(setting.value), { retain: true })
      .then(() => {
        console.log('Set %s', setting.topic);
      })
      .catch((err) => {
        console.error('Error settings %s: %s', setting.topic, err.message);
      });
  }

  console.log();
  console.log('All settings set');

  component.end()
    .then(() => {
      console.log();
      console.log('Component closed');
    })
    .catch((err) => {
      console.error();
      console.error('Unable to close component:', err.message);
    });

};

component.start().then(onStart);
