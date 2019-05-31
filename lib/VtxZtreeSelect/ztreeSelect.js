'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _popover = require('antd/lib/popover');

var _popover2 = _interopRequireDefault(_popover);

require('antd/lib/popover/style/css');

var _input = require('antd/lib/input');

var _input2 = _interopRequireDefault(_input);

require('antd/lib/input/style/css');

var _tag = require('antd/lib/tag');

var _tag2 = _interopRequireDefault(_tag);

require('antd/lib/tag/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

var _VtxZtree = require('../VtxZtree/VtxZtree');

var _VtxZtree2 = _interopRequireDefault(_VtxZtree);

require('./ztreeSelect.css');

var _isEqual2 = require('lodash/isEqual');

var _isEqual3 = _interopRequireDefault(_isEqual2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SelectZTree = function (_React$Component) {
    _inherits(SelectZTree, _React$Component);

    function SelectZTree(props) {
        _classCallCheck(this, SelectZTree);

        var _this = _possibleConstructorReturn(this, (SelectZTree.__proto__ || Object.getPrototypeOf(SelectZTree)).call(this, props));

        _this.input = null;
        _this.tree = null;
        _this.treeRefreshFlag = 1;
        _this.state = {
            popoverVisible: false
        };
        _this.keyNodesMapping = {};
        _this.getKeyNodesMapping();
        return _this;
    }

    _createClass(SelectZTree, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (!(0, _isEqual3.default)(this.props.data, nextProps.data)) {
                this.getKeyNodesMapping(nextProps.data);
            }
            if (!(0, _isEqual3.default)(this.props.expandedKeys, nextProps.expandedKeys)) {
                this.treeRefreshFlag++;
            }
        }
    }, {
        key: 'getKeyNodesMapping',
        value: function getKeyNodesMapping(nodes) {
            var t = this;
            t.keyNodesMapping = {};
            (function genNodes(nodes) {
                nodes.map(function (item) {
                    var children = item.children,
                        other = _objectWithoutProperties(item, ['children']);

                    t.keyNodesMapping[item.key] = other;
                    if (Array.isArray(item.children) && item.children.length > 0) {
                        genNodes(item.children);
                    }
                });
            })(nodes || this.props.data || []);
        }
    }, {
        key: 'clear',
        value: function clear() {
            if (this.tree) {
                if (this.props.treeCheckable) {
                    this.tree.checkNodes(this.tree.getCheckedNodes().map(function (item) {
                        return item.key;
                    }), false);
                } else {
                    this.tree.cancelSelectedNodes(this.props.value);
                }
            }
            this.props.onChange && this.props.onChange({
                nodes: [],
                keys: [],
                leafKeys: [],
                names: []
            });
        }
    }, {
        key: 'clearKey',
        value: function clearKey(key) {
            var _this2 = this;

            var keyIndex = this.props.value.indexOf(key);
            if (keyIndex != -1) {
                var keyList = [].concat(_toConsumableArray(this.props.value));
                keyList.splice(keyIndex, 1);
                var nodes = keyList.map(function (key) {
                    return _this2.keyNodesMapping[key];
                });
                if (this.tree) {
                    if (this.props.treeCheckable) {
                        this.tree.checkNodes([key], false);
                        // nodes = this.tree.getCheckedNodes();
                    } else {
                        this.tree.cancelSelectedNodes([key]);
                        // nodes = this.tree.getSelectedNodes();
                    }
                }
                this.props.onChange && this.props.onChange({
                    nodes: nodes,
                    keys: keyList,
                    leafKeys: nodes.filter(function (item) {
                        return item.isLeaf;
                    }).map(function (item) {
                        return item.key;
                    }),
                    names: nodes.map(function (item) {
                        return item.name;
                    })
                });
            }
        }
    }, {
        key: 'clearSearch',
        value: function clearSearch() {
            this.tree && this.tree.clearSearch();
        }
    }, {
        key: 'render',
        value: function render() {
            var _treeProps;

            var t = this;
            // 必填参数
            var _t$props = t.props,
                data = _t$props.data,
                value = _t$props.value;
            // 可配参数

            var _t$props2 = t.props,
                _t$props2$treeCheckab = _t$props2.treeCheckable,
                treeCheckable = _t$props2$treeCheckab === undefined ? false : _t$props2$treeCheckab,
                _t$props2$treeDefault = _t$props2.treeDefaultExpandAll,
                treeDefaultExpandAll = _t$props2$treeDefault === undefined ? false : _t$props2$treeDefault,
                _t$props2$multiple = _t$props2.multiple,
                multiple = _t$props2$multiple === undefined ? false : _t$props2$multiple,
                _t$props2$showSearch = _t$props2.showSearch,
                showSearch = _t$props2$showSearch === undefined ? false : _t$props2$showSearch,
                _t$props2$dropdownSty = _t$props2.dropdownStyle,
                dropdownStyle = _t$props2$dropdownSty === undefined ? {} : _t$props2$dropdownSty,
                _t$props2$style = _t$props2.style,
                style = _t$props2$style === undefined ? {} : _t$props2$style,
                _t$props2$disabled = _t$props2.disabled,
                disabled = _t$props2$disabled === undefined ? false : _t$props2$disabled,
                _t$props2$refreshFlag = _t$props2.refreshFlag,
                refreshFlag = _t$props2$refreshFlag === undefined ? null : _t$props2$refreshFlag,
                expandedKeys = _t$props2.expandedKeys,
                customCfg = _t$props2.customCfg,
                checkStrictly = _t$props2.checkStrictly;

            var value_arr = function (val) {
                if (Array.isArray(val)) {
                    return val;
                } else if (val) {
                    return [val];
                } else {
                    return [];
                }
            }(value);
            var selectedNodes = value_arr.filter(function (k) {
                return k in t.keyNodesMapping;
            }).map(function (item) {
                return {
                    id: item,
                    name: t.keyNodesMapping[item].name
                };
            });
            // ztree配置
            var treeProps = (_treeProps = {
                data: data, //树的数据
                isShowSearchInput: showSearch,
                multiple: multiple,
                checkable: treeCheckable
            }, _defineProperty(_treeProps, treeCheckable ? 'checkedKeys' : 'selectedKeys', value_arr), _defineProperty(_treeProps, 'defaultExpandAll', treeDefaultExpandAll), _defineProperty(_treeProps, 'expandedKeys', expandedKeys), _defineProperty(_treeProps, 'refreshFlag', refreshFlag || t.treeRefreshFlag), _defineProperty(_treeProps, 'customCfg', customCfg), _defineProperty(_treeProps, 'checkStrictly', checkStrictly), _defineProperty(_treeProps, 'ref', function ref(instance) {
                if (instance) t.tree = instance;
            }), _defineProperty(_treeProps, 'onClick', function onClick(_ref) {
                var selectedNodes = _ref.selectedNodes,
                    selectedKeys = _ref.selectedKeys,
                    selectedNames = _ref.selectedNames;

                // console.log(selectedNodes,selectedKeys,selectedNames)
                if (!treeCheckable) {
                    t.props.onChange && t.props.onChange({
                        nodes: selectedNodes,
                        keys: selectedKeys,
                        leafKeys: selectedNodes.filter(function (item) {
                            return item.isLeaf;
                        }).map(function (item) {
                            return item.key;
                        }),
                        names: selectedNames
                    });
                    if (!multiple) {
                        t.setState({
                            popoverVisible: false
                        });
                    }
                }
            }), _defineProperty(_treeProps, 'onCheck', function onCheck(_ref2) {
                var checkedNodes = _ref2.checkedNodes,
                    checkedKeys = _ref2.checkedKeys,
                    checkedNames = _ref2.checkedNames;

                // console.log({checkedNodes,checkedKeys,checkedNames })
                if (treeCheckable) {
                    t.props.onChange && t.props.onChange({
                        nodes: checkedNodes,
                        keys: checkedKeys,
                        leafKeys: checkedNodes.filter(function (item) {
                            return item.isLeaf;
                        }).map(function (item) {
                            return item.key;
                        }),
                        names: checkedNames
                    });
                }
            }), _defineProperty(_treeProps, 'beforeCheck', function beforeCheck(treeNode) {
                return t.props.beforeCheck ? t.props.beforeCheck(treeNode) : true;
            }), _treeProps);
            // popover配置
            var popoverProps = _extends({}, this.props, {
                hidePopover: function hidePopover() {
                    t.setState({ popoverVisible: false });
                }

                // 多选组件
            });var MultiSelect = _react2.default.createElement(
                'div',
                { className: 'ant-input vtx-ui-ztree-select-mselect', style: _extends({ height: 'auto', minHeight: '28px' }, style) },
                selectedNodes.length > 0 ? [selectedNodes.map(function (item, index) {
                    return _react2.default.createElement(
                        _tag2.default,
                        { key: item.id, closable: !disabled,
                            onClose: function onClose(e) {
                                e.stopPropagation();
                            },
                            afterClose: function afterClose() {
                                t.clearKey(item.id);
                            } },
                        item.name.length > 20 ? item.name.slice(0, 20) + '...' : item.name
                    );
                }), disabled ? null : _react2.default.createElement(_icon2.default, { key: 'icon', className: 'close-icon', type: 'close-circle', onClick: function onClick(e) {
                        e.stopPropagation();
                        t.clear();
                    }, style: { cursor: 'pointer' } })] : _react2.default.createElement(
                    'span',
                    { className: 'vtx-ui-ztree-select-placehoder' },
                    t.props.placeholder
                ) || null
            );

            // 单选组件
            var SingleSelect = _react2.default.createElement(_input2.default, { ref: function ref(t) {
                    if (t) t.input = t;
                },
                value: selectedNodes.map(function (item) {
                    return item.name;
                }).join(', '),
                style: style,
                readOnly: true,
                placeholder: t.props.placeholder,
                suffix: disabled || selectedNodes.length == 0 ? null : _react2.default.createElement(_icon2.default, { type: 'close-circle', onClick: t.clear.bind(t), style: { cursor: 'pointer' } })
            });

            return _react2.default.createElement(
                'div',
                { className: 'vtx-ui-ztree-select' },
                disabled ? multiple || treeCheckable ? MultiSelect : SingleSelect : _react2.default.createElement(
                    _popover2.default,
                    { placement: 'bottomLeft',
                        content: _react2.default.createElement(
                            'div',
                            { className: 'vtx-ui-ztree-select-pop', style: dropdownStyle },
                            _react2.default.createElement(_VtxZtree2.default, treeProps)
                        ),
                        trigger: 'click',
                        onVisibleChange: function onVisibleChange(v) {
                            t.setState({ popoverVisible: v });
                        },
                        visible: t.state.popoverVisible
                    },
                    multiple || treeCheckable ? MultiSelect : SingleSelect
                )
            );
        }
    }]);

    return SelectZTree;
}(_react2.default.Component);

exports.default = SelectZTree;
module.exports = exports['default'];