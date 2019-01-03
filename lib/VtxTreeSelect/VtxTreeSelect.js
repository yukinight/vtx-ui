'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./VtxTreeSelect.css');

var _isEqual2 = require('lodash/isEqual');

var _isEqual3 = _interopRequireDefault(_isEqual2);

var _treeSelect = require('antd/lib/tree-select');

var _treeSelect2 = _interopRequireDefault(_treeSelect);

require('antd/lib/tree-select/style/css');

var _tooltip = require('antd/lib/tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

require('antd/lib/tooltip/style/css');

var _tree = require('antd/lib/tree');

var _tree2 = _interopRequireDefault(_tree);

require('antd/lib/tree/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
    error: 'vtx-ui-tree-select-error',
    dis_none: 'vtx-ui-tree-select-dis_none'
};

var TreeNode = _tree2.default.TreeNode;

var VtxTreeSelect = function (_React$Component) {
    _inherits(VtxTreeSelect, _React$Component);

    function VtxTreeSelect(props) {
        _classCallCheck(this, VtxTreeSelect);

        var _this = _possibleConstructorReturn(this, (VtxTreeSelect.__proto__ || Object.getPrototypeOf(VtxTreeSelect)).call(this, props));

        _this.disableCheckboxKeys = [];
        _this.disableKeys = [];
        _this.id = 'treeSelect' + new Date().getTime() + Math.random();
        _this.state = {
            value: [],
            data: _this.dealNonentityData(props.data, props.value, props.labels)
        };
        return _this;
    }
    //处理值在树中不存在的情况


    _createClass(VtxTreeSelect, [{
        key: 'dealNonentityData',
        value: function dealNonentityData(data) {
            var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
            var labels = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

            var t = this;
            var allkeys = [],
                noKeys = [],
                d = [].concat(_toConsumableArray(data));
            var loop = function loop(item, index) {
                allkeys.push(item.key);
                if ('children' in item && t.isArray(item.children)) {
                    t.traverse(item.children, loop);
                }
            };
            t.traverse(data, loop);
            for (var i = 0; i < keys.length; i++) {
                if (allkeys.indexOf(keys[i]) == -1) {
                    noKeys.push(keys[i]);
                }
            }
            for (var j = 0; j < labels.length; j++) {
                if (noKeys.indexOf(labels[j].key) > -1) {
                    d.push(_extends({}, labels[j], {
                        isHidden: true
                    }));
                }
            }
            return d;
        }
    }, {
        key: 'onChange',
        value: function onChange(value, label, extra) {
            var t = this,
                v = [],
                l = [],
                treeNodes = [];
            //单选时,返回的value是字符串,转成数组统一操作
            if (typeof value === 'string') {
                value = [value];
            }
            //判断当前选择的节点是否是disabled的数据
            if (value && t.disableKeys.indexOf(value[value.length - 1]) !== -1) {
                return false;
            }
            //v == value 未disabled的value,l == label未disabled的label;
            if ('onChange' in t.props && typeof t.props.onChange === 'function') {
                if (t.props.treeCheckable) {
                    //多选时
                    value.map(function (item, index) {
                        if (t.disableCheckboxKeys.indexOf(item) == -1) {
                            var tn = t.getTreeNodeByKey(t.props.data, item);
                            if (tn.isNeed) {
                                treeNodes.push(tn.treeNode);
                                v.push(item);
                                l.push(label[index]);
                            }
                        }
                    });
                    t.props.onChange({ allValue: value, allLabel: label, value: v, label: l, treeNodes: treeNodes, extra: extra });
                } else {
                    t.props.onChange({ allValue: value, allLabel: label, value: value, label: label, treeNodes: treeNodes, extra: extra });
                }
            }
            this.setState({
                value: v || []
            });
        }
        //动态加载树数据

    }, {
        key: 'onLoadData',
        value: function onLoadData(node) {
            var _this2 = this;

            var t = this;
            var key = node.props.eventKey;
            var isExpand = node.props.expanded;
            var treeNode = t.getTreeNodeByKey(t.props.data, key).treeNode;
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
        //通过key获取对应的treeNode

    }, {
        key: 'getTreeNodeByKey',
        value: function getTreeNodeByKey(data, key) {
            var t = this;
            var treeNode = void 0,
                isNeed = true;
            var loop = function loop(item, index, p) {
                if (item.key == key) {
                    treeNode = item;
                    if ('nodeType' in t.props) {
                        if (t.props.nodeType.values.indexOf(item[t.props.nodeType.type]) == -1) {
                            isNeed = false;
                        }
                    }
                    return true;
                }
                if ('children' in item && t.isArray(item.children) && item.children.length > 0) {
                    t.traverse(item.children, loop, item);
                }
            };
            t.traverse(data, loop);
            return { treeNode: treeNode, isNeed: isNeed };
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
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var treeSelect = t.props;
            var TreeSelectProps = _extends({}, treeSelect, {
                style: treeSelect.style || { width: 300 },
                dropdownStyle: treeSelect.dropdownStyle || { maxHeight: 400, overflow: 'auto' },
                value: treeSelect.value || t.state.value,
                treeDefaultExpandedKeys: treeSelect.treeDefaultExpandedKeys || [],

                showSearch: treeSelect.treeCheckable || treeSelect.multiple ? false : treeSelect.showSearch || false,
                multiple: treeSelect.treeCheckable || treeSelect.multiple || false,
                treeCheckable: treeSelect.treeCheckable || false,
                disabled: treeSelect.disabled || false,
                treeDefaultExpandAll: treeSelect.treeDefaultExpandAll || false,

                onChange: t.onChange.bind(t),
                // onSelect: t.onSelect.bind(t),

                treeNodeLabelProp: 'name',
                treeNodeFilterProp: 'name',
                placeholder: treeSelect.placeholder || '',
                searchPlaceholder: treeSelect.searchPlaceholder || ''
                // getPopupContainer: ()=>document.getElementById(this.id)

                //动态加载树数据
            });if ('onLoadData' in treeSelect) {
                if (typeof treeSelect.onLoadData === 'function') TreeSelectProps.loadData = t.onLoadData.bind(t);else console.error('warn: VtxTreeSelect data: onLoadData is not a function!');
            }
            //加载节点树
            var loop = function loop(data) {
                //检索传入树的数据格式是否正确
                if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object' || !data.length && data.length !== 0) {
                    console.error('warn: VtxTreeSelect data: Data type error!');
                    return false;
                }
                var render = data.map(function (item, index) {
                    var name = item.name;
                    var disabledClass = item.disabled || treeSelect.disabledAll ? 'disable' : '';
                    var _title = !!item.icon ? _react2.default.createElement(
                        'div',
                        { className: 'stNode ' + disabledClass, onClick: function onClick(e) {
                                if (item.disabled || treeSelect.disabledAll) {
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                    return false;
                                }
                            } },
                        _react2.default.createElement('i', { className: 'iconfont ' + item.icon + ' ' + (item.iconClassName || '') + ' icf' }),
                        name
                    ) : !!item.img ? _react2.default.createElement(
                        'div',
                        { className: 'stNode ' + disabledClass, onClick: function onClick(e) {
                                if (item.disabled || treeSelect.disabledAll) {
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                    return false;
                                }
                            } },
                        _react2.default.createElement('img', { src: item.img, alt: '', className: 'imgs' }),
                        name
                    ) : _react2.default.createElement(
                        'div',
                        { className: 'stNode ' + disabledClass, onClick: function onClick(e) {
                                if (item.disabled || treeSelect.disabledAll) {
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                    return false;
                                }
                            } },
                        name
                    );
                    _title = _react2.default.createElement(
                        _tooltip2.default,
                        { placement: 'right', title: name },
                        _title
                    );
                    var TreeNodeProps = {
                        // disabled: item.disabled || (treeSelect.disabledAll?true:false),
                        disableCheckbox: item.disableCheckbox || (treeSelect.disableCheckboxAll ? true : false),
                        title: _title,
                        key: item.key,
                        name: name,
                        value: item.key,
                        isLeaf: item.isLeaf || false
                    };
                    return _react2.default.createElement(
                        TreeNode,
                        _extends({}, TreeNodeProps, { className: item.isHidden ? styles.dis_none : '' }),

                        //子节点数据处理,避免数据异常
                        'children' in item && t.isArray(item.children) && item.children.length > 0 ? loop(item.children) : ''
                    );
                });
                return render;
            };
            var requiredCheck = treeSelect.required && this.state.value.length == 0;
            return _react2.default.createElement(
                'div',
                { className: requiredCheck ? styles.error : '',
                    'data-errorMsg': '必填', style: { width: this.props.inherit ? 'inherit' : '', display: 'inline-block' } },
                _react2.default.createElement(
                    _treeSelect2.default,
                    TreeSelectProps,
                    loop(t.state.data)
                ),
                _react2.default.createElement('div', { id: this.id, className: styles.vtxtreeselect })
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var t = this;
            var disableCheckboxKeys = [],
                disableKeys = [];
            var getKeys = function getKeys(data) {
                data.map(function (item, index) {
                    if (item.disabled || t.props.disabledAll) {
                        t.disableKeys.push(item.key);
                    }
                    if (item.disableCheckbox || t.props.disableCheckboxAll) {
                        t.disableCheckboxKeys.push(item.key);
                    }
                    if (t.isArray(item.children)) {
                        getKeys(item.children);
                    }
                });
            };
            //记录下所有disabled的keys,用于阻断选择事件
            getKeys(t.props.data);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            //重新渲染结束
            var t = this;
            var disableCheckboxKeys = [],
                disableKeys = [];
            var getKeys = function getKeys(data) {
                data.map(function (item, index) {
                    if (item.disabled || t.props.disabledAll) {
                        t.disableKeys.push(item.key);
                    }
                    if (item.disableCheckbox || t.props.disableCheckboxAll) {
                        t.disableCheckboxKeys.push(item.key);
                    }
                    if (t.isArray(item.children)) {
                        getKeys(item.children);
                    }
                });
            };
            //记录下所有disabled的keys,用于阻断选择事件
            getKeys(t.props.data);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            //已加载组件，收到新的参数时调用
            var t = this;

            if (!(0, _isEqual3.default)(t.props.data, nextProps.data)) {
                t.setState({
                    data: this.dealNonentityData(nextProps.data, nextProps.value, nextProps.labels)
                });
            }
        }
    }]);

    return VtxTreeSelect;
}(_react2.default.Component);

exports.default = VtxTreeSelect;
module.exports = exports['default'];