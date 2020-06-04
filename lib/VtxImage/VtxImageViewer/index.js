'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('viewerjs/dist/viewer.css');

var _viewerjs = require('viewerjs');

var _viewerjs2 = _interopRequireDefault(_viewerjs);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _internal = require('./-internal');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ImageViewer = function (_React$Component) {
	_inherits(ImageViewer, _React$Component);

	/**
  * props
  * visible {[Boolean]}  [是否显示]
  * photo   {[Object || Array]}  [图片]  {id: '', name: ''} || [{id: '', name: ''}]
  * index   {[Number]} photo [图片下标 用于多张图片展示，从 0 开始] 
  * options {[Object]} [viewerjs 配置项]
  */
	function ImageViewer(props) {
		_classCallCheck(this, ImageViewer);

		var _this = _possibleConstructorReturn(this, (ImageViewer.__proto__ || Object.getPrototypeOf(ImageViewer)).call(this, props));

		_this.state = {};

		// 选项
		// 详细参考 https://github.com/fengyuanchen/viewerjs#options
		_this.options = _extends({
			button: true, // 显示右上角关闭按钮
			navbar: false, // 显示缩略图导航
			title: true, // 显示当前图片的标题（现实 alt 属性及图片尺寸）
			toolbar: true, // 是否显示工具栏 
			tooltip: true, // 显示缩放百分比
			movable: true, // 图片是否可移动
			zoomable: true, // 图片是否可缩放
			rotatable: true, // 图片是否可旋转
			scalable: true, // 图片是否可翻转
			transition: true }, props.options);

		_this.view = _this.view.bind(_this);

		_this.container = document.createElement('div');
		_this.viewer = new _viewerjs2.default(_this.container, _extends({
			// 关闭后
			hidden: function hidden() {
				if ('onClose' in props && (0, _util.isFunction)(props.onClose)) {
					props.onClose();
				}
			},
			view: function view(e) {
				if ('onIndexChange' in props && (0, _util.isFunction)(props.onIndexChange)) {
					// 图片下标变更
					props.onIndexChange(e.detail.index);
				}
			}
		}, _this.options));
		return _this;
	}

	_createClass(ImageViewer, [{
		key: 'componentWillUpdate',
		value: function componentWillUpdate(nextProps, nextState) {
			// visible 为true时
			if (nextProps.visible && !(0, _isEqual2.default)(this.props.visible, nextProps.visible)) {
				this.view(nextProps);
			}
		}
	}, {
		key: 'view',
		value: function view(props) {
			var _t = this;
			// 若容器中已存在子元素，则清空
			if (this.container.childNodes.length > 0) {
				this.container.innerHTML = '';
			}

			var _props$photo = props.photo,
			    photo = _props$photo === undefined ? {} : _props$photo,
			    _props$index = props.index,
			    index = _props$index === undefined ? 0 : _props$index;

			var mode = (0, _internal.checkMode)(photo);
			var newPhoto = (0, _cloneDeep2.default)(photo);

			// 单张
			if (mode === _internal.VIEWER) {
				index = 0;
				newPhoto = (0, _util.isObject)(newPhoto) ? newPhoto : newPhoto[0];

				var imgElem = document.createElement('img');
				imgElem.src = newPhoto.id;
				imgElem.alt = newPhoto.name;

				this.container.appendChild(imgElem);
			}

			// 多张
			if (mode === _internal.GALLERY) {
				var len = newPhoto.length - 1;
				index = index < 0 ? 0 : index;
				index = index > len ? len : index;

				var ulElem = document.createElement('ul');
				newPhoto.map(function (item) {
					var liElem = document.createElement('li');
					var imgElem = document.createElement('img');
					imgElem.src = item.id;
					imgElem.alt = item.name;
					liElem.appendChild(imgElem);
					ulElem.appendChild(liElem);
				});

				this.container.appendChild(ulElem);
			}

			this.viewer.update();
			this.viewer.view(index);
		}
	}, {
		key: 'render',
		value: function render() {
			return null;
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			// 销毁
			this.viewer && this.viewer.destroy();
		}
	}]);

	return ImageViewer;
}(_react2.default.Component);

exports.default = ImageViewer;
module.exports = exports['default'];