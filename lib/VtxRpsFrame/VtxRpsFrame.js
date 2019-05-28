'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./VtxRpsFrame.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
    iframeParent: 'vtx-ui-frame-ct'
};

var VtxRpsFrame = function (_React$Component) {
    _inherits(VtxRpsFrame, _React$Component);

    function VtxRpsFrame() {
        _classCallCheck(this, VtxRpsFrame);

        var _this = _possibleConstructorReturn(this, (VtxRpsFrame.__proto__ || Object.getPrototypeOf(VtxRpsFrame)).call(this));

        _this.iframeName = Math.random() + new Date().getTime();
        return _this;
    }

    _createClass(VtxRpsFrame, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            if (this.props.flag !== nextProps.flag) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.getReportInfoByCode();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.getReportInfoByCode();
        }
    }, {
        key: 'getReportInfoByCode',
        value: function getReportInfoByCode() {
            var t = this;
            var _props = this.props,
                report_code = _props.report_code,
                report_param = _props.report_param,
                data_param = _props.data_param,
                paramTypeCode = _props.paramTypeCode,
                tenantId = _props.tenantId;

            var param = {
                report_code: report_code,
                timestamp: new Date().valueOf(),
                reqMethod: 0
            };
            var paramCode = paramTypeCode || "param_report_constant";
            //获取公共参数
            var commonParamPromise = new Promise(function (resolve, reject) {
                $.ajax({
                    type: 'get',
                    url: '/cloud/management/rest/np/param/getByParamTypeCode?parameters={"paramTypeCode": "' + paramCode + '","tenantId":"' + tenantId + '"}',
                    // data: postData,
                    dataType: 'json',
                    'content-type': "application/x-www-form-urlencoded",
                    cache: false,
                    success: function success(data) {
                        resolve(data);
                    },
                    error: function error(XMLHttpRequest, textStatus, errorThrown) {
                        reject(textStatus);
                    }
                });
            });
            //获取报表code
            var getReportInfoByCodePromise = new Promise(function (resolve, reject) {
                $.ajax({
                    type: 'get',
                    url: '/cloud/rps/api/np/v101/report/getReportInfoByCode.smvc',
                    data: { parameters: JSON.stringify(param) },
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
            Promise.all([commonParamPromise, getReportInfoByCodePromise]).then(function (data) {
                var commonParamResult = data[0];
                var reportInfoByCodeResult = data[1];
                if (!commonParamResult.result && !reportInfoByCodeResult.result) {
                    //报表公共参数
                    var commonParamData = commonParamResult.data;
                    var obj = {};
                    commonParamData.forEach(function (d) {
                        obj[d.parmCode] = d.parmName;
                    });

                    var reportInfoByCodeData = reportInfoByCodeResult.data;
                    var _param = _extends({
                        data_url: reportInfoByCodeData.data_url,
                        data_param: JSON.stringify(data_param)
                    }, report_param, obj, {
                        reqMethod: 0
                    });
                    createForm('/ReportServer?report_code=' + report_code + '&reportlet=' + reportInfoByCodeData.reportlet + '&fr_locale=zh_CN&timestamp=' + new Date().valueOf(), _param, '' + t.iframeName);
                }
            }).catch(function (err) {
                return console.log(err);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: styles.iframeParent },
                _react2.default.createElement('iframe', { className: 'wrapper', width: '100%', height: '100%', name: '' + this.iframeName })
            );
        }
    }]);

    return VtxRpsFrame;
}(_react2.default.Component);

exports.default = VtxRpsFrame;


var createForm = function createForm(reqURL, param, iframeName) {
    var formDom = $("<form>"); //定义一个form表单  
    formDom.attr("style", "display:none");
    formDom.attr("target", iframeName);
    formDom.attr("method", "post");
    formDom.attr("action", reqURL);
    var inputArray = [];
    for (var k in param) {
        var input1 = $("<input>");
        input1.attr("type", "hidden");
        input1.attr("name", k);
        input1.attr("value", param[k]);
        inputArray.push(input1);
    }
    $("body").append(formDom); //将表单放置在web中  
    for (var i = 0, len = inputArray.length; i < len; i++) {
        formDom.append(inputArray[i]);
    }
    formDom.submit(); //表单提交 
    formDom.remove();
};
module.exports = exports['default'];