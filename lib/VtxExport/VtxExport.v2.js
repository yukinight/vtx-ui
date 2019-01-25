'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _VtxExport = require('./VtxExport');

var _VtxExport2 = _interopRequireDefault(_VtxExport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function VtxExport2(props) {
    var newProps = _extends({}, props, {
        mode: 'simple'
    });
    return _react2.default.createElement(_VtxExport2.default, newProps);
}

exports.default = VtxExport2;
module.exports = exports['default'];