'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
function register(component, options) {
  return new Promise(function (resolve, reject) {

    /**
     * Store a system setting
     * NOTE: Payload is assumed to be JSON!
    **/
    var storeSystemSetting = function storeSystemSetting(packet) {
      var key = ['system'].concat(packet.param.key).join('/');
      var value = JSON.parse(packet.payload.toString());
      component.set(key, value);
    };

    /**
     * Store a device setting
     * NOTE: Payload is assumed to be JSON!
    **/
    var storeDeviceSetting = function storeDeviceSetting(packet) {
      var key = ['device'].concat(packet.param.key).join('/');
      var value = JSON.parse(packet.payload.toString());
      component.set(key, value);
    };

    /**
     * Register routes
    **/
    component.route([{
      route: 'sys/settings/#key',
      handler: storeSystemSetting
    }, {
      register: 'dev/{$componentId}/settings/#key',
      handler: storeDeviceSetting
    }]);

    /**
     * Method to match a sensor key to sensor settings
    **/
    component.methods.getSensorByKey = function (key) {
      var sensors = component.get('device/sensors', []);
      return sensors[key] || null;
    };

    /**
     * Get switch settings by name
    **/
    component.methods.getSwitchByName = function (name) {
      var switches = component.get('device/actuators/switches', {});
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = switches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var sw = _step.value;

          if (sw.name == name) {
            return sw;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return null;
    };

    return resolve();
  });
}