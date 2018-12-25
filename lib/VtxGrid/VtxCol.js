'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _col = require('antd/lib/col');

var _col2 = _interopRequireDefault(_col);

require('antd/lib/col/style/css');

var _tooltip = require('antd/lib/tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

require('antd/lib/tooltip/style/css');

require('./VtxGrid.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    Lists: 'vtx-ui-grid-lists',
    colon: 'vtx-ui-grid-colon',
    list: 'vtx-ui-grid-list',
    normal: 'vtx-ui-grid-normal'
    //获取方法名,通过apply引用  如getFunctionName.apply(funa)  //输出'funa'
};function VtxCol(props) {
    var getFunctionName = function getFunctionName() {
        return this.name || this.toString().match(/function\s*([^(]*)\(/)[1];
    };
    var addStyle = function addStyle(d) {
        if (typeof d.type === 'function' && d.props.hasOwnProperty('attr') && d.props.attr == 'row') {
            return d;
        } else {
            if (d.props['data-type'] === 'colon') {
                return _react2.default.createElement(
                    'div',
                    { className: styles.Lists },
                    _react2.default.createElement(
                        'div',
                        { className: styles.colon },
                        d.props.children[0]
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: styles.list },
                        d.props.children[1]
                    )
                );
            }
            var sty = {
                lineHeight: '28px',
                height: '38px'
            };
            if (d.props['data-type'] === 'fieldName') {
                sty = _extends({}, sty, {
                    padding: '5px 0px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                    cursor: 'default'
                });
            }
            if (d.props['data-type'] === 'bt') {
                sty = _extends({}, sty, {
                    padding: '5px 0px'
                });
            }
            return _react2.default.createElement(
                'div',
                { style: _extends({}, sty) },
                d.props['data-type'] === 'fieldName' ? _react2.default.createElement(
                    _tooltip2.default,
                    { placement: 'rightTop', title: d.props.children },
                    d
                ) : d
            );
        }
    };
    var render = function render(d) {
        if (d == '') return '';
        if (!d.length) {
            return addStyle(d);
        }
        return d.map(function (item, index) {
            return addStyle(item);
        });
    };
    return _react2.default.createElement(
        _col2.default,
        props,
        render(props.children)
    );
}

exports.default = VtxCol;
module.exports = exports['default'];