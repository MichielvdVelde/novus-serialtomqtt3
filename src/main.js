'use strict';

import { Component } from 'novus-component';

import * as ConfigPlugin from './plugins/ConfigPlugin';
import * as SerialPlugin from './plugins/SerialPlugin';
import * as RelayPlugin from './plugins/RelayPlugin';
import * as CommandPlugin from './plugins/CommandPlugin';

/**
 *
**/
const component = new Component(process.env.SERIAL_COMPONENT_ID, {
  url: process.env.MQTT_BROKER_URL,
  username: process.env.SERIAL_COMPONENT_ID,
  password: new Buffer(process.env.SERIAL_COMPONENT_PASSWORD)
});

/**
 * Register plugins
**/
component.register([
  {
    register: ConfigPlugin
  },
  {
    register: SerialPlugin,
    options: {
      port: process.env.ARDUINO_COM
    }
  },
  {
    register: RelayPlugin
  },
  {
    register: CommandPlugin
  }
]);
