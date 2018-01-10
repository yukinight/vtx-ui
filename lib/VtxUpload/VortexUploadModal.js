'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _modal = require('antd/lib/modal');

var _modal2 = _interopRequireDefault(_modal);

require('antd/lib/modal/style/css');

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

require('antd/lib/button/style/css');

var _VortexUpload = require('./VortexUpload');

var _VortexUpload2 = _interopRequireDefault(_VortexUpload);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VortexUploadModal = function (_React$Component) {
    _inherits(VortexUploadModal, _React$Component);

    function VortexUploadModal(props) {
        _classCallCheck(this, VortexUploadModal);

        var _this = _possibleConstructorReturn(this, (VortexUploadModal.__proto__ || Object.getPrototypeOf(VortexUploadModal)).call(this, props));

        _this.state = {
            fileList: _this.props.upload.fileList || []
        };
        return _this;
    }

    _createClass(VortexUploadModal, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (this.props.upload.fileListVersion != nextProps.upload.fileListVersion) {
                this.setState({
                    fileList: nextProps.upload.fileList
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var t = this;
            var ulProps = _extends({}, t.props.upload, {
                onSuccess: function onSuccess(file) {
                    if (t.props.upload.mode == 'single') {
                        t.setState({
                            fileList: [file]
                        });
                    } else {
                        t.setState({
                            fileList: [].concat(_toConsumableArray(t.state.fileList), [file])
                        });
                    }
                    if (typeof t.props.upload.onSuccess == 'function') {
                        t.props.upload.onSuccess(file);
                    }
                },
                onError: function onError(res) {
                    if (typeof t.props.upload.onError == 'function') {
                        t.props.upload.onError(res);
                    }
                },
                onRemove: function onRemove(file) {
                    t.setState({
                        fileList: t.state.fileList.filter(function (item) {
                            return item.id != file.id;
                        })
                    });
                    if (typeof t.props.upload.onRemove == 'function') {
                        return t.props.upload.onRemove(file);
                    }
                }
            });

            var title = _react2.default.createElement(
                'span',
                null,
                '\u4E0A\u4F20\u6587\u4EF6',
                this.props.template ? _react2.default.createElement(_button2.default, { size: 'small', shape: 'circle', icon: 'file-text', title: '\u4E0B\u8F7D\u6A21\u677F', type: 'dashed',
                    onClick: function onClick() {
                        window.open(_this2.props.template);
                    } }) : null
            );
            var mdProps = _extends({
                title: title,
                okText: "确定",
                cancelText: "取消"
            }, t.props.modal, {
                onOk: function onOk() {
                    if (typeof t.props.modal.onOk == 'function') {
                        t.props.modal.onOk(t.state.fileList);
                    }
                }
            });
            return _react2.default.createElement(
                _modal2.default,
                mdProps,
                _react2.default.createElement(_VortexUpload2.default, ulProps),
                typeof t.props.modal.setContent == 'function' ? t.props.modal.setContent(t.state.fileList) : null
            );
        }
    }]);

    return VortexUploadModal;
}(_react2.default.Component);

exports.default = VortexUploadModal;
module.exports = exports['default'];