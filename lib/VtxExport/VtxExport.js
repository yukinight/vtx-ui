'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

require('antd/lib/button/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

var _menu = require('antd/lib/menu');

var _menu2 = _interopRequireDefault(_menu);

require('antd/lib/menu/style/css');

var _dropdown = require('antd/lib/dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

require('antd/lib/dropdown/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VtxExport = function (_React$Component) {
    _inherits(VtxExport, _React$Component);

    function VtxExport(props) {
        _classCallCheck(this, VtxExport);

        var _this = _possibleConstructorReturn(this, (VtxExport.__proto__ || Object.getPrototypeOf(VtxExport)).call(this, props));

        _this.downloadURL = props.downloadURL;
        _this.exportButtonClick = _this.exportButtonClick.bind(_this);
        return _this;
    }

    _createClass(VtxExport, [{
        key: 'exportButtonClick',
        value: function exportButtonClick(param) {
            var pass_val = typeof this.props.getExportParams == 'function' ? this.props.getExportParams(param.key) : null;
            pass_val && this.downLoadFile(this.downloadURL, 'parameters', JSON.stringify(pass_val));
        }
    }, {
        key: 'downLoadFile',
        value: function downLoadFile(reqURL, paramName, paramVal) {
            var formDom = document.createElement('form');
            formDom.style.display = 'none';
            formDom.setAttribute('target', '');
            formDom.setAttribute('method', 'post');
            formDom.setAttribute('action', this.downloadURL);

            var input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', paramName);
            input.setAttribute('value', paramVal);

            document.body.appendChild(formDom);
            formDom.appendChild(input);
            formDom.submit();
            formDom.parentNode.removeChild(formDom);
        }
    }, {
        key: 'render',
        value: function render() {
            var props = this.props;
            var exportMenu = _react2.default.createElement(
                _menu2.default,
                { onClick: this.exportButtonClick },
                this.props.rowButton === false ? null : _react2.default.createElement(
                    _menu2.default.Item,
                    { key: 'rows' },
                    '\u5BFC\u51FA\u9009\u4E2D\u884C'
                ),
                this.props.pageButton === false ? null : _react2.default.createElement(
                    _menu2.default.Item,
                    { key: 'page' },
                    '\u5BFC\u51FA\u5F53\u524D\u9875'
                ),
                this.props.allButton === false ? null : _react2.default.createElement(
                    _menu2.default.Item,
                    { key: 'all' },
                    '\u5BFC\u51FA\u5168\u90E8'
                )
            );
            return _react2.default.createElement(
                _dropdown2.default,
                { overlay: exportMenu, trigger: ["click"] },
                _react2.default.createElement(
                    _button2.default,
                    { icon: 'export' },
                    '\u5BFC\u51FA ',
                    _react2.default.createElement(_icon2.default, { type: 'down' })
                )
            );
        }
    }]);

    return VtxExport;
}(_react2.default.Component);

// function exportFile(ids=undefined){
//     // columnFields,columnNames,sort,order:asc,title,downloadAll:false
//     let param = JSON.stringify(getBaicPostData({
//         ...form,
//         columnNames:"编号,名称,所属处置单位,监测类型,开始运行日期,排序号",
//         columnFields:"code,name,factoryName,deviceTypeName,validStartTime,orderIndex",
//         downloadAll: !ids,
//         downloadIds: ids
//     }))
//     downLoadFile(disposalFacilityDownloadURL,'parameters',param);
// }

exports.default = VtxExport;
module.exports = exports['default'];