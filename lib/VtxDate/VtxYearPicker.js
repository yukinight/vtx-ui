'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

require('./VtxYearPicker.css');

var _VtxYearPicker_t = require('./VtxYearPicker_t');

var _VtxYearPicker_t2 = _interopRequireDefault(_VtxYearPicker_t);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment/locale/zh-cn');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

_moment2.default.locale('zh-cn');


var styles = {
    normal: 'vtx-ui-date-normal',
    calendarpicker: 'vtx-ui-date-calendarpicker',
    clearDate: 'vtx-ui-date-cleardate',
    calendarpickerinput: 'vtx-ui-date-calendarpickerinput',
    calendaricon: 'vtx-ui-date-calendaricon',
    error: 'vtx-ui-date-error',
    years: 'vtx-ui-date-years',
    yearsTitle: 'vtx-ui-date-yearstitle',
    arrows: 'vtx-ui-date-arrows',
    lists: 'vtx-ui-date-lists',
    list: 'vtx-ui-date-list',
    selectlist: 'vtx-ui-date-selectlist',
    selectlist_disabled: 'vtx-ui-date-selectlist_disabled',
    noselect: 'vtx-ui-date-noselect',
    hidden: 'vtx-ui-date-hidden',
    show: 'vtx-ui-date-show'
};

var VtxYearPicker = function (_React$Component) {
    _inherits(VtxYearPicker, _React$Component);

    function VtxYearPicker(props) {
        _classCallCheck(this, VtxYearPicker);

        var _this = _possibleConstructorReturn(this, (VtxYearPicker.__proto__ || Object.getPrototypeOf(VtxYearPicker)).call(this, props));

        _this.state = {
            sizeStyle: {
                small: { padding: '1px 7px', height: '22px' },
                default: { padding: '4px 7px', height: '28px' },
                large: { padding: '6px 7px', height: '32px' }
            },
            nowTime: props.value ? (0, _moment2.default)(props.value, 'YYYY').format('YYYY') : (0, _moment2.default)().format('YYYY'),
            dom: null,
            sign: 0,
            open: props.open
        };
        return _this;
    }

    _createClass(VtxYearPicker, [{
        key: 'getLocation',
        value: function getLocation(e) {
            var t = this;
            var bodyTop = 0,
                bodyLeft = 0,
                allHeight = 0,
                inputHeight = 0,
                bottom = 0,
                signtype = 't';
            //获取滚动距离
            if (document.documentElement && document.documentElement.scrollTop) {
                bodyTop = document.documentElement.scrollTop;
                bodyLeft = document.documentElement.scrollLeft;
            } else if (document.body) {
                bodyTop = document.body.scrollTop;
                bodyLeft = document.body.scrollLeft;
            }
            //可视区域高度
            if (document.documentElement) {
                allHeight = document.documentElement.clientHeight;
            }
            //计算top和left值
            var left = e.getBoundingClientRect().left + bodyLeft - 2;
            var top = e.getBoundingClientRect().top + bodyTop;
            //判断在上还是在下
            if (allHeight - top + bodyTop < 270) {
                switch (t.props.size) {
                    case 'small':
                        inputHeight = 22;
                        break;
                    case 'default':
                        inputHeight = 28;
                        break;
                    case 'large':
                        inputHeight = 32;
                        break;
                    default:
                        inputHeight = 28;
                        break;
                }
                signtype = 'b';
                top = top - 250 + inputHeight;
                bottom = top + 254;
            }
            top = top - 4;
            return { top: top, left: left, bottom: bottom, signtype: signtype };
        }
    }, {
        key: 'renderDOM',
        value: function renderDOM(time, e) {
            var t = this;
            if (!t.props.disabled) {
                e.nativeEvent.stopImmediatePropagation();
                //input失去焦点
                e.target.parentNode.childNodes[0].blur();
                var tm = time || t.state.nowTime;
                //如不存dom的时候就添加一个,如果已经存在就跳过
                if (!t.state.dom) {
                    var d = document.createElement('div');
                    d.style.position = 'absolute';
                    d.style.top = '0px';
                    d.style.left = '0px';
                    d.style.width = '100%';
                    t.state.dom = document.body.appendChild(d);
                }

                var _t$getLocation = t.getLocation(e.target.parentNode.childNodes[0]),
                    top = _t$getLocation.top,
                    left = _t$getLocation.left,
                    bottom = _t$getLocation.bottom,
                    signtype = _t$getLocation.signtype;

                if (_moment2.default.isMoment(tm)) {
                    tm = (0, _moment2.default)(tm).format('YYYY');
                }
                var param = {
                    style: styles.show,
                    time: tm
                };
                if ('open' in t.props) {
                    param.open = t.props.open;
                    if (t.props.open) {
                        param.style = styles.show;
                        param.time = tm;
                    } else {
                        param.style = styles.hidden;
                    }
                }
                _reactDom2.default.render(_react2.default.createElement(_VtxYearPicker_t2.default, _extends({
                    sign: t.state.sign++,
                    top: top, left: left, bottom: bottom, signtype: signtype,
                    onChange: t.props.onChange,
                    disabledDate: t.props.disabledDate
                }, param)), t.state.dom);
            }
        }
    }, {
        key: 'clearTime',
        value: function clearTime(e) {
            e.nativeEvent.stopImmediatePropagation();
            var t = this;
            if ('onChange' in t.props) {
                t.props.onChange('', '');
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var props = t.props;
            return _react2.default.createElement(
                'div',
                { 'data-errorMsg': '\u5FC5\u586B',
                    className: props.required && !props.value ? styles.normal + ' ' + styles.error : styles.normal,
                    style: _extends({}, props.style, { width: props.inherit ? 'inherit' : '' }) },
                _react2.default.createElement(
                    'div',
                    { className: styles.calendarpicker, style: props.style },
                    _react2.default.createElement('input', {
                        ref: 'input',
                        readOnly: true,
                        type: 'text',
                        disabled: props.disabled,
                        placeholder: props.placeholder || '请选择时间',
                        className: styles.calendarpickerinput,
                        style: t.state.sizeStyle[props.size || 'default'],
                        value: props.value ? (0, _moment2.default)(props.value, 'YYYY').format('YYYY') : '',
                        onClick: function onClick(e) {
                            return t.renderDOM('', e);
                        }
                    }),
                    _react2.default.createElement(_icon2.default, { type: 'calendar', className: styles.calendaricon, onClick: function onClick(e) {
                            return t.renderDOM('', e);
                        } }),
                    props.allowClear ? _react2.default.createElement(_icon2.default, { type: 'close-circle', className: styles.clearDate, onClick: function onClick(e) {
                            t.clearTime(e);
                        } }) : ''
                )
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            //插入真实DOM结束
            var t = this;
            if ('open' in t.props && t.props.open) {
                t.refs.input.click();
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            //已加载组件，收到新的参数时调用
            var t = this;
            t.setState({
                nowTime: nextProps.value || (0, _moment2.default)().format('YYYY')
            });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            //重新渲染结束
            var t = this;
            if ('open' in t.props) {
                t.refs.input.click();
            }
        }
    }]);

    return VtxYearPicker;
}(_react2.default.Component);
//large 高度为 32px，small 为 22px，default是 28px


exports.default = VtxYearPicker;
module.exports = exports['default'];