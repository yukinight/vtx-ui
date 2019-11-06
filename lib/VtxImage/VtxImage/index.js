'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./index.css');

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _VtxImageViewer = require('../VtxImageViewer');

var _VtxImageViewer2 = _interopRequireDefault(_VtxImageViewer);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultEmptyImageSrc = '';
var defaultErrorImageSrc = '';
var defaultEmptyText = '暂无图片';
var defaultErrorText = '图片出错';

var ImageCustom = function (_React$Component) {
	_inherits(ImageCustom, _React$Component);

	function ImageCustom(props) {
		_classCallCheck(this, ImageCustom);

		var _this = _possibleConstructorReturn(this, (ImageCustom.__proto__ || Object.getPrototypeOf(ImageCustom)).call(this, props));

		_this.state = {
			loadError: false, // 图片是否加载失败
			emptyError: false, // 空白图片是否加载失败
			errorError: false, // 报错图片是否加载失败
			viewerVisible: false // 是否查看
		};

		_this.emptyImageSrc = props.emptyImageSrc || defaultEmptyImageSrc;
		_this.errorImageSrc = props.errorImageSrc || defaultErrorImageSrc;

		// 缩略图
		_this.hasThumb = !!props.thumb;

		_this.renderImgNode = _this.renderImgNode.bind(_this);
		_this.onImgClick = _this.onImgClick.bind(_this);
		_this.renderImageViewer = _this.renderImageViewer.bind(_this);
		_this.onViewerClose = _this.onViewerClose.bind(_this);
		return _this;
	}

	_createClass(ImageCustom, [{
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			var nextSrc = nextProps.src;
			if (!(0, _isEqual2.default)(this.props.src, nextSrc)) {
				this.setState({
					loadError: false
				});
			}
		}

		// 图片点击

	}, {
		key: 'onImgClick',
		value: function onImgClick() {
			this.setState({
				viewerVisible: true
			});
			// 回调
			if (typeof this.props.onClick == 'function') {
				this.props.onClick();
			}
		}

		// 关闭画廊

	}, {
		key: 'onViewerClose',
		value: function onViewerClose() {
			this.setState({
				viewerVisible: false
			});
		}

		// 查看

	}, {
		key: 'renderImageViewer',
		value: function renderImageViewer(_ref) {
			var allowView = _ref.allowView,
			    viewer = _ref.viewer;

			if (!allowView) {
				return null;
			}
			var _props = this.props,
			    src = _props.src,
			    title = _props.title,
			    alt = _props.alt;

			var _getComponentProps = (0, _util.getComponentProps)(viewer),
			    photo = _getComponentProps.photo;

			var newPhoto = photo;

			// 若未配置photo，则默认使用Iamge src展示
			if (!photo) {
				newPhoto = { id: src, name: title || alt };
			}
			return _react2.default.createElement(_VtxImageViewer2.default, _extends({
				photo: newPhoto
			}, viewer, {
				visible: this.state.viewerVisible,
				onClose: this.onViewerClose
			}));
		}
	}, {
		key: 'renderImgNode',
		value: function renderImgNode() {
			var _this2 = this;

			var _props2 = this.props,
			    prefixCls = _props2.prefixCls,
			    thumb = _props2.thumb,
			    className = _props2.className,
			    style = _props2.style,
			    alt = _props2.alt,
			    src = _props2.src,
			    _props2$emptyText = _props2.emptyText,
			    emptyText = _props2$emptyText === undefined ? defaultEmptyText : _props2$emptyText,
			    _props2$errorText = _props2.errorText,
			    errorText = _props2$errorText === undefined ? defaultErrorText : _props2$errorText,
			    onClick = _props2.onClick;


			var imgProps = {
				src: src,
				className: className,
				style: style,
				alt: alt,
				onClick: onClick
			};

			// 无图片
			if (!src) {
				//有替代图片
				if (this.emptyImageSrc && !this.state.emptyError) {
					imgProps.src = this.emptyImageSrc;
					imgProps.onError = function () {
						_this2.setState({ emptyError: true });
					};
				} else {
					// 没有替代图片或替代图片无法加载
					return _react2.default.createElement(
						'div',
						{ className: prefixCls + '-nodata', style: style },
						_react2.default.createElement(
							'p',
							null,
							emptyText
						)
					);
				}
			}

			// 无法加载图片时记录图片地址方便跟踪
			if (this.state.loadError) {
				// 加载报错图片
				if (this.errorImageSrc && !this.state.errorError) {
					imgProps['data-error-img'] = src;
					imgProps.src = this.errorImageSrc;
					imgProps.onError = function () {
						_this2.setState({ errorError: true });
					};
				} else {
					// 无法加载报错图片
					return _react2.default.createElement(
						'div',
						{ className: prefixCls + '-error', style: style, 'data-error-img': src },
						_react2.default.createElement(
							'p',
							null,
							errorText
						)
					);
				}
			} else {
				imgProps.onError = function () {
					_this2.setState({
						loadError: true
					});
				};
			}

			// 缩略图模式 | 此模式下支持放大查看
			if (this.hasThumb) {
				var _getComponentProps2 = (0, _util.getComponentProps)(thumb),
				    backgroundColor = _getComponentProps2.backgroundColor,
				    _getComponentProps2$a = _getComponentProps2.allowView,
				    allowView = _getComponentProps2$a === undefined ? false : _getComponentProps2$a,
				    _getComponentProps2$v = _getComponentProps2.viewer,
				    viewer = _getComponentProps2$v === undefined ? {} : _getComponentProps2$v;

				// class


				var thumbCls = (0, _classnames3.default)(prefixCls + '-thumb', _defineProperty({}, prefixCls + '-view', allowView));
				// 允许查看
				if (allowView) {
					imgProps.onClick = this.onImgClick;
				}
				return _react2.default.createElement(
					'div',
					{ className: thumbCls, style: backgroundColor ? { backgroundColor: backgroundColor } : null },
					_react2.default.createElement('img', imgProps),
					this.renderImageViewer({ allowView: allowView, viewer: viewer })
				);
			}

			return _react2.default.createElement('img', imgProps);
		}
	}, {
		key: 'render',
		value: function render() {
			return this.renderImgNode();
		}
	}]);

	return ImageCustom;
}(_react2.default.Component);

ImageCustom.defaultProps = {
	prefixCls: 'vtx-image',
	thumb: false // 缩略图模式
};


function setImageConfig(options) {
	var emptyImageSrc = options.emptyImageSrc,
	    errorImageSrc = options.errorImageSrc,
	    emptyText = options.emptyText,
	    errorText = options.errorText;

	if (emptyImageSrc !== undefined) {
		defaultEmptyImageSrc = emptyImageSrc;
	}
	if (errorImageSrc !== undefined) {
		defaultErrorImageSrc = errorImageSrc;
	}
	if (emptyText !== undefined) {
		defaultEmptyText = emptyText;
	}
	if (errorText !== undefined) {
		defaultErrorText = errorText;
	}
}

ImageCustom.config = setImageConfig;

exports.default = ImageCustom;
module.exports = exports['default'];