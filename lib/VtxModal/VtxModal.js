'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./VtxModal.css');

var _modal = require('antd/lib/modal');

var _modal2 = _interopRequireDefault(_modal);

require('antd/lib/modal/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
    normal: 'vtx-ui-modal-normal',
    maxClass: 'vtx-ui-modal-maxClass',
    title: 'vtx-ui-modal-title',
    title_name: 'vtx-ui-modal-title_name',
    close: 'vtx-ui-modal-close',
    maximizeIcon: 'vtx-ui-modal-maximizeIcon'
};

var VtxModal = function (_React$Component) {
    _inherits(VtxModal, _React$Component);

    function VtxModal(props) {
        _classCallCheck(this, VtxModal);

        var _this = _possibleConstructorReturn(this, (VtxModal.__proto__ || Object.getPrototypeOf(VtxModal)).call(this, props));

        _this.classId = new Date().getTime() + Math.random();
        _this.isInit = false;
        _this.isCreate = props.visible;
        _this.state = {
            maximizable: false,
            maximizeClass: '',

            init_x: 0,
            init_y: 0,
            x_move: 0,
            y_move: 0,
            documentMouseMove: null,
            documentMouseUp: null
        };
        _this.startDrag = _this.startDrag.bind(_this);
        return _this;
    }

    _createClass(VtxModal, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.visible && !this.isCreate) {
                this.isCreate = true;
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (!this.props.isNotMoving) {
                if (this.isCreate && !this.isInit) {
                    this.isInit = true;
                    try {
                        var modalHead = document.getElementsByClassName(this.classId)[0].getElementsByClassName('ant-modal-header')[0];
                        modalHead.style.cursor = 'move';
                        modalHead.onmousedown = this.startDrag;
                    } catch (error) {
                        console.error('VtxModal拖动功能异常,未获取到头部dom对象!');
                    }
                }
            }
        }
    }, {
        key: 'startDrag',
        value: function startDrag(e) {
            var _this2 = this;

            e.preventDefault();
            this.setState({
                documentMouseUp: document.onmouseup,
                documentMouseMove: document.onmousemove,
                init_x: e.clientX - this.state.x_move,
                init_y: e.clientY - this.state.y_move
            });
            document.onmousemove = function (e) {
                _this2.setState({
                    x_move: e.clientX - _this2.state.init_x,
                    y_move: e.clientY - _this2.state.init_y
                });
            };
            document.onmouseup = function (e) {
                document.onmousemove = _this2.state.documentMouseMove;
                document.onmouseup = _this2.state.documentMouseUp;
            };
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.timer) {
                clearTimeout(this.timer);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var _props = this.props,
                _props$closable = _props.closable,
                closable = _props$closable === undefined ? true : _props$closable,
                _props$maximize = _props.maximize,
                maximize = _props$maximize === undefined ? true : _props$maximize,
                _props$wrapClassName = _props.wrapClassName,
                wrapClassName = _props$wrapClassName === undefined ? '' : _props$wrapClassName,
                _props$title = _props.title,
                title = _props$title === undefined ? '' : _props$title;
            var _state = this.state,
                maximizable = _state.maximizable,
                maximizeClass = _state.maximizeClass;

            wrapClassName = styles.normal + ' ' + wrapClassName + ' ' + maximizeClass + ' ' + this.classId;
            var transformStyle = {
                transform: 'translate(' + this.state.x_move + 'px,' + this.state.y_move + 'px)'
            };
            title = function renderTitle() {
                return _react2.default.createElement(
                    'div',
                    { className: styles.title, style: { paddingRight: closable ? '32px' : '0px' } },
                    _react2.default.createElement(
                        'div',
                        { className: styles.title_name },
                        title
                    ),
                    maximize ? _react2.default.createElement(
                        'div',
                        { className: styles.maximizeIcon },
                        _react2.default.createElement(
                            'p',
                            {
                                onClick: function onClick() {
                                    var maximizeClass = '';
                                    if (!maximizable) {
                                        maximizeClass = styles.maxClass;
                                    }
                                    t.setState({
                                        maximizable: !maximizable,
                                        maximizeClass: maximizeClass
                                    }, function () {
                                        {/* 为arcgis设计 */}
                                        if (t.timer) {
                                            clearTimeout(t.timer);
                                        }
                                        t.timer = setTimeout(function () {
                                            if (window.onModalResize && typeof window.onModalResize == 'function') {
                                                window.onModalResize();
                                            }
                                        }, 100);
                                    });
                                }
                            },
                            maximizable ? _react2.default.createElement(_icon2.default, { type: 'shrink' }) : _react2.default.createElement(_icon2.default, { type: 'arrows-alt' })
                        )
                    ) : null,
                    closable ? _react2.default.createElement(
                        'div',
                        { className: styles.close },
                        _react2.default.createElement(
                            'p',
                            { onClick: t.props.onCancel },
                            _react2.default.createElement(_icon2.default, { type: 'close' })
                        )
                    ) : ''
                );
            }();
            var props = _extends({
                closable: closable,
                maskClosable: false,
                width: 700
            }, this.props, {
                closable: false,
                title: title,
                wrapClassName: wrapClassName,
                bodyStyle: _extends({
                    maxHeight: window.innerHeight * 0.7 + 'px'
                }, this.props.bodyStyle),
                style: _extends({}, this.props.style, transformStyle)
            });
            return _react2.default.createElement(
                _modal2.default,
                props,
                this.props.children
            );
        }
    }]);

    return VtxModal;
}(_react2.default.Component);

VtxModal.info = _modal2.default.info;
VtxModal.success = _modal2.default.success;
VtxModal.error = _modal2.default.error;
VtxModal.warning = _modal2.default.warning;
VtxModal.confirm = _modal2.default.confirm;

exports.default = VtxModal;
module.exports = exports['default'];