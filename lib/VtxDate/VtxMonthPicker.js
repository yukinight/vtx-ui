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

var MonthPicker = _datePicker2.default.MonthPicker;

var cm_style = {
    error: 'vtx-ui-date-error'
};
function VtxMonthPicker(props) {
    var allowClear = props.allowClear,
        disabled = props.disabled,
        open = props.open,
        style = props.style,
        placeholder = props.placeholder,
        size = props.size,
        value = props.value,
        required = props.required,
        onChange = props.onChange,
        onOpenChange = props.onOpenChange,
        disabledDate = props.disabledDate;


    var MonthPickerProps = {
        allowClear: allowClear || false,
        disabled: disabled || false,
        style: style || {},
        placeholder: placeholder || '请选择时间',
        size: size || 'default',
        value: value ? (0, _moment2.default)(value, 'YYYY-MM') : null,

        onChange: onChange,
        onOpenChange: onOpenChange,
        disabledDate: disabledDate,
        format: 'YYYY-MM'
    };
    if ('open' in props) {
        DatePickerProps.open = open;
    }

    if (required && !value) {
        return _react2.default.createElement(
            'div',
            { className: cm_style.error, 'data-errorMsg': '\u5FC5\u586B' },
            _react2.default.createElement(MonthPicker, MonthPickerProps)
        );
    } else {
        return _react2.default.createElement(MonthPicker, MonthPickerProps);
    }
}

exports.default = VtxMonthPicker;
module.exports = exports['default'];