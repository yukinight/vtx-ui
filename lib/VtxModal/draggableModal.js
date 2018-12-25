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

var _modal = require('antd/lib/modal');

var _modal2 = _interopRequireDefault(_modal);

require('antd/lib/modal/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DraggableModal = function (_React$Component) {
    _inherits(DraggableModal, _React$Component);

    function DraggableModal(props) {
        _classCallCheck(this, DraggableModal);

        var _this = _possibleConstructorReturn(this, (DraggableModal.__proto__ || Object.getPrototypeOf(DraggableModal)).call(this, props));

        _this.state = {
            init_x: 0,
            init_y: 0,
            x_move: 0,
            y_move: 0
        };
        _this.initSucceed = false; //是否已完成初始化拖拽事件
        _this.startDrag = _this.startDrag.bind(_this);
        _this.initEvent = _this.initEvent.bind(_this);
        return _this;
    }
    // 初始化弹框的拖拽事件


    _createClass(DraggableModal, [{
        key: 'initEvent',
        value: function initEvent() {
            if (!this.drag) return;
            var modalHead = _reactDom2.default.findDOMNode(this.drag).parentNode.previousSibling;
            if (modalHead.className.indexOf('ant-modal-header') !== -1) {
                modalHead.style.cursor = 'move';
                modalHead.onmousedown = this.startDrag;
                this.initSucceed = true;
            }
        }
        // 开始拖拽：绑定事件

    }, {
        key: 'startDrag',
        value: function startDrag(e) {
            var _this2 = this;

            e.preventDefault();
            this.setState({
                init_x: e.clientX - this.state.x_move,
                init_y: e.clientY - this.state.y_move
            });
            var mousemove = function mousemove(e) {
                _this2.setState({
                    x_move: e.clientX - _this2.state.init_x,
                    y_move: e.clientY - _this2.state.init_y
                });
            };
            var mouseup = function mouseup(e) {
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('mouseup', mouseup);
            };

            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var transformStyle = {
                transform: 'translate(' + this.state.x_move + 'px,' + this.state.y_move + 'px)'
            };
            var props = _extends({}, this.props, {
                style: _extends({}, this.props.style, transformStyle)
            });

            return _react2.default.createElement(
                _modal2.default,
                props,
                this.props.children,
                _react2.default.createElement('div', { ref: function ref(elem) {
                        _this3.drag = elem;
                    } })
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.initEvent();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (!this.initSucceed) {
                this.initEvent();
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (!this.props.visible && nextProps.visible && !nextProps.remainPosition) {
                this.setState({
                    init_x: 0,
                    init_y: 0,
                    x_move: 0,
                    y_move: 0
                });
            }
        }
    }]);

    return DraggableModal;
}(_react2.default.Component);

exports.default = DraggableModal;
module.exports = exports['default'];