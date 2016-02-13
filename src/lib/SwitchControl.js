'use strict';

export function findByName(switches, name) {
  for(let sw of switches) {
    if(sw.name == name) {
      return sw;
    }
  }
  return null;
}
