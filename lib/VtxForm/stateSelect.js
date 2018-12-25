'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OptGroup = exports.Option = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _select = require('antd/lib/select');

var _select2 = _interopRequireDefault(_select);

require('antd/lib/select/style/css');

require('./stateSelect.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
    error: 'vtx-ui-select-error',
    normal: 'vtx-ui-select-normal'
};

var StateSelect = function (_React$Component) {
    _inherits(StateSelect, _React$Component);

    function StateSelect(props) {
        _classCallCheck(this, StateSelect);

        return _possibleConstructorReturn(this, (StateSelect.__proto__ || Object.getPrototypeOf(StateSelect)).call(this, props));
    }

    _createClass(StateSelect, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                _props$errorMsg = _props.errorMsg,
                errorMsg = _props$errorMsg === undefined ? ' ' : _props$errorMsg,
                _props$validated = _props.validated,
                validated = _props$validated === undefined ? true : _props$validated;

            var selectProps = _extends({
                style: { width: 300 }
            }, this.props);
            delete selectProps.errorMsg;
            delete selectProps.validated;
            delete selectProps.inherit;
            return _react2.default.createElement(
                'div',
                {
                    style: { width: this.props.inherit ? 'inherit' : '' },
                    className: validated ? styles.normal : styles.error, 'data-errormsg': errorMsg },
                _react2.default.createElement(_select2.default, selectProps)
            );
        }
    }]);

    return StateSelect;
}(_react2.default.Component);

var Option = exports.Option = _select2.default.Option;
var OptGroup = exports.OptGroup = _select2.default.OptGroup;
exports.default = StateSelect;