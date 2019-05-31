'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _upload = require('antd/lib/upload');

var _upload2 = _interopRequireDefault(_upload);

require('antd/lib/upload/style/css');

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

require('antd/lib/button/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

require('viewerjs/dist/viewer.css');

var _viewerjs = require('viewerjs');

var _viewerjs2 = _interopRequireDefault(_viewerjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VortexUpload = function (_React$Component) {
    _inherits(VortexUpload, _React$Component);

    function VortexUpload(props) {
        _classCallCheck(this, VortexUpload);

        // 初始化上传下载的地址
        var _this = _possibleConstructorReturn(this, (VortexUpload.__proto__ || Object.getPrototypeOf(VortexUpload)).call(this, props));

        _this.uploadURL = props.action || '';
        _this.downLoadURL = props.downLoadURL || '';
        // 可在外部配置的属性，具体文档参考AntUI
        _this.configurableProperty = ['data', 'showUploadList', 'multiple', 'accept', 'listType', 'disabled', 'withCredentials', 'beforeUpload'];

        _this.imageCt = null;
        _this.imageViewer = null;

        _this.state = {
            fileList: _this.getSynFileList()
        };
        return _this;
    }

    _createClass(VortexUpload, [{
        key: 'getConfig',
        value: function getConfig() {
            var t = this;
            var props = this.props;
            // 重置上传下载的地址
            t.uploadURL = props.action || '';
            t.downLoadURL = props.downLoadURL || '';
            var config = {
                action: t.uploadURL,
                fileList: t.state.fileList,
                onChange: function onChange(info) {
                    // 此处根据后台返回的数据结构取得文件ID             
                    var vtxId = info.file.response && Array.isArray(info.file.response.data) && info.file.response.data.length > 0 ? info.file.response.data[0].id : undefined;
                    var newFileList = info.fileList;
                    var newFile = vtxId ? _extends({}, info.file, {
                        id: vtxId,
                        url: t.downLoadURL + vtxId
                    }) : _extends({}, info.file);

                    if (info.file.status === 'done' && vtxId) {
                        newFileList = info.fileList.map(function (item) {
                            if (item.uid == info.file.uid) {
                                return _extends({}, item, {
                                    id: vtxId,
                                    url: t.downLoadURL + vtxId
                                });
                            }
                            return item;
                        });
                    }
                    // 更新组件状态
                    if (props.mode == 'single' && info.file.status === 'done') {
                        t.setState({ fileList: [newFile] });
                    } else {
                        t.setState({ fileList: newFileList });
                    }
                    // 触发外部方法
                    if (info.file.status === 'done') {
                        if (typeof props.onSuccess == 'function') {
                            props.onSuccess(newFile);
                        }
                    } else if (info.file.status === 'error') {
                        if (typeof props.onError == "function") {
                            props.onError(info.file);
                        }
                    }
                },
                onRemove: function onRemove(file) {
                    if (typeof props.onRemove == "function") {
                        return props.onRemove(file);
                    }
                }
            };

            // 继承相关配置
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = t.configurableProperty[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var p = _step.value;

                    if (props[p] !== undefined) {
                        config[p] = props[p];
                    }
                }
                // viewMode
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (props.viewMode && props.showUploadList !== false) {
                config.showUploadList = { showRemoveIcon: false };
            }
            if (props.listType == 'picture-card') {
                config.onPreview = t.handlePreview.bind(t);
            }

            return config;
        }
    }, {
        key: 'getSynFileList',
        value: function getSynFileList(props) {
            var t = this;
            props = props || this.props;
            var processedFileList = props.fileList || [];
            // 单文件模式只取第一个
            if (props.mode == 'single' && processedFileList.length > 1) {
                processedFileList = [processedFileList[0]];
            }
            processedFileList = processedFileList.map(function (item, index) {
                // 将外部传入的简易文件数组处理成为组件需要的数组结构
                if (item.name === undefined || item.id === undefined) {
                    console.error('文件列表的name和id属性不能为空');
                }
                var itemURL = item.url || t.downLoadURL + item.id;
                return _extends({}, item, {
                    uid: -1 - index,
                    status: 'done',
                    url: itemURL,
                    thumbUrl: itemURL
                });
            });
            return processedFileList;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (this.props.fileListVersion != nextProps.fileListVersion) {
                this.setState({
                    fileList: this.getSynFileList(nextProps)
                });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.imageViewer = new _viewerjs2.default(this.imageCt, {});
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.imageViewer.destroy();
        }
    }, {
        key: 'handlePreview',
        value: function handlePreview(file) {
            var imageIndex = this.props.fileList.map(function (item) {
                return item.id;
            }).indexOf(file.id);
            if (imageIndex == -1) return;
            this.imageViewer.update();
            this.imageViewer.view(imageIndex);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    _upload2.default,
                    this.getConfig(),
                    this.props.viewMode ? null : this.props.customizedButton || (this.props.listType == 'picture-card' ? _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(_icon2.default, { type: 'plus', style: { fontSize: '28px', color: '#999' } }),
                        _react2.default.createElement(
                            'div',
                            { className: 'ant-upload-text' },
                            '\u4E0A\u4F20'
                        )
                    ) : _react2.default.createElement(
                        _button2.default,
                        null,
                        _react2.default.createElement(_icon2.default, { type: 'upload' }),
                        '\u4E0A\u4F20'
                    ))
                ),
                _react2.default.createElement(
                    'div',
                    { style: { display: 'none' } },
                    _react2.default.createElement(
                        'ul',
                        { ref: function ref(ins) {
                                if (ins) _this2.imageCt = ins;
                            } },
                        this.props.fileList.map(function (item, index) {
                            return _react2.default.createElement(
                                'li',
                                { key: item.id },
                                _react2.default.createElement('img', { src: item.url || _this2.downLoadURL + item.id, alt: item.name || 'picture-' + (index + 1) })
                            );
                        })
                    )
                )
            );
        }
    }]);

    return VortexUpload;
}(_react2.default.Component);

exports.default = VortexUpload;
module.exports = exports['default'];