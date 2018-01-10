'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Map = require('./Map');

var _Map2 = _interopRequireDefault(_Map);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var zoomMap = function (_React$Component) {
    _inherits(zoomMap, _React$Component);

    function zoomMap(props) {
        _classCallCheck(this, zoomMap);

        var _this = _possibleConstructorReturn(this, (zoomMap.__proto__ || Object.getPrototypeOf(zoomMap)).call(this, props));

        _this.map = null;
        _this.state = {
            filterPoints: []
        };
        return _this;
    }

    _createClass(zoomMap, [{
        key: 'resetPoints',
        value: function resetPoints() {
            var mapPoints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var zoomLv = arguments[1];

            // console.log('当前zoom等级',this.state.zoomLv);
            console.log(this.map.getMapExtent());
            zoomLv = zoomLv || this.map.getZoomLevel();
            if (zoomLv) {
                this.setState({
                    filterPoints: mapPoints.filter(function (item) {
                        return typeof item.zoomLevel == 'number' ? item.zoomLevel <= zoomLv : true;
                    })
                }, function () {
                    // console.log(`zoom等级(${this.state.zoomLv})过滤后还有${this.state.filterPoints.length}个点`);
                });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            // console.log(this.map.getMapExtent())        
            // 地图加载完成取得当前zoom值，初始化内部点数据
            this.resetPoints(this.props.mapPoints);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (!this.deepEqual(this.props.mapPoints, nextProps.mapPoints)) {
                // 外部点数据改变，更新内部点数据
                this.resetPoints(nextProps.mapPoints);
            }
        }
    }, {
        key: 'deepEqual',
        value: function deepEqual(a, b) {
            return _immutable2.default.is(_immutable2.default.fromJS(a), _immutable2.default.fromJS(b));
        }
    }, {
        key: 'zoomEnd',
        value: function zoomEnd(obj) {
            // console.log(obj)
            //zoom操作后，更新内部点数据
            this.resetPoints(this.props.mapPoints);

            if (typeof this.props.zoomEnd === "function") {
                this.props.zoomEnd(obj);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var newProps = _extends({}, this.props, {
                zoomEnd: this.zoomEnd.bind(this),
                mapPoints: this.state.filterPoints,
                ref: function ref(p) {
                    if (p) {
                        _this2.map = p;
                    }
                }
                // 屏蔽地图默认的setFitView的调整zoom功能，只会重新设置center
            });if (newProps.mapVisiblePoints) {
                newProps.mapVisiblePoints = _extends({}, newProps.mapVisiblePoints, {
                    type: 'center'
                });
            }

            return _react2.default.createElement(_Map2.default, newProps);
        }
    }]);

    return zoomMap;
}(_react2.default.Component);

exports.default = zoomMap;
module.exports = exports['default'];