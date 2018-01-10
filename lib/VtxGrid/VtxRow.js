'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _row = require('antd/lib/row');

var _row2 = _interopRequireDefault(_row);

require('antd/lib/row/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function VtxRow(props) {
    var children = props.children,
        _props$gutter = props.gutter,
        gutter = _props$gutter === undefined ? 0 : _props$gutter,
        type = props.type,
        align = props.align,
        justify = props.justify;

    var RowProps = { gutter: gutter, type: type, align: align, justify: justify };
    return _react2.default.createElement(
        _row2.default,
        RowProps,
        children
    );
}

exports.default = VtxRow;
module.exports = exports['default'];