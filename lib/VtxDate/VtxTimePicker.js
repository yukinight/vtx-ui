'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment/locale/zh-cn');

var _timePicker = require('antd/lib/time-picker');

var _timePicker2 = _interopRequireDefault(_timePicker);

require('antd/lib/time-picker/style/css');

require('./common.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_moment2.default.locale('zh-cn');


var cm_style = {
    error: 'vtx-ui-date-error'
};

function VtxTimePicker(props) {
    var value = props.value,
        className = props.className,
        popupClassName = props.popupClassName,
        open = props.open,
        format = props.format,
        disabled = props.disabled,
        hideDisabledOptions = props.hideDisabledOptions,
        placeholder = props.placeholder,
        required = props.required,
        onOpenChange = props.onOpenChange,
        onChange = props.onChange,
        disabledHours = props.disabledHours,
        disabledMinutes = props.disabledMinutes,
        disabledSeconds = props.disabledSeconds,
        addon = props.addon;


    var TimePickerProps = {
        value: value ? (0, _moment2.default)(value, format || 'HH:mm:ss') : null,

        className: className,
        popupClassName: popupClassName,
        disabled: disabled || false,
        hideDisabledOptions: hideDisabledOptions || false,
        format: format || 'HH:mm:ss',
        placeholder: placeholder || '请选择时间',

        onChange: onChange,
        onOpenChange: onOpenChange,
        disabledHours: disabledHours,
        disabledMinutes: disabledMinutes,
        disabledSeconds: disabledSeconds,
        addon: addon,
        style: props.style
    };
    if ('open' in props) {
        TimePickerProps.open = open;
    }
    if (required && !value) {
        return _react2.default.createElement(
            'div',
            { className: cm_style.error, 'data-errorMsg': '\u5FC5\u586B' },
            _react2.default.createElement(_timePicker2.default, TimePickerProps)
        );
    } else {
        return _react2.default.createElement(_timePicker2.default, TimePickerProps);
    }
}

exports.default = VtxTimePicker;
module.exports = exports['default'];