'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _VtxRow = require('./VtxRow.js');

var _VtxRow2 = _interopRequireDefault(_VtxRow);

var _VtxCol = require('./VtxCol.js');

var _VtxCol2 = _interopRequireDefault(_VtxCol);

require('./VtxGrid.css');

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

require('antd/lib/button/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

var _select = require('antd/lib/select');

var _select2 = _interopRequireDefault(_select);

require('antd/lib/select/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
    Lists: 'vtx-ui-grid-lists',
    colon: 'vtx-ui-grid-colon',
    list: 'vtx-ui-grid-list',
    normal: 'vtx-ui-grid-normal'
};

var Option = _select2.default.Option;

var VtxModeGrid = function (_React$Component) {
    _inherits(VtxModeGrid, _React$Component);

    function VtxModeGrid(props) {
        _classCallCheck(this, VtxModeGrid);

        var _this = _possibleConstructorReturn(this, (VtxModeGrid.__proto__ || Object.getPrototypeOf(VtxModeGrid)).call(this, props));

        _this.isResize = null; //resize定时
        _this.weightiness = 0;
        props.gridweight.map(function (item, index) {
            _this.weightiness += item;
        });
        var height = 48,
            style = { borderBottom: '1px solid #e1e1e1' };
        if (props.showAll || props.showMore) {
            style = _this.weightiness > 4 ? { boxShadow: '0 1px 10px -3px #999' } : { borderBottom: '1px solid #e1e1e1' };
            height = _this.weightiness > 4 ? _this.getHeight(_this.weightiness) : 48;
        }
        _this.state = {
            height: height,
            style: style,
            hiddenMoreButtion: props.hiddenMoreButtion || true,
            hiddenconfrimButtion: props.hiddenconfrimButtion || false,
            hiddenclearButtion: props.hiddenclearButtion || false,
            width: window.innerWidth,

            mode: false, //false:普通模式，true:高级模式
            searchItemTitle: props.titles[0]
        };
        return _this;
    }

    _createClass(VtxModeGrid, [{
        key: 'getHeight',
        value: function getHeight(w) {
            return Math.ceil(w / 4) * 38 + 10;
        }
    }, {
        key: 'isShowMore',
        value: function isShowMore(weightiness) {
            var t = this;
            var h = t.state.height;
            // if(this.isFrist && (t.props.showAll || t.props.showMore)){
            //     this.isFrist = 0;
            //     t.setState({
            //         height: t.getHeight(weightiness),
            //         style: {
            //             boxShadow: '0 1px 10px -3px #999'
            //         }
            //     })
            //     return false;
            // }
            if (h > 48) {
                t.setState({
                    height: 48,
                    style: {
                        borderBottom: '1px solid #e1e1e1'
                    }
                });
            } else {
                t.setState({
                    height: t.getHeight(weightiness),
                    style: {
                        boxShadow: '0 1px 10px -3px #999'
                    }
                });
            }
        }
    }, {
        key: 'resetWidth',
        value: function resetWidth() {
            var t = this;
            if (this.isResize) {
                clearTimeout(this.isResize);
            }
            this.isResize = setTimeout(function () {
                t.setState({
                    width: window.innerWidth
                });
            }, 50);
        }
    }, {
        key: 'modeChange',
        value: function modeChange() {
            if (this.state.mode) {
                this.isShowMore(4);
            } else {

                this.isShowMore(this.weightiness);
            }
            this.setState({
                mode: !this.state.mode,
                hiddenMoreButtion: this.state.mode
            });
        }
    }, {
        key: 'searchItemChange',
        value: function searchItemChange(title) {
            this.setState({
                searchItemTitle: title
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var t = this;
            var props = t.props;
            var w = t.state.width > 1000 ? t.state.width : 1000,
                ar = Math.ceil(260 / w * 24),
                al = 24 - ar;
            var render = function render(d, i) {
                // let b = 4, c = 20,gwt = props.gridweight[i];
                var xs = Math.ceil(62 / (w * al / 24 / 24 / 4)),
                    b = xs % 4 === 0 ? xs : xs - xs % 4 + 4,
                    c = 24 - b,
                    gwt = props.gridweight[i];
                if (gwt === 2) {
                    // b = 2;
                    b = b / 2;
                    c = 24 - b;
                }
                if (gwt === 4) {
                    // b = 1;
                    b = b / 4;
                    c = 24 - b;
                }
                return _react2.default.createElement(
                    _VtxCol2.default,
                    { key: i, span: 6 * gwt },
                    _react2.default.createElement(
                        _VtxRow2.default,
                        { gutter: 2, attr: 'row' },
                        _react2.default.createElement(
                            _VtxCol2.default,
                            { span: b },
                            _react2.default.createElement(
                                'fieldName',
                                null,
                                props.titles[i]
                            )
                        ),
                        _react2.default.createElement(
                            _VtxCol2.default,
                            { span: c },
                            _react2.default.createElement(
                                'colon',
                                null,
                                '\uFF1A',
                                d
                            )
                        )
                    )
                );
            };
            var analyzeChildern = function analyzeChildern(data) {
                if (!data) return '';
                if (!data.length) {
                    return render(data, 0);
                } else {
                    return data.map(function (item, index) {
                        return render(item, index);
                    });
                }
            };
            var currentItemIndex = this.props.titles.indexOf(this.state.searchItemTitle);
            return _react2.default.createElement(
                'div',
                { className: styles.normal + ' ' + t.props.className, style: _extends({ height: t.state.height + 'px' }, t.state.style) },
                _react2.default.createElement(
                    _VtxRow2.default,
                    { gutter: 10, attr: 'row' },
                    _react2.default.createElement(
                        _VtxCol2.default,
                        { span: al, xl: { span: 20 } },
                        !this.state.mode ? _react2.default.createElement(
                            'div',
                            null,
                            _react2.default.createElement(
                                'div',
                                { style: { display: 'inline-block' } },
                                _react2.default.createElement(
                                    _select2.default,
                                    { value: this.state.searchItemTitle, style: { width: 120 },
                                        onChange: function onChange(val) {
                                            _this2.searchItemChange(val);
                                        } },
                                    this.props.titles.map(function (item, index) {
                                        return _react2.default.createElement(
                                            Option,
                                            { key: item },
                                            item
                                        );
                                    })
                                )
                            ),
                            _react2.default.createElement(
                                'div',
                                { style: { display: 'inline-block', minWidth: '300px' } },
                                this.props.children[currentItemIndex]
                            )
                        ) : _react2.default.createElement(
                            _VtxRow2.default,
                            { gutter: 10, attr: 'row' },
                            analyzeChildern(props.children)
                        )
                    ),
                    _react2.default.createElement(
                        _VtxCol2.default,
                        { span: ar, xl: { span: 4 } },
                        _react2.default.createElement(
                            _VtxRow2.default,
                            { gutter: 10, attr: 'row' },
                            t.state.hiddenconfrimButtion ? "" : _react2.default.createElement(
                                _VtxCol2.default,
                                { span: 7 },
                                _react2.default.createElement(
                                    'bt',
                                    null,
                                    _react2.default.createElement(
                                        _button2.default,
                                        { style: { width: '100%' }, type: 'primary', onClick: function onClick() {
                                                if (typeof props.confirm === 'function') {
                                                    props.confirm(_this2.state.mode ? null : _this2.state.searchItemTitle);
                                                }
                                            } },
                                        props.confirmText || '查询'
                                    )
                                )
                            ),
                            t.state.hiddenclearButtion ? "" : _react2.default.createElement(
                                _VtxCol2.default,
                                { span: 7 },
                                _react2.default.createElement(
                                    'bt',
                                    null,
                                    _react2.default.createElement(
                                        _button2.default,
                                        { style: { width: '100%' }, onClick: function onClick() {
                                                if (typeof props.clear === 'function') {
                                                    props.clear(_this2.state.mode ? null : _this2.state.searchItemTitle);
                                                }
                                            } },
                                        props.clearText || '清空'
                                    )
                                )
                            ),
                            _react2.default.createElement(
                                _VtxCol2.default,
                                { span: 4 },
                                this.weightiness > 4 && !t.state.hiddenMoreButtion ? _react2.default.createElement(
                                    'bt',
                                    null,
                                    _react2.default.createElement(_button2.default, { type: 'primary', shape: 'circle', icon: 'ellipsis', onClick: function onClick() {
                                            return t.isShowMore(_this2.weightiness);
                                        } })
                                ) : ''
                            ),
                            _react2.default.createElement(
                                _VtxCol2.default,
                                { span: 6 },
                                _react2.default.createElement(
                                    'div',
                                    { className: styles.modeButton,
                                        onClick: this.modeChange.bind(this), style: { lineHeight: '40px', cursor: 'pointer', fontWeight: 'bold' } },
                                    this.state.mode ? '普通模式' : '高级模式'
                                )
                            )
                        )
                    )
                )
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var t = this;
            // 自适应宽度
            window.addEventListener('resize', t.resetWidth.bind(t), false);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var t = this;
            window.removeEventListener('resize', t.resetWidth.bind(t), false);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var t = this;
            // if(this.weightiness > 4 && (t.props.showAll || t.props.showMore)){
            //     t.isShowMore(this.weightiness);
            // }
            // t.setState({
            //     hiddenMoreButtion: nextProps.hiddenMoreButtion || false,
            //     hiddenconfrimButtion: nextProps.hiddenconfrimButtion || false,
            //     hiddenclearButtion: nextProps.hiddenclearButtion || false,
            // })
        }
    }]);

    return VtxModeGrid;
}(_react2.default.Component);

VtxModeGrid.VtxRow = _VtxRow2.default;
VtxModeGrid.VtxCol = _VtxCol2.default;

exports.default = VtxModeGrid;
module.exports = exports['default'];