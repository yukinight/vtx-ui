'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

var _input = require('antd/lib/input');

var _input2 = _interopRequireDefault(_input);

require('antd/lib/input/style/css');

require('./stateInput.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
    error: 'vtx-ui-input-error',
    normal: 'vtx-ui-input-normal'
};

var stateInput = function (_React$Component) {
    _inherits(stateInput, _React$Component);

    function stateInput(props) {
        _classCallCheck(this, stateInput);

        return _possibleConstructorReturn(this, (stateInput.__proto__ || Object.getPrototypeOf(stateInput)).call(this, props));
    }

    _createClass(stateInput, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                _props$errorMsg = _props.errorMsg,
                errorMsg = _props$errorMsg === undefined ? ' ' : _props$errorMsg,
                _props$validated = _props.validated,
                validated = _props$validated === undefined ? true : _props$validated,
                _props$loading = _props.loading,
                loading = _props$loading === undefined ? false : _props$loading;


            var inputProps = _extends({
                style: { width: 300 }
            }, this.props);

            delete inputProps.errorMsg;
            delete inputProps.validated;
            delete inputProps.loading;
            delete inputProps.inherit;

            var actErrorMsg = void 0,
                actValidated = void 0;
            if (errorMsg instanceof Array && validated instanceof Array) {
                var firstUnmatched = validated.indexOf(false);
                if (firstUnmatched == -1) {
                    actValidated = true;
                    actErrorMsg = errorMsg[0];
                } else {
                    actValidated = false;
                    actErrorMsg = errorMsg[firstUnmatched] || '';
                }
            } else {
                actErrorMsg = errorMsg;
                actValidated = validated;
            }

            inputProps.suffix = loading ? _react2.default.createElement(_icon2.default, { type: 'loading' }) : actValidated ? null : _react2.default.createElement(_icon2.default, { type: 'close-circle', style: { color: 'red' } });

            return _react2.default.createElement(
                'div',
                {
                    style: { width: this.props.inherit ? 'inherit' : '' },
                    className: actValidated ? styles.normal : styles.error, 'data-errormsg': actErrorMsg },
                _react2.default.createElement(_input2.default, inputProps)
            );
        }
    }]);

    return stateInput;
}(_react2.default.Component);

exports.default = stateInput;
module.exports = exports['default'];