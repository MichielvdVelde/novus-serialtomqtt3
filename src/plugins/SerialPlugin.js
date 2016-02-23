'use strict';

import { SerialConnection } from 'novus-serialconnection';

export function register(component, options) {

  // Create the serial connecion
  component.plugins.serial = new SerialConnection(options.port);

  // Open the serial connection
  return component.plugins.serial.open();

}
