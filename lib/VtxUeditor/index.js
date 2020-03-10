'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./index.less');

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _default = require('../default');

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var styles = _defineProperty({}, 'vtx-ui-uedit', 'vtx-ui-uedit');

var VtxUeditor = function (_React$Component) {
    _inherits(VtxUeditor, _React$Component);

    function VtxUeditor(props) {
        _classCallCheck(this, VtxUeditor);

        var _this = _possibleConstructorReturn(this, (VtxUeditor.__proto__ || Object.getPrototypeOf(VtxUeditor)).call(this, props));

        _this.id = props.id || 'vtx-ui-uedit' + (new Date().getTime() + Math.random());
        _this.state = {};
        _this.ue = null;
        _this.loadMapJs();
        return _this;
    }

    _createClass(VtxUeditor, [{
        key: 'loadMapJs',
        value: function loadMapJs() {
            var t = this;
            window.UEDITOR_HOME_URL = _default2.default.ueditorServer;
            this.loadUEComplete = new Promise(function (resolve, reject) {
                if (window.UE) {
                    resolve(window.UE);
                } else {
                    var Config = new Promise(function (resolve, reject) {
                        $.getScript(_default2.default.ueditorServer + 'ueditor.config.js', function () {
                            /* 
                                maximumWords 总字符数 10000
                                zIndex: 900
                            */
                            window.UEDITOR_CONFIG = _extends({}, window.UEDITOR_CONFIG, {
                                maxUndoCount: 50,
                                maxInputCount: 20,
                                serverUrl: '/' + (t.props.serverUrlprefix || 'editorURL') + '/jsp/controller.jsp'
                            }, t.props.config);
                            resolve();
                        });
                    });
                    var Ueditor = new Promise(function (resolve, reject) {
                        $.getScript(_default2.default.ueditorServer + 'ueditor.all.js', function () {
                            // resolve();
                            $.getScript(_default2.default.ueditorServer + 'ueditor.parse.js', function () {
                                resolve();
                            });
                        });
                    });
                    Promise.all([Ueditor, Config]).then(function () {
                        resolve(window.UE);
                    });
                }
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var t = this;
            t.loadUEComplete.then(function () {
                t.init();
            });
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            if ((0, _isEqual2.default)(t.props, nextProps)) {
                return false;
            }
            return true;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.setParam(nextProps);
        }
        // 初始化

    }, {
        key: 'init',
        value: function init() {
            this.ue = window.UE.getEditor(this.id);
            this.setParam(this.props);
        }
        // 设置参数

    }, {
        key: 'setParam',
        value: function setParam(option) {
            var t = this;
            if (this.ue) {
                this.ue.ready(function () {
                    // 初始化数据
                    t.ue.setContent(option.value || '');
                    if (option.disabled) {
                        t.ue.setDisabled();
                    } else {
                        t.ue.setEnabled();
                    }
                });
            }
        }
        // 获取html文本

    }, {
        key: 'getContent',
        value: function getContent() {
            return this.ue.getContent();
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            return _react2.default.createElement('div', { className: styles['vtx-ui-uedit'], id: this.id });
        }
    }]);

    return VtxUeditor;
}(_react2.default.Component);

exports.default = VtxUeditor;
module.exports = exports['default'];