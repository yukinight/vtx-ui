'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _dva = require('dva');

var _router = require('dva/router');

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

var VtxGrid = function (_React$Component) {
    _inherits(VtxGrid, _React$Component);

    function VtxGrid(props) {
        _classCallCheck(this, VtxGrid);

        var _this = _possibleConstructorReturn(this, (VtxGrid.__proto__ || Object.getPrototypeOf(VtxGrid)).call(this, props));

        _this.isResize = null; //resize定时
        _this.weightiness = 0;
        _this.resetWidth = _this.resetWidth.bind(_this);
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
            // hiddenMoreButtion: props.hiddenMoreButtion || false,
            // hiddenconfrimButtion: props.hiddenconfrimButtion || false,
            // hiddenclearButtion: props.hiddenclearButtion || false,
            width: window.innerWidth
        };
        return _this;
    }

    _createClass(VtxGrid, [{
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
        key: 'render',
        value: function render() {
            var _this2 = this;

            var t = this;
            var props = t.props;
            var w = t.state.width > 1000 ? t.state.width : 1000,
                ar = Math.ceil(210 / w * 24),
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
                                'span',
                                { 'data-type': 'fieldName' },
                                props.titles[i]
                            )
                        ),
                        _react2.default.createElement(
                            _VtxCol2.default,
                            { span: c },
                            _react2.default.createElement(
                                'span',
                                { 'data-type': 'colon' },
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
            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref) {
                        _this2.ref = _ref;
                    }, className: styles.normal + ' ' + t.props.className, style: _extends({ height: t.state.height + 'px' }, t.state.style) },
                _react2.default.createElement(
                    _VtxRow2.default,
                    { gutter: 10, attr: 'row' },
                    _react2.default.createElement(
                        _VtxCol2.default,
                        { span: al, xl: { span: 21 } },
                        _react2.default.createElement(
                            _VtxRow2.default,
                            { gutter: 10, attr: 'row' },
                            analyzeChildern(props.children)
                        )
                    ),
                    _react2.default.createElement(
                        _VtxCol2.default,
                        { span: ar, xl: { span: 3 } },
                        _react2.default.createElement(
                            _VtxRow2.default,
                            { gutter: 10, attr: 'row' },

                            // t.state.hiddenconfrimButtion?"":
                            t.props.hiddenconfrimButtion ? "" : _react2.default.createElement(
                                _VtxCol2.default,
                                { span: 10 },
                                _react2.default.createElement(
                                    'span',
                                    { 'data-type': 'bt' },
                                    _react2.default.createElement(
                                        _button2.default,
                                        { style: { width: '100%' }, type: 'primary', onClick: props.confirm },
                                        props.confirmText || '查询'
                                    )
                                )
                            ),

                            // t.state.hiddenclearButtion?"":
                            t.props.hiddenclearButtion ? "" : _react2.default.createElement(
                                _VtxCol2.default,
                                { span: 10 },
                                _react2.default.createElement(
                                    'span',
                                    { 'data-type': 'bt' },
                                    _react2.default.createElement(
                                        _button2.default,
                                        { style: { width: '100%' }, onClick: props.clear },
                                        props.clearText || '清空'
                                    )
                                )
                            ),
                            _react2.default.createElement(
                                _VtxCol2.default,
                                { span: 4 },

                                // this.weightiness > 4 && !t.state.hiddenMoreButtion?
                                this.weightiness > 4 && !t.props.hiddenMoreButtion ? _react2.default.createElement(
                                    'span',
                                    { 'data-type': 'bt' },
                                    _react2.default.createElement(_button2.default, { type: 'primary', shape: 'circle', icon: 'ellipsis', onClick: function onClick() {
                                            return t.isShowMore(_this2.weightiness);
                                        } })
                                ) : ''
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
            if (t.ref) {
                t.setState({
                    width: t.ref.offsetWidth
                });
            }
            // 自适应宽度
            window.addEventListener('resize', t.resetWidth, false);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var t = this;
            window.removeEventListener('resize', t.resetWidth, false);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this3 = this;

            var t = this;
            this.weightiness = 0;
            nextProps.gridweight.map(function (item, index) {
                _this3.weightiness += item;
            });
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

    return VtxGrid;
}(_react2.default.Component);

VtxGrid.VtxRow = _VtxRow2.default;
VtxGrid.VtxCol = _VtxCol2.default;

exports.default = VtxGrid;
module.exports = exports['default'];