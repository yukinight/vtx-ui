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
function VtxDatePicker(props) {
    var showTime = props.showTime,
        format = props.format,
        allowClear = props.allowClear,
        disabled = props.disabled,
        open = props.open,
        showToday = props.showToday,
        value = props.value,
        placeholder = props.placeholder,
        size = props.size,
        style = props.style,
        disabledDate = props.disabledDate,
        onChange = props.onChange,
        onOpenChange = props.onOpenChange,
        disabledTime = props.disabledTime,
        onOk = props.onOk,
        required = props.required;


    var DatePickerProps = {
        allowClear: allowClear || false,
        showTime: showTime || false,
        disabled: disabled || false,
        showToday: showToday || false,

        format: format || (!showTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'),
        value: value ? (0, _moment2.default)(value, format || (!showTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')) : null,
        style: style || {},
        placeholder: placeholder || '请选择时间',
        size: size || 'default',

        onChange: onChange,
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
    if (required && !value) {
        return _react2.default.createElement(
            'div',
            { className: cm_style.error, 'data-errorMsg': '\u5FC5\u586B' },
            _react2.default.createElement(_datePicker2.default, DatePickerProps)
        );
    } else {
        return _react2.default.createElement(_datePicker2.default, DatePickerProps);
    }
}

exports.default = VtxDatePicker;
//后期完善功能
// function disabledDateFun(current) {
//     let isTrue = false;
//     if(!current) return isTrue;
//     switch(disabledDate.type){
//         case 'equ'://等于
//             isTrue = disabledDate.date.indexOf(moment(current).format(DatePickerProps.format)) > -1;
//         break;
//         case 'lss'://小于
//             isTrue = current.valueOf() < moment(disabledDate.date).valueOf();
//         break;
//         case 'les'://小于等于
//             isTrue = current.valueOf() <= moment(disabledDate.date).valueOf();
//         break;
//         case 'gt'://大于
//             isTrue = current.valueOf() > moment(disabledDate.date).valueOf();
//         break;
//         case 'geq'://大于等于
//             isTrue = current.valueOf() >= moment(disabledDate.date).valueOf();
//         break;
//     }
//     return isTrue;
// }

module.exports = exports['default'];