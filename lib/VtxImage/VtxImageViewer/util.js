'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isArray = exports.isEmptyObject = undefined;
exports.isObject = isObject;
exports.isFunction = isFunction;

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isEmptyObject = exports.isEmptyObject = _isEmpty2.default;

function isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}

function isFunction(fn) {
  return Object.prototype.toString.call(fn) === '[object Function]';
}

var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function _isArray(x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = exports.isArray = _isArray;