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

var _isEqual2 = require('lodash/isEqual');

var _isEqual3 = _interopRequireDefault(_isEqual2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OptimizingPointMap = function (_React$Component) {
    _inherits(OptimizingPointMap, _React$Component);

    function OptimizingPointMap(props) {
        _classCallCheck(this, OptimizingPointMap);

        var _this = _possibleConstructorReturn(this, (OptimizingPointMap.__proto__ || Object.getPrototypeOf(OptimizingPointMap)).call(this, props));

        _this.map = null;
        _this.mapLoaded = false;
        _this.MPP = new mapPointsProcessor(props.gridSpacing || 40);
        _this.state = {
            filterPoints: []
        };
        _this.zoomEnd = _this.zoomEnd.bind(_this);
        _this.moveEnd = _this.moveEnd.bind(_this);
        _this.resetPoints = _this.resetPoints.bind(_this);

        _this.resetDelay = {
            timer: null,
            eType: null
        };
        return _this;
    }

    _createClass(OptimizingPointMap, [{
        key: 'resetPoints',
        value: function resetPoints(props, eType) {
            var t = this;
            // 延时优化，只处理最后一次操作
            if (t.resetDelay.timer) {
                clearTimeout(t.resetDelay.timer);
            }
            t.resetDelay.eType = t.resetDelay.eType == 'zoom' || eType == 'zoom' ? 'zoom' : eType;
            t.resetDelay.timer = setTimeout(function () {
                var mcfg = t.map.getMapExtent();
                var param = {
                    mapHeight: mcfg.mapSize.height,
                    mapWidth: mcfg.mapSize.width,
                    minLat: mcfg.southWest.lat,
                    maxLat: mcfg.northEast.lat,
                    minLng: mcfg.southWest.lng,
                    maxLng: mcfg.northEast.lng,
                    eType: t.resetDelay.eType,
                    allPoints: props.mapPoints,
                    reservedPoints: props.reservedPoints
                };
                t.setState({
                    filterPoints: t.MPP.pointFilter(param)
                });
                t.resetDelay.timer = null;
                t.resetDelay.eType = null;
            }, 200);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.map.loadMapComplete.then(function () {
                _this2.resetPoints(_this2.props);
                _this2.mapLoaded = true;
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (this.mapLoaded && (!(0, _isEqual3.default)(this.props.reservedPoints, nextProps.reservedPoints) || !(0, _isEqual3.default)(this.props.mapPoints, nextProps.mapPoints))) {
                // 外部点数据改变，更新内部点数据
                this.resetPoints(nextProps);
            }
        }
    }, {
        key: 'zoomEnd',
        value: function zoomEnd(obj) {
            this.resetPoints(this.props, 'zoom');
            if (typeof this.props.zoomEnd === "function") {
                this.props.zoomEnd(obj);
            }
        }
    }, {
        key: 'moveEnd',
        value: function moveEnd(obj) {
            this.resetPoints(this.props, 'move');
            if (typeof this.props.moveEnd === "function") {
                this.props.moveEnd(obj);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            // console.log('优化后剩余点数：'+this.state.filterPoints.length)  
            var newProps = _extends({}, this.props, {
                zoomEnd: this.zoomEnd,
                moveEnd: this.moveEnd,
                mapPoints: this.state.filterPoints,
                getMapInstance: function getMapInstance(p) {
                    if (p) {
                        _this3.map = p;
                    }
                    if (typeof _this3.props.getMapInstance === "function") {
                        _this3.props.getMapInstance(p);
                    }
                }
            });
            delete newProps.gridSpacing;
            delete newProps.reservedPoints;

            return _react2.default.createElement(_Map2.default, newProps);
        }
    }]);

    return OptimizingPointMap;
}(_react2.default.Component);

var mapPointsProcessor = function () {
    function mapPointsProcessor(gridSpacing) {
        _classCallCheck(this, mapPointsProcessor);

        this.GRIDSPACING = gridSpacing || 40;
        this.mapHeight = null; //地图高度
        this.mapWidth = null; //地图宽度
        // 若地图大小不变，zoom不变，网格的经纬度间隔应该保持不变以保证前后两次网格位置保持一致
        this.lngInterval = null; //划分的网格经度间隔
        this.latInterval = null; //划分的网格纬度间隔
        this.maxLat = null, this.minLat = null, this.maxLng = null, this.minLng = null;
    }

    _createClass(mapPointsProcessor, [{
        key: 'resetMapConfig',
        value: function resetMapConfig(param) {
            // 若没传地图相关参数默认使用上次的地图参数
            var mapHeight = param.mapHeight,
                mapWidth = param.mapWidth,
                maxLat = param.maxLat,
                minLat = param.minLat,
                maxLng = param.maxLng,
                minLng = param.minLng,
                eType = param.eType;

            this.maxLat = maxLat || this.maxLat;
            this.minLat = minLat || this.minLat;
            this.maxLng = maxLng || this.maxLng;
            this.minLng = minLng || this.minLng;
            // 当操作为zoom（改变最大最小经纬度）或地图宽高改变则重新计算网格
            if (eType == 'zoom' || mapHeight && mapHeight != this.mapHeight || mapWidth && mapWidth != this.mapWidth) {
                this.mapHeight = mapHeight || this.mapHeight;
                this.mapWidth = mapWidth || this.mapWidth;
                this.calGridInterval();
            }
        }
    }, {
        key: 'calGridInterval',
        value: function calGridInterval() {
            var x_num = Math.ceil(this.mapWidth / this.GRIDSPACING);
            var y_num = Math.ceil(this.mapHeight / this.GRIDSPACING);
            this.lngInterval = parseFloat(((this.maxLng - this.minLng) / x_num).toFixed(6));
            this.latInterval = parseFloat(((this.maxLat - this.minLat) / y_num).toFixed(6));
        }
    }, {
        key: 'pointFilter',
        value: function pointFilter(param) {
            // allPoints为必填参数
            var allPoints = param.allPoints,
                _param$reservedPoints = param.reservedPoints,
                reservedPoints = _param$reservedPoints === undefined ? [] : _param$reservedPoints;

            this.resetMapConfig(param);

            var hashPoints = {};
            for (var i = 0, len = allPoints.length; i < len; i++) {
                var p_lng = allPoints[i].longitude;
                var p_lat = allPoints[i].latitude;
                if (p_lng > this.maxLng || p_lng < this.minLng || p_lat > this.maxLat || p_lat < this.minLat) {
                    continue;
                }
                var x_index = parseInt(p_lng / this.lngInterval);
                var y_index = parseInt(p_lat / this.latInterval);
                var hashIndex = x_index + '-' + y_index;
                if (!hashPoints[hashIndex]) {
                    hashPoints[hashIndex] = allPoints[i];
                }
            }

            var filteredPoints = [].concat(_toConsumableArray(reservedPoints));
            var reservedIds = reservedPoints.map(function (item) {
                return item.id;
            });
            for (var k in hashPoints) {
                var the_point = hashPoints[k];
                if (reservedIds.indexOf(the_point.id) == -1) {
                    filteredPoints.push(the_point);
                }
            }

            return filteredPoints;
        }
    }]);

    return mapPointsProcessor;
}();

exports.default = OptimizingPointMap;
module.exports = exports['default'];