'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./AMap.css');

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
//公共地址配置


var Set = _immutable2.default.Set;

var VortexAMap = function (_React$Component) {
    _inherits(VortexAMap, _React$Component);

    function VortexAMap(props) {
        _classCallCheck(this, VortexAMap);

        //初始化 图元管理方法
        var _this = _possibleConstructorReturn(this, (VortexAMap.__proto__ || Object.getPrototypeOf(VortexAMap)).call(this, props));

        _this.GM = new _MapToolFunction.graphicManage();
        _this.getPolygonArea = _MapToolFunction.getPolygonArea;
        _this.pointCollectionId = 'vtx_gmap_html_pointCollection'; //海量点canvas点位容器id class管理
        _this.morepoints = []; //海量点集合
        _this.htmlXY = { x: 0, y: 0, px: 0, py: 0, isCount: false };
        _this.stopMove = true; //防止zoom事件触发时,联动的触发move事件
        _this.mapLeft = 0; //地图offset的Left值
        _this.mapTop = 0; //地图offset的Top值
        _this.clusterObj = null; //聚合点类对象
        _this.trafficLayer = null; //路况类对象
        _this.scale = null; //比例尺控件对象
        _this.tool = null; //比例尺工具对象
        _this.ruler = null; //测距对象
        _this.mousetool = null; //绘制图元对象
        _this.districeSearch = null; //行政区划搜索对象
        _this.polyEdit = null; //折线和多边形编辑对象
        _this.circleEdit = null; //圆编辑对象
        _this.editTimeout = null; //圆编辑时的延迟回调,避免重复调用
        _this.heatmap = null; //热力图对象
        //为了样式相同,引用百度的鼠标样式
        _this.csr = /webkit/.test(navigator.userAgent.toLowerCase()) ? 'url("http://api.map.baidu.com/images/ruler.cur") 3 6, crosshair' : 'url("http://api.map.baidu.com/images/ruler.cur"), crosshair';
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
            // center: props.mapCenter,
            mapZoomLevel: props.mapZoomLevel,
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

    _createClass(VortexAMap, [{
        key: 'loadMapJs',
        value: function loadMapJs() {
            this.loadMapComplete = new Promise(function (resolve, reject) {
                if (window.AMap) {
                    resolve(window.AMap);
                } else {
                    $.getScript('http://webapi.amap.com/maps?v=1.4.6&key=e59ef9272e3788ac59d9a22f0f8cf9fe&plugin=AMap.MarkerClusterer,AMap.Scale,AMap.ToolBar,AMap.DistrictSearch,AMap.RangingTool,AMap.MouseTool,AMap.PolyEditor,AMap.CircleEditor,AMap.PlaceSearch,AMap.Heatmap', function () {
                        var PointCollection = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/GPointCollection.js', function () {
                                resolve();
                            });
                        });
                        Promise.all([PointCollection]).then(function () {
                            resolve(window.AMap);
                        });
                    });
                }
            });
        }
        //初始化地图

    }, {
        key: 'init',
        value: function init() {
            var t = this;
            var _t$props = t.props,
                mapPoints = _t$props.mapPoints,
                mapLines = _t$props.mapLines,
                mapPolygons = _t$props.mapPolygons,
                mapCircles = _t$props.mapCircles,
                setVisiblePoints = _t$props.setVisiblePoints,
                mapVisiblePoints = _t$props.mapVisiblePoints,
                mapCenter = _t$props.mapCenter,
                mapZoomLevel = _t$props.mapZoomLevel,
                mapCluster = _t$props.mapCluster,
                mapPointCollection = _t$props.mapPointCollection,
                showControl = _t$props.showControl,
                boundaryName = _t$props.boundaryName,
                heatMapData = _t$props.heatMapData,
                areaRestriction = _t$props.areaRestriction;
            //创建地图

            t.createMap();
            //初始化中心点
            t.setCenter(mapCenter);
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
            /*设置指定图元展示*/
            if (mapVisiblePoints) {
                t.setVisiblePoints(mapVisiblePoints);
            }
            //设置比例尺
            if (mapZoomLevel) {
                t.setZoomLevel(mapZoomLevel);
            }
            //设置点聚合
            if (mapCluster) {
                t.cluster(mapCluster);
            }
            //展示比例尺
            if (showControl) {
                t.showControl();
            }

            //画边界线
            if (boundaryName instanceof Array && boundaryName.length > 0) {
                t.addBaiduBoundary(boundaryName);
            }

            //回调显示方法
            if (t.props.showGraphicById) {
                t.props.showGraphicById(t.showGraphicById.bind(t));
            }
            //回调隐藏方法
            if (t.props.hideGraphicById) {
                t.props.hideGraphicById(t.hideGraphicById.bind(t));
            }
            //设置区域限制
            if (areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]) {
                t.setAreaRestriction(areaRestriction);
            }
            // 画热力图
            if (heatMapData) {
                t.heatMapOverlay(heatMapData);
            }
            //添加海量点
            if (mapPointCollection instanceof Array) {
                t.addPointCollection(mapPointCollection);
            }
            //初始化地图拖拽开始事件
            t.dragMapStart();
            //初始化地图拖拽结束事件
            t.dragMapEnd();
            //初始化地图移动开始事件
            t.moveStart();
            //初始化地图移动结束事件
            t.moveEnd();
            //初始化地图zoom改变开始事件
            t.zoomStart();
            //初始化地图zoom改变结束事件
            t.zoomEnd();
            //初始化地图点击事件
            t.clickMap();

            t.setState({
                mapCreated: true
            });
        }
        //地图方法

    }, {
        key: 'createMap',
        value: function createMap(divId) {
            var t = this;
            var _t$props2 = t.props,
                mapCenter = _t$props2.mapCenter,
                mapId = _t$props2.mapId,
                mapZoomLevel = _t$props2.mapZoomLevel,
                minZoom = _t$props2.minZoom,
                maxZoom = _t$props2.maxZoom;
            //缓存Map的对象,方便后期的功能操作
            //后期不会操作gis数据,直接通过state缓存.

            if (window.VtxMap) {
                window.VtxMap[mapId] = {};
            } else {
                window.VtxMap = {};
            }
            window.VtxMap[mapId] = t.state.gis = new AMap.Map(mapId, {
                resizeEnable: true,
                //zoom等级,和百度一样默认10
                zoom: mapZoomLevel || 10,
                //不传中心点,高德地图默认使用用户所在地的城市为中心点
                center: mapCenter,
                zooms: [minZoom || 3, maxZoom || 18]
            });
            //创建海量点图层
            //加上mapId 实现多地图
            t.pointCollectionId = mapId + '_' + t.pointCollectionId;
            $($('#' + mapId + ' .amap-maps')[0]).append('<div class=\'vtx_gmap_html_pointCollection_a\' id=\'' + t.pointCollectionId + '\' ></div>');
            //聚合点类对象
            t.clusterObj = new AMap.MarkerClusterer(t.state.gis, []);
            //比例尺控件对象
            /*算出比例尺位置偏移量*/
            var offsetS = new AMap.Pixel(60, 17);
            var offsetT = new AMap.Pixel(25, 10);
            var zlt = 'RB';
            var zls = 'RB';
            if (t.props.showControl) {
                switch (t.props.showControl.location) {
                    case 'tl':
                        zlt = 'LT';
                        zls = 'LB';
                        offsetS = new AMap.Pixel(10, 17);
                        offsetT = new AMap.Pixel(5, 10);
                        break;
                    case 'bl':
                        zlt = 'LB';
                        zls = 'LB';
                        offsetS = new AMap.Pixel(60, 19);
                        offsetT = new AMap.Pixel(5, 12);
                        break;
                    case 'tr':
                        zlt = 'RT';
                        zls = 'RB';
                        offsetS = new AMap.Pixel(25, 17);
                        offsetT = new AMap.Pixel(25, 10);
                        break;
                    case 'br':
                        zlt = 'RB';
                        zls = 'RB';
                        offsetS = new AMap.Pixel(70, 17);
                        offsetT = new AMap.Pixel(25, 10);
                        break;
                }
                //默认是all
                var tp = {
                    ruler: true,
                    direction: true
                };
                switch (t.props.showControl.type) {
                    case 'small':
                        tp = {
                            ruler: false,
                            direction: true
                        };
                        break;
                    case 'pan':
                        tp = {
                            ruler: false,
                            direction: true
                        };
                        break;
                    case 'zoom':
                        tp = {
                            ruler: false,
                            direction: false
                        };
                        break;
                }
                t.scale = new AMap.Scale({
                    position: zls,
                    offset: offsetS
                });
                //比例尺工具对象
                t.tool = new AMap.ToolBar(_extends({
                    position: zlt,
                    offset: offsetT,
                    locate: false
                }, tp));
            }
            //搜索服务
            var opts = {
                subdistrict: 1, //返回下一级行政区
                extensions: 'all', //返回行政区边界坐标组等具体信息
                level: 'country' //查询行政级别为 市
            };
            //实例化DistrictSearch
            t.districeSearch = new AMap.DistrictSearch(opts);
            //实例化RangingTool
            t.ruler = new AMap.RangingTool(t.state.gis);
            t.ruler.on('end', function (_ref) {
                var type = _ref.type,
                    polyline = _ref.polyline,
                    points = _ref.points,
                    distance = _ref.distance;

                var lnglats = points.map(function (item, index) {
                    return [item.lng, item.lat];
                });
                //恢复鼠标默认样式
                t.state.gis.setDefaultCursor();
                t.ruler.turnOff();
                if (typeof t.props.mapRangingTool === "function") {
                    t.props.mapRangingTool({
                        distance: distance, lnglats: lnglats
                    });
                }
            });
            //绘制图元类
            t.mousetool = new AMap.MouseTool(t.state.gis);
            //绘制完后的回调
            t.mousetool.on('draw', function (_ref2) {
                var type = _ref2.type,
                    obj = _ref2.obj;

                var drawExtData = obj.getExtData();
                var backobj = {
                    id: drawExtData.id,
                    attributes: drawExtData.attributes,
                    geometryType: drawExtData.type,
                    mapLayer: obj,
                    geometry: {
                        type: drawExtData.type
                    }
                };
                //缓存绘制的图元信息
                t.GM.setGraphic(drawExtData.id, obj);
                t.GM.setGraphicParam(drawExtData.id, backobj);
                //区别点和圆的经纬度数据处理

                var _t$dealData = t.dealData(obj),
                    lnglatAry = _t$dealData.lnglatAry,
                    _extent = _t$dealData._extent,
                    path = _t$dealData.path;
                //处理返回数据


                switch (drawExtData.type) {
                    case 'point':
                        backobj.geometry.x = obj.getPosition().getLng();
                        backobj.geometry.y = obj.getPosition().getLat();
                        break;
                    case 'polyline':
                        backobj.lnglatAry = lnglatAry;
                        backobj.geometry.paths = path;
                        backobj.geometry._extent = _extent;
                        backobj.distance = obj.getLength();
                        break;
                    case 'polygon':
                        backobj.area = obj.getArea();
                        backobj.lnglatAry = lnglatAry;
                        backobj.geometry.rings = path;
                        backobj.geometry._extent = _extent;
                        break;
                    case 'rectangle':
                        backobj.area = obj.getArea();
                        backobj.lnglatAry = lnglatAry;
                        backobj.geometry.rings = path;
                        backobj.geometry._extent = _extent;
                        break;
                    case 'circle':
                        backobj.geometry.x = obj.getCenter().getLng();
                        backobj.geometry.y = obj.getCenter().getLat();
                        backobj.geometry.radius = obj.getRadius();
                        backobj.area = Math.PI * Math.pow(backobj.geometry.radius, 2);
                        break;
                }
                //恢复鼠标默认样式
                t.state.gis.setDefaultCursor();
                t.mousetool.close();
                if ('drawEnd' in t.props) {
                    t.props.drawEnd(backobj);
                }
            });
            t.heatmap = new AMap.Heatmap(t.state.gis);
            t.state.gis.on('mapmove', function (e) {
                if (t.htmlXY.isCount) {
                    var nowXY = t.state.gis.lnglatToPixel(t.state.gis.getCenter());
                    $('#' + t.pointCollectionId).css({
                        top: t.htmlXY.y - nowXY.y,
                        left: t.htmlXY.x - nowXY.x,
                        display: 'none'
                    });
                }
            });
        }
        //清空地图所有图元

    }, {
        key: 'clearAll',
        value: function clearAll() {
            var t = this;
            //先清除所有标记
            t.clusterObj.clearMarkers();
            t.state.gis.clearMap();
            //清空所有缓存图元数据
            t.GM.clearAll();
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
        /*set方法*/
        //设置地图中心位置 lng/经度  lat/纬度

    }, {
        key: 'setCenter',
        value: function setCenter(gt) {
            var t = this;
            if (gt) {
                t.state.gis.setCenter(gt);
                // t.setState({center:gt});
            } else {
                t.state.gis.setCenter([116.400433, 39.906705]);
                // t.setState({center:[117.468021,39.890092]});
            }
        }
        /*地图区域限制*/

    }, {
        key: 'setAreaRestriction',
        value: function setAreaRestriction(sw_ne) {
            var bounds = new AMap.Bounds(new AMap.LngLat(sw_ne[0][0], sw_ne[0][1]), new AMap.LngLat(sw_ne[1][0], sw_ne[1][1]));
            this.state.gis.setLimitBounds(bounds);
        }
    }, {
        key: 'clearAreaRestriction',
        value: function clearAreaRestriction() {
            this.state.gis.clearLimitBounds();
        }
        //展示路况信息

    }, {
        key: 'openTrafficInfo',
        value: function openTrafficInfo() {
            var t = this;
            //判断是否已经创建路况对象
            if (this.trafficLayer) {
                this.trafficLayer.show();
            } else {
                //路况类对象
                var trafficLayer = new AMap.TileLayer.Traffic({
                    zIndex: 10
                });
                t.state.gis.add(trafficLayer);
                this.trafficLayer = trafficLayer;
            }
        }
        //隐藏路况信息

    }, {
        key: 'hideTrafficInfo',
        value: function hideTrafficInfo() {
            if (this.trafficLayer) {
                this.trafficLayer.hide();
            }
        }
        //设置指定图元展示   高德只有zoom和center全适应,单适应暂时无法实现

    }, {
        key: 'setVisiblePoints',
        value: function setVisiblePoints(obj) {
            var t = this;
            var ids = [];
            switch (obj.fitView) {
                case 'point':
                    t.state.gis.setFitView(t.state.gis.getAllOverlays('marker'));
                    break;
                case 'line':
                    t.state.gis.setFitView(t.state.gis.getAllOverlays('polyline'));
                    break;
                case 'polygon':
                    t.state.gis.setFitView(t.state.gis.getAllOverlays('polygon'));
                    break;
                case 'circle':
                    t.state.gis.setFitView(t.state.gis.getAllOverlays('circle'));
                    break;
                case 'all':
                    var pts = [].concat(_toConsumableArray(t.state.gis.getAllOverlays('marker')), _toConsumableArray(t.state.gis.getAllOverlays('polyline')), _toConsumableArray(t.state.gis.getAllOverlays('polygon')), _toConsumableArray(t.state.gis.getAllOverlays('circle')));
                    t.state.gis.setFitView(pts);
                    break;
                default:
                    if (obj.fitView instanceof Array) {
                        ids = obj.fitView;
                    } else if (typeof obj.fitView === 'string') {
                        ids = obj.fitView.split(',');
                    }
                    if (ids[0] instanceof Array) {
                        var l = new AMap.LngLat(ids[0][0], ids[0][1]),
                            r = new AMap.LngLat(ids[1][0], ids[1][1]);
                        var b = new AMap.Bounds(l, r);
                        t.state.gis.setBounds(b);
                    } else {
                        t.state.gis.setFitView(this.GM.getMoreGraphic(ids));
                    }
                    break;
            }
        }
        //设置地图比例尺

    }, {
        key: 'setZoomLevel',
        value: function setZoomLevel(zoom) {
            var t = this;
            t.state.gis.setZoom(zoom);
        }
        //获取当前地图的中心位置

    }, {
        key: 'getCurrentCenter',
        value: function getCurrentCenter() {
            var t = this;
            return {
                lat: t.state.gis.getCenter().lat,
                lng: t.state.gis.getCenter().lng
            };
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
            var gis = t.state.gis;

            var obj = {
                mapSize: gis.getSize(),
                nowCenter: t.getCurrentCenter(),
                northEast: {
                    lat: gis.getBounds().getNorthEast().lat,
                    lng: gis.getBounds().getNorthEast().lng
                },
                southWest: {
                    lat: gis.getBounds().getSouthWest().lat,
                    lng: gis.getBounds().getSouthWest().lng
                },
                zoom: t.getZoomLevel()
            };
            obj.radius = t.calculatePointsDistance([obj.nowCenter.lng, obj.nowCenter.lat], [gis.getBounds().getNorthEast().getLng(), gis.getBounds().getNorthEast().getLat()]);
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
            ary = ary.filter(function (item, index) {
                return !(t.GM.getGraphicParam(item).attributes.config || {}).isAnimation;
            });
            var ms = this.GM.getMoreGraphic(ary).filter(function (item, index) {
                return !item && item != 0 ? false : true;
            });
            t.clusterObj.setMarkers(ms);
        }
        //展示比例尺

    }, {
        key: 'showControl',
        value: function showControl() {
            var t = this;
            t.state.gis.addControl(t.scale);
            if (t.props.showControl.type !== 'null' && !!t.props.showControl.type) {
                t.state.gis.addControl(t.tool);
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

            var _t$dealData2 = t.dealData(gg),
                lnglatAry = _t$dealData2.lnglatAry,
                _extent = _t$dealData2._extent,
                path = _t$dealData2.path;

            switch (gp.geometryType) {
                case 'point':
                    lng = gg.getPosition().getLng();
                    lat = gg.getPosition().getLat();
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
                        lnglatAry: lnglatAry,
                        mapLayer: gg,
                        geometry: _extends({}, gp.geometry, {
                            paths: pts,
                            _extent: _extent
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
                        lnglatAry: lnglatAry,
                        mapLayer: gg,
                        geometry: _extends({}, gp.geometry, {
                            rings: pts,
                            _extent: _extent
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
                    lng = gg.getCenter().getLng();
                    lat = gg.getCenter().getLat();
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
        //显示隐藏的图元

    }, {
        key: 'showGraphicById',
        value: function showGraphicById(id) {
            var t = this;
            t.GM.getGraphic(id).show();
        }
        //隐藏图元

    }, {
        key: 'hideGraphicById',
        value: function hideGraphicById(id) {
            var t = this;
            t.GM.getGraphic(id).hide();
        }
        //画出对应边界线 name区域名

    }, {
        key: 'addBaiduBoundary',
        value: function addBaiduBoundary(bdNames) {
            var t = this;
            this.districeSearch;
            bdNames.forEach(function (name) {
                t.districeSearch.search(name, function (status, result) {
                    if (status == 'complete') {
                        var id = 'boundary' + new Date().getTime();
                        var paths = result.districtList[0].boundaries[0].map(function (item, index) {
                            return [item.lng, item.lat];
                        });
                        t.addPolygon([{ id: id, rings: paths }]);
                        t.state.boundaryInfo.push({ id: id, name: name });
                    }
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
            var option = {
                radius: cg.radius,
                opacity: [0, cg.opacity]
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
                var points = (d.points || []).map(function (d, i) {
                    var p = new AMap.LngLat(d.lng, d.lat);
                    p = t.state.gis.lngLatToContainer(p);
                    return [p.x, p.y];
                });
                var options = {
                    size: d.size,
                    shape: d.shape,
                    color: d.color,
                    width: t.state.gis.getSize().width,
                    height: t.state.gis.getSize().height,
                    mapId: t.props.mapId
                };
                var VotexpointCollection = new GMapLib.PointCollection(points, options);
                t.morepoints.push({
                    id: d.id,
                    value: VotexpointCollection
                });
                VotexpointCollection.draw();
            });
        }
        //更新海量点

    }, {
        key: 'updatePointCollection',
        value: function updatePointCollection() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var t = this;
            data.map(function (ds, ind) {
                t.morepoints.map(function (item, index) {
                    if (item.id == ds.id) {
                        var points = (ds.points || []).map(function (d, i) {
                            var p = new AMap.LngLat(d.lng, d.lat);
                            p = t.state.gis.lngLatToContainer(p);
                            return [p.x, p.y];
                        });
                        var options = {
                            size: ds.size,
                            shape: ds.shape,
                            color: ds.color,
                            width: t.state.gis.getSize().width,
                            height: t.state.gis.getSize().height
                        };
                        item.value.reDraw(points, options);
                    }
                });
            });
        }
        //删除海量点

    }, {
        key: 'clearPointCollection',
        value: function clearPointCollection() {
            var ids = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var t = this;
            ids.map(function (id, ind) {
                t.morepoints.map(function (item, index) {
                    if (id == item.id) {
                        item.value.clear();
                    }
                });
            });
        }
        //删除全部海量点

    }, {
        key: 'clearAllPointCollection',
        value: function clearAllPointCollection() {
            var t = this;
            t.morepoints.map(function (item, index) {
                item.value.clear();
            });
        }
        //添加点

    }, {
        key: 'addPoint',
        value: function addPoint(mapPoints, type) {
            var _this3 = this;

            var t = this;
            var ps = [];
            var psids = [].concat(_toConsumableArray(t.state.pointIds));
            mapPoints.map(function (item, index) {
                //如果id重复,直接跳过不执行.
                if (_this3.GM.isRepetition(item.id)) {
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
                    markerContentX: -13,
                    markerContentY: -42,
                    zIndex: 100,
                    deg: 0
                    //初始化默认数据
                };if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                //覆盖物参数
                var markerOption = {
                    position: new AMap.LngLat(item.longitude, item.latitude),
                    offset: new AMap.Pixel(cg.markerContentX, cg.markerContentY),
                    zIndex: cg.zIndex,
                    angle: cg.deg,
                    clickable: true,
                    cursor: 'pointer',
                    bubble: true,
                    extData: {
                        id: item.id
                    }
                };
                if (cg.BAnimationType == 0) {
                    markerOption.animation = 'AMAP_ANIMATION_BOUNCE';
                } else if (cg.BAnimationType == 1) {
                    markerOption.animation = 'AMAP_ANIMATION_DROP';
                } else {
                    markerOption.animation = 'AMAP_ANIMATION_NONE';
                }
                //判断html还是图片
                if (!!item.markerContent) {
                    markerOption.content = item.markerContent;
                } else {
                    markerOption.icon = item.url;
                }
                //是否展示label
                if (item.canShowLabel) {
                    var labelClass = item.labelClass || 'label-content';
                    markerOption.label = {
                        content: '<div class=\'' + labelClass + '\'>' + cg.labelContent + '</div>',
                        offset: new AMap.Pixel(cg.labelPixelX, cg.labelPixelY)
                    };
                }
                //获得覆盖物对象
                var marker = new AMap.Marker(markerOption);
                //添加点击事件
                marker.on('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                marker.on('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                marker.on('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                ps.push(marker);
                psids.push(item.id);
                //缓存图元的数据,偏于后期操作
                _this3.GM.setGraphic(item.id, marker).setGraphicParam(item.id, {
                    attributes: _extends({}, item, { other: item }),
                    geometryType: 'point',
                    geometry: {
                        type: 'point',
                        x: item.longitude,
                        y: item.latitude
                    }
                });
            });
            //统一加点
            t.state.gis.add(ps);
            if (type !== 'defined') {
                t.setState({
                    pointIds: psids
                });
            }
        }
        //更新点

    }, {
        key: 'updatePoint',
        value: function updatePoint(mapPoints) {
            var _this4 = this;

            var t = this;
            mapPoints.map(function (item, index) {
                //判断图元是否存在.
                if (_this4.GM.isRepetition(item.id)) {
                    //点位数据不符合,直接跳过
                    if (!item.longitude || !item.latitude) {
                        console.error('\u70B9 \u7ECF\u7EAC\u5EA6 \u6570\u636E\u9519\u8BEF');
                        return false;
                    }
                    if (!item.config) {
                        item.config = {};
                    }
                    //获取原有的图元
                    var gc = _this4.GM.getGraphic(item.id),
                        isuserUrlLeft = false;
                    var cg = {
                        labelContent: item.config.labelContent || gc.getLabel(),
                        markerContentX: item.config.markerContentX || gc.getOffset().getX(),
                        markerContentY: item.config.markerContentY || gc.getOffset().getY(),
                        deg: item.config.deg || gc.getAngle(),
                        zIndex: item.config.zIndex || gc.getzIndex(),
                        labelClass: item.config.labelContent || 'label-content'
                    };
                    if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    //是否展示label
                    if (item.canShowLabel) {
                        cg.labelPixelX = item.config.labelPixelX || gc.getLabel().offset.getX();
                        cg.labelPixelY = item.config.labelPixelY || gc.getLabel().offset.getY();
                        cg.labelContent = item.config.labelContent || gc.getLabel().offset.content;
                        var labelClass = item.labelClass || 'label-content';
                        //更新label
                        gc.setLabel({
                            content: '<div class=\'' + labelClass + '\'>' + cg.labelContent + '</div>',
                            offset: new AMap.Pixel(cg.labelPixelX, cg.labelPixelY)
                        });
                    }
                    //更新偏移量
                    gc.setOffset(new AMap.Pixel(cg.markerContentX, cg.markerContentY));
                    //设置偏转角度
                    gc.setAngle(cg.deg);
                    //设置点的标记添加顺序
                    gc.setzIndex(cg.zIndex);
                    //更新经纬度
                    if (!item.config.isAnimation) {
                        gc.setPosition(new AMap.LngLat(item.longitude, item.latitude));
                    } else {
                        var distance = t.calculatePointsDistance([item.longitude, item.latitude], [gc.getPosition().getLng(), gc.getPosition().getLat()]);
                        if (distance > 0) {
                            var delay = item.config.animationDelay || 3;
                            var speed = distance / delay * 3600 / 1000;
                            if (cg.autoRotation) {
                                var ddeg = t.rotateDeg(gc.getPosition(), [item.longitude, item.latitude]);
                                if (item.urlleft && ddeg < -90 && ddeg > -270) {
                                    ddeg += 180;
                                    isuserUrlLeft = true;
                                }
                                gc.setAngle(ddeg);
                            }
                            gc.moveTo(new AMap.LngLat(item.longitude, item.latitude), speed, function (k) {
                                return k;
                            });
                        }
                    }
                    if (item.config.BAnimationType == 0) {
                        gc.setAnimation('AMAP_ANIMATION_BOUNCE');
                    } else if (item.config.BAnimationType == 1) {
                        gc.setAnimation('AMAP_ANIMATION_DROP');
                    } else {
                        gc.setAnimation('AMAP_ANIMATION_NONE');
                    }
                    //判断html还是图片
                    if (!!item.markerContent) {
                        gc.setContent(item.markerContent);
                    } else {
                        if (isuserUrlLeft) {
                            gc.setIcon(item.urlleft);
                        } else {
                            if (item.url) {
                                gc.setIcon(item.url);
                            }
                        }
                    }
                    _this4.GM.setGraphicParam(item.id, {
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
        }
        //添加线

    }, {
        key: 'addLine',
        value: function addLine(mapLines, type) {
            var _this5 = this;

            var t = this;
            var ls = [];
            var lsids = [].concat(_toConsumableArray(t.state.lineIds));
            //遍历添加线(图元)
            mapLines.map(function (item, index) {
                //如果id重复,直接跳过不执行.
                if (_this5.GM.isRepetition(item.id)) {
                    console.error('\u591A\u6298\u7EBFid: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //多折线点位数据不符合,直接跳过
                if (!(item.paths && item.paths.length >= 2)) {
                    console.error('\u591A\u6298\u7EBFpaths\u6570\u636E\u9519\u8BEF');
                    return false;
                }
                var cg = {
                    color: '#277ffa',
                    pellucidity: 0.9,
                    lineWidth: 5,
                    lineType: 'solid',
                    isHidden: false
                };
                if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                var lineOption = {
                    strokeColor: cg.color,
                    strokeOpacity: cg.pellucidity,
                    strokeWeight: cg.lineWidth,
                    strokeStyle: cg.lineType,
                    path: (item.paths || []).map(function (itt, indd) {
                        return [].concat(_toConsumableArray(itt));
                    }),
                    cursor: 'pointer',
                    bubble: true
                };
                var polyline = new AMap.Polyline(lineOption);
                //添加点击事件
                polyline.on('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                polyline.on('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                polyline.on('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                //缓存图元的数据,便于后期操作
                var pts = item.paths.map(function (itt, ind) {
                    return [].concat(_toConsumableArray(itt));
                });
                _this5.GM.setGraphic(item.id, polyline).setGraphicParam(item.id, {
                    attributes: _extends({}, item, {
                        paths: pts,
                        other: item
                    }),
                    geometryType: 'polyline',
                    geometry: {
                        type: 'polyline',
                        paths: pts
                    }
                });
                ls.push(polyline);
                lsids.push(item.id);
                //添加线
                // polyline.setMap(t.state.gis);
                //根据参数判断是否显示多折线
                if (cg.isHidden) {
                    polyline.hide();
                } else {
                    polyline.show();
                }
                //state中缓存 line的id...用于数据判断
                t.state.lineIds.push(item.id);
                // polyline.on('click', function(e) {
                //     let obj = {
                //         type: 'polyline',
                //         attributes: {...item.other,...{config:item.config}},
                //         top: e.pixel.y,
                //         left: e.pixel.x,
                //         e: e
                //     }
                //     //接入点击事件
                // });
            });
            t.state.gis.add(ls);
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
            var _this6 = this;

            var t = this;
            //遍历添加线(图元)
            mapLines.map(function (item, index) {
                //判断图元是否存在.
                if (_this6.GM.isRepetition(item.id)) {
                    //多折线点位数据不符合,直接跳过
                    if (!(item.paths && item.paths.length >= 2)) {
                        console.error('\u591A\u6298\u7EBFpaths\u6570\u636E\u9519\u8BEF');
                        return false;
                    }
                    //获取原有的图元
                    var gc = _this6.GM.getGraphic(item.id);
                    var op = gc.getOptions();
                    if (!item.config) {
                        item.config = {};
                    }
                    //根据参数判断是否显示多折线
                    if (item.config && item.config.isHidden) {
                        gc.hide();
                    } else {
                        gc.show();
                    }
                    //获取原有的线属性,转换key值
                    var cg = {
                        color: op.strokeColor,
                        pellucidity: op.strokeOpacity,
                        lineWidth: op.strokeWeight,
                        lineType: op.strokeStyle
                    };
                    //重新初始化值
                    if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    //重新赋值
                    var lineOption = {
                        strokeColor: cg.color,
                        strokeOpacity: cg.pellucidity,
                        strokeWeight: cg.lineWidth,
                        strokeStyle: cg.lineType,
                        path: (item.paths || op.path).map(function (itt, indd) {
                            return [].concat(_toConsumableArray(itt));
                        }),
                        cursor: 'pointer'
                    };
                    var pts = item.paths.map(function (itt, ind) {
                        return [].concat(_toConsumableArray(itt));
                    });
                    _this6.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, {
                            paths: pts,
                            other: item
                        }),
                        geometryType: 'polyline',
                        geometry: {
                            type: 'polyline',
                            paths: pts
                        }
                    });
                    //更新线
                    gc.setOptions(lineOption);
                } else {
                    console.error('\u66F4\u65B0\u7684\u591A\u6298\u7EBFid\u4E0D\u5B58\u5728!');
                    return false;
                }
            });
        }
        //添加面

    }, {
        key: 'addPolygon',
        value: function addPolygon(mapPolygons) {
            var _this7 = this;

            var t = this;
            var pgs = [];
            var pgsids = [].concat(_toConsumableArray(t.state.polygonIds));
            //遍历添加面(图元)
            mapPolygons.map(function (item, index) {
                //如果id重复,直接跳过不执行.
                if (_this7.GM.isRepetition(item.id)) {
                    console.error('\u591A\u8FB9\u5F62id: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //多边形点位数据不符合,直接跳过
                if (!(item.rings && item.rings.length >= 3)) {
                    console.error('\u591A\u8FB9\u5F62rings\u6570\u636E\u9519\u8BEF');
                    return false;
                }
                var cg = {
                    lineType: 'solid',
                    lineWidth: 5,
                    lineColor: '#277ffa',
                    lineOpacity: 1,
                    color: '#fff',
                    pellucidity: 0.5
                    // isHidden: false  //后期跟百度一起加
                };
                if (!item.config) {
                    cg = _extends({}, cg, item.config);
                }
                var polygonOption = {
                    strokeColor: cg.lineColor,
                    strokeOpacity: cg.lineOpacity,
                    strokeWeight: cg.lineWidth,
                    strokeStyle: cg.lineType,
                    fillColor: cg.color,
                    fillOpacity: cg.pellucidity,
                    path: (item.rings || []).map(function (itt, indd) {
                        return [].concat(_toConsumableArray(itt));
                    }),
                    cursor: 'pointer',
                    bubble: true
                };
                var polygon = new AMap.Polygon(polygonOption);
                //添加点击事件
                polygon.on('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                polygon.on('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                polygon.on('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                //缓存图元的数据,便于后期操作
                var pts = item.rings.map(function (itt, ind) {
                    return [].concat(_toConsumableArray(itt));
                });
                _this7.GM.setGraphic(item.id, polygon).setGraphicParam(item.id, {
                    attributes: _extends({}, item, {
                        rings: pts,
                        other: item
                    }),
                    geometryType: 'polygon',
                    geometry: {
                        type: 'polygon',
                        rings: pts
                    }
                });
                pgs.push(polygon);
                pgsids.push(item.id);
            });
            t.state.gis.add(pgs);
            t.setState({
                polygonIds: pgsids
            });
        }
        //更新面

    }, {
        key: 'updatePolygon',
        value: function updatePolygon(mapPolygons) {
            var _this8 = this;

            var t = this;
            mapPolygons.map(function (item, index) {
                //判断图元是否存在.
                if (_this8.GM.isRepetition(item.id)) {
                    //多边形点位数据不符合,直接跳过
                    if (!(item.rings && item.rings.length >= 3)) {
                        console.error('\u591A\u8FB9\u5F62rings\u6570\u636E\u9519\u8BEF');
                        return false;
                    }
                    //获取原有的图元
                    var gc = _this8.GM.getGraphic(item.id);
                    var op = gc.getOptions();
                    if (!item.config) {
                        item.config = {};
                    }
                    //根据参数判断是否显示面
                    // if(item.config && item.config.isHidden){
                    //     gc.hide();
                    // }else{
                    //     gc.show();
                    // }
                    //获取原有的面属性,转换key值
                    var cg = {
                        lineType: op.strokeStyle,
                        lineWidth: op.strokeWeight,
                        lineColor: op.strokeColor,
                        lineOpacity: op.strokeOpacity,
                        color: op.fillColor,
                        pellucidity: op.fillOpacity
                        //重新初始化值
                    };if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    //重新赋值
                    var polygonOption = {
                        strokeColor: cg.lineColor,
                        strokeOpacity: cg.lineOpacity,
                        strokeWeight: cg.lineWidth,
                        strokeStyle: cg.lineType,
                        fillColor: cg.color,
                        fillOpacity: cg.pellucidity,
                        path: (item.rings || op.path).map(function (itt, indd) {
                            return [].concat(_toConsumableArray(itt));
                        }),
                        cursor: 'pointer'
                    };
                    var pts = item.rings.map(function (itt, ind) {
                        return [].concat(_toConsumableArray(itt));
                    });
                    _this8.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, {
                            rings: pts,
                            other: item
                        }),
                        geometryType: 'polygon',
                        geometry: {
                            type: 'polygon',
                            rings: pts
                        }
                    });
                    //更新线
                    gc.setOptions(polygonOption);
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
            var _this9 = this;

            var t = this;
            var ccs = [];
            var ccsids = [].concat(_toConsumableArray(t.state.circleIds));
            mapCircles.map(function (item, index) {
                //如果id重复,直接跳过不执行.
                if (_this9.GM.isRepetition(item.id)) {
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
                    // isHidden: false  //后期跟百度一起加
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
                    fillOpacity: cg.pellucidity,
                    center: new AMap.LngLat(item.longitude, item.latitude),
                    radius: item.radius,
                    cursor: 'pointer',
                    bubble: true
                    //创建圆对象
                };var circle = new AMap.Circle(circleOption);
                //添加点击事件
                circle.on('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                circle.on('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                circle.on('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                //缓存图元的数据,便于后期操作
                _this9.GM.setGraphic(item.id, circle).setGraphicParam(item.id, {
                    attributes: _extends({}, item, { other: item }),
                    geometryType: 'circle',
                    geometry: {
                        type: 'circle',
                        x: item.longitude,
                        y: item.latitude,
                        radius: item.radius
                    }
                });
                ccs.push(circle);
                ccsids.push(item.id);
            });
            t.state.gis.add(ccs);
            t.setState({
                circleIds: ccsids
            });
        }
        //更新圆

    }, {
        key: 'updateCircle',
        value: function updateCircle(mapCircles) {
            var _this10 = this;

            var t = this;
            mapCircles.map(function (item, index) {
                //判断图元是否存在.
                if (_this10.GM.isRepetition(item.id)) {
                    //圆 点位数据不符合,直接跳过
                    if (!item.longitude || !item.latitude) {
                        console.error('\u5706 \u7ECF\u7EAC\u5EA6 \u6570\u636E\u9519\u8BEF');
                        return false;
                    }
                    //获取原有的图元
                    var gc = _this10.GM.getGraphic(item.id);
                    var op = gc.getOptions();
                    if (!item.config) {
                        item.config = {};
                    }
                    //获取原有的面属性,转换key值
                    var cg = {
                        lineType: op.strokeStyle,
                        lineWidth: op.strokeWeight,
                        lineColor: op.strokeColor,
                        lineOpacity: op.strokeOpacity,
                        color: op.fillColor,
                        pellucidity: op.fillOpacity
                        //重新初始化值
                    };if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    //重新赋值
                    var circleOption = {
                        strokeColor: cg.lineColor,
                        strokeOpacity: cg.lineOpacity,
                        strokeWeight: cg.lineWidth,
                        strokeStyle: cg.lineType,
                        fillColor: cg.color,
                        fillOpacity: cg.pellucidity,
                        center: new AMap.LngLat(item.longitude, item.latitude) || op.center,
                        radius: !item.radius && item != 0 ? op.radius : item.radius,
                        cursor: 'pointer'
                        //缓存图元的数据,便于后期操作
                    };_this10.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, { other: item }),
                        geometryType: 'circle',
                        geometry: {
                            type: 'circle',
                            x: item.longitude,
                            y: item.latitude,
                            radius: item.radius
                        }
                    });
                    //更新线
                    gc.setOptions(circleOption);
                } else {
                    console.error('\u66F4\u65B0\u7684\u5706id\u4E0D\u5B58\u5728!');
                    return false;
                }
            });
        }
        /*根据图元id,使图元变成可编辑状态*/

    }, {
        key: 'doEdit',
        value: function doEdit(id) {
            var t = this;
            var ms = t.getGraphic(id);
            if (!ms) {
                return false;
            }
            if (!!t.state.editId) {
                t.endEdit();
            }
            switch (ms.geometryType) {
                case 'point':
                    ms.mapLayer.setDraggable(true);
                    ms.mapLayer.on('dragend', t.editGraphicChange, t);
                    break;
                case 'polyline':
                // break;
                case 'polygon':
                case 'rectangle':
                    t.polyEdit = new AMap.PolyEditor(t.state.gis, ms.mapLayer);
                    t.polyEdit.open();
                    t.polyEdit.on('adjust', t.editGraphicChange, t);
                    break;
                case 'circle':
                    t.circleEdit = new AMap.CircleEditor(t.state.gis, ms.mapLayer);
                    t.circleEdit.open();
                    t.circleEdit.on('move', t.editGraphicChange, t);
                    t.circleEdit.on('adjust', t.editGraphicChange, t);
                    break;
            }
            t.setState({
                editId: id
            });
        }
        //关闭编辑

    }, {
        key: 'endEdit',
        value: function endEdit() {
            var t = this;
            var ms = t.getGraphic(t.state.editId);
            switch (ms.geometryType) {
                case 'point':
                    ms.mapLayer.setDraggable(false);
                    ms.mapLayer.off('dragend', t.editGraphicChange, t);
                    break;
                case 'polyline':
                case 'polygon':
                case 'rectangle':
                    t.polyEdit.close();
                    t.polyEdit.off('adjust', t.editGraphicChange, t);
                    break;
                case 'circle':
                    t.circleEdit.close();
                    t.circleEdit.off('move', t.editGraphicChange, t);
                    t.circleEdit.off('adjust', t.editGraphicChange, t);
                    break;
            }
            var editGraphic = t.state.editGraphic;
            if (editGraphic) {
                t.setState({
                    editId: '',
                    editGraphic: ''
                }, function () {
                    t.props.editGraphicChange(editGraphic);
                });
            }
        }
        //编辑变动后

    }, {
        key: 'editGraphicChange',
        value: function editGraphicChange(e) {
            var t = this;
            var ms = t.getGraphic(t.state.editId);
            var obj = {
                id: t.state.editId,
                e: e
            };
            switch (ms.geometryType) {
                case 'point':
                    obj.geometry = ms.geometry;
                    obj.param = ms;
                    break;
                case 'polyline':
                    obj.geometry = ms.geometry;
                    obj.param = ms;
                    obj.distance = ms.mapLayer.getLength();
                    break;
                case 'polygon':
                case 'rectangle':
                    obj.geometry = ms.geometry;
                    obj.param = ms;
                    obj.area = e.target.getArea();
                    break;
                case 'circle':
                    if (!('lnglat' in e)) {
                        obj.e.lnglat = new AMap.LngLat(ms.geometry.x, ms.geometry.y);
                    }
                    if (!('radius' in e)) {
                        obj.e.radius = ms.geometry.radius;
                    }
                    obj.geometry = ms.geometry;
                    obj.param = ms;
                    obj.area = Math.pow(ms.geometry.radius, 2) * Math.PI;
                    break;
            }
            if (ms.geometryType == 'circle') {
                if (t.editTimeout) {
                    clearTimeout(t.editTimeout);
                }
                t.editTimeout = setTimeout(function () {
                    t.setState({
                        editGraphic: obj
                    }, function () {
                        t.props.editGraphicChange(obj);
                    });
                }, 300);
            } else {
                t.setState({
                    editGraphic: obj
                }, function () {
                    t.props.editGraphicChange(obj);
                });
            }
        }
        //点击图元事件

    }, {
        key: 'clickGraphic',
        value: function clickGraphic(id, e) {
            var t = this;
            if (typeof t.props.clickGraphic === "function") {
                var param = t.getGraphic(id);
                var obj = {
                    param: param,
                    type: param.geometry.type, //图元类型
                    attributes: _extends({}, param.attributes.other, { config: param.attributes.config }), //添加时图元信息
                    top: e.pixel.y + t.mapTop, //当前点所在的位置(屏幕)
                    left: e.pixel.x + t.mapLeft,
                    e: e
                };
                t.props.clickGraphic(obj);
            }
        }
        //拖拽地图开始

    }, {
        key: 'dragMapStart',
        value: function dragMapStart() {
            var t = this;
            if (typeof t.props.dragMapStart === "function") {
                t.state.gis.on('dragstart', function (e) {
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
                t.state.gis.on('dragend', function (e) {
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
                t.state.gis.on('movestart', function (e) {
                    t.htmlXY = _extends({
                        px: 0, py: 0, isCount: true
                    }, t.state.gis.lnglatToPixel(t.state.gis.getCenter()));
                    $('#' + t.pointCollectionId).css({ top: '0px', left: '0px', display: 'none' });
                    t.updatePointCollection(t.props.mapPointCollection);
                    if (t.stopMove) {
                        var obj = t.getMapExtent();
                        obj.e = e;
                        //处理下数据,符合拖拽事件
                        t.props.moveStart(obj);
                    }
                });
            }
        }
        //地图移动结束事件

    }, {
        key: 'moveEnd',
        value: function moveEnd() {
            var t = this;
            if (typeof t.props.moveEnd === "function") {
                t.state.gis.on('moveend', function (e) {
                    t.htmlXY.isCount = false;
                    $('#' + t.pointCollectionId).css({ top: '0px', left: '0px', display: 'block' });
                    t.updatePointCollection(t.props.mapPointCollection);
                    if (t.stopMove) {
                        var obj = t.getMapExtent();
                        obj.e = e;
                        //处理下数据,符合拖拽事件
                        t.props.moveEnd(obj);
                    } else {
                        t.stopMove = true;
                    }
                });
            }
        }
        //地图更改缩放级别开始时触发触发此事件

    }, {
        key: 'zoomStart',
        value: function zoomStart() {
            var t = this;
            if (typeof t.props.zoomStart === "function") {
                t.state.gis.on('zoomstart', function (e) {
                    $('#' + t.pointCollectionId).css({ display: 'none' });
                    t.stopMove = false;
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
                t.state.gis.on('zoomend', function (e) {
                    $('#' + t.pointCollectionId).css({ display: 'inline-block' });
                    var obj = t.getMapExtent();
                    obj.e = e;
                    t.props.zoomEnd(obj);
                });
            }
        }
        //图元鼠标悬浮事件

    }, {
        key: 'mouseOverGraphic',
        value: function mouseOverGraphic(id, e) {
            var t = this;
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
            if (typeof t.props.mouseOutGraphic === "function") {
                var obj = {
                    e: e, id: id,
                    param: t.getGraphic(id)
                };
                t.props.mouseOutGraphic(obj);
            }
        }
        //地图点击事件

    }, {
        key: 'clickMap',
        value: function clickMap() {
            var t = this;
            if (typeof t.props.clickMap === "function") {
                t.state.gis.on('click', function (e) {
                    var obj = t.getMapExtent();
                    obj.e = e;
                    obj.clickLngLat = {
                        lng: (e.lnglat || {}).lng,
                        lat: (e.lnglat || {}).lat
                    };
                    obj.pixel = e.pixel;
                    t.props.clickMap(obj);
                });
            }
        }
        //测距

    }, {
        key: 'vtxRangingTool',
        value: function vtxRangingTool() {
            var t = this;
            t.ruler.turnOn();
            //引用百度测距样式
            t.state.gis.setDefaultCursor(this.csr);
        }
        /*
            参数
            geometryType:point/polyline/polygon/circle/rectangle  默认point
            parameter 样式 默认null 对象{}写入方式跟add方法一样(对应点线圆面)
            data //初始化数据   默认{id:'add'}
        */

    }, {
        key: 'draw',
        value: function draw(obj) {
            var t = this,
                drawParam = {};
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
            //引用百度测距样式
            t.state.gis.setDefaultCursor('crosshair');
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
                    param.icon = new AMap.Icon({
                        image: drawParam.parameter.url || 'http://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png',
                        size: new AMap.Size(drawParam.parameter.width || 36, drawParam.parameter.height || 36),
                        offset: new AMap.Pixel(drawParam.parameter.labelPixelX || -10, drawParam.parameter.labelPixelY || -34)
                    });
                    param.extData = {
                        id: drawParam.data.id,
                        attributes: {
                            id: drawParam.data.id,
                            url: drawParam.parameter.url || 'http://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png',
                            config: {
                                width: drawParam.parameter.width || 36,
                                height: drawParam.parameter.height || 36
                            }
                        },
                        type: 'point'
                    };
                    t.mousetool.marker(param);
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
                    t.mousetool.polyline(param);
                    break;
                case 'polygon':
                    t.mousetool.polygon(paramgcr);
                    break;
                case 'circle':
                    t.mousetool.circle(paramgcr);
                    break;
                case 'rectangle':
                    t.mousetool.rectangle(paramgcr);
                    break;
            }
            //保存绘制图元的id便于后期比对
            t.state.drawIds[drawParam.geometryType].push(drawParam.data.id);
        }
        //关闭绘制图元

    }, {
        key: 'closeDraw',
        value: function closeDraw() {
            var t = this;
            //恢复鼠标默认样式
            t.state.gis.setDefaultCursor();
            t.mousetool.close();
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
        //删除图元

    }, {
        key: 'removeGraphic',
        value: function removeGraphic(id, type) {
            var t = this;
            if (!!this.GM.getGraphic(id)) {
                if ((t.GM.getGraphicParam(id).attributes.config || {}).isAnimation) {
                    this.GM.getGraphic(id).stopMove();
                }
                //清除聚合点 避免异常
                t.clusterObj.removeMarker(this.GM.getGraphic(id));
                //清除地图中图元
                this.GM.getGraphic(id).setMap();
                //清除对应id的图元数据缓存
                this.GM.removeGraphic(id);
            } else {
                return false;
            }
            //清除 state中id的缓存
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
        //点位角度旋转(以指向东(右)为0°)

    }, {
        key: 'rotateDeg',
        value: function rotateDeg(sp, ep) {
            var t = this;
            var s = t.state.gis.lngLatToContainer(sp),

            //获取当前点位的经纬度
            e = t.state.gis.lngLatToContainer(new AMap.LngLat(ep[0], ep[1])),
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
        //对比对象数据是否相等

    }, {
        key: 'deepEqual',
        value: function deepEqual(a, b) {
            return _immutable2.default.is(_immutable2.default.fromJS(a), _immutable2.default.fromJS(b));
        }
        //计算2点间距离 单位m 精确到个位

    }, {
        key: 'calculatePointsDistance',
        value: function calculatePointsDistance(f, s) {
            var lnglat1 = new AMap.LngLat(f[0], f[1]);
            var lnglat2 = new AMap.LngLat(s[0], s[1]);
            return Math.round(lnglat1.distance(lnglat2));
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
    }, {
        key: 'searchPoints',
        value: function searchPoints(searchValue) {
            var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
            var pageIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            var t = this;
            var psc = new AMap.PlaceSearch({
                pageSize: pageSize,
                pageIndex: pageIndex
            });
            return new Promise(function (resolve) {
                psc.search(searchValue, function (status, result) {
                    var list = result.poiList.pois.map(function (r) {
                        return {
                            id: r.id,
                            longitude: r.location.lng,
                            latitude: r.location.lat,
                            canShowLabel: true,
                            config: {
                                labelContent: r.name,
                                labelPixelY: 27
                            },
                            other: 'search'
                        };
                    });
                    resolve(list);
                });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var _map = this.props;
            return _react2.default.createElement('div', { id: _map.mapId, style: { width: '100%', height: '100%' } });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var t = this;
            this.loadMapComplete.then(function () {
                t.mapLeft = document.getElementById(t.props.mapId).offsetLeft;
                t.mapTop = document.getElementById(t.props.mapId).offsetTop;
                t.init();
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var t = this;
            //关闭moveTo定时
            for (var i in t.GM.allParam) {
                if (t.GM.allParam.type == 'point') {
                    t.GM.getGraphic[i].stopMove();
                }
            }
            this.state.gis.destroy();
            this.state.gis = null;
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            //重新渲染结束
            var t = this;
            var props = t.props;
            // 等待地图加载
            if (!t.state.mapCreated) return;

            //回调显示方法
            if (props.showGraphicById) {
                props.showGraphicById(t.showGraphicById.bind(t));
            }
            //回调隐藏方法
            if (props.hideGraphicById) {
                props.hideGraphicById(t.hideGraphicById.bind(t));
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps, prevProps) {
            //已加载组件，收到新的参数时调用
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
                isClearAll = nextProps.isClearAll,
                mapPointCollection = nextProps.mapPointCollection,
                isclearAllPointCollection = nextProps.isclearAllPointCollection,
                isSetAreaRestriction = nextProps.isSetAreaRestriction,
                areaRestriction = nextProps.areaRestriction,
                isClearAreaRestriction = nextProps.isClearAreaRestriction;

            var props = t.props;

            // 等待地图加载
            if (!t.state.mapCreated) return;
            if (mapPointCollection instanceof Array && !t.deepEqual(mapPointCollection, t.props.mapPointCollection)) {
                var _t$dataMatch = t.dataMatch(t.props.mapPointCollection, mapPointCollection, 'id'),
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

                t.updateLine(_updatedData3);
                t.addLine(_addedData3);
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
                面数据处理
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
            //是否关闭图元编辑
            if (typeof isEndEdit == 'boolean' && isEndEdit || isEndEdit && isEndEdit !== t.props.isEndEdit) {
                t.endEdit();
            }
            /*设置指定图元展示*/
            if (typeof setVisiblePoints == 'boolean' && setVisiblePoints || setVisiblePoints && setVisiblePoints !== t.props.setVisiblePoints) {
                t.setVisiblePoints(mapVisiblePoints);
            }
            //绘制图元
            if (typeof isDraw == 'boolean' && isDraw || isDraw && isDraw !== t.props.isDraw) {
                t.draw(mapDraw);
            }
            //关闭绘制
            if (typeof isCloseDraw == 'boolean' && isCloseDraw || isCloseDraw && isCloseDraw !== t.props.isCloseDraw) {
                t.closeDraw();
            }
            //清空地图
            if (typeof isClearAll == 'boolean' && isClearAll || isClearAll && isClearAll !== t.props.isClearAll) {
                t.clearAll();
            }
            //设置中心点
            if (typeof setCenter == 'boolean' && setCenter || setCenter && setCenter !== t.props.setCenter) {
                if (!(t.getCurrentCenter().lng == mapCenter[0] && t.getCurrentCenter().lat == mapCenter[1])) {
                    t.setCenter(mapCenter);
                }
            }
            //设置比例尺
            if (typeof setZoomLevel == 'boolean' && setZoomLevel || setZoomLevel && setZoomLevel !== t.props.setZoomLevel) {
                if (!(t.getZoomLevel() == mapZoomLevel)) {
                    t.setZoomLevel(mapZoomLevel);
                }
            }
            //是否打开路况
            if (isOpenTrafficInfo) {
                t.openTrafficInfo();
            } else {
                t.hideTrafficInfo();
            }
            //设置点聚合
            if (typeof setCluster == 'boolean' && setCluster || setCluster && setCluster !== t.props.setCluster) {
                t.cluster(mapCluster);
            }
            //测距工具调用
            if (typeof isRangingTool == 'boolean' && isRangingTool || isRangingTool && isRangingTool !== t.props.isRangingTool) {
                t.vtxRangingTool();
            }
            //单独删除操作
            if (typeof isRemove == 'boolean' && isRemove || isRemove && isRemove !== t.props.isRemove) {
                mapRemove.map(function (item, index) {
                    t.removeGraphic(item.id, item.type);
                });
            }
            //设置区域限制
            if (typeof isSetAreaRestriction == 'boolean' && isSetAreaRestriction || isSetAreaRestriction && isSetAreaRestriction !== t.props.isSetAreaRestriction && areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]) {
                t.setAreaRestriction(areaRestriction);
            }
            //关闭区域限制
            if (typeof isClearAreaRestriction == 'boolean' && isClearAreaRestriction || isClearAreaRestriction && isClearAreaRestriction !== t.props.isClearAreaRestriction) {
                t.clearAreaRestriction();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            //关闭moveTo定时
            var t = this;
            for (var i in t.GM.allParam) {
                if (t.GM.allParam[i].geometryType == 'point') {
                    if (t.GM.getGraphic[i]) {
                        t.GM.getGraphic[i].stopMove();
                    }
                }
            }
        }
    }]);

    return VortexAMap;
}(_react2.default.Component);

exports.default = VortexAMap;
module.exports = exports['default'];