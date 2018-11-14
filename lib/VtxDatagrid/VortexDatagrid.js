'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _table = require('antd/lib/table');

var _table2 = _interopRequireDefault(_table);

require('antd/lib/table/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

var _popconfirm = require('antd/lib/popconfirm');

var _popconfirm2 = _interopRequireDefault(_popconfirm);

require('antd/lib/popconfirm/style/css');

var _tooltip = require('antd/lib/tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

require('antd/lib/tooltip/style/css');

var _checkbox = require('antd/lib/checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

require('antd/lib/checkbox/style/css');

var _popover = require('antd/lib/popover');

var _popover2 = _interopRequireDefault(_popover);

require('antd/lib/popover/style/css');

require('./VortexDatagrid.less');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
    autoHeightcontainer: 'vtx-ui-datagrid-autoheightcontainer',
    nowrap: 'vtx-ui-datagrid-nowrap',
    ct: 'vtx-ui-datagrid-ct',
    nowrapOverflow: 'vtx-ui-datagrid-nowrapoverflow',
    titleSelectionContainer: 'vtx-ui-datagrid-titleselectioncontainer',
    columnBt: 'vtx-ui-datagrid-columnbt',
    indexColumn: 'vtx-ui-datagrid-indexcolumn'
};

var VortexDatagrid = function (_React$Component) {
    _inherits(VortexDatagrid, _React$Component);

    function VortexDatagrid(props) {
        _classCallCheck(this, VortexDatagrid);

        var _this = _possibleConstructorReturn(this, (VortexDatagrid.__proto__ || Object.getPrototypeOf(VortexDatagrid)).call(this, props));

        _this.id = 'vtxdg' + new Date().getTime();
        // 表头和分页组件的高度，用来计算表格body的高度
        _this.headFootHeight = props.headFootHeight || 115;
        _this.state = {
            autoFit: props.autoFit,
            nowrap: _this.ifNowrap(),
            bodyHeight: null,
            // columnConfig: this.columnHandler(),
            columnsVisibility: props.columns.map(function (item) {
                return { title: item.title, key: item.key, visible: true };
            })
        };
        _this.resetHeight = _this.resetHeight.bind(_this);
        return _this;
    }

    _createClass(VortexDatagrid, [{
        key: 'resetHeight',
        value: function resetHeight() {
            var bodyHeight = document.getElementById(this.id).scrollHeight - this.headFootHeight;
            this.setState({
                bodyHeight: bodyHeight
            });
            var divs = document.getElementById(this.id).getElementsByTagName('div');
            var bodyDiv = Array.prototype.filter.call(divs, function (dom) {
                return dom.className == 'ant-table-body';
            })[0];
            bodyDiv.style.minHeight = bodyHeight + 'px';
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var t = this;
            // 自适应高度
            if (t.state.autoFit) {
                setTimeout(function () {
                    t.resetHeight();
                }, 1);
                window.addEventListener('resize', t.resetHeight, false);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var t = this;
            if (t.state.autoFit) {
                window.removeEventListener('resize', t.resetHeight, false);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            //重新渲染结束
            var t = this;
            if (t.state.bodyHeight != document.getElementById(this.id).scrollHeight - this.headFootHeight) {
                if (t.state.autoFit) {
                    setTimeout(function () {
                        t.resetHeight();
                    }, 1);
                }
            }
        }
        // 表格是否有不允许换行的列

    }, {
        key: 'ifNowrap',
        value: function ifNowrap() {
            var columns = this.props.columns;
            for (var i = 0, len = columns.length; i < len; i++) {
                if (columns[i].nowrap) return true;
            }
            return false;
        }
        // 封装column配置项

    }, {
        key: 'columnHandler',
        value: function columnHandler(props) {
            var t = this;
            props = props || this.props;
            var columnConfig = props.columns.map(function (col, index) {
                var newCol = _extends({}, col);
                // let title = newCol.title;
                // newCol.preTitle = title;
                // newCol.title = <span onContextMenu={()=>{alert(title)}}>{title}</span>
                // 配置按钮操作列
                if (col.renderButtons) {
                    delete newCol.renderButtons;
                    newCol.render = function (text, record, index) {
                        return t.generateButtons(col.renderButtons, record, text, index);
                    };
                }
                // 不允许换行列的处理
                if (col.nowrap) {
                    delete newCol.nowrap;
                    newCol.className = styles.nowrapOverflow;
                    if (typeof newCol.render == 'function') {
                        var oldRender = newCol.render;
                        newCol.render = function (text, record) {
                            if (text === null || text === undefined) text = '';
                            return _react2.default.createElement(
                                _tooltip2.default,
                                { title: oldRender(text, record), placement: 'topLeft' },
                                oldRender(text, record)
                            );
                        };
                    } else {
                        newCol.render = function (text, record) {
                            if (text === null || text === undefined) text = '';
                            return _react2.default.createElement(
                                _tooltip2.default,
                                { title: _react2.default.createElement(
                                        'span',
                                        null,
                                        text
                                    ), placement: 'topLeft' },
                                text
                            );
                        };
                    }
                }
                return newCol;
            });
            // 序列号处理
            if (props.indexColumn) {
                columnConfig.unshift({
                    title: props.indexTitle || ' ',
                    dataIndex: 'rIndex',
                    key: 'rIndex',
                    width: 50,
                    className: styles.indexColumn
                });
            }

            return columnConfig;
        }
    }, {
        key: 'changeColumnVisibility',
        value: function changeColumnVisibility(key, visible) {
            this.setState({
                columnsVisibility: this.state.columnsVisibility.map(function (item) {
                    if (item.key == key) {
                        return _extends({}, item, {
                            visible: visible
                        });
                    }
                    return item;
                })
            });
        }
    }, {
        key: 'generateButtons',
        value: function generateButtons(btList, rowData, text, index) {
            var btnList = typeof btList === "function" ? btList(text, rowData, index) : btList;
            return _react2.default.createElement(
                'span',
                null,
                btnList.map(function (bt, bt_index) {
                    switch (bt.name) {
                        /*case '编辑': return (
                            <span key={bt_index}>
                                {bt_index==0?null: <span className="ant-divider" />}
                                <a onClick={()=>{
                                    if(typeof(bt.onClick)=='function'){
                                        bt.onClick(rowData);
                                    }
                                }}>{bt.name}</a>
                            </span>
                        );*/
                        case '删除':
                            return _react2.default.createElement(
                                'span',
                                { key: bt_index },
                                bt_index == 0 ? null : _react2.default.createElement('span', { className: 'ant-divider' }),
                                _react2.default.createElement(
                                    _popconfirm2.default,
                                    { title: '\u786E\u5B9A\u5220\u9664\u5417\uFF1F', okText: '\u786E\u5B9A', cancelText: '\u53D6\u6D88', onConfirm: function onConfirm() {
                                            if (typeof bt.onClick == 'function') {
                                                bt.onClick(rowData);
                                            }
                                        } },
                                    _react2.default.createElement(
                                        'a',
                                        null,
                                        bt.name
                                    )
                                )
                            );
                        default:
                            return _react2.default.createElement(
                                'span',
                                { key: bt_index },
                                bt_index == 0 ? null : _react2.default.createElement('span', { className: 'ant-divider' }),
                                _react2.default.createElement(
                                    'a',
                                    { onClick: function onClick() {
                                            if (typeof bt.onClick == 'function') {
                                                bt.onClick(rowData);
                                            }
                                        } },
                                    bt.name
                                )
                            );
                    }
                })
            );
        }
    }, {
        key: 'getNewProps',
        value: function getNewProps() {
            var t = this;
            var deletedTitles = t.state.columnsVisibility.filter(function (item) {
                return !item.visible;
            }).map(function (item) {
                return item.key;
            });

            var newProps = _extends({}, t.props, {
                columns: t.columnHandler().filter(function (item) {
                    return deletedTitles.indexOf(item.key) == -1;
                })
                // 自适应处理
            });if (newProps.autoFit) {
                delete newProps.autoFit;
                if (newProps.scroll) {
                    newProps.scroll = _extends({}, newProps.scroll, {
                        y: t.state.bodyHeight
                    });
                } else {
                    newProps.scroll = {
                        y: t.state.bodyHeight
                    };
                }
            }
            // 序列号处理
            if (newProps.indexColumn) {
                delete newProps.indexColumn;
                var startIndex = typeof newProps.startIndex == 'number' ? newProps.startIndex : 1;
                delete newProps.startIndex;
                newProps.dataSource = newProps.dataSource.map(function (item, index) {
                    return _extends({}, item, {
                        rIndex: index + startIndex
                    });
                });
            }

            return newProps;
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var containerClasses = [styles.ct];
            if (t.state.autoFit) {
                containerClasses.push(styles.autoHeightcontainer);
            }
            if (t.state.nowrap) {
                containerClasses.push(styles.nowrap);
            }

            return _react2.default.createElement(
                'div',
                { id: t.id, className: containerClasses.join(' ') },
                _react2.default.createElement(_table2.default, _extends({}, t.getNewProps(), { className: styles.data_tb })),
                t.props.hideColumn ? _react2.default.createElement(
                    _popover2.default,
                    { placement: 'bottomRight', title: '隐藏显示列', content: _react2.default.createElement(
                            'div',
                            { className: styles.titleSelectionContainer },
                            t.state.columnsVisibility.map(function (item, index) {
                                return _react2.default.createElement(
                                    _checkbox2.default,
                                    { key: index, checked: item.visible, onChange: function onChange(e) {
                                            t.changeColumnVisibility(item.key, e.target.checked);
                                        } },
                                    item.title
                                );
                            })
                        ), trigger: 'click' },
                    _react2.default.createElement(_icon2.default, { type: 'setting', className: styles.columnBt })
                ) : null
            );
        }
    }]);

    return VortexDatagrid;
}(_react2.default.Component);

exports.default = VortexDatagrid;
module.exports = exports['default'];