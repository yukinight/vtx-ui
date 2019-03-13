'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./Map.css');

var _MapToolFunction = require('../MapToolFunction');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _default = require('../../default');

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Set = _immutable2.default.Set;
//公共地址配置

var gisMapConstant = {
    circle: 'BMAP_POINT_SHAPE_CIRCLE', //圆形
    star: 1, //星形
    square: 4, //方形
    rhombus: 5, //菱形
    waterdrop: 2, //水滴状，该类型无size和color属性
    tiny: 1, //定义点的尺寸为超小，宽高为2px*2px
    smaller: 2, //定义点的尺寸为很小，宽高为4px*4px
    small: 3, //定义点的尺寸为小，宽高为8px*8px
    normal: 4, //定义点的尺寸为正常，宽高为10px*10px，为海量点默认尺寸
    big: 5, //定义点的尺寸为大，宽高为16px*16px
    bigger: 6, //定义点的尺寸为很大，宽高为20px*20px
    huge: 7 //定义点的尺寸为超大，宽高为30px*30px
};

var BaiduMap = function (_React$Component) {
    _inherits(BaiduMap, _React$Component);

    function BaiduMap(props) {
        _classCallCheck(this, BaiduMap);

        var _this = _possibleConstructorReturn(this, (BaiduMap.__proto__ || Object.getPrototypeOf(BaiduMap)).call(this, props));

        _this.GM = new _MapToolFunction.graphicManage(); //初始化 图元管理方法
        _this.getPolygonArea = _MapToolFunction.getPolygonArea;
        _this.initPointIndex = 0; //初始化地图时记录点当前位置
        _this._cluster = null; //点聚合对象
        _this._rangingTool = null; //测距对象
        _this._bmar = null; //区域限制对象
        _this._drawmanager = null; //图元绘制对象
        _this.editGraphicChange = null; //编辑方法回调
        _this.editTimeout = null; //圆编辑回调延迟时间对象
        _this._boundary = null; //获取行政区域数据的对象
        _this.moveToTimer = null; //moveTo时间对象
        _this.heatmap = null; //热力图对象
        _this.morepoints = []; //海量点数组
        _this.movePoints = []; //移动点的动画集合
        _this.state = {
            gis: null, //地图对象
            mapId: props.mapId,
            mapCreated: false,
            pointIds: [], //地图上点的ids
            lineIds: [], //地图上线的ids
            polygonIds: [], //地图上面的ids
            circleIds: [], //地图上圆的ids
            editId: '', //当前编辑的图元id
            editGraphic: '', //当前编辑完后图元所有数据
            boundaryInfo: [], //当前画出的边界线的id和区域名
            drawIds: { //绘制工具id集合
                point: [],
                polyline: [],
                polygon: [],
                circle: [],
                rectangle: []
            }
        };
        _this.loadMapJs();
        return _this;
    }

    _createClass(BaiduMap, [{
        key: 'loadMapJs',
        value: function loadMapJs() {
            this.loadMapComplete = new Promise(function (resolve, reject) {
                if (window.BMap) {
                    resolve(window.BMap);
                } else {
                    $.getScript('http://api.map.baidu.com/getscript?v=2.0&ak=EVlFc6DZzAzU5avIjoxNcFgQ', function () {
                        var DistanceTool = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/DistanceTool_min.js', function () {
                                resolve();
                            });
                        });
                        var TrafficControl = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/TrafficControl_min.js', function () {
                                resolve();
                            });
                        });
                        var MarkerClusterer = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/MarkerClusterer_min.js', function () {
                                resolve();
                            });
                        });
                        var AreaRestriction = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/AreaRestriction_min.js', function () {
                                resolve();
                            });
                        });
                        var DrawingManager = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/DrawingManager_min.js', function () {
                                resolve();
                            });
                        });
                        var Heatmap = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/Heatmap_min.js', function () {
                                resolve();
                            });
                        });
                        var GeoUtils = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/GeoUtils_min.js', function () {
                                resolve();
                            });
                        });
                        var TextIconOverlay = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/TextIconOverlay_min.js', function () {
                                resolve();
                            });
                        });

                        Promise.all([DistanceTool, TrafficControl, MarkerClusterer, AreaRestriction, DrawingManager, Heatmap, GeoUtils, TextIconOverlay]).then(function () {
                            resolve(window.BMap);
                        });
                    });
                    $("<link>").attr({ rel: "stylesheet", type: "text/css", href: "http://api.map.baidu.com/library/TrafficControl/1.4/src/TrafficControl_min.css" }).appendTo("head");
                }
            });
        }
        //初始化地图数据

    }, {
        key: 'init',
        value: function init() {
            var t = this;
            //创建地图
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
            //画边界线
            if (boundaryName instanceof Array && boundaryName.length > 0) {
                t.addBaiduBoundary(boundaryName);
            }
            // 画热力图
            if (heatMapData) {
                t.heatMapOverlay(heatMapData);
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
            //设置点聚合
            if (mapCluster instanceof Array) {
                t.cluster(mapCluster);
            }
            //开关路况
            if (isOpenTrafficInfo) {
                t.openTrafficInfo();
            } else {
                t.hideTrafficInfo();
            }
            //设置区域限制
            if (areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]) {
                t.setAreaRestriction(areaRestriction);
            }
            //是否设置比例尺
            if (t.props.showControl) {
                t.showControl();
            }
            /*地图事件*/
            //初始化地图点击事件
            t.clickMap();
            //地图拖动之前事件
            t.dragMapStart();
            //地图拖动结束后事件
            t.dragMapEnd();
            //地图移动之前事件
            t.moveStart();
            //地图移动结束后事件
            t.moveEnd();
            //地图缩放开始前事件
            t.zoomStart();
            //地图缩放结束后事件
            t.zoomEnd();

            t.setState({
                mapCreated: true
            });
        }
        //创建地图

    }, {
        key: 'createMap',
        value: function createMap() {
            var t = this;
            var _t$props = t.props,
                mapCenter = _t$props.mapCenter,
                mapId = _t$props.mapId,
                mapZoomLevel = _t$props.mapZoomLevel,
                minZoom = _t$props.minZoom,
                maxZoom = _t$props.maxZoom;

            var options = {
                zoom: mapZoomLevel || 10,
                center: mapCenter || [116.404, 39.915],
                minZoom: minZoom, maxZoom: maxZoom
            };
            if (window.VtxMap) {
                window.VtxMap[mapId] = {};
            } else {
                window.VtxMap = {};
            }
            var map = window.VtxMap[mapId] = t.state.gis = new BMap.Map(mapId, {
                enableMapClick: false,
                minZoom: options.minZoom,
                maxZoom: options.maxZoom
            });
            setTimeout(function () {
                $('#myCanvasElement').parent().children('svg').css({ 'z-index': 1 });
            }, 500);
            // 初始化地图,设置中心点坐标和地图级别
            map.centerAndZoom(new BMap.Point(parseFloat(options.center[0]), parseFloat(options.center[1])), options.zoom);
            //添加地图类型控件(几乎不用,先写着)
            if (t.props.satelliteSwitch) {
                map.addControl(new BMap.MapTypeControl());
            }
            //初始化路况控件
            if (!t._trafficCtrl) {
                t._trafficCtrl = new BMapLib.TrafficControl({
                    // 是否显示路况提示面板
                    showPanel: false
                });
                map.addControl(t._trafficCtrl);
                if (document.getElementById('tcBtn').remove) {
                    document.getElementById('tcBtn').remove();
                } else {
                    document.getElementById('tcBtn').removeNode();
                }
            }
            //开启鼠标滚轮缩放
            map.enableScrollWheelZoom(true);
            //初始化获取行政区域数据的对象
            if (!t._boundary) {
                t._boundary = new BMap.Boundary();
            }
            //初始化点聚合对象
            if (!t._cluster) {
                t._cluster = new BMapLib.MarkerClusterer(map, { maxZoom: 17 });
            }
            //初始化测距对象
            if (!t._rangingTool) {
                t._rangingTool = new BMapLib.DistanceTool(map);
            }
            //初始化区域限制对象
            if (!t._bmar) {
                t._bmar = new BMapLib.AreaRestriction();
            }
            //初始化图元绘制对象
            if (!t._drawmanager) {
                t._drawmanager = new BMapLib.DrawingManager(map);
                //监听绘制结束事件
                t._drawmanager.addEventListener('overlaycomplete', function (e) {
                    // console.log(e);
                    // console.log(e.drawingMode);
                    // console.log(e.overlay);
                    // console.log(e.calculate);
                    // console.log(e.label);
                    // console.log(e.extData);
                    if (e.label) {
                        t.state.gis.removeOverlay(e.label);
                    }
                    var drawExtData = e.extData;
                    //保存绘制图元的id便于后期比对
                    t.state.drawIds[drawExtData.type].push(drawExtData.id);
                    var backobj = {
                        id: drawExtData.id,
                        attributes: drawExtData.attributes,
                        geometryType: drawExtData.type,
                        mapLayer: e.overlay,
                        geometry: {
                            type: drawExtData.type
                        }
                    };
                    //缓存绘制的图元信息
                    t.GM.setGraphic(drawExtData.id, e.overlay);

                    //区别点和圆的经纬度数据处理

                    var _t$dealData = t.dealData(e.overlay),
                        lnglatAry = _t$dealData.lnglatAry,
                        _extent = _t$dealData._extent,
                        path = _t$dealData.path;
                    //处理返回数据


                    switch (drawExtData.type) {
                        case 'point':
                            backobj.geometry.x = e.overlay.getPosition().lng;
                            backobj.geometry.y = e.overlay.getPosition().lat;
                            break;
                        case 'polyline':
                            backobj.distance = e.calculate;
                            backobj.lnglatAry = lnglatAry;
                            backobj.geometry.paths = path;
                            backobj.geometry._extent = _extent;
                            break;
                        case 'polygon':
                            backobj.area = e.calculate;
                            backobj.lnglatAry = lnglatAry;
                            backobj.geometry.rings = path;
                            backobj.geometry._extent = _extent;
                            break;
                        case 'rectangle':
                            backobj.area = e.calculate;
                            backobj.lnglatAry = lnglatAry;
                            backobj.geometry.rings = path;
                            backobj.geometry._extent = _extent;
                            break;
                        case 'circle':
                            backobj.geometry.x = e.overlay.getCenter().lng;
                            backobj.geometry.y = e.overlay.getCenter().lat;
                            backobj.geometry.radius = e.overlay.getRadius();
                            backobj.area = e.calculate;
                            break;
                    }
                    t.GM.setGraphicParam(drawExtData.id, backobj);
                    t._drawmanager.close();
                    if ('drawEnd' in t.props) {
                        t.props.drawEnd(backobj);
                    }
                });
            }
        }
        //新增点位

    }, {
        key: 'addPoint',
        value: function addPoint(mapPoints, type) {
            var _this2 = this;

            var t = this;
            var psids = [].concat(_toConsumableArray(t.state.pointIds));
            mapPoints.map(function (item, index) {
                //如果id重复,直接跳过不执行.
                if (_this2.GM.isRepetition(item.id)) {
                    console.error('\u52A0\u70B9id: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //点位数据不符合,直接跳过
                if (!item.longitude || !item.latitude) {
                    console.error('\u70B9 \u7ECF\u7EAC\u5EA6 \u6570\u636E\u9519\u8BEF');
                    return false;
                }
                var cg = {
                    width: 30,
                    height: 30,
                    labelContent: '',
                    labelPixelX: 0,
                    labelPixelY: 34,
                    BAnimationType: 3,
                    //高德以左上定位,百度以中心为定位
                    //默认点的偏移值就不同
                    markerContentX: -15,
                    markerContentY: -30,
                    deg: 0
                };
                if (item.markerContent) {
                    cg = _extends({}, cg, { markerContentX: 0, markerContentY: 0, width: 100, height: 30 });
                }
                //初始化默认数据
                if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                var position = new BMap.Point(item.longitude, item.latitude);
                var marker = null;
                if (item.markerContent) {
                    /*自定义html加点
                     用Label来实现,无法再添加label(高德有判断,实现不同)*/
                    //覆盖物参数
                    var markerOption = {
                        offset: new BMap.Size(cg.markerContentX + cg.width / 2, cg.markerContentY + cg.height / 2),
                        icon: null
                    };
                    var icon = new BMap.Icon(_default2.default.mapServerURL + '/images/touming.png', new BMap.Size(cg.width, cg.height));
                    icon.setImageSize(new BMap.Size(cg.width, cg.height));
                    markerOption = _extends({}, markerOption, { icon: icon });
                    marker = new BMap.Marker(position, markerOption);

                    //覆盖物参数
                    var markerLOption = {
                        offset: new BMap.Size(0, 0)
                    };
                    var markerL = new BMap.Label(item.markerContent, markerLOption);
                    markerL.setStyle({
                        backgroundColor: '',
                        border: '0'
                    });
                    marker.setLabel(markerL);
                } else {
                    /*添加非html点位*/
                    //覆盖物参数
                    var _markerOption = {
                        offset: new BMap.Size(cg.markerContentX + cg.width / 2, cg.markerContentY + cg.height / 2),
                        icon: null
                    };
                    var _icon = new BMap.Icon(item.url || _default2.default.mapServerURL + '/images/defaultMarker.png', new BMap.Size(cg.width, cg.height));
                    _icon.setImageSize(new BMap.Size(cg.width, cg.height));
                    _markerOption = _extends({}, _markerOption, { icon: _icon });
                    marker = new BMap.Marker(position, _markerOption);
                    //设置选择角度
                    marker.setRotation(cg.deg);
                    //添加label
                    if (item.canShowLabel && cg.labelContent) {
                        //label默认样式
                        var labelClass = 'label-content';
                        //接受label自定义样式
                        if (item.labelClass) {
                            labelClass = item.labelClass.split(',').join(' ');
                        }
                        var markerLabel = new BMap.Label("<div class='" + labelClass + "' style=\"margin-left: 0;\">" + cg.labelContent + "</div>", {
                            offset: new BMap.Size(cg.labelPixelX, cg.labelPixelY)
                        });
                        markerLabel.setStyle({
                            border: '0',
                            backgroundColor: ''
                        });
                        marker.setLabel(markerLabel);
                    }
                }
                if (cg.zIndex || cg.zIndex === 0) {
                    marker.setZIndex(cg.zIndex);
                }
                //添加点到地图
                t.state.gis.addOverlay(marker);
                if (!item.markerContent && cg.BAnimationType == 0) {
                    marker.setAnimation(BMAP_ANIMATION_BOUNCE);
                } else if (!item.markerContent && cg.BAnimationType == 1) {
                    marker.setAnimation(BMAP_ANIMATION_DROP);
                }
                //点击事件
                marker.addEventListener('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                //鼠标移入事件
                marker.addEventListener('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                //鼠标移出事件
                marker.addEventListener('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                //缓存所有点的id
                psids.push(item.id);
                //缓存当前点的图元对象和基本数据
                t.GM.setGraphic(item.id, marker).setGraphicParam(item.id, {
                    attributes: _extends({}, item, { other: item }),
                    geometryType: 'point',
                    geometry: {
                        type: 'point',
                        x: item.longitude,
                        y: item.latitude
                    }
                });
            });
            if (type !== 'defined') {
                //所有点缓存在state中
                t.setState({
                    pointIds: psids
                });
            }
        }
        //更新点位

    }, {
        key: 'updatePoint',
        value: function updatePoint(mapPoints) {
            var _this3 = this;

            var t = this;
            // let dpoints = [],apoints = [];
            mapPoints.map(function (item, index) {
                //判断图元是否存在.
                if (_this3.GM.isRepetition(item.id)) {
                    //点位数据不符合,直接跳过
                    if (!item.longitude || !item.latitude) {
                        console.error('\u70B9 \u7ECF\u7EAC\u5EA6 \u6570\u636E\u9519\u8BEF');
                        return false;
                    }
                    //获取原有的图元
                    var gc = t.GM.getGraphic(item.id);
                    var cg = {
                        width: 30,
                        height: 30,
                        labelContent: '',
                        labelPixelX: 0,
                        labelPixelY: 34,
                        BAnimationType: 3,
                        //高德以左上定位,百度以中心为定位
                        //默认点的偏移值就不同
                        markerContentX: -15,
                        markerContentY: -30,
                        deg: 0
                    };
                    if (item.markerContent) {
                        cg = _extends({}, cg, { markerContentX: 0, markerContentY: 0, width: 100, height: 30 });
                    }
                    if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    if (item.markerContent) {
                        gc.setOffset(new BMap.Size(cg.markerContentX + cg.width / 2, cg.markerContentY + cg.height / 2));
                        var icon = new BMap.Icon(_default2.default.mapServerURL + '/images/touming.png', new BMap.Size(cg.width, cg.height));
                        icon.setImageSize(new BMap.Size(cg.width, cg.height));
                        gc.setIcon(icon);
                        if (!!gc.getLabel()) {
                            gc.getLabel().setContent(item.markerContent);
                            gc.getLabel().setOffset(new BMap.Size(0, 0));
                        } else {
                            //覆盖物参数
                            var markerLOption = {
                                offset: new BMap.Size(0, 0)
                            };
                            var markerL = new BMap.Label(item.markerContent, markerLOption);
                            markerL.setStyle({
                                backgroundColor: '',
                                border: '0'
                            });
                            gc.setLabel(markerL);
                        }
                    } else {
                        cg.width = cg.width || gc.getIcon().size.width;
                        cg.height = cg.height || gc.getIcon().size.height;
                        //未改变方式的点 直接修改数据
                        var _icon2 = new BMap.Icon(item.url || _default2.default.mapServerURL + '/images/defaultMarker.png', new BMap.Size(cg.width, cg.height));
                        _icon2.setImageSize(new BMap.Size(cg.width, cg.height));
                        gc.setIcon(_icon2);
                        gc.setOffset(new BMap.Size((cg.markerContentX || -15) + cg.width / 2, (cg.markerContentY || -30) + cg.height / 2));
                        //修改角度
                        gc.setRotation(cg.deg || 0);
                        //添加label
                        if (item.canShowLabel && cg.labelContent) {
                            var markerLabel = gc.getLabel(),

                            //label默认样式
                            labelClass = 'label-content';
                            //接受label自定义样式
                            if (item.labelClass) {
                                labelClass = item.labelClass.split(',').join(' ');
                            }
                            var labelContent = "<div class='" + labelClass + "' style=\"margin-left: 0;\">" + cg.labelContent + "</div>",
                                labelOffset = new BMap.Size(cg.labelPixelX, cg.labelPixelY);
                            if (markerLabel) {
                                markerLabel.setContent(labelContent);
                                markerLabel.setOffset(labelOffset);
                            } else {
                                markerLabel = new BMap.Label(labelContent, {
                                    offset: labelOffset
                                });
                                markerLabel.setStyle({
                                    border: '0',
                                    backgroundColor: ''
                                });
                                gc.setLabel(markerLabel);
                            }
                        } else {
                            if (!!gc.getLabel()) {
                                gc.getLabel().setContent('');
                            }
                        }
                        if (cg.BAnimationType == 0) {
                            gc.setAnimation(BMAP_ANIMATION_BOUNCE);
                        } else if (cg.BAnimationType == 1) {
                            gc.setAnimation(BMAP_ANIMATION_DROP);
                        } else {
                            gc.setAnimation(null);
                        }
                        /*moveTo*/
                    }
                    //动画效果会延迟执行经纬度的切换
                    if (cg.isAnimation) {
                        t.moveTo(item.id, [item.longitude, item.latitude], cg.animationDelay, cg.autoRotation, item.url, item.urlleft);
                    } else {
                        //修改经纬度
                        gc.setPosition(new BMap.Point(item.longitude, item.latitude));
                    }
                    if (cg.zIndex || cg.zIndex === 0) {
                        gc.setZIndex(cg.zIndex);
                    }
                    t.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, { other: item }),
                        geometryType: 'point',
                        geometry: {
                            type: 'point',
                            x: item.longitude,
                            y: item.latitude
                        }
                    });
                } else {
                    console.error('\u66F4\u65B0\u7684\u70B9\u4F4Did\u4E0D\u5B58\u5728!');
                    return false;
                }
            });
            t.moveAnimation();
            // //删除改变了加载方式的点
            // dpoints.map((item,index)=>{
            //     t.removeGraphic(item,'point');
            // });
            // if(apoints.length > 0){
            //     //重新加载改变了方式的点
            //     setTimeout(()=>{
            //         t.addPoint(apoints);
            //     },100);
            // }
        }
        //添加线

    }, {
        key: 'addLine',
        value: function addLine(mapLines, type) {
            var t = this;
            var lsids = [].concat(_toConsumableArray(t.state.lineIds));
            //遍历添加线(图元)
            mapLines.map(function (item, index) {
                //如果id重复,直接跳过不执行.
                if (t.GM.isRepetition(item.id)) {
                    console.error('\u591A\u6298\u7EBFid: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //多折线点位数据不符合,直接跳过
                if (!(item.paths && item.paths.length >= 2)) {
                    console.error('\u591A\u6298\u7EBFpaths\u6570\u636E\u9519\u8BEF');
                    return false;
                }
                //初始化默认参数
                var cg = {
                    color: '#277ffa',
                    pellucidity: 0.9,
                    lineWidth: 5,
                    lineType: 'solid',
                    isHidden: false
                    //合并参数
                };if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                //处理线的点数组
                var linePath = item.paths.map(function (item, index) {
                    return new BMap.Point(item[0], item[1]);
                }),

                //处理线的参数
                lineOption = {
                    strokeColor: cg.color, // 线颜色
                    strokeWeight: cg.lineWidth, // 线宽
                    strokeOpacity: cg.pellucidity, // 线透明度
                    strokeStyle: cg.lineType // 线样式
                };
                //创建线对象
                var line = new BMap.Polyline(linePath, lineOption);
                //判断线显示和隐藏
                if (cg.isHidden) {
                    line.hide();
                } else {
                    line.show();
                }
                lsids.push(item.id);
                //添加线至地图
                t.state.gis.addOverlay(line);
                //点击事件
                line.addEventListener('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                //鼠标移入事件
                line.addEventListener('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                //鼠标移出事件
                line.addEventListener('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                t.GM.setGraphic(item.id, line).setGraphicParam(item.id, {
                    attributes: _extends({}, item, {
                        paths: item.paths,
                        other: item
                    }),
                    geometryType: 'polyline',
                    geometry: {
                        type: 'polyline',
                        paths: item.paths
                    }
                });
            });
            if (type !== 'defined') {
                t.setState({
                    lineIds: lsids
                });
            }
        }
        //更新线

    }, {
        key: 'updateLine',
        value: function updateLine(mapLines) {
            var t = this;
            //遍历添加线(图元)
            mapLines.map(function (item, index) {
                //判断图元是否存在.
                if (t.GM.isRepetition(item.id)) {
                    //多折线点位数据不符合,直接跳过
                    if (!(item.paths && item.paths.length >= 2)) {
                        console.error('\u591A\u6298\u7EBFpaths\u6570\u636E\u9519\u8BEF');
                        return false;
                    }
                } else {
                    console.error('\u66F4\u65B0\u7684\u591A\u6298\u7EBFid\u4E0D\u5B58\u5728!');
                    return false;
                }
                var gc = t.GM.getGraphic(item.id);
                //初始化默认参数
                var cg = {
                    color: '#277ffa',
                    pellucidity: 0.9,
                    lineWidth: 5,
                    lineType: 'solid', //'solid'  'dashed'
                    isHidden: false
                    //合并参数
                };if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                //处理线的点数组
                var linePath = item.paths.map(function (item, index) {
                    return new BMap.Point(item[0], item[1]);
                });
                //修改线点位数据
                gc.setPath(linePath);
                //修改线颜色
                gc.setStrokeColor(cg.color);
                //修改透明度
                gc.setStrokeOpacity(cg.pellucidity);
                //修改线宽度
                gc.setStrokeWeight(cg.lineWidth);
                //修改线的类型
                gc.setStrokeStyle(cg.lineType);
                //判断线显示和隐藏
                if (cg.isHidden) {
                    gc.hide();
                } else {
                    gc.show();
                }
                t.GM.setGraphicParam(item.id, {
                    attributes: _extends({}, item, {
                        paths: item.paths,
                        other: item
                    }),
                    geometryType: 'polyline',
                    geometry: {
                        type: 'polyline',
                        paths: item.paths
                    }
                });
            });
        }
        //添加面

    }, {
        key: 'addPolygon',
        value: function addPolygon(mapPolygons) {
            var t = this;
            var pgsids = [].concat(_toConsumableArray(t.state.polygonIds));
            //遍历添加面(图元)
            mapPolygons.map(function (item, index) {
                //如果id重复,直接跳过不执行.
                if (t.GM.isRepetition(item.id)) {
                    console.error('\u591A\u8FB9\u5F62id: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //多边形点位数据不符合,直接跳过
                if (!(item.rings && item.rings.length >= 3)) {
                    console.error('\u591A\u8FB9\u5F62rings\u6570\u636E\u9519\u8BEF');
                    return false;
                }
                //初始化参数
                var cg = {
                    lineType: 'solid',
                    lineWidth: 5,
                    lineColor: '#277ffa',
                    lineOpacity: 1,
                    color: '#fff',
                    pellucidity: 0.5
                    // isHidden: false  //后期需要再加
                };
                if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                //面的参数
                var polygonOption = {
                    strokeColor: cg.lineColor,
                    strokeOpacity: cg.lineOpacity,
                    strokeWeight: cg.lineWidth,
                    strokeStyle: cg.lineType,
                    fillColor: cg.color,
                    fillOpacity: cg.pellucidity
                },
                    polygonPath = item.rings.map(function (item, index) {
                    return new BMap.Point(item[0], item[1]);
                });
                //创建面对象
                var polygon = new BMap.Polygon(polygonPath, polygonOption);
                //添加面至地图
                t.state.gis.addOverlay(polygon);
                //点击事件
                polygon.addEventListener('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                //鼠标移入事件
                polygon.addEventListener('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                //鼠标移出事件
                polygon.addEventListener('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                //缓存面id
                pgsids.push(item.id);
                //缓存面图元对象和对于传入数据
                t.GM.setGraphic(item.id, polygon).setGraphicParam(item.id, {
                    attributes: _extends({}, item, {
                        rings: item.rings,
                        other: item
                    }),
                    geometryType: 'polygon',
                    geometry: {
                        type: 'polygon',
                        rings: item.rings
                    }
                });
            });
            t.setState({
                polygonIds: pgsids
            });
        }
        //更新面

    }, {
        key: 'updatePolygon',
        value: function updatePolygon(mapPolygons) {
            var t = this;
            mapPolygons.map(function (item, index) {
                //判断图元是否存在.
                if (t.GM.isRepetition(item.id)) {
                    //多边形点位数据不符合,直接跳过
                    if (!(item.rings && item.rings.length >= 3)) {
                        console.error('\u591A\u8FB9\u5F62rings\u6570\u636E\u9519\u8BEF');
                        return false;
                    }
                    //获取原有的图元
                    var gc = t.GM.getGraphic(item.id);
                    //初始化参数
                    var cg = {
                        lineType: 'solid',
                        lineWidth: 5,
                        lineColor: '#277ffa',
                        lineOpacity: 1,
                        color: '#fff',
                        pellucidity: 0.5
                        // isHidden: false  //后期需要再加
                    };
                    if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    var polygonPath = item.rings.map(function (item, index) {
                        return new BMap.Point(item[0], item[1]);
                    });
                    //更新经纬度
                    gc.setPath(polygonPath);
                    //更新边框线颜色
                    gc.setStrokeColor(cg.lineColor);
                    //更新填充色
                    gc.setFillColor(cg.color);
                    //更新变线透明度
                    gc.setStrokeOpacity(cg.lineOpacity);
                    //更新填充色透明度
                    gc.setFillOpacity(cg.pellucidity);
                    //更新边线宽度
                    gc.setStrokeWeight(cg.lineWidth);
                    //更新边线类型
                    gc.setStrokeStyle(cg.lineType);
                    t.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, {
                            rings: item.rings,
                            other: item
                        }),
                        geometryType: 'polygon',
                        geometry: {
                            type: 'polygon',
                            rings: item.rings
                        }
                    });
                } else {
                    console.error('\u66F4\u65B0\u7684\u591A\u8FB9\u5F62id\u4E0D\u5B58\u5728!');
                    return false;
                }
            });
        }
        //添加圆  circle

    }, {
        key: 'addCircle',
        value: function addCircle(mapCircles) {
            var t = this;
            var ccsids = [].concat(_toConsumableArray(t.state.circleIds));
            mapCircles.map(function (item, index) {
                //如果id重复,直接跳过不执行.
                if (t.GM.isRepetition(item.id)) {
                    console.error('\u5706id: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //圆 点位数据不符合,直接跳过
                if (!item.longitude || !item.latitude) {
                    console.error('\u5706 \u7ECF\u7EAC\u5EA6 \u6570\u636E\u9519\u8BEF');
                    return false;
                }
                var cg = {
                    lineType: 'solid',
                    lineWidth: 5,
                    lineColor: '#277ffa',
                    lineOpacity: 1,
                    color: '#fff',
                    pellucidity: 0.5
                    // isHidden: false  //后期需要在加
                };
                if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                //初始化配置数据
                var circleOption = {
                    strokeColor: cg.lineColor,
                    strokeOpacity: cg.lineOpacity,
                    strokeWeight: cg.lineWidth,
                    strokeStyle: cg.lineType,
                    fillColor: cg.color,
                    fillOpacity: cg.pellucidity
                },
                    centerPoint = new BMap.Point(item.longitude, item.latitude);
                //创建圆图元实例
                var circle = new BMap.Circle(centerPoint, item.radius, circleOption);
                //添加圆至地图
                t.state.gis.addOverlay(circle);
                //点击事件
                circle.addEventListener('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                //鼠标移入事件
                circle.addEventListener('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                //鼠标移出事件
                circle.addEventListener('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                ccsids.push(item.id);
                //缓存数据
                t.GM.setGraphic(item.id, circle).setGraphicParam(item.id, {
                    attributes: _extends({}, item, { other: item }),
                    geometryType: 'circle',
                    geometry: {
                        type: 'circle',
                        x: item.longitude,
                        y: item.latitude,
                        radius: item.radius
                    }
                });
            });
            t.setState({
                circleIds: ccsids
            });
        }
        //更新圆

    }, {
        key: 'updateCircle',
        value: function updateCircle(mapCircles) {
            var t = this;
            mapCircles.map(function (item, index) {
                //判断图元是否存在.
                if (t.GM.isRepetition(item.id)) {
                    //圆 点位数据不符合,直接跳过
                    if (!item.longitude || !item.latitude) {
                        console.error('\u5706 \u7ECF\u7EAC\u5EA6 \u6570\u636E\u9519\u8BEF');
                        return false;
                    }
                    //获取原有的图元
                    var gc = t.GM.getGraphic(item.id);
                    //获取原有的面属性,转换key值
                    var cg = {
                        lineType: 'solid',
                        lineWidth: 5,
                        lineColor: '#277ffa',
                        lineOpacity: 1,
                        color: '#fff',
                        pellucidity: 0.5
                        // isHidden: false  //后期需要在加
                    };
                    if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    var centerPoint = new BMap.Point(item.longitude, item.latitude);
                    //修改中心点
                    gc.setCenter(centerPoint);
                    //修改半径
                    gc.setRadius(item.radius);
                    //修改边线颜色
                    gc.setStrokeColor(cg.lineColor);
                    //修改填充颜色
                    gc.setFillColor(cg.color);
                    //修改边线透明度
                    gc.setStrokeOpacity(cg.lineOpacity);
                    //修改填充透明度
                    gc.setFillOpacity(cg.pellucidity);
                    //修改边线宽度
                    gc.setStrokeWeight(cg.lineWidth);
                    //修改边线样式
                    gc.setStrokeStyle(cg.lineType);
                    //缓存图元的数据,便于后期操作
                    t.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, { other: item }),
                        geometryType: 'circle',
                        geometry: {
                            type: 'circle',
                            x: item.longitude,
                            y: item.latitude,
                            radius: item.radius
                        }
                    });
                } else {
                    console.error('\u66F4\u65B0\u7684\u5706id\u4E0D\u5B58\u5728!');
                    return false;
                }
            });
        }
        //画出对应边界线 name区域名

    }, {
        key: 'addBaiduBoundary',
        value: function addBaiduBoundary(bdNames) {
            var t = this;
            bdNames.forEach(function (name) {
                t._boundary.get(name, function (ary) {
                    var id = 'boundary' + new Date().getTime();
                    var paths = ary.boundaries[0].split(';').map(function (item, index) {
                        return item.split(',');
                    });
                    t.addPolygon([{ id: id, rings: paths }]);
                    t.state.boundaryInfo.push({ id: id, name: name });
                });
            });
        }
        //删除对应应边界线 name区域名

    }, {
        key: 'removeBaiduBoundary',
        value: function removeBaiduBoundary(removedBDNames) {
            var t = this;
            var removedBDIds = t.state.boundaryInfo.filter(function (item) {
                return removedBDNames.indexOf(item.name) > -1;
            }).map(function (item) {
                return item.id;
            });
            t.setState({ boundaryInfo: t.state.boundaryInfo.filter(function (item) {
                    return removedBDNames.indexOf(item.name) == -1;
                }) });
            removedBDIds.forEach(function (id) {
                t.removeGraphic(id, 'polygon');
            });
        }
        //热力图

    }, {
        key: 'heatMapOverlay',
        value: function heatMapOverlay() {
            var d = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var t = this;
            var cg = {
                radius: 20,
                max: 100,
                visible: true,
                opacity: 1
            };
            if (d.config) {
                cg = _extends({}, cg, d.config);
            }
            if (!t.heatmap) {
                t.heatmap = new BMapLib.HeatmapOverlay({
                    visible: cg.visible
                });
                t.state.gis.addOverlay(t.heatmap);
            }
            var option = {
                radius: cg.radius,
                //百度是1-100,高德是0-1
                opacity: eval(cg.opacity) * 100,
                visible: cg.visible
            };
            if (cg.gradient) {
                option.gradient = cg.gradient;
            }
            t.heatmap.setOptions(option);
            t.heatmap.setDataSet({
                max: cg.max,
                data: d.data || []
            });
            if (cg.visible) {
                t.heatmap.show();
            } else {
                t.heatmap.hide();
            }
        }
        //添加海量点   

    }, {
        key: 'addPointCollection',
        value: function addPointCollection() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var t = this;
            data.map(function (item, index) {
                var d = item || {};
                var points = [];
                (d.points || []).map(function (d, i) {
                    var p = new BMap.Point(d.lng, d.lat);
                    p.attributes = d;
                    points.push(p);
                });
                var options = {
                    size: gisMapConstant[d.size] || gisMapConstant['normal'],
                    shape: gisMapConstant[d.shape] || gisMapConstant['circle'],
                    color: d.color || '#d340c3'
                    // 初始化PointCollection
                };var VotexpointCollection = new BMap.PointCollection(points, options);
                t.state.gis.addOverlay(VotexpointCollection); // 添加Overlay
                t.morepoints.push({
                    id: d.id,
                    value: VotexpointCollection
                });
                VotexpointCollection.addEventListener('click', function (e) {
                    if ('clickPointCollection' in t.props && typeof t.props.clickPointCollection == 'function') {
                        var obj = _extends({
                            id: d.id
                        }, e.point, {
                            mapLayer: VotexpointCollection
                        });
                        t.props.clickPointCollection(obj);
                    }
                });
            });
        }
        //更新海量点

    }, {
        key: 'updatePointCollection',
        value: function updatePointCollection() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var t = this;
            data.map(function (ds, i) {
                t.morepoints.map(function (item, index) {
                    if (item.id == ds.id) {
                        var points = [];
                        ds.points.map(function (d, i) {
                            var p = new BMap.Point(d.lng, d.lat);
                            p.attributes = d;
                            points.push(p);
                        });
                        item.value.setPoints(points);
                        item.value.setStyles({
                            size: gisMapConstant[ds.size] || gisMapConstant['normal'],
                            shape: gisMapConstant[ds.shape] || gisMapConstant['circle'],
                            color: ds.color || '#d340c3'
                        });
                    }
                });
            });
        }
        //清空单个海量点

    }, {
        key: 'clearPointCollection',
        value: function clearPointCollection(ids) {
            var t = this;
            ids.map(function (id, ind) {
                t.morepoints.map(function (item, index) {
                    if (id == item.id) {
                        item.value.clear();
                    }
                });
            });
        }
        //清空海量点

    }, {
        key: 'clearAllPointCollection',
        value: function clearAllPointCollection() {
            var t = this;
            t.morepoints.map(function (item, index) {
                item.value.clear();
            });
        }
        /*图元事件处理*/
        //点击图元事件

    }, {
        key: 'clickGraphic',
        value: function clickGraphic(id, e) {
            var t = this;
            //编辑中的图元关闭其他事件返回
            if (t.state.editId == id) return false;
            if (typeof t.props.clickGraphic === "function") {
                var param = t.getGraphic(id);
                var obj = {
                    param: param,
                    type: param.geometry.type, //图元类型
                    attributes: _extends({}, param.attributes.other, { config: param.attributes.config }), //添加时图元信息
                    top: e.clientY, //当前点所在的位置(屏幕)
                    left: e.clientX,
                    e: e
                };
                t.props.clickGraphic(obj);
            }
        }
        //图元鼠标悬浮事件

    }, {
        key: 'mouseOverGraphic',
        value: function mouseOverGraphic(id, e) {
            var t = this;
            //编辑中的图元关闭其他事件返回
            if (t.state.editId == id) return false;
            if (typeof t.props.mouseOverGraphic === 'function') {
                var obj = {
                    e: e, id: id,
                    param: t.getGraphic(id)
                };
                t.props.mouseOverGraphic(obj);
            }
        }
        //图元鼠标移开事件

    }, {
        key: 'mouseOutGraphic',
        value: function mouseOutGraphic(id, e) {
            var t = this;
            //编辑中的图元关闭其他事件返回
            if (t.state.editId == id) return false;
            if (typeof t.props.mouseOutGraphic === "function") {
                var obj = {
                    e: e, id: id,
                    param: t.getGraphic(id)
                };
                t.props.mouseOutGraphic(obj);
            }
        }
        /*地图事件处理*/
        //地图点击事件

    }, {
        key: 'clickMap',
        value: function clickMap() {
            var t = this;
            if (typeof t.props.clickMap === "function") {
                t.state.gis.addEventListener('click', function (e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    obj.clickLngLat = e.point;
                    obj.pixel = e.pixel;
                    t.props.clickMap(obj);
                });
            }
        }
        //地图拖动之前事件

    }, {
        key: 'dragMapStart',
        value: function dragMapStart() {
            var t = this;
            if (typeof t.props.dragMapStart === 'function') {
                t.state.gis.addEventListener('dragstart', function (e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.dragMapStart(obj);
                });
            }
        }
        //地图拖动结束后事件

    }, {
        key: 'dragMapEnd',
        value: function dragMapEnd() {
            var t = this;
            if (typeof t.props.dragMapEnd === 'function') {
                t.state.gis.addEventListener('dragend', function (e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.dragMapEnd(obj);
                });
            }
        }
        //地图移动之前事件

    }, {
        key: 'moveStart',
        value: function moveStart() {
            var t = this;
            if (typeof t.props.moveStart === 'function') {
                t.state.gis.addEventListener('movestart', function (e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.moveStart(obj);
                });
            }
        }
        //地图移动结束后事件

    }, {
        key: 'moveEnd',
        value: function moveEnd() {
            var t = this;
            if (typeof t.props.moveEnd === 'function') {
                t.state.gis.addEventListener('moveend', function (e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.moveEnd(obj);
                });
            }
        }
        //地图更改缩放级别开始时触发触发此事件

    }, {
        key: 'zoomStart',
        value: function zoomStart() {
            var t = this;
            if (typeof t.props.zoomStart === 'function') {
                t.state.gis.addEventListener('zoomstart', function (e) {
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
            if (typeof t.props.zoomEnd === 'function') {
                t.state.gis.addEventListener('zoomend', function (e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.zoomEnd(obj);
                });
            }
        }
        /*set方法*/
        //设置地图中心位置 lng/经度  lat/纬度

    }, {
        key: 'setCenter',
        value: function setCenter(gt) {
            var t = this;
            var mgt = [116.404, 39.915];
            if (gt) {
                //经纬度 必须存在 否则不操作
                if (!gt[0] || !gt[1]) {
                    return false;
                }
                //如果设置的经纬度 与当前中心点一样 不操作
                var c = t.state.gis.getCenter();
                if (c.lng == gt[0] && c.lat == gt[1]) {
                    return false;
                }
                mgt = gt;
            }
            t.state.gis.setCenter(new BMap.Point(mgt[0], mgt[1]));
            t.setState({ center: mgt });
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
                obj = t.getFitView(ary);
            } else if (arg instanceof Array) {
                if (ary[0] instanceof Array) {
                    var a = [];
                    for (var i = 0; i < ary.length; i++) {
                        a = new BMap.Point(ary[i][0], ary[i][1]);
                    }
                    obj = t.state.gis.getViewport(a);
                } else {
                    obj = t.getFitView(arg);
                }
            }
            if (!obj) {
                return false;
            }
            if (!type || type == 'all') {
                t.state.gis.centerAndZoom(obj.center, obj.zoom);
            } else if (type == 'zoom') {
                t.setZoomLevel(obj.zoom);
            } else if (type == 'center') {
                t.setCenter([obj.center.lng, obj.center.lat]);
            }
        }
        /*get方法*/
        //获取当前地图的中心位置

    }, {
        key: 'getCurrentCenter',
        value: function getCurrentCenter() {
            var t = this;
            return t.state.gis.getCenter();
        }
        //获取当前比例尺

    }, {
        key: 'getZoomLevel',
        value: function getZoomLevel() {
            var t = this;
            return t.state.gis.getZoom();
        }
        //获取对应经纬的最优 zoomLevel和center

    }, {
        key: 'getFitView',
        value: function getFitView(ids) {
            var t = this;
            if (ids.length > 0) {
                var allLayers = [];
                for (var i = 0; i < ids.length; i++) {
                    switch ((t.GM.getGraphicParam(ids[i]) || {}).geometryType) {
                        case 'point':
                            allLayers.push(t.GM.getGraphic(ids[i]).getPosition());
                            break;
                        case 'polyline':
                        case 'polygon':
                            allLayers = [].concat(_toConsumableArray(allLayers), _toConsumableArray(t.GM.getGraphic(ids[i]).getPath()));
                            break;
                        case 'circle':
                            allLayers.push(t.GM.getGraphic(ids[i]).getCenter());
                            break;
                    }
                }
                if (allLayers.length > 0) {
                    return t.state.gis.getViewport(allLayers);
                }
            }
        }
        //获取图元数据

    }, {
        key: 'getGraphic',
        value: function getGraphic(id) {
            var t = this;
            if (!id) {
                return false;
            }
            var gp = t.GM.getGraphicParam(id);
            var gg = t.GM.getGraphic(id);
            if (!gg) {
                return false;
            }
            var p = {},
                pts = [],
                lng = 0,
                lat = 0;
            switch (gp.geometryType) {
                case 'point':
                    lng = gg.getPosition().lng;
                    lat = gg.getPosition().lat;
                    p = _extends({}, gp, {
                        mapLayer: gg,
                        geometry: _extends({}, gp.geometry, {
                            x: lng,
                            y: lat
                        }),
                        attributes: _extends({}, gp.attributes, {
                            longitude: lng,
                            latitude: lat,
                            other: _extends({}, gp.attributes.other, {
                                longitude: lng,
                                latitude: lat
                            })
                        })
                    });
                    break;
                case 'polyline':
                    pts = gg.getPath().map(function (item, index) {
                        return [item.lng, item.lat];
                    });
                    p = _extends({}, gp, {
                        mapLayer: gg,
                        geometry: _extends({}, gp.geometry, {
                            paths: pts
                        }),
                        attributes: _extends({}, gp.attributes, {
                            paths: pts,
                            other: _extends({}, gp.attributes.other, {
                                paths: pts
                            })
                        })
                    });
                    break;
                case 'polygon':
                    pts = gg.getPath().map(function (item, index) {
                        return [item.lng, item.lat];
                    });
                    p = _extends({}, gp, {
                        mapLayer: gg,
                        geometry: _extends({}, gp.geometry, {
                            rings: pts
                        }),
                        attributes: _extends({}, gp.attributes, {
                            rings: pts,
                            other: _extends({}, gp.attributes.other, {
                                rings: pts
                            })
                        })
                    });
                    break;
                case 'circle':
                    lng = gg.getCenter().lng;
                    lat = gg.getCenter().lat;
                    var radius = gg.getRadius();
                    p = _extends({}, gp, {
                        mapLayer: gg,
                        geometry: _extends({}, gp.geometry, {
                            x: lng,
                            y: lat,
                            radius: radius
                        }),
                        attributes: _extends({}, gp.attributes, {
                            longitude: lng,
                            latitude: lat,
                            radius: radius,
                            other: _extends({}, gp.attributes.other, {
                                longitude: lng,
                                latitude: lat,
                                radius: radius
                            })
                        })
                    });
                    break;
            }
            return p;
        }
        /*功能方法*/
        //单个删除图元

    }, {
        key: 'removeGraphic',
        value: function removeGraphic(id, type) {
            var t = this;
            var graphic = t.GM.getGraphic(id);
            if (!!graphic) {
                //清除聚合点 避免异常
                t._cluster.removeMarker(this.GM.getGraphic(id));
                //清除地图中图元
                t.state.gis.removeOverlay(graphic);
                //清除对应id的图元数据缓存
                t.GM.removeGraphic(id);
            } else {
                return false;
            }
            for (var i = 0; i < t.movePoints.length; i++) {
                if (t.movePoints[i].id == id) {
                    t.movePoints.splice(i, 1);
                    continue;
                }
            }
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
                case 'draw':
                    if (t.state.drawIds.point.indexOf(id) > -1) {
                        t.state.drawIds.point.splice(t.state.drawIds.point.indexOf(id), 1);
                    }
                    if (t.state.drawIds.polyline.indexOf(id) > -1) {
                        t.state.drawIds.polyline.splice(t.state.drawIds.polyline.indexOf(id), 1);
                    }
                    if (t.state.drawIds.polygon.indexOf(id) > -1) {
                        t.state.drawIds.polygon.splice(t.state.drawIds.polygon.indexOf(id), 1);
                    }
                    if (t.state.drawIds.circle.indexOf(id) > -1) {
                        t.state.drawIds.circle.splice(t.state.drawIds.circle.indexOf(id), 1);
                    }
                    if (t.state.drawIds.rectangle.indexOf(id) > -1) {
                        t.state.drawIds.rectangle.splice(t.state.drawIds.rectangle.indexOf(id), 1);
                    }
                    break;
                default:
                    if (t.state.pointIds.indexOf(id) > -1) {
                        t.state.pointIds.splice(t.state.pointIds.indexOf(id), 1);
                    }
                    if (t.state.lineIds.indexOf(id) > -1) {
                        t.state.lineIds.splice(t.state.lineIds.indexOf(id), 1);
                    }
                    if (t.state.polygonIds.indexOf(id) > -1) {
                        t.state.polygonIds.splice(t.state.polygonIds.indexOf(id), 1);
                    }
                    if (t.state.circleIds.indexOf(id) > -1) {
                        t.state.circleIds.splice(t.state.circleIds.indexOf(id), 1);
                    }
                    break;
            }
            if (id == t.state.editId) {
                t.state.editId = '';
            }
            if (ids.indexOf(id) != -1) {
                ids.splice(ids.indexOf(id), 1);
            }
        }
        /*根据图元id,使图元变成可编辑状态*/

    }, {
        key: 'doEdit',
        value: function doEdit(id) {
            var t = this;
            //获取编辑点的图元和参数
            var graphic = t.GM.getGraphic(id);
            var gtp = t.GM.getGraphicParam(id);
            if (!graphic) return false;
            //关闭先前编辑的图元
            if (!!t.state.editId) {
                t.endEdit();
            }
            if (!t.editGraphicChange) {
                //编辑变动后
                t.editGraphicChange = function (e) {
                    var id = t.state.editId,
                        param = t.getGraphic(id),
                        obj = {
                        param: param, e: e, id: id,
                        geometry: param.geometry
                    };
                    if (param.geometry.type == 'polygon') {
                        obj.area = BMapLib.GeoUtils.getPolygonArea(param.mapLayer);
                    }
                    if (param.geometry.type == 'polyline') {
                        obj.distance = t.calculateDistance(param.geometry.paths);
                    }
                    if (param.geometry.type == 'circle') {
                        obj.area = Math.pow(param.geometry.radius, 2) * Math.PI;
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
                };
            }
            switch (gtp.geometryType) {
                case 'point':
                    graphic.enableDragging();
                    graphic.addEventListener("dragend", t.editGraphicChange);
                    break;
                case 'polyline':
                case 'polygon':
                case 'rectangle':
                    graphic.enableEditing();
                    graphic.addEventListener("lineupdate", t.editGraphicChange);
                    break;
                case 'circle':
                    graphic.enableEditing();
                    graphic.addEventListener("lineupdate", t.editGraphicChange);
                    break;
            }
            t.setState({ editId: id });
        }
        //关闭编辑

    }, {
        key: 'endEdit',
        value: function endEdit() {
            var t = this;
            //获取编辑点的图元和参数
            var graphic = t.GM.getGraphic(t.state.editId);
            var gtp = t.GM.getGraphicParam(t.state.editId);
            if (!graphic) return false;
            switch (gtp.geometryType) {
                case 'point':
                    graphic.disableDragging();
                    graphic.removeEventListener("dragend", t.editGraphicChange);
                    break;
                case 'polyline':
                case 'polygon':
                case 'rectangle':
                    graphic.disableEditing();
                    graphic.removeEventListener("lineupdate", t.editGraphicChange);
                    break;
                case 'circle':
                    graphic.disableEditing();
                    graphic.removeEventListener("lineupdate", t.editGraphicChange);
                    break;
            }
            var editGraphic = t.state.editGraphic;
            t.setState({
                editId: '',
                editGraphic: ''
            }, function () {
                if (editGraphic) {
                    t.props.editGraphicChange(editGraphic);
                }
            });
        }
        //绘制图元

    }, {
        key: 'draw',
        value: function draw(obj) {
            var t = this,
                drawParam = {};
            //先关闭(防止连点)
            t._drawmanager.close();
            //初始化参数
            drawParam.geometryType = obj.geometryType || 'point';
            drawParam.parameter = obj.parameter ? _extends({}, obj.parameter) : {};
            drawParam.data = obj.data ? _extends({}, obj.data) : {};
            drawParam.data.id = (obj.data || {}).id || 'draw' + new Date().getTime();
            //判断id是否存在
            var len = t.state.drawIds[drawParam.geometryType].indexOf(drawParam.data.id);
            if (len > -1) {
                //如果id存在 删除存在的图元,清除drawId中的id数据
                t.removeGraphic(drawParam.data.id);
                t.state.drawIds[drawParam.geometryType].splice(len, 1);
            }
            var param = {};
            var paramgcr = {};
            if (drawParam.geometryType == 'polygon' || drawParam.geometryType == 'circle' || drawParam.geometryType == 'rectangle') {
                paramgcr.fillColor = drawParam.parameter.color;
                paramgcr.strokeColor = drawParam.parameter.lineColor;
                paramgcr.strokeOpacity = drawParam.parameter.lineOpacity;
                paramgcr.strokeWeight = drawParam.parameter.lineWidth;
                paramgcr.fillOpacity = drawParam.parameter.pellucidity;
                paramgcr.strokeStyle = drawParam.parameter.lineType;
                paramgcr.extData = {
                    id: drawParam.data.id,
                    attributes: {
                        id: drawParam.data.id,
                        config: {
                            color: drawParam.parameter.color,
                            lineColor: drawParam.parameter.lineColor,
                            lineOpacity: drawParam.parameter.lineOpacity,
                            pellucidity: drawParam.parameter.pellucidity,
                            lineWidth: drawParam.parameter.lineWidth
                        }
                    },
                    type: drawParam.geometryType
                };
            }
            switch (drawParam.geometryType) {
                case 'point':
                    param.offset = new BMap.Size((drawParam.parameter.markerContentX || -15) + (drawParam.parameter.width || 30) / 2, (drawParam.parameter.markerContentY || -30) + (drawParam.parameter.height || 30) / 2);
                    var icon = new BMap.Icon(drawParam.parameter.url || _default2.default.mapServerURL + '/images/defaultMarker.png', new BMap.Size(drawParam.parameter.width || 30, drawParam.parameter.height || 30));
                    icon.setImageSize(new BMap.Size(drawParam.parameter.width || 30, drawParam.parameter.height || 30));
                    param.icon = icon;
                    param.extData = {
                        id: drawParam.data.id,
                        attributes: {
                            id: drawParam.data.id,
                            url: drawParam.parameter.url || _default2.default.mapServerURL + '/images/defaultMarker.png',
                            config: {
                                width: drawParam.parameter.width || 36,
                                height: drawParam.parameter.height || 36
                            }
                        },
                        type: 'point'
                    };
                    t._drawmanager.setDrawingMode('marker');
                    t._drawmanager.open({ markerOptions: param });
                    break;
                case 'polyline':
                    param.strokeColor = drawParam.parameter.color;
                    param.strokeOpacity = drawParam.parameter.pellucidity;
                    param.strokeWeight = drawParam.parameter.lineWidth;
                    param.strokeStyle = drawParam.parameter.lineType;
                    param.extData = {
                        id: drawParam.data.id,
                        attributes: {
                            id: drawParam.data.id,
                            config: {
                                color: drawParam.parameter.color,
                                pellucidity: drawParam.parameter.pellucidity,
                                lineWidth: drawParam.parameter.lineWidth
                            }
                        },
                        type: 'polyline'
                    };
                    t._drawmanager.open({ polylineOptions: param, enableCalculate: true });
                    t._drawmanager.setDrawingMode('polyline');
                    break;
                case 'polygon':
                    t._drawmanager.open({ polygonOptions: paramgcr, enableCalculate: true });
                    t._drawmanager.setDrawingMode('polygon');
                    break;
                case 'circle':
                    t._drawmanager.open({ circleOptions: paramgcr, enableCalculate: true });
                    t._drawmanager.setDrawingMode('circle');
                    break;
                case 'rectangle':
                    t._drawmanager.open({ rectangleOptions: paramgcr, enableCalculate: true });
                    t._drawmanager.setDrawingMode('rectangle');
                    break;
            }
        }
        //关闭绘制图元

    }, {
        key: 'closeDraw',
        value: function closeDraw() {
            var t = this;
            t._drawmanager.close();
        }
        //清空地图图元

    }, {
        key: 'clearAll',
        value: function clearAll() {
            var t = this;
            //清空聚合
            if (t._cluster) {
                t._cluster.clearMarkers();
            }
            //关闭测距
            if (t._rangingTool) {
                t._rangingTool.close();
            }
            //清空地图
            t.state.gis.clearOverlays();
            //清空缓存数据
            t.GM.clearAll();
            //关闭编辑
            t.endEdit();
            //清空历史数据记录
            t.setState({
                pointIds: [],
                lineIds: [],
                polygonIds: [],
                circleIds: [],
                boundaryInfo: [],
                drawIds: {
                    point: [],
                    polyline: [],
                    polygon: [],
                    circle: [],
                    rectangle: []
                }
            });
        }
        /*工具方法*/
        //聚合地图图元(arg为空时聚合全部点)

    }, {
        key: 'cluster',
        value: function cluster(arg) {
            var t = this;
            var ary = t.clusterToolFunction(arg);
            t._cluster.addMarkers(ary);
        }
        //删除点聚合效果

    }, {
        key: 'removeCluster',
        value: function removeCluster(arg) {
            var t = this;
            var ary = t.clusterToolFunction(arg);
            if (ary.length > 0) {
                t._cluster.removeMarkers(ary);
            }
        }
        //清空聚合效果

    }, {
        key: 'clearClusters',
        value: function clearClusters() {
            var t = this;
            t._cluster.clearMarkers();
        }
        //聚合功能公共方法(获取图元集合)

    }, {
        key: 'clusterToolFunction',
        value: function clusterToolFunction(arg) {
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
            //过滤moveTo的点位
            //缓存所有聚合的点位
            var allps = [];
            for (var i = 0; i < ary.length; i++) {
                allps.push(t.GM.getGraphic(ary[i]));
            }
            return allps;
        }
        //测距

    }, {
        key: 'vtxRangingTool',
        value: function vtxRangingTool(callback) {
            var t = this;
            var cb = function cb(e) {
                //关闭测距
                t._rangingTool.close();
                //注销事件(避免重复)
                t._rangingTool.removeEventListener('drawend', cb);
                if (typeof callback === "function") {
                    var obj = {
                        distance: e.distance
                    };
                    var objLngLats = new Array();
                    for (var i = 0; i < e.points.length; i++) {
                        objLngLats.push([e.points[i].lng, e.points[i].lat]);
                    }
                    obj.lnglats = objLngLats;
                    callback(obj);
                }
            };
            t._rangingTool.addEventListener('drawend', cb);
            t._rangingTool.open(this.state.gis);
        }
        //开启路况

    }, {
        key: 'openTrafficInfo',
        value: function openTrafficInfo() {
            var t = this;
            t._trafficCtrl.showTraffic();
        }
        //关闭路况

    }, {
        key: 'hideTrafficInfo',
        value: function hideTrafficInfo() {
            var t = this;
            t._trafficCtrl.hideTraffic();
        }
        //展示比例尺

    }, {
        key: 'showControl',
        value: function showControl() {
            var t = this,
                location = BMAP_ANCHOR_TOP_LEFT,
                type = '';
            switch (t.props.showControl.location) {
                case 'tl':
                    location = BMAP_ANCHOR_TOP_LEFT;
                    break;
                case 'bl':
                    location = BMAP_ANCHOR_BOTTOM_LEFT;
                    break;
                case 'tr':
                    location = BMAP_ANCHOR_TOP_RIGHT;
                    break;
                case 'br':
                    location = BMAP_ANCHOR_BOTTOM_RIGHT;
                    break;
            }
            switch (t.props.showControl.type) {
                case 'all':
                    type = '';
                    break;
                case 'small':
                    type = BMAP_NAVIGATION_CONTROL_SMALL;
                    break;
                case 'pan':
                    type = BMAP_NAVIGATION_CONTROL_PAN;
                    break;
                case 'zoom':
                    type = BMAP_NAVIGATION_CONTROL_ZOOM;
                    break;
            }
            // 左上角，添加比例尺
            var control = new BMap.ScaleControl({ anchor: location });
            t.state.gis.addControl(control);
            if (type !== 'null') {
                //右上角，仅包含平移和缩放按钮
                var navigation = new BMap.NavigationControl({ anchor: location, type: type });
                t.state.gis.addControl(navigation);
            }
        }
        /*设置显示区域*/

    }, {
        key: 'setAreaRestriction',
        value: function setAreaRestriction(sw_ne) {
            var t = this;
            //修改了区域限制的js文件.
            var bounds = new BMap.Bounds(new BMap.Point(sw_ne[0][0], sw_ne[0][1]), new BMap.Point(sw_ne[1][0], sw_ne[1][1]));
            t._bmar.setBounds(this.state.gis, bounds);
        }
        /*取消显示区域*/

    }, {
        key: 'clearAreaRestriction',
        value: function clearAreaRestriction() {
            var t = this;
            t._bmar.clearBounds();
        }
        //渲染

    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var _map = this.props;
            return _react2.default.createElement('div', { id: _map.mapId, style: { width: '100%', height: '100%' } });
        }
        /*公共方法*/

    }, {
        key: 'moveAnimation',
        value: function moveAnimation() {
            var t = this;
            if (t.moveToTimer) {
                clearInterval(t.moveToTimer);
            }
            t.moveToTimer = setInterval(function () {
                for (var i = 0; i < t.movePoints.length; i++) {
                    t.movePoints[i].waitTime += 10;
                    t.movePoints[i].deleteTime -= 10;
                }
                t.movePoints.sort(function (x, y) {
                    return y.waitTime - x.waitTime;
                });
                var nowMovePoints = t.movePoints.slice(0, 10),
                    deleteIndex = [];
                for (var _i = 0; _i < nowMovePoints.length; _i++) {
                    var _nowMovePoints$_i = nowMovePoints[_i],
                        id = _nowMovePoints$_i.id,
                        rx = _nowMovePoints$_i.rx,
                        ry = _nowMovePoints$_i.ry,
                        waitTime = _nowMovePoints$_i.waitTime,
                        deleteTime = _nowMovePoints$_i.deleteTime;

                    var gc = t.GM.getGraphic(id);
                    if (!gc) {
                        clearInterval(t.moveToTimer);
                    } else {
                        var gg = gc.getPosition();
                        var tx = gg.lng + rx,
                            ty = gg.lat + ry;
                        gc.setPosition(new BMap.Point(tx, ty));
                        t.movePoints[_i].waitTime = 0;
                        if (deleteTime <= 0) {
                            deleteIndex.push(_i);
                        }
                    }
                }
                deleteIndex.sort(function (a, b) {
                    return b - a;
                });
                for (var _i2 = 0; _i2 < deleteIndex.length; _i2++) {
                    t.movePoints.splice(deleteIndex[_i2], 1);
                }
                if (nowMovePoints.length == 0) {
                    clearInterval(t.moveToTimer);
                }
            }, 10);
        }
    }, {
        key: 'moveTo',
        value: function moveTo(id, lnglat, delay, autoRotation, urlright, urlleft) {
            delay = delay || 3;
            var t = this,
                timer = 10,
                gc = t.GM.getGraphic(id);
            delay = eval(delay) * 1000;
            var count = delay / timer;
            var s = gc.getPosition(),
                e = new BMap.Point(lnglat[0], lnglat[1]);
            if (s.equals(e)) {
                return false;
            } else {
                var url = null;
                //计算角度,旋转
                if (autoRotation) {
                    var ddeg = t.rotateDeg(gc.getPosition(), lnglat);
                    if (urlleft && ddeg < -90 && ddeg > -270) {
                        ddeg += 180;
                        url = urlleft;
                    } else {
                        url = urlright;
                    }
                    var gcicon = gc.getIcon();
                    gcicon.setImageUrl(url);
                    gc.setIcon(gcicon);
                    gc.setRotation(ddeg);
                }
                //拆分延迟移动定位
                var rx = (e.lng - s.lng) / count,
                    ry = (e.lat - s.lat) / count;
                var isHave = false;
                for (var i = 0; i < t.movePoints.length; i++) {
                    if (t.movePoints[i].id == id) {
                        t.movePoints.splice(i, 1, {
                            id: id, rx: rx, ry: ry,
                            waitTime: 0,
                            deleteTime: delay
                        });
                        isHave = true;
                    }
                }
                if (!isHave) {
                    t.movePoints.push({
                        id: id, rx: rx, ry: ry,
                        waitTime: 0,
                        deleteTime: delay
                    });
                }
            }
        }
        //点位角度旋转(以指向东(右)为0°)

    }, {
        key: 'rotateDeg',
        value: function rotateDeg(sp, ep) {
            var t = this;
            var s = t.state.gis.pointToPixel(sp),

            //获取当前点位的经纬度
            e = t.state.gis.pointToPixel(new BMap.Point(ep[0], ep[1])),
                deg = 0;
            if (e.x != s.x) {
                var tan = (e.y - s.y) / (e.x - s.x),
                    atan = Math.atan(tan);
                deg = atan * 360 / (2 * Math.PI);
                //degree  correction;
                if (e.x < s.x) {
                    deg = -deg + 90 + 90;
                } else {
                    deg = -deg;
                }
                deg = -deg;
            } else {
                var disy = e.y - s.y;
                var bias = 0;
                if (disy > 0) bias = -1;else bias = 1;
                if (disy == 0) bias = 0;
                deg = -bias * 90;
            }
            return deg;
        }
        //处理线和面的 经纬度数据

    }, {
        key: 'dealData',
        value: function dealData(ms) {
            //区别点和圆的经纬度数据处理
            var lnglatAry = [],
                _extent = { xmax: 0, xmin: 0, ymax: 0, ymin: 0 },
                path = [];
            if ('getPath' in ms) {
                path = ms.getPath();
                path = path.map(function (item, index) {
                    var lng = item.lng,
                        lat = item.lat;
                    if (lng > _extent.xmax) {
                        _extent.xmax = lng;
                    }
                    if (lng < _extent.xmin || _extent.xmin == 0) {
                        _extent.xmin = lng;
                    }
                    if (lat > _extent.ymax) {
                        _extent.ymax = lat;
                    }
                    if (lat < _extent.ymin || _extent.ymin == 0) {
                        _extent.ymin = lat;
                    }
                    lnglatAry.push({
                        lngX: lng,
                        latX: lat
                    });
                    return [lng, lat];
                });
            }
            return { lnglatAry: lnglatAry, _extent: _extent, path: path };
        }
        //显示隐藏的图元

    }, {
        key: 'showGraphicById',
        value: function showGraphicById(id) {
            var t = this;
            if (t.GM.getGraphic(id)) {
                t.GM.getGraphic(id).show();
            }
        }
        //隐藏图元

    }, {
        key: 'hideGraphicById',
        value: function hideGraphicById(id) {
            var t = this;
            if (t.GM.getGraphic(id)) {
                t.GM.getGraphic(id).hide();
            }
        }
        //获取地图当前的位置状态信息

    }, {
        key: 'getMapExtent',
        value: function getMapExtent() {
            var t = this;
            var nowBounds = t.state.gis.getBounds();
            var obj = {};
            obj.southWest = {
                lng: nowBounds.getSouthWest().lng,
                lat: nowBounds.getSouthWest().lat
            };
            obj.northEast = {
                lng: nowBounds.getNorthEast().lng,
                lat: nowBounds.getNorthEast().lat
            };
            obj.nowCenter = t.state.gis.getCenter();
            obj.zoom = t.state.gis.getZoom();
            obj.mapSize = t.state.gis.getSize();
            obj.radius = t.calculatePointsDistance([obj.nowCenter.lng, obj.nowCenter.lat], [obj.northEast.lng, obj.northEast.lat]);
            return obj;
        }
        //计算2点间距离 单位m 精确到2位小数

    }, {
        key: 'calculatePointsDistance',
        value: function calculatePointsDistance(fp, ep) {
            return Math.round(this.state.gis.getDistance(new BMap.Point(fp[0], fp[1]), new BMap.Point(ep[0], ep[1])) * 100) / 100;
        }
        //计算多个点的距离(常用于线计算)

    }, {
        key: 'calculateDistance',
        value: function calculateDistance(ps) {
            var t = this,
                totalDistance = 0;
            if (ps.length < 0) {
                return false;
            }
            for (var i = 0; i < ps.length; i++) {
                if (i < ps.length - 1) {
                    totalDistance += t.calculatePointsDistance(ps[i], ps[i + 1]);
                }
            }
            return Math.round(totalDistance * 100) / 100;
        }
        //计算图元面积(面,圆)

    }, {
        key: 'calculateArea',
        value: function calculateArea(id) {
            var t = this;
            return t.state.gis.calculateArea(t.getGraphic(id));
        }
        //对比对象数据是否相等

    }, {
        key: 'deepEqual',
        value: function deepEqual(a, b) {
            return _immutable2.default.is(_immutable2.default.fromJS(a), _immutable2.default.fromJS(b));
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
        //处理需要增加图元的数据(避免意外问题)

    }, {
        key: 'dealAdd',
        value: function dealAdd(ary, ids) {
            var ads = [],
                otherupds = [];
            for (var i = 0; i < ary.length; i++) {
                if (ids.indexOf(ary[i].id) > -1) {
                    otherupds.push(ary[i]);
                } else {
                    ads.push(ary[i]);
                }
            }
            return { ads: ads, otherupds: otherupds };
        }
        //处理需要更新图元的数据(避免意外问题)

    }, {
        key: 'dealUpdate',
        value: function dealUpdate(ary, ids) {
            var upds = [],
                otherads = [];
            for (var i = 0; i < ary.length; i++) {
                if (ids.indexOf(ary[i].id) > -1) {
                    upds.push(ary[i]);
                } else {
                    otherads.push(ary[i]);
                }
            }
            return { upds: upds, otherads: otherads };
        }
        //百度搜索功能

    }, {
        key: 'searchPoints',
        value: function searchPoints(searchValue) {
            var _this4 = this;

            var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
            var pageIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            return new Promise(function (resolve) {
                var psc = new BMap.LocalSearch(_this4.state.gis, {
                    onSearchComplete: function onSearchComplete(result) {
                        if (!result) {
                            resolve([]);
                        } else if (result.getPageIndex() != pageIndex) {
                            psc.gotoPage(pageIndex);
                        } else {
                            var res_arr = [];
                            for (var i = 0, len = result.getCurrentNumPois(); i < len; i++) {
                                res_arr.push(result.getPoi(i));
                            }
                            resolve(res_arr.map(function (r) {
                                return {
                                    id: r.uid,
                                    longitude: r.point.lng,
                                    latitude: r.point.lat,
                                    canShowLabel: true,
                                    config: {
                                        labelContent: r.title,
                                        labelPixelY: 27
                                    },
                                    other: 'search'
                                };
                            }));
                        }
                        // console.log(result,result.getNumPages(),result.getPageIndex());                    
                    },
                    pageCapacity: pageSize
                });
                psc.search(searchValue);
            });
        }
        //初始化

    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var t = this;
            t.loadMapComplete.then(function () {
                t.init();
            });
        }
        //重新渲染结束

    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {}
        //已加载组件，收到新的参数时调用

    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var t = this;
            //点/线旧数据
            var _t$state = t.state,
                pointIds = _t$state.pointIds,
                lineIds = _t$state.lineIds,
                polygonIds = _t$state.polygonIds,
                circleIds = _t$state.circleIds,
                drawIds = _t$state.drawIds;
            var point = drawIds.point,
                polyline = drawIds.polyline,
                polygon = drawIds.polygon,
                circle = drawIds.circle,
                rectangle = drawIds.rectangle;
            //点/线新数据

            var mapPoints = nextProps.mapPoints,
                mapLines = nextProps.mapLines,
                mapPolygons = nextProps.mapPolygons,
                mapCircles = nextProps.mapCircles,
                customizedBoundary = nextProps.customizedBoundary,
                isOpenTrafficInfo = nextProps.isOpenTrafficInfo,
                boundaryName = nextProps.boundaryName,
                heatMapData = nextProps.heatMapData,
                mapVisiblePoints = nextProps.mapVisiblePoints,
                setVisiblePoints = nextProps.setVisiblePoints,
                setCenter = nextProps.setCenter,
                mapCenter = nextProps.mapCenter,
                setZoomLevel = nextProps.setZoomLevel,
                mapZoomLevel = nextProps.mapZoomLevel,
                setCluster = nextProps.setCluster,
                mapCluster = nextProps.mapCluster,
                isRangingTool = nextProps.isRangingTool,
                mapRangingTool = nextProps.mapRangingTool,
                isRemove = nextProps.isRemove,
                mapRemove = nextProps.mapRemove,
                mapDraw = nextProps.mapDraw,
                isDraw = nextProps.isDraw,
                isCloseDraw = nextProps.isCloseDraw,
                editGraphicId = nextProps.editGraphicId,
                isDoEdit = nextProps.isDoEdit,
                isEndEdit = nextProps.isEndEdit,
                mapPointCollection = nextProps.mapPointCollection,
                isclearAllPointCollection = nextProps.isclearAllPointCollection,
                isSetAreaRestriction = nextProps.isSetAreaRestriction,
                areaRestriction = nextProps.areaRestriction,
                isClearAreaRestriction = nextProps.isClearAreaRestriction,
                isClearAll = nextProps.isClearAll;

            var props = t.props;

            // 等待地图加载
            if (!t.state.mapCreated) return;

            /*添加海量点*/
            if (mapPointCollection instanceof Array && !t.deepEqual(mapPointCollection, props.mapPointCollection)) {
                var _t$dataMatch = t.dataMatch(props.mapPointCollection, mapPointCollection, 'id'),
                    deletedDataIDs = _t$dataMatch.deletedDataIDs,
                    addedData = _t$dataMatch.addedData,
                    updatedData = _t$dataMatch.updatedData;

                t.clearPointCollection(deletedDataIDs);
                t.addPointCollection(addedData);
                t.updatePointCollection(updatedData);
            }
            if (typeof isclearAllPointCollection == 'boolean' && isclearAllPointCollection || isclearAllPointCollection && isclearAllPointCollection !== t.props.isclearAllPointCollection) {
                t.clearAllPointCollection();
            }
            /*点数据处理
                pointData[2]相同的点,执行刷新
                pointData[1]的数据在idsForGraphicId中不存在的,执行新增
                pointData[0]数据中多余的id,执行删除
            */
            if (mapPoints instanceof Array && !t.deepEqual(mapPoints, props.mapPoints)) {
                var oldMapPoints = props.mapPoints;
                var newMapPoints = mapPoints;
                //过滤编辑的图元
                if (!!t.state.editId) {
                    oldMapPoints = props.mapPoints.filter(function (item) {
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

                var _t$dealAdd = t.dealAdd(_addedData, [].concat(_toConsumableArray(pointIds), _toConsumableArray(point))),
                    ads = _t$dealAdd.ads,
                    otherupds = _t$dealAdd.otherupds;

                var _t$dealUpdate = t.dealUpdate(_updatedData, [].concat(_toConsumableArray(pointIds), _toConsumableArray(point))),
                    upds = _t$dealUpdate.upds,
                    otherads = _t$dealUpdate.otherads;
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

                t.addPoint([].concat(_toConsumableArray(ads), _toConsumableArray(otherads)));
                //更新
                t.updatePoint([].concat(_toConsumableArray(upds), _toConsumableArray(otherupds)));
            }
            /*
                线数据处理
                先全删除,再新增
            */
            if (mapLines instanceof Array && !t.deepEqual(mapLines, props.mapLines)) {
                var oldMapLines = props.mapLines;
                var newMapLines = mapLines;
                if (!!t.state.editId) {
                    oldMapLines = props.mapLines.filter(function (item) {
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

                var _t$dealAdd2 = t.dealAdd(_addedData2, [].concat(_toConsumableArray(lineIds), _toConsumableArray(polyline))),
                    _ads = _t$dealAdd2.ads,
                    _otherupds = _t$dealAdd2.otherupds;

                var _t$dealUpdate2 = t.dealUpdate(_updatedData2, [].concat(_toConsumableArray(lineIds), _toConsumableArray(polyline))),
                    _upds = _t$dealUpdate2.upds,
                    _otherads = _t$dealUpdate2.otherads;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = _deletedDataIDs2[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _id = _step2.value;

                        t.removeGraphic(_id, 'line');
                    }
                    //增加
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

                t.addLine([].concat(_toConsumableArray(_ads), _toConsumableArray(_otherads)));
                //更新
                t.updateLine([].concat(_toConsumableArray(_upds), _toConsumableArray(_otherupds)));
            }
            //画其他特例线专用
            if (customizedBoundary instanceof Array && !t.deepEqual(customizedBoundary, props.customizedBoundary)) {
                var _t$dataMatch4 = t.dataMatch(props.customizedBoundary, customizedBoundary, 'id'),
                    _deletedDataIDs3 = _t$dataMatch4.deletedDataIDs,
                    _addedData3 = _t$dataMatch4.addedData,
                    _updatedData3 = _t$dataMatch4.updatedData;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = _deletedDataIDs3[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _id2 = _step3.value;

                        t.removeGraphic(_id2, 'line');
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

                t.addLine(_addedData3);
                t.updateLine(_updatedData3);
            }
            /*
                面数据处理
                先全删除,再新增
            */
            if (mapPolygons instanceof Array && !t.deepEqual(mapPolygons, props.mapPolygons)) {
                var oldMapPolygons = props.mapPolygons;
                var newMapPolygons = mapPolygons;
                if (!!t.state.editId) {
                    oldMapPolygons = props.mapPolygons.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                    newMapPolygons = mapPolygons.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                }

                var _t$dataMatch5 = t.dataMatch(oldMapPolygons, newMapPolygons, 'id'),
                    _deletedDataIDs4 = _t$dataMatch5.deletedDataIDs,
                    _addedData4 = _t$dataMatch5.addedData,
                    _updatedData4 = _t$dataMatch5.updatedData;

                var _t$dealAdd3 = t.dealAdd(_addedData4, [].concat(_toConsumableArray(rectangle), _toConsumableArray(polygon), _toConsumableArray(polygonIds))),
                    _ads2 = _t$dealAdd3.ads,
                    _otherupds2 = _t$dealAdd3.otherupds;

                var _t$dealUpdate3 = t.dealUpdate(_updatedData4, [].concat(_toConsumableArray(rectangle), _toConsumableArray(polygon), _toConsumableArray(polygonIds))),
                    _upds2 = _t$dealUpdate3.upds,
                    _otherads2 = _t$dealUpdate3.otherads;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = _deletedDataIDs4[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var _id3 = _step4.value;

                        t.removeGraphic(_id3, 'polygon');
                    }
                    //增加
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

                t.addPolygon([].concat(_toConsumableArray(_ads2), _toConsumableArray(_otherads2)));
                //更新
                t.updatePolygon([].concat(_toConsumableArray(_upds2), _toConsumableArray(_otherupds2)));
            }
            /*
                圆数据处理
                先全删除,再新增
            */
            if (mapCircles instanceof Array && !t.deepEqual(mapCircles, props.mapCircles)) {
                var oldMapCircles = props.mapCircles;
                var newMapCircles = mapCircles;
                if (!!t.state.editId) {
                    oldMapCircles = props.mapCircles.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                    newMapCircles = mapCircles.filter(function (item) {
                        return item.id !== editGraphicId;
                    });
                }

                var _t$dataMatch6 = t.dataMatch(oldMapCircles, newMapCircles, 'id'),
                    _deletedDataIDs5 = _t$dataMatch6.deletedDataIDs,
                    _addedData5 = _t$dataMatch6.addedData,
                    _updatedData5 = _t$dataMatch6.updatedData;

                var _t$dealAdd4 = t.dealAdd(_addedData5, [].concat(_toConsumableArray(circleIds), _toConsumableArray(circle))),
                    _ads3 = _t$dealAdd4.ads,
                    _otherupds3 = _t$dealAdd4.otherupds;

                var _t$dealUpdate4 = t.dealUpdate(_updatedData5, [].concat(_toConsumableArray(circleIds), _toConsumableArray(circle))),
                    _upds3 = _t$dealUpdate4.upds,
                    _otherads3 = _t$dealUpdate4.otherads;
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)


                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = _deletedDataIDs5[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var _id4 = _step5.value;

                        t.removeGraphic(_id4, 'circle');
                    }
                    //增加
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

                t.addCircle([].concat(_toConsumableArray(_ads3), _toConsumableArray(_otherads3)));
                //更新
                t.updateCircle([].concat(_toConsumableArray(_upds3), _toConsumableArray(_otherupds3)));
            }
            //绘制边界线
            if (boundaryName instanceof Array && !t.deepEqual(boundaryName, props.boundaryName)) {
                var newBDName = Set(boundaryName);
                var oldBDName = Set(props.boundaryName);
                var removedBoundaryName = oldBDName.subtract(newBDName).toJS();
                var addedBoundaryName = newBDName.subtract(oldBDName).toJS();
                t.removeBaiduBoundary(removedBoundaryName);
                t.addBaiduBoundary(addedBoundaryName);
            }
            // 获取热力图
            if (heatMapData && !t.deepEqual(heatMapData, props.heatMapData)) {
                t.heatMapOverlay(heatMapData);
            }
            //图元编辑调用
            if (typeof isDoEdit == 'boolean' && isDoEdit || isDoEdit && isDoEdit !== t.props.isDoEdit) {
                t.doEdit(editGraphicId);
            }
            //关闭图元编辑
            if (typeof isEndEdit == 'boolean' && isEndEdit || isEndEdit && isEndEdit !== t.props.isEndEdit) {
                t.endEdit();
            }
            //开启图元绘制
            if (typeof isDraw == 'boolean' && isDraw || isDraw && isDraw !== t.props.isDraw) {
                t.draw(mapDraw);
            }
            //关闭图元绘制
            if (typeof isCloseDraw == 'boolean' && isCloseDraw || isCloseDraw && isCloseDraw !== t.props.isCloseDraw) {
                t.closeDraw();
            }
            //设置中心点
            if (typeof setCenter == 'boolean' && setCenter || setCenter && setCenter !== t.props.setCenter) {
                t.setCenter(mapCenter);
            }
            //设置点聚合
            if (typeof setCluster == 'boolean' && setCluster || setCluster && setCluster !== t.props.setCluster) {
                t.cluster(mapCluster);
            }
            //设置比例尺
            if (typeof setZoomLevel == 'boolean' && setZoomLevel || setZoomLevel && setZoomLevel !== t.props.setZoomLevel) {
                t.setZoomLevel(mapZoomLevel);
            }
            //设置最优视野
            if (typeof setVisiblePoints == 'boolean' && setVisiblePoints || setVisiblePoints && setVisiblePoints !== t.props.setVisiblePoints) {
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
            //测距工具调用
            if (typeof isRangingTool == 'boolean' && isRangingTool || isRangingTool && isRangingTool !== t.props.isRangingTool) {
                t.vtxRangingTool(mapRangingTool);
            }
            //开关路况
            if (isOpenTrafficInfo) {
                t.openTrafficInfo();
            } else {
                t.hideTrafficInfo();
            }
            //设置区域限制
            if (typeof isSetAreaRestriction == 'boolean' && isSetAreaRestriction || isSetAreaRestriction && isSetAreaRestriction !== t.props.isSetAreaRestriction && areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]) {
                t.setAreaRestriction(areaRestriction);
            }
            //关闭区域限制
            if (typeof isClearAreaRestriction == 'boolean' && isClearAreaRestriction || isClearAreaRestriction && isClearAreaRestriction !== t.props.isClearAreaRestriction) {
                t.clearAreaRestriction();
            }
            //清空地图
            if (typeof isClearAll == 'boolean' && isClearAll || isClearAll && isClearAll !== t.props.isClearAll) {
                t.clearAll();
            }
            //删除指定图元
            if (typeof isRemove == 'boolean' && isRemove || isRemove && isRemove !== t.props.isRemove) {
                mapRemove.map(function (item, index) {
                    t.removeGraphic(item.id, item.type);
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            //关闭moveTo定时
            var t = this;
            if (t.state.gis) {
                t.state.gis.clearOverlays();
            }
            t.state.gis = null;
            if (t.moveToTimer) {
                clearInterval(t.moveToTimer);
            }
        }
    }]);

    return BaiduMap;
}(_react2.default.Component);

exports.default = BaiduMap;
module.exports = exports['default'];