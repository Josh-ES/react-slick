"use strict";

exports.__esModule = true;
exports.mixin = mixin;

var _es6Symbol = require("es6-symbol");

var _es6Symbol2 = _interopRequireDefault(_es6Symbol);

var _reflect = require("reflect.ownkeys");

var _reflect2 = _interopRequireDefault(_reflect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mixin(behaviour) {
  var sharedBehaviour = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  // these keys reflect the behaviour that is to be attached to class instances
  var instanceKeys = (0, _reflect2.default)(behaviour);
  // these keys reflect static behaviour
  var sharedKeys = (0, _reflect2.default)(sharedBehaviour);
  var typeTag = (0, _es6Symbol2.default)("isA");

  function _mixin(workingClass) {
    // attach instance-oriented behaviour
    for (var _iterator = instanceKeys, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var property = _ref;

      Object.defineProperty(workingClass.prototype, property, {
        value: behaviour[property],
        writable: true
      });
    }

    Object.defineProperty(workingClass.prototype, typeTag, { value: true });
  }

  // attach static behaviour
  for (var _iterator2 = sharedKeys, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref2 = _i2.value;
    }

    var property = _ref2;

    Object.defineProperty(_mixin, property, {
      enumerable: sharedBehaviour.propertyIsEnumerable(property),
      value: sharedBehaviour[property],
      writable: true
    });
  }

  // this allows you to use "instanceof" on an object that uses a mixin
  Object.defineProperty(_mixin, _es6Symbol2.default.hasInstance, {
    value: function value(instance) {
      return !!instance[typeTag];
    },
    writable: true
  });

  return _mixin;
}

exports.default = mixin;