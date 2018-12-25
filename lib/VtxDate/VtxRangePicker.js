'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment/locale/zh-cn');

var _datePicker = require('antd/lib/date-picker');

var _datePicker2 = _interopRequireDefault(_datePicker);

require('antd/lib/date-picker/style/css');

require('./common.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_moment2.default.locale('zh-cn');


var cm_style = {
    error: 'vtx-ui-date-error'
};
var RangePicker = _datePicker2.default.RangePicker;


function VtxRangePicker(props) {
    var showTime = props.showTime,
        format = props.format,
        allowClear = props.allowClear,
        disabled = props.disabled,
        open = props.open,
        value = props.value,
        placeholder = props.placeholder,
        size = props.size,
        style = props.style,
        disabledDate = props.disabledDate,
        required = props.required,
        _onChange = props.onChange,
        onOpenChange = props.onOpenChange,
        disabledTime = props.disabledTime,
        onOk = props.onOk;


    var DatePickerProps = {
        allowClear: allowClear || false,
        showTime: showTime || false,
        disabled: disabled || false,

        format: format || (!showTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
        // value: !value || value == []? [null,null]: [moment(value[0],(format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss'))),moment(value[1],(format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss')))],
        value: !value ? [null, null] : [value[0] ? (0, _moment2.default)(value[0], format || (!showTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')) : null, value[1] ? (0, _moment2.default)(value[1], format || (!showTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')) : null],
        style: style || {},
        placeholder: placeholder ? [placeholder, placeholder] : ['请选择时间', '请选择时间'],
        size: size || 'default',

        onChange: function onChange(date, dateString) {
            //防止,时间和日期之间切换选择后,前大后小的bug
            var d1 = date[0],
                d2 = date[1],
                ds1 = dateString[0],
                ds2 = dateString[1];
            var d = [],
                ds = [];
            if (d1.valueOf() <= d2.valueOf()) {
                d = [d1, d2];
                ds = [ds1, ds2];
            } else {
                d = [d2, d1];
                ds = [ds2, ds1];
            }
            _onChange(d, ds);
        },
        onOpenChange: onOpenChange,
        disabledTime: disabledTime,
        onOk: onOk
    };
    if ('open' in props) {
        DatePickerProps.open = open;
    }
    if ('disabledDate' in props) {
        if (typeof disabledDate === 'function') {
            DatePickerProps.disabledDate = disabledDate;
        }
        // DatePickerProps.disabledDate = disabledDateFun;
    }

    if (required && (!value || !value[0] && !value[1])) {
        return _react2.default.createElement(
            'div',
            { className: cm_style.error, 'data-errorMsg': '\u5FC5\u586B' },
            _react2.default.createElement(RangePicker, DatePickerProps)
        );
    } else {
        return _react2.default.createElement(RangePicker, DatePickerProps);
    }
}

exports.default = VtxRangePicker;
module.exports = exports['default'];