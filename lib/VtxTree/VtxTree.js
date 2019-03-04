'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./VtxTree.css');

var _tree2 = require('antd/lib/tree');

var _tree3 = _interopRequireDefault(_tree2);

require('antd/lib/tree/style/css');

var _input = require('antd/lib/input');

var _input2 = _interopRequireDefault(_input);

require('antd/lib/input/style/css');

var _tooltip = require('antd/lib/tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

require('antd/lib/tooltip/style/css');

var _spin = require('antd/lib/spin');

var _spin2 = _interopRequireDefault(_spin);

require('antd/lib/spin/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

var _isEqual2 = require('lodash/isEqual');

var _isEqual3 = _interopRequireDefault(_isEqual2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
	normal: 'vtx-ui-tree-normal',
	searchInput: 'vtx-ui-tree-searchInput',
	treeBody: 'vtx-ui-tree-treeBody',
	text_ellipsis: 'vtx-ui-tree-text_ellipsis',
	dis_n: 'vtx-ui-tree-dis_n',
	treeNode: 'vtx-ui-tree-treenode',
	disable: 'vtx-ui-tree-disable'
};

var TreeNode = _tree3.default.TreeNode;
var Search = _input2.default.Search;

var VtxTree = function (_React$Component) {
	_inherits(VtxTree, _React$Component);

	function VtxTree(props) {
		_classCallCheck(this, VtxTree);

		var _this = _possibleConstructorReturn(this, (VtxTree.__proto__ || Object.getPrototypeOf(VtxTree)).call(this, props));

		_this.askeys = [];
		_this.allKeys = [];
		_this.state = {
			isExpandAll: props.isExpandAll || 'other',
			autoExpandParent: 'autoExpandParent' in props ? props.autoExpandParent : true,
			expandedKeys: props.expandedKeys || [],
			selectedKeys: props.selectedKeys,
			data: props.data,
			onLoad: props.onLoad,
			inputValue: ''
		};

		return _this;
	}
	/*
 	vtxTree事件处理
  */
	//右击事件


	_createClass(VtxTree, [{
		key: 'onRightClick',
		value: function onRightClick(_ref) {
			var event = _ref.event,
			    node = _ref.node;

			var t = this;

			if ('onRightClick' in t.props && typeof t.props.onRightClick === 'function') {
				var key = node.props.eventKey;
				var treeNode = t.getTreeNodeByKey(t.props.data, key);
				t.props.onRightClick({ event: event, key: key, treeNode: treeNode });
			}
		}
		//点击事件(checkable为true时,效果和onCheck相同,即为多选事件)

	}, {
		key: 'onSelect',
		value: function onSelect(selectedKeys, e) {

			var t = this;
			var _tree = t.props;
			var key = e.node.props.eventKey;
			//同时为true时,onSelect事件执行onCheck方法
			if (_tree.checkable && _tree.isGangedChecked) {
				e.node.onCheck();
				return false;
			}
			var treeNode = t.getTreeNodeByKey(t.props.data, key);
			//无关联的点击事件
			if ('onClick' in t.props && typeof t.props.onClick === 'function') {
				_tree.onClick({ key: key, selectedKeys: selectedKeys, treeNode: treeNode });
			} else {
				t.setState({
					selectedKeys: selectedKeys
				});
			}
		}
		//复选框存在时的多选事件

	}, {
		key: 'onCheck',
		value: function onCheck(checkedKeys, e) {

			var t = this;
			var _tree = t.props;
			var key = e.node.props.eventKey;
			var isChecked = e.node.props.checked;
			var treeNode = void 0;
			var leafNode = [];
			var isCheckAll = true;
			for (var i = 0; i < t.allKeys.length; i++) {
				if (t.allKeys[i] !== t.props.data[0].key) {
					if ((t.props.checkedKeys || []).indexOf(t.allKeys[i]) === -1) {
						isCheckAll = false;
					}
				}
			}
			if (t.allKeys.length <= checkedKeys.length) {
				if (!isCheckAll) {
					checkedKeys = t.allKeys;
				} else {
					checkedKeys = [];
				}
			}
			//遍历获取所有选中叶子节点 和 当前点击的节点
			var getNodes = function getNodes(item, index) {
				if (item.key === key) {
					treeNode = item;
				}
				checkedKeys.map(function (itemK, indexK) {
					if (item.key === itemK && item.isLeaf && !(item.disabled || item.disableCheckbox)) {
						leafNode.push(item);
					}
				});
				if (t.isArray(item.children)) {
					t.traverse(item.children, getNodes);
				}
			};
			t.traverse(_tree.data, getNodes);

			if ('onCheck' in t.props && typeof t.props.onCheck === 'function') {
				_tree.onCheck({ key: key, isChecked: isChecked, checkedKeys: checkedKeys, treeNode: treeNode, leafNode: leafNode });
			}
		}

		//展开和收起事件

	}, {
		key: 'onExpand',
		value: function onExpand(expandedKeys, e) {
			var t = this;
			if ('onExpand' in t.props && typeof t.props.onExpand === 'function') {
				var key = e.node.props.eventKey;
				var isExpand = e.expanded;
				var treeNode = t.getTreeNodeByKey(t.props.data, key);
				t.props.onExpand({ key: key, expandedKeys: expandedKeys, isExpand: isExpand, treeNode: treeNode });
			} else {
				t.setState({
					isExpandAll: 'other',
					expandedKeys: expandedKeys,
					autoExpandParent: false
				});
			}
		}
		//动态加载树数据

	}, {
		key: 'onLoadData',
		value: function onLoadData(node) {
			var _this2 = this;

			var t = this;
			var key = node.props.eventKey;
			var isExpand = node.props.expanded;
			var treeNode = t.getTreeNodeByKey(t.props.data, key);
			treeNode.children = !treeNode.children ? [] : treeNode.children;
			if (treeNode.children.length === 0) {
				return new Promise(function (resolve) {
					_this2.props.onLoadData({ key: key, treeNode: treeNode, isExpand: isExpand, resolve: resolve });
				});
			} else {
				return new Promise(function (resolve) {
					resolve();
				});
			}
		}
		//搜索框onchange事件

	}, {
		key: 'onChange',
		value: function onChange(e) {
			var t = this;
			var val = e.target.value;
			//内部记录搜索框输入的内容
			t.setState({
				inputValue: e.target.value
			});
			var keys = t.getKeysbySearch(val);
			//使用者控制onChange事件
			if (!!t.props.searchInput && 'onChange' in t.props.searchInput) {
				t.props.searchInput.onChange({ val: val, keys: keys });
				//手动控制事件后,默认事件被阻止
				return false;
			}
			t.setState({
				expandedKeys: keys,
				isExpandAll: 'other',
				autoExpandParent: true
			});
		}
		//搜索框onchange事件

	}, {
		key: 'filtrateTree',
		value: function filtrateTree(val) {
			var t = this;
			var keys = t.getKeysbySearch(val);
			t.setState({
				inputValue: val,
				expandedKeys: keys,
				isExpandAll: 'other',
				autoExpandParent: true
			});
		}
		//搜索框onsubmit确定事件

	}, {
		key: 'onSubmit',
		value: function onSubmit() {
			var t = this;
			var val = t.state.inputValue;
			var keys = t.getKeysbySearch(val);
			//使用者控制onSubmit事件
			if (!!t.props.searchInput && 'onSubmit' in t.props.searchInput) {
				t.props.searchInput.onSubmit({ val: val, keys: keys });
				//手动控制事件后,默认事件被阻止
				return false;
			}
			t.setState({
				expandedKeys: keys,
				isExpandAll: 'other',
				autoExpandParent: true
			});
		}
		/*
  	公共方法
   */
		//通过searchInput找出对应的keys

	}, {
		key: 'getKeysbySearch',
		value: function getKeysbySearch(val) {
			var t = this;
			var data = t.props.data;
			var keys = [],
			    askeys = [];
			var getKeys = function getKeys(item, index, p) {
				if (item.name.toString().toUpperCase().indexOf(val.toString().toUpperCase()) > -1) {
					keys.push(item.key);
					if (askeys.indexOf(p) > -1) {
						askeys.splice(askeys.indexOf(p), 1);
					}
					askeys.push(p + ',' + item.key);
				}
				if ('children' in item && t.isArray(item.children)) {
					t.traverse(item.children, getKeys, p ? p + ',' + item.key : item.key);
				}
			};
			t.traverse(data, getKeys);
			//根节点必须展示
			this.askeys = [data[0].key];
			//获取所有需要展示
			for (var i = 0; i < askeys.length; i++) {
				var b = askeys[i].split(',');
				for (var j = 0; j < b.length; j++) {
					if (this.askeys.indexOf(b[j]) === -1) {
						this.askeys.push(b[j]);
					}
				}
			}
			return keys;
		}
		//通过key获取对应的treeNode

	}, {
		key: 'getTreeNodeByKey',
		value: function getTreeNodeByKey(data, key) {
			var t = this;
			var treeNode = void 0;
			var loop = function loop(item, index) {
				if (item.key == key) {
					treeNode = item;
					return true;
				}
				if ('children' in item && t.isArray(item.children)) {
					t.traverse(item.children, loop);
				}
			};
			t.traverse(data, loop);
			return treeNode;
		}
		//遍历tree数据方法

	}, {
		key: 'traverse',
		value: function traverse(ary, backcall, p) {
			ary.map(function (item, index) {
				backcall(item, index, p);
			});
		}
		//判断对应参数是否是数组

	}, {
		key: 'isArray',
		value: function isArray(ary) {
			return Object.prototype.toString.call(ary) === '[object Array]';
		}
		//获取所有叶子节点(onload事件)

	}, {
		key: 'getLeafKeys',
		value: function getLeafKeys() {
			var t = this;
			var leafNode = [];
			var leafKeys = [];
			var getNodes = function getNodes(item, index) {
				if (item.isLeaf) {
					leafNode.push(item);
					leafKeys.push(item.key);
				}
				if (t.isArray(item.children)) {
					t.traverse(item.children, getNodes);
				}
			};
			t.traverse(t.state.data, getNodes);
			return { leafNode: leafNode, leafKeys: leafKeys };
		}
	}, {
		key: 'render',
		value: function render() {
			var _this3 = this;

			var t = this;
			var _tree = t.props;
			t.allKeys = [];
			//antd-tree树参数
			var TreeProps = {
				multiple: _tree.multiple || false, //true可以点击多个节点
				checkable: _tree.checkable || false, //true时有复选框
				autoExpandParent: t.state.autoExpandParent, //是否自动展开父节点

				onSelect: t.onSelect.bind(t), //点击节点事件 (checkable时效果和onCheck相同,即为多选事件)
				onCheck: t.onCheck.bind(t), //在checkable为true时点击复选框事件
				onExpand: t.onExpand.bind(t) //展开和收起节点事件

				//右击事件
			};if ('onRightClick' in _tree && typeof _tree.onRightClick === 'function') {
				TreeProps.onRightClick = t.onRightClick.bind(t);
			}
			//可控显示选中节点
			if ('selectedKeys' in _tree) {
				if (t.isArray(_tree.selectedKeys)) {
					TreeProps.selectedKeys = t.state.selectedKeys || [];
				} else {
					console.error('warn: selectedKeys: Data type error!');
				}
			}
			//清空在isGangedChecked为true时的tree默认操作
			if (_tree.isGangedChecked) {
				TreeProps.selectedKeys = [];
			}
			//动态加载树数据
			if ('checkedKeys' in _tree) {
				if (t.isArray(_tree.checkedKeys)) TreeProps.checkedKeys = _tree.checkedKeys || [];else console.error('warn: checkedKeys: Data type error!');
			}
			//动态加载树数据
			if ('onLoadData' in _tree) {
				if (typeof _tree.onLoadData === 'function') TreeProps.loadData = t.onLoadData.bind(t);else console.error('warn: VtxTree data: onLoadData is not a function!');
			}
			//树展开功能
			if ('isExpandAll' in _tree && t.state.isExpandAll === 'openAll') {
				//（受控）展开全部节点
				var ary = [];
				var isLeaf = function isLeaf(item, index) {
					//判断是否是叶子节点 (是叶子节点,记录下节点key,不是则继续往下找)
					ary.push(item.key);
					if ('children' in item && item.children instanceof Array && !item.isLeaf) {
						t.traverse(item.children, isLeaf);
					}
				};
				t.traverse(_tree.data, isLeaf);
				TreeProps.expandedKeys = ary;
			} else if ('isExpandAll' in _tree && t.state.isExpandAll === 'closeAll') {
				//（受控）收起全部节点
				TreeProps.expandedKeys = [];
			} else if (t.state.isExpandAll === 'other') {
				//（受控）展开树节点
				TreeProps.expandedKeys = t.state.expandedKeys || [];
			} else if ('expandedKeys' in _tree) {
				//（受控）展开指定的树节点
				TreeProps.expandedKeys = t.state.expandedKeys || [];
			}
			//加载节点树
			var loop = function loop(data) {
				//检索传入树的数据格式是否正确
				if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object' || !data.length && data.length !== 0) {
					console.error('warn: VtxTree data: Data type error!');
					return false;
				}
				var render = data.map(function (item, index) {
					var searchValue = t.state.inputValue;
					var name = item.name;
					//搜索框搜索文字高亮功能
					// if(t.state.expandedKeys.indexOf(item.key) === -1){
					// 	return '';
					// }
					if (!!_tree.isShowSearchInput && searchValue.length > 0) {
						var indexn = item.name.search(t.state.inputValue);
						var beforeStr = item.name.substr(0, indexn);
						var afterStr = item.name.substr(indexn + searchValue.length);
						name = indexn != -1 ? _react2.default.createElement(
							'span',
							null,
							beforeStr,
							_react2.default.createElement(
								'span',
								{ style: { color: !!_tree.searchInput ? _tree.searchInput.color || '#f50' : '#f50', padding: 0 } },
								searchValue
							),
							afterStr
						) : _react2.default.createElement(
							'span',
							null,
							name
						);
					}
					var disabledClass = item.disabled || _tree.disabledAll ? styles.disable : '';
					var _title = !!item.icon ? _react2.default.createElement(
						'div',
						{ className: styles.treeNode + ' ' + disabledClass, onClick: function onClick(e) {
								if (item.disabled || _tree.disabledAll) {
									e.stopPropagation();
									e.nativeEvent.stopImmediatePropagation();
									return false;
								}
							} },
						_react2.default.createElement('i', { className: 'iconfont ' + item.icon + ' ' + (item.iconClassName || ''),
							style: { 'verticalAlign': 'middle', 'marginRight': '4px' } }),
						name
					) : !!item.antdIcon ? _react2.default.createElement(
						'div',
						{ className: styles.treeNode + ' ' + disabledClass, onClick: function onClick(e) {
								if (item.disabled || _tree.disabledAll) {
									e.stopPropagation();
									e.nativeEvent.stopImmediatePropagation();
									return false;
								}
							} },
						_react2.default.createElement(_icon2.default, {
							type: item.antdIcon, className: '' + (item.iconClassName || ''),
							style: { 'verticalAlign': 'middle', 'marginRight': '4px' }
						}),
						name
					) : !!item.img ? _react2.default.createElement(
						'div',
						{ className: styles.treeNode + ' ' + disabledClass, onClick: function onClick(e) {
								if (item.disabled || _tree.disabledAll) {
									e.stopPropagation();
									e.nativeEvent.stopImmediatePropagation();
									return false;
								}
							} },
						_react2.default.createElement('img', { src: item.img, alt: '',
							style: { 'width': '16px', 'height': '16px', 'verticalAlign': 'middle', 'marginRight': '4px' } }),
						name
					) : _react2.default.createElement(
						'div',
						{ className: styles.treeNode + ' ' + disabledClass, onClick: function onClick(e) {
								if (item.disabled || _tree.disabledAll) {
									e.stopPropagation();
									e.nativeEvent.stopImmediatePropagation();
									return false;
								}
							} },
						name
					);
					_title = _react2.default.createElement(
						_tooltip2.default,
						{ placement: 'right', title: name, overlay: name },
						_title
					);
					if (!(_tree.isShowSearchInput && _this3.askeys.indexOf(item.key) === -1 && t.state.inputValue.length > 0)) {
						t.allKeys.push(item.key);
					}
					var TreeNodeProps = {
						// disabled: item.disabled || (_tree.disabledAll?true:false),
						disableCheckbox: item.disableCheckbox || (_tree.disableCheckboxAll ? true : false),
						title: _title,
						key: item.key,
						isLeaf: item.isLeaf || false,
						className: _tree.isShowSearchInput && _this3.askeys.indexOf(item.key) === -1 && t.state.inputValue.length > 0 ? styles.dis_n : ''
					};
					return _react2.default.createElement(
						TreeNode,
						TreeNodeProps,

						//子节点数据处理,避免数据异常
						'children' in item && t.isArray(item.children) && !item.isLeaf ? loop(item.children) : ''
					);
				});
				return render;
			};
			var isFixed = _tree.isFixed == undefined ? true : _tree.isFixed;
			return _react2.default.createElement(
				'div',
				{ className: styles.normal,
					style: { paddingTop: _tree.isShowSearchInput && isFixed ? '30px' : '0px' }
				},
				_react2.default.createElement(
					'div',
					{ className: styles.searchInput,
						style: {
							position: isFixed ? 'absolute' : 'relative'
						}
					},
					!_tree.isShowSearchInput ? '' : !!_tree.searchInput && 'render' in _tree.searchInput ? _tree.searchInput.render(t.onChange.bind(t), t.onSubmit.bind(t)) : _react2.default.createElement(Search, { placeholder: '\u641C\u7D22', onChange: t.onChange.bind(t), onSearch: t.onSubmit.bind(t) })
				),
				_react2.default.createElement(
					'div',
					{ className: styles.treeBody },
					_tree.data.length ? _react2.default.createElement(
						_tree3.default,
						TreeProps,
						loop(_tree.data)
					) : _react2.default.createElement(
						_spin2.default,
						{ tip: '\u52A0\u8F7D\u4E2D...' },
						_react2.default.createElement('div', { style: { width: '100%', height: '50px' } })
					)
				)
			);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var t = this;
			//树加载完后回调事件
			var keys = t.getLeafKeys();
			if (!!t.state.onLoad && !!t.state.data[0]) t.state.onLoad({ leafNode: keys.leafNode, leafKeys: keys.leafKeys });
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate(prevProps, prevState) {
			//重新渲染结束
			var t = this;
			//加载完后回调事件
			var keys = t.getLeafKeys();
			if (!!t.state.onLoad && !!t.state.data[0]) t.state.onLoad({ leafNode: keys.leafNode, leafKeys: keys.leafKeys });
		}
	}, {
		key: 'shouldComponentUpdate',
		value: function shouldComponentUpdate(nextProps, nextState) {
			var t = this;
			var oldProps = _extends({}, t.props);
			var newProps = _extends({}, nextProps);
			var oldState = _extends({}, t.state);
			var newState = _extends({}, nextState);
			delete oldProps.onClick;
			delete oldProps.onCheck;
			delete oldProps.onLoadData;
			delete oldProps.onExpand;
			delete oldProps.onRightClick;
			delete oldProps.onLoad;
			delete oldProps.searchInput;

			delete newProps.onClick;
			delete newProps.onCheck;
			delete newProps.onLoadData;
			delete newProps.onExpand;
			delete newProps.onRightClick;
			delete newProps.onLoad;
			delete newProps.searchInput;

			delete oldState.onLoad;
			delete newState.onLoad;
			return !(0, _isEqual3.default)(oldProps, newProps) || !(0, _isEqual3.default)(oldState, newState);
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			//已加载组件，收到新的参数时调用
			var t = this;
			t.setState({
				isExpandAll: nextProps.isExpandAll ? nextProps.isExpandAll : t.state.isExpandAll,
				selectedKeys: nextProps.selectedKeys ? nextProps.selectedKeys : t.state.selectedKeys,
				expandedKeys: nextProps.expandedKeys ? nextProps.expandedKeys : t.state.expandedKeys,
				autoExpandParent: 'autoExpandParent' in nextProps ? nextProps.autoExpandParent : t.state.autoExpandParent,
				data: nextProps.data ? nextProps.data : t.state.data,
				onLoad: nextProps.onLoad
			});
		}
	}]);

	return VtxTree;
}(_react2.default.Component);

exports.default = VtxTree;
module.exports = exports['default'];