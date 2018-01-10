'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./Map.less');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Set = _immutable2.default.Set;

var Map = function (_React$Component) {
    _inherits(Map, _React$Component);

    function Map(props) {
        _classCallCheck(this, Map);

        var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));

        _this.editTimeout = null; //圆编辑时的延迟回调,避免重复调用
        _this.state = {
            mapId: props.mapId,
            center: props.mapCenter,
            maxZoom: props.maxZoom,
            minZoom: props.minZoom,
            gis: new VortexBMap(),
            pointIds: [], //点的所有id
            lineIds: [], //线的所有id
            polygonIds: [], //面的所有id
            circleIds: [], //圆的所有id
            editId: '', //当前编辑的图元id
            editGraphic: '', //当前编辑完后图元所有数据
            boundaryInfo: [], //当前画出的边界线的id和区域名
            defaultPoint: './resources/images/defaultMarker.png', //默认点
            drawIds: { //绘制工具id集合
                point: [],
                polyline: [],
                polygon: [],
                circle: [],
                rectangle: []
            }
        };
        return _this;
    }

    _createClass(Map, [{
        key: 'init',
        value: function init() {
            var t = this;
            t.createMap();
            var _props = this.props,
                mapPoints = _props.mapPoints,
                mapLines = _props.mapLines,
                mapPolygons = _props.mapPolygons,
                mapCircles = _props.mapCircles,
                mapVisiblePoints = _props.mapVisiblePoints,
                mapCluster = _props.mapCluster,
                mapZoomLevel = _props.mapZoomLevel,
                isOpenTrafficInfo = _props.isOpenTrafficInfo,
                mapPointCollection = _props.mapPointCollection,
                areaRestriction = _props.areaRestriction;
            var _props2 = this.props,
                boundaryName = _props2.boundaryName,
                heatMapData = _props2.heatMapData,
                customizedBoundary = _props2.customizedBoundary;
            var _state = this.state,
                boundaryInfo = _state.boundaryInfo,
                pointIds = _state.pointIds,
                lineIds = _state.lineIds,
                polygonIds = _state.polygonIds,
                circleIds = _state.circleIds;
            //添加点
            //Math.max(2,3)
            //MapUtil.isArray

            if (mapPoints instanceof Array) {
                t.addPoint(mapPoints);
            }
            //添加线
            if (mapLines instanceof Array) {
                t.addLine(mapLines);
            }
            //添加面
            if (mapPolygons instanceof Array) {
                t.addPolygon(mapPolygons);
            }
            //添加圆
            if (mapCircles instanceof Array) {
                t.addCircle(mapCircles);
            }
            if (mapPointCollection instanceof Array) {
                t.addPointCollection(mapPointCollection);
            }
            //初始展示的视野范围
            if (mapVisiblePoints) {
                switch (mapVisiblePoints.fitView) {
                    case 'point':
                        t.setVisiblePoints(pointIds, mapVisiblePoints.type);
                        break;
                    case 'line':
                        t.setVisiblePoints(lineIds, mapVisiblePoints.type);
                        break;
                    case 'polygon':
                        t.setVisiblePoints(polygonIds, mapVisiblePoints.type);
                        break;
                    case 'circle':
                        t.setVisiblePoints(circleIds, mapVisiblePoints.type);
                        break;
                    case 'all':
                        t.setVisiblePoints(pointIds.concat(lineIds).concat(polygonIds).concat(circleIds), mapVisiblePoints.type);
                        break;
                    default:
                        t.setVisiblePoints(mapVisiblePoints, mapVisiblePoints.type);
                        break;
                }
            }
            //设置中心点
            t.setCenter(t.state.center);
            //设置点聚合
            if (mapCluster instanceof Array) {
                t.cluster(mapCluster);
            }
            //设置比例尺
            if (mapZoomLevel) {
                t.setZoomLevel(mapZoomLevel);
            }
            //画边界线
            if (boundaryName instanceof Array && boundaryName.length > 0) {
                t.addBaiduBoundary(boundaryName);
            }
            // 画热力图
            if (heatMapData) {
                t.addHeatMap(heatMapData);
            }
            if (customizedBoundary instanceof Array) {
                t.addLine(customizedBoundary);
            }
            if (isOpenTrafficInfo) {
                t.openTrafficInfo();
            } else {
                t.hideTrafficInfo();
            }
            //设置区域限制
            if (areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]) {
                t.setAreaRestriction(areaRestriction);
            }
            //图元点击事件
            t.clickGraphic();
            //地图拖动事件
            t.dragMapStart(); //拖动之前
            t.dragMapEnd(); //拖动结束后
            t.moveStart();
            t.moveEnd();
            //每次图元编辑后
            t.editGraphicChange();
            //鼠标悬浮图元事件
            t.mouseOverGraphic();
            t.mouseOutGraphic();
            //地图缩放事件
            t.zoomStart();
            t.zoomEnd();
            //绘制结束回调事件
            t.drawEnd();
            //海量点点击事件
            t.clickPointCollection();
            //点击地图
            t.clickMap();
            //是否设置比例尺
            if (t.props.showControl) {
                t.showControl();
            }
            //返回计算距离方法
            // if(whetherIs('function',t.props.calculatePointsDistance)){
            //     t.props.calculatePointsDistance(t.calculatePointsDistance.bind(t));
            // }
            //回调显示方法
            // if(t.props.showGraphicById){
            //     t.props.showGraphicById(t.showGraphicById.bind(t));
            // }
            //回调隐藏方法
            // if(t.props.hideGraphicById){
            //     t.props.hideGraphicById(t.hideGraphicById.bind(t));
            // }
        }
        //创建地图

    }, {
        key: 'createMap',
        value: function createMap() {
            var t = this;
            var options = {
                zoom: 10,
                center: [116.404, 39.915]
            };
            if (!!t.state.maxZoom) {
                options.maxZoom = t.state.maxZoom;
            }
            if (!!t.state.minZoom) {
                options.minZoom = t.state.minZoom;
            }
            if (!!t.state.center) {
                options.center = t.state.center;
            }
            if (!!t.props.mapZoomLevel) {
                options.zoom = t.props.mapZoomLevel;
            }
            if (window.VtxMap) {
                window.VtxMap[t.state.mapId] = {};
            } else {
                window.VtxMap = {};
            }
            var map = window.VtxMap[t.state.mapId] = new BMap.Map(t.state.mapId, {
                enableMapClick: false,
                minZoom: options.minZoom,
                maxZoom: options.maxZoom
            });
            // 初始化地图,设置中心点坐标和地图级别
            map.centerAndZoom(new BMap.Point(parseFloat(options.center[0]), parseFloat(options.center[1])), options.zoom);
            if (!!t.props.satelliteSwitch) {
                //添加地图类型控件
                map.addControl(new BMap.MapTypeControl());
            }
            // 设置地图显示的城市 此项是必须设置的
            // map.setCurrentCity("北京");
            //开启鼠标滚轮缩放
            map.enableScrollWheelZoom(true);
            //将map对象保存到voterBMap
            t.state.gis.createMap(map);
        }
        //清空地图所有图元

    }, {
        key: 'clearAll',
        value: function clearAll() {
            var t = this;
            t.state.gis.clear();
            //清空历史数据记录
            t.setState({
                pointIds: [],
                lineIds: [],
                polygonIds: [],
                circleIds: [],
                boundaryInfo: [],
                editId: '',
                editGraphic: '',
                drawIds: {
                    point: [],
                    polyline: [],
                    polygon: [],
                    circle: [],
                    rectangle: []
                }
            });
        }
        /*set方法*/
        //设置地图中心位置 lng/经度  lat/纬度

    }, {
        key: 'setCenter',
        value: function setCenter(gt) {
            var t = this;
            if (gt) {
                var c = t.state.gis.map.getCenter();
                if (c.lng == gt[0] && c.lat == gt[1]) {
                    return false;
                }
                t.state.gis.setCenter(gt[0], gt[1]);
                t.setState({ center: gt });
            } else {
                t.state.gis.setCenter(117.468021, 39.890092);
                t.setState({ center: [117.468021, 39.890092] });
            }
        }
    }, {
        key: 'openTrafficInfo',
        value: function openTrafficInfo() {
            this.state.gis.openTrafficInfo();
        }
    }, {
        key: 'hideTrafficInfo',
        value: function hideTrafficInfo() {
            this.state.gis.hideTrafficInfo();
        }
        /*设置显示区域*/

    }, {
        key: 'setAreaRestriction',
        value: function setAreaRestriction(sw_ne) {
            var bounds = new BMap.Bounds(new BMap.Point(sw_ne[0][0], sw_ne[0][1]), new BMap.Point(sw_ne[1][0], sw_ne[1][1]));
            BMapLib.AreaRestriction.setBounds(this.state.gis.map, bounds);
        }
        /*取消显示区域*/

    }, {
        key: 'clearAreaRestriction',
        value: function clearAreaRestriction() {
            BMapLib.AreaRestriction.clearBounds();
        }
        //将制定图元展示在视野内 (强制改变地图中心位置)
        /*
            参数arg格式如下1,2
            1.string   格式如:'1,a,2,3,4'
            2.数组 ['1','2']
        */

    }, {
        key: 'setVisiblePoints',
        value: function setVisiblePoints(arg, type) {
            var t = this;
            var ary = [];
            var obj = null;
            if (typeof arg === 'string') {
                ary = arg.split(',');
                obj = t.state.gis.getFitView(ary);
            } else if (arg instanceof Array) {
                if (typeof arg[0] == 'string') {
                    ary = arg;
                    obj = t.state.gis.getFitView(ary);
                } else if (arg[0] instanceof Array) {
                    var xmax = 0,
                        xmin = 0,
                        ymax = 0,
                        ymin = 0;
                    arg.map(function (item, index) {
                        var lng = item[0],
                            lat = item[1];
                        if (lng > xmax) {
                            xmax = lng;
                        }
                        if (lng < xmin || xmin == 0) {
                            xmin = lng;
                        }
                        if (lat > ymax) {
                            ymax = lat;
                        }
                        if (lat < ymin || ymin == 0) {
                            ymin = lat;
                        }
                    });
                    obj = t.state.gis.map.getViewport([new BMap.Point(xmax, ymax), new BMap.Point(xmin, ymin)]);
                }
            }
            if (!obj) {
                return false;
            }
            if (type == 'all') {
                // t.state.gis.setFitview(ary);
                t.setZoomLevel(obj.zoom);
                t.setCenter([obj.center.lng, obj.center.lat]);
            } else if (type == 'zoom') {
                t.setZoomLevel(obj.zoom);
            } else if (type == 'center') {
                t.setCenter([obj.center.lng, obj.center.lat]);
            }
        }
        //设置地图比例尺

    }, {
        key: 'setZoomLevel',
        value: function setZoomLevel(zoom) {
            var t = this;
            var z = t.getZoomLevel();
            if (z == zoom) {
                return false;
            }
            t.state.gis.setZoom(zoom);
        }
        /*get方法*/
        //获取当前地图的中心位置

    }, {
        key: 'getCurrentCenter',
        value: function getCurrentCenter() {
            var t = this;
            return t.state.gis.getNowCenter();
        }
        //获取当前比例尺

    }, {
        key: 'getZoomLevel',
        value: function getZoomLevel() {
            var t = this;
            return t.state.gis.getZoom();
        }
        //获取当前地图边框左右边角经纬度,中心点位置,和比例尺,半径距离

    }, {
        key: 'getMapExtent',
        value: function getMapExtent() {
            var t = this;
            var obj = t.state.gis.getMapExtent();
            var radius = t.calculatePointsDistance([obj.nowCenter.lng, obj.nowCenter.lat], [obj.northEast.lng, obj.northEast.lat]);
            obj.radius = radius;
            return obj;
        }
        //聚合地图图元(arg为空时聚合全部点)

    }, {
        key: 'cluster',
        value: function cluster(arg) {
            var t = this;
            var ary = [];
            if (!arg) {
                var pointIds = t.state.pointIds;

                ary = pointIds;
            } else {
                if (Object.prototype.toString.apply(arg) === '[object Array]') {
                    ary = arg;
                } else if (typeof arg === 'string') {
                    ary = arg.split(',');
                }
            }
            t.state.gis.cluster(ary);
        }
        //展示比例尺

    }, {
        key: 'showControl',
        value: function showControl() {
            var t = this;
            t.state.gis.showControl(t.props.showControl.type, t.props.showControl.location);
        }
        //获取图元数据
        /*
            attributes 初始化数据(即添加点时的初始数据)
            geometryType:point/polyline/polygon/circle
            mapLayer 
                点 rc / 线 Ac / 面 zc / 圆 Bc
            geometry 格式化数据 
                点 {type:point,x:lng,y:lat}
                线 {type:polyline,paths:[[lng,lat],[lng,lat]]}
                面 {type:polygon,rings:[[lng,lat],[lng,lat],[lng,lat]]}
                圆 {type:circle,x:lng,y:lat,radius:xxx}
        */

    }, {
        key: 'getGraphic',
        value: function getGraphic(id) {
            var t = this;
            return t.state.gis.getGraphic(id);
        }
        //显示隐藏的图元

    }, {
        key: 'showGraphicById',
        value: function showGraphicById(id) {
            var t = this;
            t.state.gis.showGraphicById(id);
        }
        //隐藏图元

    }, {
        key: 'hideGraphicById',
        value: function hideGraphicById(id) {
            var t = this;
            t.state.gis.hideGraphicById(id);
        }
        //画出对应边界线 name区域名

    }, {
        key: 'addBaiduBoundary',
        value: function addBaiduBoundary(bdNames) {
            var t = this;
            bdNames.forEach(function (name) {
                t.state.gis.getBoundary(name, function (ary) {
                    var id = 'boundary' + new Date().getTime();
                    var paths = ary.boundaries[0].split(';').map(function (item, index) {
                        return item.split(',');
                    });
                    t.addPolygon([{ id: id, rings: paths }]);
                    t.state.boundaryInfo.push({ id: id, name: name });
                });
            });
        }
    }, {
        key: 'removeBaiduBoundary',
        value: function removeBaiduBoundary(removedBDNames) {
            var _this2 = this;

            var removedBDIds = this.state.boundaryInfo.filter(function (item) {
                return removedBDNames.indexOf(item.name) > -1;
            }).map(function (item) {
                return item.id;
            });
            this.setState({ boundaryInfo: this.state.boundaryInfo.filter(function (item) {
                    return removedBDNames.indexOf(item.name) == -1;
                }) });
            removedBDIds.forEach(function (id) {
                _this2.removeGraphic(id, 'polygon');
            });
        }
    }, {
        key: 'addHeatMap',
        value: function addHeatMap(heatMapData) {
            this.state.gis.creatHeatMapOverlay(heatMapData);
        }
        //地图加点(支持多个和单个)
        /*
            参数 [{
                id : 唯一id,
                longitude : 经度,
                latitude : 纬度,
                infoWindow : 是否有弹出 默认true,
                url : 图标url,
                markerContent: 点样式,//跟url冲突,存在markerContent时,url不展示
                config : {
                    width:图标宽 默认30,
                    height:图标高 默认30,
                    labelContent: 下标文字,
                    labelPixelX: x轴下标偏移量,
                    labelPixelY: y轴下标偏移量,
                }
            }]
        */

    }, {
        key: 'addPoint',
        value: function addPoint(arg) {
            var t = this;
            var pointIds = t.state.pointIds;
            arg.map(function (item, index) {
                if (pointIds.indexOf(item.id) === -1) {
                    var config = {
                        labelContent: '',
                        labelPixelX: 0,
                        labelPixelY: 34,
                        width: 30,
                        height: 30,
                        BAnimationType: 3
                    };
                    config = _extends({}, config, item.config);
                    t.state.gis.addPoint({
                        id: item.id,
                        longitude: item.longitude,
                        labelClass: item.labelClass,
                        latitude: item.latitude,
                        infoWindow: item.infoWindow || true,
                        url: item.url || '',
                        markerContent: item.markerContent || '',
                        canShowLabel: item.canShowLabel || false,
                        config: config,
                        other: item
                    });
                    pointIds.push(item.id);
                }
            });
            t.setState({ pointIds: pointIds });
        }
        //更新地图点数据(支持多个和单个) {暂时有不用,未完善}
        /*
            参数 [{
                    id : 唯一id,
                    longitude : 经度,
                    latitude : 纬度,
                    infoWindow : 是否有弹出 默认true,
                    url : 图标url,
                    markerContent: 点样式,//跟url冲突,存在markerContent时,url不展示
                    config : {
                        width:图标宽 默认30,
                        height:图标高 默认30,
                        labelContent: 下标文字,
                        labelPixelX: x轴下标偏移量,
                        labelPixelY: y轴下标偏移量,
                    }
                }]
         */

    }, {
        key: 'updatePoint',
        value: function updatePoint(arg) {
            var t = this;
            arg.map(function (item, index) {
                var config = {
                    labelContent: '',
                    labelPixelX: 0,
                    labelPixelY: 34,
                    width: 30,
                    height: 30,
                    BAnimationType: 3
                };
                t.state.gis.updatePoint({
                    id: item.id,
                    longitude: item.longitude,
                    latitude: item.latitude,
                    labelClass: item.labelClass,
                    infoWindow: item.infoWindow || true,
                    url: item.url || '',
                    markerContent: item.markerContent || '',
                    canShowLabel: item.canShowLabel || false,
                    config: _extends({}, config, item.config),
                    other: item
                });
            });
        }
        //地图加线(支持多个和单个) paths:必须含2个点,即含有2个有经纬度的数组
        /*
            参数 [{
                    id : 唯一id,
                    paths:[[经度,纬度],[经度,纬度],[经度,纬度]],
                    infoWindow : 是否有弹出 默认true,
                    config : {
                        lineType : 线类型（实线solid，虚线dashed）默认实线solid
                        lineWidth :  线宽, 默认5
                        color : 线颜色, 默认[]
                        pellucidity : 线透明度(0-1), 默认1
                    }
                }]
         */

    }, {
        key: 'addLine',
        value: function addLine(arg) {
            var t = this;
            var lineIds = t.state.lineIds;
            arg.map(function (item, index) {
                if (lineIds.indexOf(item.id) === -1) {
                    var config = {
                        lineType: 'solid',
                        lineWidth: 5,
                        color: '',
                        pellucidity: 1
                    };
                    t.state.gis.addLine({
                        id: item.id,
                        paths: [item.paths],
                        infoWindow: item.infoWindow || true,
                        config: _extends({}, config, item.config),
                        other: item
                    });
                    lineIds.push(item.id);
                }
            });
            t.setState({ lineIds: lineIds });
        }
        //地图加面(支持多个和单个) rings:必须含3个点,即含有3个有经纬度的数组
        /*
            参数 [{
                    id : 唯一id,
                    rings:[[经度,纬度],[经度,纬度],[经度,纬度]],
                    infoWindow : 是否有弹出 默认true,
                    config : {
                        lineType : 线类型（实线solid，虚线dashed）默认实线solid
                        lineWidth :  线宽, 默认5
                        color : 填充颜色, 默认[]
                        pellucidity : 填充透明度(0-1), 默认1
                        lineColor: 线颜色, 默认''
                        lineOpacity: 线透明度, 默认1
                    }
                }]
         */

    }, {
        key: 'addPolygon',
        value: function addPolygon(arg) {
            var t = this;
            var polygonIds = t.state.polygonIds;
            arg.map(function (item, index) {
                if (polygonIds.indexOf(item.id) === -1) {
                    var config = {
                        lineType: 'solid',
                        lineWidth: 5,
                        color: "#fff",
                        pellucidity: .5,
                        lineColor: "",
                        lineOpacity: 1
                    };
                    t.state.gis.addPolygon({
                        id: item.id,
                        rings: [item.rings],
                        infoWindow: item.infoWindow || true,
                        config: _extends({}, config, item.config),
                        other: item
                    });
                    polygonIds.push(item.id);
                }
            });
            t.setState({ polygonIds: polygonIds });
        }
        //地图加面(支持多个和单个) rings:必须含3个点,即含有3个有经纬度的数组
        /*
            参数 [{
                    id : 唯一id,
                    longitude : 经度,
                    latitude : 纬度,
                    infoWindow : 是否有弹出 默认true,
                    radius : 半径, 单位是m/米 默认50
                    config : {
                        lineType : 线类型（实线solid，虚线dashed）默认实线solid
                        lineWidth :  线宽, 默认5
                        color : 填充颜色, 默认'#FFF'
                        pellucidity : 填充透明度(0-1), 默认1
                        lineColor: 线颜色, 默认''
                        lineOpacity: 线透明度, 默认1
                    }
                }]
         */

    }, {
        key: 'addCircle',
        value: function addCircle(arg) {
            var t = this;
            var circleIds = t.state.circleIds;
            arg.map(function (item, index) {
                if (circleIds.indexOf(item.id) === -1) {
                    var config = {
                        lineType: 'solid',
                        lineWidth: 5,
                        color: "#FFF",
                        pellucidity: .5,
                        lineColor: "rgb(58, 107, 219)",
                        lineOpacity: 1
                    };
                    t.state.gis.addCircle({
                        id: item.id,
                        longitude: item.longitude,
                        latitude: item.latitude,
                        radius: item.radius || 50,
                        infoWindow: item.infoWindow || true,
                        config: _extends({}, config, item.config),
                        other: item
                    });
                    circleIds.push(item.id);
                }
            });
            t.setState({ circleIds: circleIds });
        }
        //加海量点

    }, {
        key: 'addPointCollection',
        value: function addPointCollection(points) {
            var t = this;
            points.map(function (item, index) {
                t.state.gis.addPointCollection(item);
            });
        }
        //更新海量点

    }, {
        key: 'updatePointCollection',
        value: function updatePointCollection(points) {
            var t = this;
            points.map(function (item, index) {
                t.state.gis.updatePointCollection(item);
            });
        }
        //根据id删除对应海量点

    }, {
        key: 'clearPointCollection',
        value: function clearPointCollection(ids) {
            var t = this;
            ids.map(function (item, index) {
                t.state.gis.clearPointCollection(item);
            });
        }
        //清除所有海量点

    }, {
        key: 'clearAllPointCollection',
        value: function clearAllPointCollection() {
            var t = this;
            t.state.gis.clearAllPointCollection();
        }
        //点击海量点事件

    }, {
        key: 'clickPointCollection',
        value: function clickPointCollection() {
            var t = this;
            t.state.gis.bind('clickPointCollection', function (param, e) {
                var obj = _extends({
                    attributes: e.point.attributes,
                    lng: e.point.lng,
                    lat: e.point.lat
                }, param);
                if (typeof t.props.clickPointCollection === "function") {
                    t.props.clickPointCollection(obj);
                }
            });
        }
        /*根据图元id,使图元变成可编辑状态*/

    }, {
        key: 'doEdit',
        value: function doEdit(id) {
            var t = this;
            var graphic = t.getGraphic(id);
            if (!graphic) return false;
            if (!!t.state.editId) {
                t.endEdit();
            }
            t.state.gis.doEdit(graphic, id);
            t.setState({ editId: id });
        }
        //关闭编辑

    }, {
        key: 'endEdit',
        value: function endEdit() {
            var t = this;
            var graphic = t.getGraphic(t.state.editId);
            if (!graphic) return false;
            t.state.gis.endEdit(graphic);
            //避免死循环
            var editGraphic = t.state.editGraphic;
            if (editGraphic) {
                t.setState({ editGraphic: '', editId: '' }, function () {
                    t.props.editGraphicChange(editGraphic);
                });
            }
        }
        //编辑变动后

    }, {
        key: 'editGraphicChange',
        value: function editGraphicChange() {
            var t = this;
            if (typeof t.props.editGraphicChange === 'function') {
                t.state.gis.bind('graphicVortexChange', function (param, e) {
                    var obj = {
                        param: param, e: e,
                        id: param.attributes.id,
                        geometry: param.geometry
                    };
                    if (param.geometry.type == 'circle') {
                        if (t.editTimeout) {
                            clearTimeout(t.editTimeout);
                        }
                        t.editTimeout = setTimeout(function () {
                            t.setState({ editGraphic: obj }, function () {
                                t.props.editGraphicChange(obj);
                            });
                        }, 300);
                    } else {
                        t.setState({ editGraphic: obj }, function () {
                            t.props.editGraphicChange(obj);
                        });
                    }
                });
            }
        }
        //图元鼠标悬浮事件

    }, {
        key: 'mouseOverGraphic',
        value: function mouseOverGraphic() {
            var t = this;
            t.state.gis.bind('mouseOverGraphic', function (param, e) {
                var obj = {
                    param: param, e: e,
                    id: param.attributes.id
                    // t.isSetTop(param.attributes.id,true);
                };if (typeof t.props.mouseOverGraphic === "function") {
                    t.props.mouseOverGraphic(obj);
                }
            });
        }
        //图元鼠标移开事件

    }, {
        key: 'mouseOutGraphic',
        value: function mouseOutGraphic() {
            var t = this;
            t.state.gis.bind('mouseOutGraphic', function (param, e) {
                var obj = {
                    param: param, e: e,
                    id: param.attributes.id
                    //取消点的置顶效果
                    // t.isSetTop(param.attributes.id,false);
                };if (typeof t.props.mouseOutGraphic === "function") {
                    t.props.mouseOutGraphic(obj);
                }
            });
        }
        //测距

    }, {
        key: 'vtxRangingTool',
        value: function vtxRangingTool(backcall) {
            var t = this;
            t.state.gis.vtxRangingTool(function (obj) {
                if (typeof backcall === "function") {
                    backcall(obj);
                }
            });
        }
        //是否置顶图元

    }, {
        key: 'isSetTop',
        value: function isSetTop(id, type) {
            var t = this;
            var graphic = t.getGraphic(id);
            t.state.gis.isSetTop(graphic, type);
        }
        //删除图元

    }, {
        key: 'removeGraphic',
        value: function removeGraphic(id, type) {
            var t = this;
            var graphic = t.getGraphic(id);
            if (!graphic) return false;
            t.state.gis.removeGraphic(graphic);
            var ids = [];
            switch (type) {
                case 'point':
                    ids = t.state.pointIds;
                    break;
                case 'line':
                    ids = t.state.lineIds;
                    break;
                case 'polygon':
                    ids = t.state.polygonIds;
                    break;
                case 'circle':
                    ids = t.state.circleIds;
                    break;
            }
            if (ids.indexOf(id) != -1) {
                ids.splice(ids.indexOf(id), 1);
            }
        }
        //点击图元事件

    }, {
        key: 'clickGraphic',
        value: function clickGraphic() {
            var t = this;
            if (typeof t.props.clickGraphic === "function") {
                t.state.gis.bind('clickGraphic', function (param, e) {
                    var obj = {
                        param: param,
                        type: param.geometry.type, //图元类型
                        attributes: _extends({}, param.attributes.other, { config: param.attributes.config }), //添加时图元信息
                        top: e.clientY, //当前点所在的位置(屏幕)
                        left: e.clientX,
                        e: e
                    };
                    t.props.clickGraphic(obj);
                });
            }
        }
        //拖拽地图开始

    }, {
        key: 'dragMapStart',
        value: function dragMapStart() {
            var t = this;
            if (typeof t.props.dragMapStart === "function") {
                t.state.gis.bind('dragMapStart', function (param, e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    //处理下数据,符合拖拽事件
                    t.props.dragMapStart(obj);
                });
            }
        }
        //拖拽地图结束事件

    }, {
        key: 'dragMapEnd',
        value: function dragMapEnd() {
            var t = this;
            if (typeof t.props.dragMapEnd === "function") {
                t.state.gis.bind('dragMapEnd', function (param, e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    //处理下数据,符合拖拽事件
                    t.props.dragMapEnd(obj);
                });
            }
        }
        //地图移动开始事件

    }, {
        key: 'moveStart',
        value: function moveStart() {
            var t = this;
            if (typeof t.props.moveStart === "function") {
                t.state.gis.bind('moveStart', function (param, e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    //处理下数据,符合拖拽事件
                    t.props.moveStart(obj);
                });
            }
        }
        //地图移动结束事件

    }, {
        key: 'moveEnd',
        value: function moveEnd() {
            var t = this;
            if (typeof t.props.moveEnd === "function") {
                t.state.gis.bind('moveEnd', function (param, e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    //处理下数据,符合拖拽事件
                    t.props.moveEnd(obj);
                });
            }
        }
        //地图更改缩放级别开始时触发触发此事件

    }, {
        key: 'zoomStart',
        value: function zoomStart() {
            var t = this;
            if (typeof t.props.zoomStart === "function") {
                t.state.gis.bind('zoomStart', function (param, e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.zoomStart(obj);
                });
            }
        }
        //地图更改缩放级别结束时触发触发此事件

    }, {
        key: 'zoomEnd',
        value: function zoomEnd() {
            var t = this;
            if (typeof t.props.zoomEnd === "function") {
                t.state.gis.bind('zoomEnd', function (param, e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.zoomEnd(obj);
                });
            }
        }
        //地图点击事件

    }, {
        key: 'clickMap',
        value: function clickMap() {
            var t = this;
            if (typeof t.props.clickMap === "function") {
                t.state.gis.bind('clickMap', function (param, e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.clickMap(obj);
                });
            }
        }
        //绘制图元
        /*
            参数
            geometryType:point/polyline/polygon/circle/rectangle  默认point
            parameter 样式 默认null 对象{}写入方式跟add方法一样(对应点线圆面)
            data //初始化数据   默认{id:'add'}
        */

    }, {
        key: 'draw',
        value: function draw(obj) {
            var t = this;
            obj = obj || {};
            obj.data = obj.data || {};
            obj.data.id = obj.data.id || 'draw' + new Date().getTime();
            obj.geometryType = obj.geometryType || 'point';
            //判断有没有
            var len = t.state.drawIds[obj.geometryType].indexOf(obj.data.id);
            if (obj.data && obj.data.id && len > -1) {
                t.removeGraphic(obj.data.id);
                t.state.drawIds[obj.geometryType].splice(len, 1);
            }
            obj.parameter = obj.parameter || { url: t.state.defaultPoint };
            t.state.gis.draw(obj.geometryType, obj.parameter, obj.data);
            t.state.drawIds[obj.geometryType].push(obj.data.id);
        }
        //关闭绘制图元

    }, {
        key: 'closeDraw',
        value: function closeDraw() {
            this.state.gis.closeDraw();
        }
        //绘制图元结束回调

    }, {
        key: 'drawEnd',
        value: function drawEnd() {
            var t = this;
            if (typeof t.props.drawEnd === "function") {
                t.state.gis.bind('drawEnd', function (src) {
                    if (src.geometryType !== 'point') {
                        src.area = t.calculateArea(src.id);
                    }
                    t.props.drawEnd(src);
                });
            }
        }
        //计算图元面积(面,圆)

    }, {
        key: 'calculateArea',
        value: function calculateArea(id) {
            var t = this;
            return t.state.gis.calculateArea(t.getGraphic(id));
        }
        //计算2点间距离 单位m 精确到个位

    }, {
        key: 'calculatePointsDistance',
        value: function calculatePointsDistance(f, s) {
            return Math.round(this.state.gis.calculatePointsDistance(f, s));
        }
        /*公共方法*/
        //判断对应参数是否是数组

    }, {
        key: 'isArray',
        value: function isArray(ary) {
            return Object.prototype.toString.call(ary) === '[object Array]';
        }
        //判断对应参数是否是数组

    }, {
        key: 'isObject',
        value: function isObject(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        }
        //判断对应参数是否是函数

    }, {
        key: 'isFunction',
        value: function isFunction(param) {
            return typeof param === 'function';
        }
        //数据解析(分析,新增,更新,删除对应的数据)

    }, {
        key: 'dataMatch',
        value: function dataMatch(oldData, newData, type) {
            var onlyOldData = Set(oldData).subtract(Set(newData)).toJS();
            var onlyNewData = Set(newData).subtract(Set(oldData)).toJS();
            var onlyOldIDs = onlyOldData.map(function (item) {
                return item[type];
            });
            var onlyNewIDs = onlyNewData.map(function (item) {
                return item[type];
            });
            var updateDataIDs = Set(onlyOldIDs).intersect(Set(onlyNewIDs)).toJS();
            var updatedData = onlyNewData.filter(function (item) {
                return updateDataIDs.indexOf(item[type]) > -1;
            });
            var replacedData = onlyOldData.filter(function (item) {
                return updateDataIDs.indexOf(item[type]) > -1;
            });
            var deletedDataIDs = onlyOldIDs.filter(function (oldID) {
                return updateDataIDs.indexOf(oldID) == -1;
            });
            var addedData = onlyNewData.filter(function (item) {
                return updateDataIDs.indexOf(item[type]) == -1;
            });

            return { deletedDataIDs: deletedDataIDs, addedData: addedData, updatedData: updatedData, replacedData: replacedData };
        }
    }, {
        key: 'deepEqual',
        value: function deepEqual(a, b) {
            return _immutable2.default.is(_immutable2.default.fromJS(a), _immutable2.default.fromJS(b));
        }
    }, {
        key: 'searchPoints',
        value: function searchPoints(searchValue) {
            var _this3 = this;

            var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
            var pageIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            return new Promise(function (resolve) {
                var psc = new BMap.LocalSearch(_this3.state.gis.map, {
                    onSearchComplete: function onSearchComplete(result) {
                        if (!result) {
                            resolve({
                                pageIndex: pageIndex,
                                pageSize: pageSize,
                                pois: []
                            });
                        } else if (result.getPageIndex() != pageIndex) {
                            psc.gotoPage(pageIndex);
                        } else {
                            var res_arr = [];
                            for (var i = 0, len = result.getCurrentNumPois(); i < len; i++) {
                                res_arr.push(result.getPoi(i));
                            }
                            resolve({
                                pageIndex: result.getPageIndex(),
                                pageSize: result.getCurrentNumPois(),
                                totalPages: result.getNumPages(),
                                count: result.getNumPois(),
                                pois: res_arr
                            });
                        }
                        // console.log(result,result.getNumPages(),result.getPageIndex());                    
                    },
                    pageCapacity: pageSize
                });
                psc.search(searchValue);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var _map = this.props;
            return _react2.default.createElement('div', { id: _map.mapId, className: 'vtx-map' });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var t = this;
            t.init();
            // let z_index;
            // $(document).on('mouseover','label.BMapLabel',function(e){
            //     z_index = $(this).css('z-index');
            //     $(this).css('z-index',1);
            // })
            // $(document).on('mouseout','label.BMapLabel',function(e){
            //     $(this).css('z-index',z_index)
            // })
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {//重新渲染结束
            // let t = this;    
            //返回计算距离方法
            // if(whetherIs('function',t.props.calculatePointsDistance)){
            //     t.props.calculatePointsDistance(t.calculatePointsDistance.bind(t));
            // }
            //回调显示方法
            // if(t.props.showGraphicById){
            //     t.props.showGraphicById(t.showGraphicById.bind(t));
            // }
            //回调隐藏方法
            // if(t.props.hideGraphicById){
            //     t.props.hideGraphicById(t.hideGraphicById.bind(t));
            // }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            //已加载组件，收到新的参数时调用
            var t = this;
            //点/线旧数据
            var _t$state = t.state,
                pointIds = _t$state.pointIds,
                lineIds = _t$state.lineIds,
                polygonIds = _t$state.polygonIds,
                circleIds = _t$state.circleIds,
                center = _t$state.center,
                boundaryInfo = _t$state.boundaryInfo;
            //点/线新数据

            var mapPoints = nextProps.mapPoints,
                mapLines = nextProps.mapLines,
                mapPolygons = nextProps.mapPolygons,
                mapCircles = nextProps.mapCircles,
                mapCenter = nextProps.mapCenter,
                setCenter = nextProps.setCenter,
                mapVisiblePoints = nextProps.mapVisiblePoints,
                setVisiblePoints = nextProps.setVisiblePoints,
                mapCluster = nextProps.mapCluster,
                setCluster = nextProps.setCluster,
                mapZoomLevel = nextProps.mapZoomLevel,
                setZoomLevel = nextProps.setZoomLevel,
                isRangingTool = nextProps.isRangingTool,
                mapRangingTool = nextProps.mapRangingTool,
                editGraphicId = nextProps.editGraphicId,
                isDoEdit = nextProps.isDoEdit,
                isEndEdit = nextProps.isEndEdit,
                boundaryName = nextProps.boundaryName,
                heatMapData = nextProps.heatMapData,
                customizedBoundary = nextProps.customizedBoundary,
                mapDraw = nextProps.mapDraw,
                isDraw = nextProps.isDraw,
                isCloseDraw = nextProps.isCloseDraw,
                isClearAll = nextProps.isClearAll,
                isOpenTrafficInfo = nextProps.isOpenTrafficInfo,
                mapPointCollection = nextProps.mapPointCollection,
                isclearAllPointCollection = nextProps.isclearAllPointCollection,
                isRemove = nextProps.isRemove,
                mapRemove = nextProps.mapRemove,
                isSetAreaRestriction = nextProps.isSetAreaRestriction,
                areaRestriction = nextProps.areaRestriction,
                isClearAreaRestriction = nextProps.isClearAreaRestriction;
            /*添加海量点*/

            if (mapPointCollection instanceof Array && !t.deepEqual(mapPointCollection, t.props.mapPointCollection)) {
                var _t$dataMatch = t.dataMatch(t.props.mapPointCollection, mapPointCollection, 'id'),
                    deletedDataIDs = _t$dataMatch.deletedDataIDs,
                    addedData = _t$dataMatch.addedData,
                    updatedData = _t$dataMatch.updatedData;

                t.clearPointCollection(deletedDataIDs);
                t.addPointCollection(addedData);
                t.updatePointCollection(updatedData);
            }
            /*点数据处理
                pointData[2]相同的点,执行刷新
                pointData[1]的数据在idsForGraphicId中不存在的,执行新增
                pointData[0]数据中多余的id,执行删除
            */
            if (mapPoints instanceof Array && !t.deepEqual(mapPoints, t.props.mapPoints)) {
                var oldMapPoints = t.props.mapPoints;
                var newMapPoints = mapPoints;
                //过滤编辑的图元
                if (!!t.state.editGraphic) {
                    oldMapPoints = t.props.mapPoints.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                    newMapPoints = mapPoints.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                }

                var _t$dataMatch2 = t.dataMatch(oldMapPoints, newMapPoints, 'id'),
                    _deletedDataIDs = _t$dataMatch2.deletedDataIDs,
                    _addedData = _t$dataMatch2.addedData,
                    _updatedData = _t$dataMatch2.updatedData;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _deletedDataIDs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var id = _step.value;

                        t.removeGraphic(id, 'point');
                    }
                    //增加
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                t.addPoint(_addedData);
                //更新
                t.updatePoint(_updatedData);
            }
            /*
                线数据处理
                先全删除,再新增
            */
            if (mapLines instanceof Array && !t.deepEqual(mapLines, t.props.mapLines)) {
                var oldMapLines = t.props.mapLines;
                var newMapLines = mapLines;
                if (!!t.state.editGraphic) {
                    oldMapLines = t.props.mapLines.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                    newMapLines = mapLines.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                }

                var _t$dataMatch3 = t.dataMatch(oldMapLines, newMapLines, 'id'),
                    _deletedDataIDs2 = _t$dataMatch3.deletedDataIDs,
                    _addedData2 = _t$dataMatch3.addedData,
                    _updatedData2 = _t$dataMatch3.updatedData;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var actDelIds = [].concat(_toConsumableArray(_deletedDataIDs2), _toConsumableArray(_updatedData2.map(function (item) {
                    return item.id;
                })));
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = actDelIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _id = _step2.value;

                        t.removeGraphic(_id, 'line');
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                t.addLine([].concat(_toConsumableArray(_addedData2), _toConsumableArray(_updatedData2)));
            }
            /*
                面数据处理
                先全删除,再新增
            */
            if (mapPolygons instanceof Array && !t.deepEqual(mapPolygons, t.props.mapPolygons)) {
                var oldMapPolygons = t.props.mapPolygons;
                var newMapPolygons = mapPolygons;
                if (!!t.state.editGraphic) {
                    oldMapPolygons = t.props.mapPolygons.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                    newMapPolygons = mapPolygons.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                }

                var _t$dataMatch4 = t.dataMatch(oldMapPolygons, newMapPolygons, 'id'),
                    _deletedDataIDs3 = _t$dataMatch4.deletedDataIDs,
                    _addedData3 = _t$dataMatch4.addedData,
                    _updatedData3 = _t$dataMatch4.updatedData;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var _actDelIds = [].concat(_toConsumableArray(_deletedDataIDs3), _toConsumableArray(_updatedData3.map(function (item) {
                    return item.id;
                })));
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = _actDelIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _id2 = _step3.value;

                        t.removeGraphic(_id2, 'polygon');
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                t.addPolygon([].concat(_toConsumableArray(_addedData3), _toConsumableArray(_updatedData3)));
            }
            /*
                圆数据处理
                先全删除,再新增
            */
            if (mapCircles instanceof Array && !t.deepEqual(mapCircles, t.props.mapCircles)) {
                var oldMapCircles = t.props.mapCircles;
                var newMapCircles = mapCircles;
                if (!!t.state.editGraphic) {
                    oldMapCircles = t.props.mapCircles.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                    newMapCircles = mapCircles.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                }

                var _t$dataMatch5 = t.dataMatch(oldMapCircles, newMapCircles, 'id'),
                    _deletedDataIDs4 = _t$dataMatch5.deletedDataIDs,
                    _addedData4 = _t$dataMatch5.addedData,
                    _updatedData4 = _t$dataMatch5.updatedData;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var _actDelIds2 = [].concat(_toConsumableArray(_deletedDataIDs4), _toConsumableArray(_updatedData4.map(function (item) {
                    return item.id;
                })));
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = _actDelIds2[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var _id3 = _step4.value;

                        t.removeGraphic(_id3, 'circle');
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                t.addCircle([].concat(_toConsumableArray(_addedData4), _toConsumableArray(_updatedData4)));
            }
            //图元编辑调用
            if (isDoEdit) {
                t.doEdit(editGraphicId);
            }
            if (isEndEdit) {
                t.endEdit();
            }
            //绘制边界线
            if (boundaryName instanceof Array && !t.deepEqual(boundaryName, t.props.boundaryName)) {
                var newBDName = Set(boundaryName);
                var oldBDName = Set(t.props.boundaryName);
                var removedBoundaryName = oldBDName.subtract(newBDName).toJS();
                var addedBoundaryName = newBDName.subtract(oldBDName).toJS();
                t.removeBaiduBoundary(removedBoundaryName);
                t.addBaiduBoundary(addedBoundaryName);
            }
            // 获取热力图
            if (heatMapData && !t.deepEqual(heatMapData, t.props.heatMapData)) {
                t.addHeatMap(heatMapData);
            }
            if (customizedBoundary instanceof Array && !t.deepEqual(customizedBoundary, t.props.customizedBoundary)) {
                var _t$dataMatch6 = t.dataMatch(t.props.customizedBoundary, customizedBoundary, 'id'),
                    _deletedDataIDs5 = _t$dataMatch6.deletedDataIDs,
                    _addedData5 = _t$dataMatch6.addedData,
                    _updatedData5 = _t$dataMatch6.updatedData;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var _actDelIds3 = [].concat(_toConsumableArray(_deletedDataIDs5), _toConsumableArray(_updatedData5.map(function (item) {
                    return item.id;
                })));
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = _actDelIds3[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var _id4 = _step5.value;

                        t.removeGraphic(_id4, 'line');
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }

                t.addLine([].concat(_toConsumableArray(_addedData5), _toConsumableArray(_updatedData5)));
            }
            //绘制图元
            if (isDraw) {
                t.draw(mapDraw);
            }
            if (isCloseDraw) {
                t.closeDraw();
            }
            if (isClearAll) {
                t.clearAll();
            }
            if (setVisiblePoints) {
                switch (mapVisiblePoints.fitView) {
                    case 'point':
                        t.setVisiblePoints(pointIds, mapVisiblePoints.type);
                        break;
                    case 'line':
                        t.setVisiblePoints(lineIds, mapVisiblePoints.type);
                        break;
                    case 'polygon':
                        t.setVisiblePoints(polygonIds, mapVisiblePoints.type);
                        break;
                    case 'circle':
                        t.setVisiblePoints(circleIds, mapVisiblePoints.type);
                        break;
                    case 'all':
                        t.setVisiblePoints(pointIds.concat(lineIds).concat(polygonIds).concat(circleIds), mapVisiblePoints.type);
                        break;
                    default:
                        t.setVisiblePoints(mapVisiblePoints.fitView, mapVisiblePoints.type);
                        break;
                }
            }
            //设置中心点
            if (setCenter) {
                if (!(t.getCurrentCenter()[0] == mapCenter[0] && t.getCurrentCenter()[1] == mapCenter[1])) {
                    t.setCenter(mapCenter);
                }
            }
            //设置点聚合
            if (setCluster) {
                t.cluster(mapCluster);
            }
            //设置比例尺
            if (setZoomLevel) {
                if (!(t.getZoomLevel() == mapZoomLevel)) {
                    t.setZoomLevel(mapZoomLevel);
                }
            }
            //测距工具调用
            if (isRangingTool) {
                t.vtxRangingTool(mapRangingTool);
            }
            if (isOpenTrafficInfo) {
                t.openTrafficInfo();
            } else {
                t.hideTrafficInfo();
            }
            if (isclearAllPointCollection) {
                t.clearAllPointCollection();
            }
            if (isRemove) {
                mapRemove.map(function (item, index) {
                    switch (item.type) {
                        case 'draw':
                            t.removeGraphic(item.id);
                            if (t.state.drawIds.point.indexOf(item.id) > -1) {
                                t.state.drawIds.point.splice(t.state.drawIds.point.indexOf(item.id), 1);
                            }
                            if (t.state.drawIds.polyline.indexOf(item.id) > -1) {
                                t.state.drawIds.polyline.splice(t.state.drawIds.polyline.indexOf(item.id), 1);
                            }
                            if (t.state.drawIds.polygon.indexOf(item.id) > -1) {
                                t.state.drawIds.polygon.splice(t.state.drawIds.polygon.indexOf(item.id), 1);
                            }
                            if (t.state.drawIds.circle.indexOf(item.id) > -1) {
                                t.state.drawIds.circle.splice(t.state.drawIds.circle.indexOf(item.id), 1);
                            }
                            if (t.state.drawIds.rectangle.indexOf(item.id) > -1) {
                                t.state.drawIds.rectangle.splice(t.state.drawIds.rectangle.indexOf(item.id), 1);
                            }
                            break;
                        default:
                            t.removeGraphic(item.id, item.type);
                            break;
                    }
                });
            }
            //设置区域限制
            if (isSetAreaRestriction && areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]) {
                t.setAreaRestriction(areaRestriction);
            }
            if (isClearAreaRestriction) {
                t.clearAreaRestriction();
            }
        }
    }]);

    return Map;
}(_react2.default.Component);

exports.default = Map;
module.exports = exports['default'];