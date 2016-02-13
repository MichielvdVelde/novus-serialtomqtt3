'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findByName = findByName;
function findByName(switches, name) {
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
}