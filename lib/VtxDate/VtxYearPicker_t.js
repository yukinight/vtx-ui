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

var VtxYearPicker_t = function (_React$Component) {
    _inherits(VtxYearPicker_t, _React$Component);

    function VtxYearPicker_t(props) {
        _classCallCheck(this, VtxYearPicker_t);

        var _this = _possibleConstructorReturn(this, (VtxYearPicker_t.__proto__ || Object.getPrototypeOf(VtxYearPicker_t)).call(this, props));

        _this.state = {
            time: props.time,
            selectedtime: props.time,
            cli: document.onclick,
            cn: props.style,
            top: props.top,
            left: props.left,
            bottom: props.bottom,
            signtype: props.signtype
        };
        return _this;
    }

    _createClass(VtxYearPicker_t, [{
        key: 'clickItem',
        value: function clickItem(item, index, e) {
            var t = this;
            if (index == 0 || index == 11) {
                e.nativeEvent.stopImmediatePropagation();
                t.setState({
                    time: item
                });
            } else {
                t.setState({
                    cn: styles.hidden
                }, function () {
                    setTimeout(function () {
                        t.setState({
                            time: ''
                        });
                    }, 190);
                });
                t.chooseYear(item);
            }
        }
    }, {
        key: 'attachEvent',
        value: function attachEvent() {
            var t = this;
            document.onclick = function (event) {
                t.setState({
                    cn: styles.hidden
                }, function () {
                    setTimeout(function () {
                        t.setState({
                            time: ''
                        });
                    }, 190);
                });
                document.onclick = t.state.cli;
            };
        }
    }, {
        key: 'chooseYear',
        value: function chooseYear(date) {
            var props = this.props;
            var d = date.toString();
            if ('onChange' in props) {
                props.onChange((0, _moment2.default)(d, 'YYYY'), d);
            }
        }
    }, {
        key: 'changeTime',
        value: function changeTime(item, e) {
            e.nativeEvent.stopImmediatePropagation();
            this.setState({
                time: item
            });
        }
    }, {
        key: 'isDisabled',
        value: function isDisabled(time) {
            var t = this;
            if ('disabledDate' in t.props && typeof t.props.disabledDate === 'function') {
                return t.props.disabledDate((0, _moment2.default)(time, 'YYYY'));
            }
            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var props = t.props;
            var calendarAry = [],
                time = void 0,
                startTime = void 0,
                endTime = void 0;
            if (t.state.time == '') {
                calendarAry = [];
            } else {
                time = parseInt(t.state.time, 10);
                startTime = time - (time % 10 + 1);
                endTime = time + (10 - time % 10);
                for (var i = startTime; i <= endTime; i++) {
                    calendarAry.push(i);
                }
            }
            var sty = {
                position: 'absolute',
                left: t.state.left
            };
            if (t.state.signtype == 't') {
                sty.top = t.state.top;
            } else {
                sty.bottom = -t.state.bottom;
            }
            return _react2.default.createElement(
                'div',
                { className: t.state.cn, style: sty },
                !t.state.time ? '' : _react2.default.createElement(
                    'div',
                    { className: styles.years },
                    _react2.default.createElement(
                        'div',
                        { className: styles.yearsTitle },
                        _react2.default.createElement(_icon2.default, { onClick: function onClick(e) {
                                t.changeTime(calendarAry[0], e);
                            }, type: 'double-left', className: styles.arrows, style: { left: '7px' } }),
                        calendarAry[1],
                        '-',
                        calendarAry[10],
                        _react2.default.createElement(_icon2.default, { onClick: function onClick(e) {
                                t.changeTime(calendarAry[11], e);
                            }, type: 'double-right', className: styles.arrows, style: { right: '7px' } })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: styles.lists },
                        calendarAry.map(function (item, index) {
                            var disabled = t.isDisabled(item);
                            return _react2.default.createElement(
                                'div',
                                {
                                    key: index,
                                    onClick: function onClick(e) {
                                        if (!disabled) {
                                            t.clickItem(item, index, e);
                                        } else {
                                            e.nativeEvent.stopImmediatePropagation();
                                        }
                                    },
                                    className: styles.list + ' ' + styles.noselect,
                                    unselectable: "on"
                                },
                                _react2.default.createElement(
                                    'span',
                                    {
                                        className: (item == t.state.selectedtime && index !== 0 && index !== 11 ? styles.selectlist : '') + ' ' + (disabled ? styles.selectlist_disabled : '')
                                    },
                                    item
                                )
                            );
                        })
                    )
                )
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            //插入真实DOM结束
            var t = this;
            if (!('open' in t.props)) {
                t.attachEvent();
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            //已加载组件，收到新的参数时调用
            var t = this;
            if (!('open' in nextProps)) {
                if (t.props.sign != nextProps.sign) {
                    t.attachEvent();
                }
            }
            var newParam = {
                selectedtime: nextProps.time,
                cn: nextProps.style,
                top: nextProps.top,
                left: nextProps.left,
                bottom: nextProps.bottom,
                signtype: nextProps.signtype
            };
            if ('open' in nextProps) {
                if (!nextProps.open) {
                    t.setState(_extends({}, newParam), function () {
                        setTimeout(function () {
                            t.setState({
                                time: ''
                            });
                        }, 190);
                    });
                } else {
                    t.setState(_extends({
                        time: nextProps.time
                    }, newParam));
                }
            } else {
                t.setState(_extends({
                    time: nextProps.time
                }, newParam));
            }
        }
    }]);

    return VtxYearPicker_t;
}(_react2.default.Component);
//large 高度为 32px，small 为 22px，default是 28px


exports.default = VtxYearPicker_t;
module.exports = exports['default'];