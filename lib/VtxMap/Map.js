'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _AMap = require('./AMap/AMap');

var _AMap2 = _interopRequireDefault(_AMap);

var _Map = require('./BMap/Map');

var _Map2 = _interopRequireDefault(_Map);

var _TMap = require('./TMap/TMap');

var _TMap2 = _interopRequireDefault(_TMap);

var _Map3 = require('./GMap/Map');

var _Map4 = _interopRequireDefault(_Map3);

require('./Map.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VtxMap = function (_React$Component) {
    _inherits(VtxMap, _React$Component);

    function VtxMap(props) {
        _classCallCheck(this, VtxMap);

        return _possibleConstructorReturn(this, (VtxMap.__proto__ || Object.getPrototypeOf(VtxMap)).call(this, props));
    }

    _createClass(VtxMap, [{
        key: 'render',
        value: function render() {
            var t = this;

            var _t$props = t.props,
                mapType = _t$props.mapType,
                getMapInstance = _t$props.getMapInstance,
                newProps = _objectWithoutProperties(_t$props, ['mapType', 'getMapInstance']);

            if (typeof getMapInstance == 'function') {
                newProps.ref = function (map) {
                    if (map) {
                        getMapInstance(map);
                    }
                };
            }
            switch (mapType) {
                case 'amap':
                    return _react2.default.createElement(_AMap2.default, newProps);
                case 'tmap':
                    return _react2.default.createElement(_TMap2.default, newProps);
                case 'gmap':
                    return _react2.default.createElement(_Map4.default, newProps);
                default:
                    return _react2.default.createElement(_Map2.default, newProps);
            }
        }
    }]);

    return VtxMap;
}(_react2.default.Component);

exports.default = VtxMap;
module.exports = exports['default'];