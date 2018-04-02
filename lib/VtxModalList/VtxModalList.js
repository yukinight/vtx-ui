'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./VtxModalList.less');

var _tooltip = require('antd/lib/tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

require('antd/lib/tooltip/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import jq from 'jquery';

var VtxModalList = function (_React$Component) {
    _inherits(VtxModalList, _React$Component);

    function VtxModalList(props) {
        _classCallCheck(this, VtxModalList);

        var _this = _possibleConstructorReturn(this, (VtxModalList.__proto__ || Object.getPrototypeOf(VtxModalList)).call(this, props));

        _this.repeteList = {};
        _this.state = {
            //新增时不做验证判断.
            isRequired: props.isRequired || false,
            isRefresh: 0,
            repeteLoading: []
        };
        return _this;
    }

    _createClass(VtxModalList, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            //已加载组件，收到新的参数时调用
            var t = this;
            if (t.props.visible != nextProps.visible) {
                t.setState({
                    isRequired: nextProps.isRequired
                });
            }
        }
        /*
            重复验证 ajax
            options:
            url 请求地址
            body 请求参数
            method 请求方式 默认 post
            返回数据格式: 
            {
                msg: '',
                //0接口成功,1接口失败
                result: 0,
                //true不重复,false 重复
                data: true
            }
           */

    }, {
        key: 'repeteAjax',
        value: function repeteAjax() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var ajaxPropmise = new Promise(function (resolve, reject) {
                $.ajax({
                    type: options.method || 'post',
                    url: options.url || '',
                    data: options.body || null,
                    dataType: 'json',
                    async: true,
                    success: function success(data) {
                        resolve(data);
                    },
                    error: function error(XMLHttpRequest, textStatus, errorThrown) {
                        reject(textStatus);
                    }
                });
            });
            return ajaxPropmise.then(function (data) {
                return { data: data };
            }).catch(function (err) {
                return new Promise(function (resolve, reject) {
                    resolve({ result: 1, data: false });
                });
            });
        }
        //处理props.children

    }, {
        key: 'renderChildren',
        value: function renderChildren() {
            var t = this;
            var chil = t.props.children;
            if (!!chil) {
                if (!chil.length) {
                    return t.cloneComponent(this.props.children);
                } else {
                    var elems = chil.map(function (item, index) {
                        return t.cloneComponent(item, index);
                    });
                    return elems;
                }
            }
        }
        /*
            复制Element对象,并做重复功能处理
            input特殊处理onChange事件,增加正则判断
            select,input,treeSelect做非空验证处理
         */

    }, {
        key: 'cloneComponent',
        value: function cloneComponent(elem, index) {
            var t = this,
                mld = elem.props['data-modallist'] || {},
                reg = mld.regexp || {};
            var ty = (mld.layout || {}).type || 'default';
            var isInherit = function isInherit() {
                if (typeof elem.type == 'function') {
                    switch (elem.type.name.toLocaleLowerCase()) {
                        case 'stateinput':
                            return true;
                            break;
                        case 'stateselect':
                            return true;
                            break;
                        case 'vtxtreeselect':
                            return true;
                            break;
                        case 'vtxyearpicker':
                            return true;
                            break;
                    }
                }
                return false;
            };
            var e = _react2.default.cloneElement(elem, _extends({}, elem.props, {
                'data-modallist': '',
                style: _extends({}, elem.props.style, {
                    width: '100%'
                })
            }, isInherit() ? { inherit: true } : {}, elem.props.prefixCls && elem.props.prefixCls == "ant-input" || (mld.layout || {}).comType == 'input' ? { onBlur: function onBlur(e) {
                    if ('onBlur' in elem.props && typeof elem.props.onBlur == 'function') {
                        elem.props.onBlur(e);
                    }
                    if (reg.repete && e.target.value) {
                        t.setState({
                            repeteLoading: [index]
                        });
                        t.repeteAjax({
                            url: (reg.repete || {}).url || '',
                            body: (reg.repete || {}).key || null
                        }).then(function (_ref) {
                            var data = _ref.data;

                            t.repeteList[index] = _extends({}, t.repeteList[index], {
                                isRepete: data.data,
                                errorMsg: data.msg || ''
                            });
                            t.setState({
                                //刷新用
                                isRefresh: +t.state.isRefresh,
                                repeteLoading: []
                            });
                        });
                    }
                } } : {}, (elem.props.prefixCls && elem.props.prefixCls == "ant-input" || (mld.layout || {}).comType == 'input') && 'onChange' in elem.props && typeof elem.props.onChange == 'function' ? { onChange: function onChange(e) {
                    var value = e.target.value,
                        required = true;
                    if (!!reg.exp) {
                        if (reg.exp instanceof RegExp) {
                            required = reg.exp.test(value);
                        } else if (reg.exp instanceof Function) {
                            required = reg.exp(value);
                        } else {
                            console.error('参数reg: 格式不是验证方法或正则表达式!');
                        }
                    }
                    if (required || value === '') {
                        elem.props.onChange(e);
                    }
                } } : {}));
            t.repeteList[index] = _extends({
                isRepete: true }, t.repeteList[index] || {}, reg, {
                mld: mld,
                type: ty,
                elem: e
            });

            var _t$verify = t.verify(reg.value, mld, index, reg.repete),
                required = _t$verify.required,
                errorMsg = _t$verify.errorMsg;

            return _react2.default.createElement(
                LayoutComponent,
                _extends({
                    key: index
                }, (elem.props['data-modallist'] || {}).layout || {}),
                ty == 'default' ? _react2.default.createElement(
                    VerificationComponent,
                    {
                        required: required,
                        errorMsg: errorMsg,
                        isLoading: t.state.repeteLoading.indexOf(index) > -1
                    },
                    e,
                    (elem.props.prefixCls && elem.props.prefixCls == "ant-input" || (mld.layout || {}).comType == 'input') && !!(mld.layout || {}).maxNum ? _react2.default.createElement(
                        'div',
                        { className: 'input_hint' },
                        (elem.props.value || '').length + '/' + mld.layout.maxNum
                    ) : '',
                    t.state.repeteLoading.indexOf(index) > -1 ? _react2.default.createElement(_icon2.default, { type: 'loading', className: 'vtx-ui-modallist-loading-icon' }) : ''
                ) : e
            );
        }
        //数据验证展示

    }, {
        key: 'verify',
        value: function verify() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var mld = arguments[1];
            var index = arguments[2];
            var repete = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

            var t = this,
                isRequired = t.state.isRequired,
                reg = mld.regexp || {};
            var required = true,
                errorMsg = '';
            /*
                值为空时,不验证重复,验证是否为空等
                值不为空时,验证重复,和验证其他状态
             */
            if (!value && (mld.layout || {}).require) {
                //全局判断是不是不验证状态 isRequired==true时不执行验证
                if (!isRequired) {
                    required = false;
                    errorMsg = '必填项';
                }
            } else {
                //判断是否重复
                if (!t.repeteList[index].isRepete && !!repete) {
                    required = false;
                    errorMsg = t.repeteList[index].errorMsg ? t.repeteList[index].errorMsg : '字段重复';
                } else {
                    if (!!reg.exp && !isRequired && value) {
                        if (reg.exp instanceof RegExp) {
                            required = reg.exp.test(value);
                            errorMsg = '数据不符合规范';
                        } else if (reg.exp instanceof Function) {
                            required = reg.exp(value);
                            errorMsg = '数据不符合规范';
                        } else {
                            console.error('参数reg: 格式不是验证方法或正则表达式!');
                        }
                    }
                }
            }
            return { required: required, errorMsg: errorMsg };
        }
        //外部调用 清空验证的方法

    }, {
        key: 'clear',
        value: function clear() {
            var t = this;
            for (var i in t.repeteList) {
                t.repeteList[i].isRepete = true;
            }
            t.setState({
                isRequired: true
            });
        }
        //外部调用 保存前的统一验证方法
        //返回Promise 

    }, {
        key: 'submit',
        value: function submit() {
            var t = this;
            t.setState({
                isRequired: false
            });
            return new Promise(function (resolve, reject) {
                //先做正则判断,避免发送多余请求
                for (var i in t.repeteList) {
                    var r = t.repeteList[i];
                    if (r.type == 'default') {
                        //重新验证一遍
                        //必填项 值为空
                        if ((r.mld.layout || {}).require && !r.value) {
                            resolve(false);
                            break;
                        }
                        //有值  做正则判断
                        if (r.value) {
                            var reg = r.mld.regexp || {},
                                required = true;
                            if (!!reg.exp) {
                                if (reg.exp instanceof RegExp) {
                                    required = reg.exp.test(r.value);
                                } else if (reg.exp instanceof Function) {
                                    required = reg.exp(r.value);
                                } else {
                                    console.error('参数reg: 格式不是验证方法或正则表达式!');
                                }
                            }
                            //正则不匹配 跳过
                            if (!required) {
                                resolve(false);
                                break;
                            }
                        }
                    }
                }
                resolve(true);
            }).then(function (data) {
                if (data) {
                    //正则判断完后,再发送请求,确认是否重复
                    var plist = [],
                        ii = [];
                    for (var i in t.repeteList) {
                        var r = t.repeteList[i];
                        if (r.type == 'default' && r.repete) {
                            var p = t.repeteAjax({
                                url: (r.repete || {}).url || '',
                                body: (r.repete || {}).key || null
                            });
                            plist.push(p);
                            ii.push(i);
                        }
                    }
                    return Promise.all(plist).then(function (values) {
                        var isRequest = true;
                        for (var _i = 0; _i < values.length; _i++) {
                            if (!values[_i].data.data) {
                                t.repeteList[ii[_i]] = _extends({}, t.repeteList[ii[_i]], {
                                    isRepete: values[_i].data.data,
                                    errorMsg: values[_i].data.msg || ''
                                });
                                isRequest = false;
                            }
                        }
                        return new Promise(function (resolve, reject) {
                            t.setState({
                                isRefresh: +t.state.isRefresh
                            });
                            resolve(isRequest);
                        });
                    });
                } else {
                    return new Promise(function (resolve, reject) {
                        resolve(false);
                    });
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            return _react2.default.createElement(
                'div',
                { className: 'vtx-ui-modallist-lists' },
                t.renderChildren()
            );
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var t = this;
            t.clear();
        }
    }]);

    return VtxModalList;
}(_react2.default.Component);
/*
    验证布局
    required 是否验证错误
    errorMsg 错误提示信息
 */


function VerificationComponent(props) {
    var required = props.required,
        _props$errorMsg = props.errorMsg,
        errorMsg = _props$errorMsg === undefined ? '' : _props$errorMsg,
        isLoading = props.isLoading,
        children = props.children;

    return _react2.default.createElement(
        'div',
        {
            className: '' + (required || isLoading ? 'vtx-ui-modallist-verificat' : 'vtx-ui-modallist-error'),
            'data-errormsg': errorMsg
        },
        children,
        required || isLoading ? '' : _react2.default.createElement(_icon2.default, { type: 'close-circle', className: 'vtx-ui-modallist-error-icon' })
    );
}
/*
    layout 弹框布局
    children 子节点
    name 字段名称
    require 是否必填
    width 宽度占比
    className 自定义样式
    type 展示类型
    style 自定义内连样式
 */
function LayoutComponent(props) {
    var children = props.children,
        name = props.name,
        require = props.require,
        width = props.width,
        className = props.className,
        _props$type = props.type,
        type = _props$type === undefined ? 'default' : _props$type,
        _props$style = props.style,
        style = _props$style === undefined ? {} : _props$style;

    width = type == 'title' ? 100 : width;
    return _react2.default.createElement(
        'div',
        {
            className: (name ? 'vtx-ui-modallist-list_pl' : 'vtx-ui-modallist-list_p0') + ' ' + (type == 'title' ? 'vtx-ui-modallist-list-title' : '') + ' ' + className,
            style: _extends({}, style, { width: width + '%' })
        },
        name ? _react2.default.createElement(
            _tooltip2.default,
            { placement: 'top', title: name },
            _react2.default.createElement(
                'span',
                { className: 'vtx-ui-modallist-list-left', 'data-mh': '：' },
                require ? _react2.default.createElement(
                    'span',
                    { className: 'vtx-ui-modallist-list-require' },
                    '*'
                ) : '',
                name
            )
        ) : '',
        type == 'text' || type == 'title' ? _react2.default.createElement(
            'span',
            { className: 'vtx-ui-modallist-list-right-text' },
            children
        ) : '',
        type == 'default' ? _react2.default.createElement(
            'div',
            { className: 'vtx-ui-modallist-list-right' },
            children
        ) : ''
    );
}
exports.default = VtxModalList;
module.exports = exports['default'];