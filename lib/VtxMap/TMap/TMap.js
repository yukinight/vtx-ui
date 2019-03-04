'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./TMap.css');

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

var TMap = function (_React$Component) {
    _inherits(TMap, _React$Component);

    function TMap(props) {
        _classCallCheck(this, TMap);

        //初始化 图元管理方法
        var _this = _possibleConstructorReturn(this, (TMap.__proto__ || Object.getPrototypeOf(TMap)).call(this, props));

        _this.GM = new _MapToolFunction.graphicManage();
        _this.getPolygonArea = _MapToolFunction.getPolygonArea;
        _this.pointCollectionId = 'vtx_gmap_html_pointCollection'; //海量点canvas点位容器id class管理
        _this.isNotClickMap = false; //阻止点击事件冒泡到地图
        _this.isZoom = false; //阻止 zoom事件后触发的移动事件
        _this.mapLeft = 0; //地图offset的Left值
        _this.mapTop = 0; //地图offset的Top值
        _this.clusterObj = null; //聚合对象
        _this.clusterMarkers = null; //聚合的点集合
        _this.markerTool = null; //绘制点对象
        _this.polylineTool = null; //绘制线对象
        _this.polygonTool = null; //绘制面对象
        _this.rectangleTool = null; //绘制矩形对象
        _this.circleTool = null; //绘制圆对象
        _this.isEditId = null; //记录当前编辑的id,过滤移入移出事件
        _this.moveToTimer = null; //moveTo时间对象
        _this.movePoints = []; //move点的对象集合
        _this.morepoints = []; //海量点集合
        _this.heatmap = null; //热力图对象
        _this.animTimer = {}; //点位跳动动画
        _this.animCount = {}; //点位跳动动画 位置记录
        _this.waitInit = null; //等加载定时
        _this.isLoading = false; //是否加载完
        _this.waitReceive = null; //等初始化,更新定时
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
            },
            controlStyle: 'lt'
        };
        _this.loadMapJs();
        return _this;
    }

    _createClass(TMap, [{
        key: 'loadMapJs',
        value: function loadMapJs() {
            var t = this;
            this.loadMapComplete = new Promise(function (resolve, reject) {
                if (window.T) {
                    resolve(window.T);
                } else {
                    $.getScript(_default2.default.mapServerURL + '/T_content.js', function () {
                        $.getScript('http://api.tianditu.gov.cn/api?v=4.0&tk=e781ae595c43649431fb7270328e0669', function () {
                            var Heatmap = new Promise(function (resolve, reject) {
                                //对象问题  和arcgis使用不同的热力图
                                $.getScript(_default2.default.mapServerURL + '/Theatmap.js', function () {
                                    resolve();
                                });
                            });
                            var PointCollection = new Promise(function (resolve, reject) {
                                $.getScript(_default2.default.mapServerURL + '/GPointCollection.js', function () {
                                    resolve();
                                });
                            });
                            // let components = new Promise((resolve,reject)=>{
                            //     $.getScript(`${configUrl.mapServerURL}/T_toolComponents.js`,()=>{
                            //         resolve();
                            //     })
                            // });
                            Promise.all([Heatmap, PointCollection /*,components*/]).then(function () {
                                if (t.waitInit) {
                                    clearInterval(t.waitInit);
                                }
                                t.waitInit = setInterval(function () {
                                    if (T.Tool) {
                                        clearInterval(t.waitInit);
                                        resolve(window.T);
                                    }
                                }, 50);
                            });
                        });
                    });
                }
            });
        }
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
                areaRestriction = _t$props.areaRestriction,
                heatMapData = _t$props.heatMapData;
            //创建地图

            t.createMap();
            //添加点
            if (mapPoints instanceof Array) {
                t.addPoint(mapPoints);
            }
            //添加线
            if (mapLines instanceof Array) {
                t.addLine(mapLines);
            }
            // //添加面
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
            // 画热力图
            if (heatMapData) {
                t.heatMapOverlay(heatMapData);
            }
            //添加海量点
            if (mapPointCollection instanceof Array) {
                setTimeout(function () {
                    t.addPointCollection(mapPointCollection);
                }, 100);
            }
            //设置比例尺
            if (mapZoomLevel) {
                t.setZoomLevel(mapZoomLevel);
            }
            //设置点聚合
            if (mapCluster) {
                t.cluster(mapCluster);
            }
            // //展示比例尺
            if (showControl) {
                t.showControl();
            }

            // //画边界线
            // if(boundaryName instanceof Array && boundaryName.length>0){
            //     t.addBaiduBoundary(boundaryName);
            // }

            //设置区域限制
            if (areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]) {
                t.setAreaRestriction(areaRestriction);
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
    }, {
        key: 'createMap',
        value: function createMap() {
            var t = this;
            var _t$props2 = t.props,
                _t$props2$mapCenter = _t$props2.mapCenter,
                mapCenter = _t$props2$mapCenter === undefined ? [] : _t$props2$mapCenter,
                mapId = _t$props2.mapId,
                mapZoomLevel = _t$props2.mapZoomLevel,
                minZoom = _t$props2.minZoom,
                maxZoom = _t$props2.maxZoom;

            window.VtxMap = {};
            window.VtxMap[mapId] = t.state.gis = new T.Map(mapId, {
                //zoom等级,和百度一样默认10
                zoom: mapZoomLevel || 10,
                //必须有中心点,不传默认在北京(不设置中心点,报错)
                center: mapCenter ? new T.LngLat(mapCenter[0] || 116.40769, mapCenter[1] || 39.906705) : new T.LngLat(116.40769, 39.89945),
                minZoom: minZoom || 1,
                maxZoom: maxZoom || 18
            });
            //海量点图元容器
            t.pointCollectionId = mapId + '_' + t.pointCollectionId;
            var pointCollectionDiv = document.createElement('div');
            pointCollectionDiv.id = t.pointCollectionId;
            pointCollectionDiv.class = 'vtx_gmap_html_pointCollection_t';
            pointCollectionDiv.className = 'vtx_gmap_html_pointCollection_t';
            $(t.state.gis.getPanes().mapPane.children[0]).before(pointCollectionDiv);
        }
        //清空地图所有图元

    }, {
        key: 'clearAll',
        value: function clearAll() {
            var t = this;
            //清空热力图
            if (t.heatmap) {
                t.heatmap.clear();
            }
            t.heatmap = null;
            //先清除所有标记
            if (t.clusterMarkers) {
                t.clusterObj.removeMarkers(t.clusterMarkers);
            }
            t.clearAllPointCollection();
            //清空点
            t.state.gis.getOverlays().map(function (item, index) {
                t.state.gis.removeOverLay(item);
            });
            //清空缓存数据
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
                t.state.gis.centerAndZoom(new T.LngLat(gt[0], gt[1]), t.state.gis.getZoom());
            } else {
                t.state.gis.centerAndZoom(new T.LngLat(116.400433, 39.906705), t.state.gis.getZoom());
            }
        }
        /*地图区域限制*/

    }, {
        key: 'setAreaRestriction',
        value: function setAreaRestriction(sw_ne) {
            var t = this;
            var bounds = new T.LngLatBounds(new T.LngLat(sw_ne[0][0], sw_ne[0][1]), new T.LngLat(sw_ne[1][0], sw_ne[1][1]));
            t.state.gis.setMaxBounds(bounds);
        }
    }, {
        key: 'clearAreaRestriction',
        value: function clearAreaRestriction() {
            this.state.gis.setMaxBounds(null);
        }
        //设置指定图元展示   高德只有zoom和center全适应,单适应暂时无法实现

    }, {
        key: 'setVisiblePoints',
        value: function setVisiblePoints(obj) {
            var t = this;
            var ls = [];
            var _t$state = t.state,
                pointIds = _t$state.pointIds,
                lineIds = _t$state.lineIds,
                polygonIds = _t$state.polygonIds,
                circleIds = _t$state.circleIds;

            var getLngLats = function getLngLats(ids) {
                var alnglat = [];
                t.GM.getMoreGraphic(ids).map(function (item, index) {
                    //根据天地图 覆盖物类型获取lnglat
                    switch (item.getType()) {
                        case 1:
                        case 2:
                            alnglat.push(item.getLngLat());
                            break;
                        case 4:
                            alnglat.push.apply(alnglat, _toConsumableArray(item.getLngLats()));
                            break;
                        case 5:
                            //多边形 返回的是 三维数组
                            alnglat.push.apply(alnglat, _toConsumableArray(item.getLngLats()[0]));
                            break;
                        case 8:
                            alnglat.push(item.getCenter());
                            break;
                    }
                });
                return alnglat;
            };
            //算出 要展示的图元点位
            switch (obj.fitView) {
                case 'point':
                    ls = getLngLats(pointIds);
                    break;
                case 'line':
                    ls = getLngLats(lineIds);
                    break;
                case 'polygon':
                    ls = getLngLats(polygonIds);
                    break;
                case 'circle':
                    ls = getLngLats(circleIds);
                    break;
                case 'all':
                    ls = getLngLats([].concat(_toConsumableArray(pointIds), _toConsumableArray(lineIds), _toConsumableArray(polygonIds), _toConsumableArray(circleIds)));
                    break;
                default:
                    var ids = [];
                    if (obj.fitView instanceof Array) {
                        ids = obj.fitView;
                    } else if (typeof obj.fitView === 'string') {
                        ids = obj.fitView.split(',');
                    }
                    if (ids[0] instanceof Array) {
                        for (var i = 0; i < ids.length; i++) {
                            ls = new T.LngLat(ids[i][0], ids[i][1]);
                        }
                    } else {
                        ls = getLngLats(ids);
                    }
                    break;
            }
            if (ls.length >= 1) {
                if (obj.type == 'zoom') {
                    t.setZoomLevel(t.state.gis.getViewport(ls).zoom);
                } else if (obj.type == 'center') {
                    var _t$state$gis$getViewp = t.state.gis.getViewport(ls),
                        center = _t$state$gis$getViewp.center;

                    t.setCenter([center.lng, center.lat]);
                } else {
                    t.state.gis.setViewport(ls);
                }
            }
        }

        //设置地图比例尺

    }, {
        key: 'setZoomLevel',
        value: function setZoomLevel(zoom) {
            var t = this;
            t.state.gis.centerAndZoom(t.state.gis.getCenter(), zoom);
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
                mapSize: { width: gis.getSize().x, height: gis.getSize().y },
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
            var ms = this.GM.getMoreGraphic(ary).filter(function (item, index) {
                // return !item && item != 0 ? false : true;
                return item && item.getType() === 2 && !item.label;
            });
            //聚合的对象,便于后期清除时调用
            this.clusterObj = new T.MarkerClusterer(t.state.gis, { markers: ms });
            //记录聚合的点,便于后期清除
            this.clusterMarkers = ms;
        }
        //设置比例尺

    }, {
        key: 'showControl',
        value: function showControl() {
            var t = this;
            var zlt = T_ANCHOR_BOTTOM_RIGHT;
            var zls = T_ANCHOR_BOTTOM_RIGHT;
            if (t.props.showControl) {
                switch (t.props.showControl.location) {
                    case 'tl':
                        zlt = T_ANCHOR_TOP_LEFT;
                        zls = T_ANCHOR_BOTTOM_LEFT;
                        break;
                    case 'bl':
                        zlt = T_ANCHOR_BOTTOM_LEFT;
                        zls = T_ANCHOR_BOTTOM_LEFT;
                        break;
                    case 'tr':
                        zlt = T_ANCHOR_TOP_RIGHT;
                        zls = T_ANCHOR_BOTTOM_RIGHT;
                        break;
                    case 'br':
                        zlt = T_ANCHOR_BOTTOM_RIGHT;
                        zls = T_ANCHOR_BOTTOM_RIGHT;
                        break;
                }
            }
            var zoomControl = void 0,
                scaleControl = void 0;
            switch (t.props.showControl.type) {
                case 'all':
                case 'small':
                case 'pan':
                case 'zoom':
                    zoomControl = new T.Control.Zoom();
                    scaleControl = new T.Control.Scale();
                    this.state.gis.addControl(scaleControl);
                    this.state.gis.addControl(zoomControl);
                    zoomControl.setPosition(zlt);
                    scaleControl.setPosition(zls);
                    break;
                default:
                    scaleControl = new T.Control.Scale();
                    this.state.gis.addControl(scaleControl);
                    scaleControl.setPosition(zls);
                    break;
            }
            var fdom = document.getElementById(t.props.mapId);
            //天地图 api问题  使用js dom操作css
            if (t.props.showControl && t.props.showControl.location == 'bl') {
                var dom = fdom.getElementsByClassName('tdt-control-scale')[0];
                dom.style.position = 'relative';
                dom.style.top = '65px';
                dom.style.left = '45px';
            }
            if (t.props.showControl && t.props.showControl.location == 'br') {
                var _dom = fdom.getElementsByClassName('tdt-control-scale')[0];
                _dom.style.position = 'relative';
                _dom.style.top = '65px';
                _dom.style.right = '45px';
            }
        }
        //测距

    }, {
        key: 'vtxRangingTool',
        value: function vtxRangingTool() {
            var _this2 = this;

            var t = this;
            //将map对象放到全局中.是因为天地图api中使用了全局map.(坑B)
            window.map = t.state.gis;
            //创建标注工具对象
            var lineTool = new T.PolylineTool(t.state.gis, { showLabel: true });
            lineTool.open();
            this.isNotClickMap = true;
            //监听每次点击事件,阻止地图点击事件冒泡
            lineTool.addEventListener('addpoint', function () {
                _this2.isNotClickMap = true;
            });
            lineTool.addEventListener('draw', function (obj) {
                if ('mapRangingTool' in t.props) {
                    t.props.mapRangingTool({
                        distance: obj.currentDistance,
                        lnglats: obj.currentLnglats.map(function (item, index) {
                            return [item.lng, item.lat];
                        })
                    });
                }
            });
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
                    lng = gg.getLngLat().getLng();
                    lat = gg.getLngLat().getLat();
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
                    pts = gg.getLngLats().map(function (item, index) {
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
                    pts = gg.getLngLats()[0].map(function (item, index) {
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
        //添加点

    }, {
        key: 'addPoint',
        value: function addPoint(mapPoints, type) {
            var _this3 = this;

            var t = this;
            var psids = [].concat(_toConsumableArray(t.state.pointIds));
            mapPoints.map(function (item, index) {
                var cg = {
                    width: 33,
                    height: 33,
                    labelContent: '',
                    labelPixelX: 0,
                    labelPixelY: 33,
                    markerContentX: -16.5,
                    markerContentY: -33,
                    zIndex: 100,
                    deg: 0
                    //如果id重复,直接跳过不执行.
                };if (_this3.GM.isRepetition(item.id)) {
                    console.error('\u52A0\u70B9id: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //点位数据不符合,直接跳过
                if (!item.longitude || !item.latitude) {
                    console.error('\u70B9 \u7ECF\u7EAC\u5EA6 \u6570\u636E\u9519\u8BEF');
                    return false;
                }
                if (item.markerContent) {
                    cg = _extends({}, cg, { markerContentX: 0, markerContentY: 0, width: 100, height: 30 });
                }
                //初始化默认数据
                if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                //覆盖物参数
                var markerOption = {
                    zIndexOffset: cg.zIndex,
                    opacity: 1
                };
                var marker = null;
                //判断html还是图片
                if (!!item.markerContent) {
                    markerOption.icon = new T.Icon({
                        iconUrl: item.url || _default2.default.mapServerURL + '/images/touming.png',
                        iconSize: new T.Point(cg.width, cg.height),
                        iconAnchor: new T.Point(-cg.markerContentX, -cg.markerContentY)
                    });
                    if (cg.zIndex !== undefined || cg.zIndex !== null) {
                        markerOption.zIndexOffset = cg.zIndex;
                    }
                    //获得覆盖物对象
                    marker = new T.Marker(new T.LngLat(item.longitude, item.latitude), markerOption);
                    t.state.gis.addOverLay(marker);
                    //-12,+15测试的阈值
                    marker.label = new T.Label({
                        text: item.markerContent,
                        offset: new T.Point(cg.markerContentX - 12, cg.markerContentY + 15)
                    });
                    marker.showLabel();
                    //统一加点
                } else {
                    markerOption.icon = new T.Icon({
                        iconUrl: item.url || _default2.default.mapServerURL + '/images/defaultMarker.png',
                        iconSize: new T.Point(cg.width, cg.height),
                        iconAnchor: new T.Point(-cg.markerContentX, -cg.markerContentY)
                    });
                    if (cg.zIndex !== undefined || cg.zIndex !== null) {
                        markerOption.zIndexOffset = cg.zIndex;
                    }
                    //获得覆盖物对象
                    marker = new T.Marker(new T.LngLat(item.longitude, item.latitude), markerOption);
                    //添加点击事件
                    //统一加点
                    t.state.gis.addOverLay(marker);
                    //是否展示label
                    if (item.canShowLabel) {
                        var labelClass = item.labelClass || 'label-content';
                        marker.label = new T.Label({
                            text: '<div class=\'' + labelClass + '\'>' + cg.labelContent + '</div>',
                            offset: new T.Point(cg.labelPixelX - cg.width / 2, cg.labelPixelY + (cg.markerContentY + cg.height / 2))
                        });
                        marker.showLabel();
                    }
                }
                //点跳动动画
                if (!item.markerContent && cg.BAnimationType == 0) {
                    t.pointAnimation(item.id, marker);
                } else {
                    t.pointAnimation(item.id, null);
                }
                if (cg.deg) {
                    marker.getElement().style.transform = marker.getElement().style.transform + (' rotate(' + cg.deg + 'deg)');
                    marker.getElement().style['-ms-transform'] = ' rotate(' + cg.deg + 'deg)';
                }
                marker.addEventListener('click', function (e) {
                    t.clickGraphic(item.id, e);
                });
                marker.addEventListener('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                marker.addEventListener('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                psids.push(item.id);
                //缓存图元的数据,偏于后期操作
                _this3.GM.setGraphic(item.id, marker).setGraphicParam(item.id, {
                    attributes: _extends({}, item, { other: item }),
                    geometryType: 'point',
                    geometry: {
                        type: 'point',
                        x: item.longitude,
                        y: item.latitude
                    },
                    deg: cg.deg
                });
            });
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
                    //获取原有的图元
                    var gc = _this4.GM.getGraphic(item.id);
                    var cg = null;
                    if (!!item.markerContent) {
                        cg = {
                            markerContentX: (item.config || {}).markerContentX || gc.getIcon().options.iconSize.x,
                            markerContentY: (item.config || {}).markerContentY || gc.getIcon().options.iconSize.y,
                            //暂时不设置旋转角度,后期维护设置吧
                            // deg: item.config.deg,
                            zIndex: (item.config || {}).zIndex || gc.options.zIndexOffset
                        };
                        //设置点的标记添加顺序
                        // gc.setZindex(cg.zIndex);
                        gc.setZIndexOffset(cg.zIndex);
                        if (!(item.config || {}).isAnimation) {
                            //修改经纬度
                            gc.setLngLat(new T.LngLat(item.longitude, item.latitude));
                        }
                        if (gc.label) {
                            _this4.state.gis.removeOverLay(gc.label);
                        }
                        gc.label = new T.Label({
                            text: item.markerContent,
                            offset: new T.Point(cg.markerContentX - 12, cg.markerContentY + 15)
                        });
                        gc.showLabel();
                    } else {
                        cg = {
                            width: (item.config || {}).width || 33,
                            height: (item.config || {}).height || 33,
                            markerContentX: (item.config || {}).markerContentX || -16.5,
                            markerContentY: (item.config || {}).markerContentY || -33,
                            //暂时不设置旋转角度,后期维护设置吧
                            deg: (item.config || {}).deg,
                            zIndex: (item.config || {}).zIndex || 100,
                            labelClass: (item.config || {}).labelContent || 'label-content',
                            labelContent: '',
                            BAnimationType: (item.config || {}).BAnimationType,
                            labelPixelX: 0,
                            labelPixelY: 33
                        };
                        gc.setIcon(new T.Icon({
                            iconUrl: item.url || _default2.default.mapServerURL + '/images/defaultMarker.png',
                            iconSize: new T.Point(cg.width, cg.height),
                            iconAnchor: new T.Point(-cg.markerContentX, -cg.markerContentY)
                        }));
                        if (!(item.config || {}).isAnimation) {
                            //修改经纬度
                            gc.setLngLat(new T.LngLat(item.longitude, item.latitude));
                        }
                        //是否展示label
                        if (item.canShowLabel) {
                            if (gc.label) {
                                _this4.state.gis.removeOverLay(gc.label);
                            }
                            // cg.labelPixelX= (item.config || {}).labelPixelX?(item.config || {}).labelPixelX - (cg.width/2):gc.getLabel().options.offset.x;
                            // cg.labelPixelY= (item.config || {}).labelPixelY?(item.config || {}).labelPixelY + (cg.markerContentY + cg.height/2):gc.getLabel().options.offset.y;
                            // cg.labelContent= (item.config || {}).labelContent || gc.getLabel().options.text;
                            cg.labelPixelX = (item.config || {}).labelPixelX ? (item.config || {}).labelPixelX - cg.width / 2 : cg.labelPixelX - cg.width / 2;
                            cg.labelPixelY = (item.config || {}).labelPixelY ? (item.config || {}).labelPixelY + (cg.markerContentY + cg.height / 2) : cg.labelPixelY + (cg.markerContentY + cg.height / 2);
                            cg.labelContent = (item.config || {}).labelContent || '';
                            var labelClass = item.labelClass || 'label-content';
                            //更新label
                            gc.label = new T.Label({
                                text: '<div class=\'' + labelClass + '\'>' + cg.labelContent + '</div>',
                                offset: new T.Point(cg.labelPixelX, cg.labelPixelY)
                            });
                            gc.showLabel();
                        }
                        //设置点的标记添加顺序
                        gc.setZIndexOffset(cg.zIndex);
                    }
                    //点跳动动画
                    if (!item.markerContent && cg.BAnimationType == 0) {
                        t.pointAnimation(item.id, gc);
                    } else {
                        t.pointAnimation(item.id, null);
                    }
                    if (cg.deg) {
                        gc.getElement().style.transform = gc.getElement().style.transform + (' rotate(' + cg.deg + 'deg)');
                        gc.getElement().style['-ms-transform'] = ' rotate(' + cg.deg + 'deg)';
                    }
                    //动画效果会延迟执行经纬度的切换
                    if ((item.config || {}).isAnimation) {
                        t.moveTo(item.id, [item.longitude, item.latitude], (item.config || {}).animationDelay, (item.config || {}).autoRotation, item.url, item.urlleft);
                    }
                    _this4.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, { other: item }),
                        geometryType: 'point',
                        geometry: {
                            type: 'point',
                            x: item.longitude,
                            y: item.latitude
                        },
                        deg: cg.deg || 0
                    });
                } else {
                    console.error('\u66F4\u65B0\u7684\u70B9id\u4E0D\u5B58\u5728!');
                    return false;
                }
            });
            t.moveAnimation();
        }
        //添加线

    }, {
        key: 'addLine',
        value: function addLine(mapLines, type) {
            var _this5 = this;

            var t = this;
            var lsids = [].concat(_toConsumableArray(t.state.lineIds));
            //遍历添加线(图元)
            mapLines.map(function (item, index) {
                var cg = {
                    color: '#277ffa',
                    pellucidity: 0.9,
                    lineWidth: 5,
                    lineType: 'solid',
                    isHidden: false
                    //如果id重复,直接跳过不执行.
                };if (_this5.GM.isRepetition(item.id)) {
                    console.error('\u591A\u6298\u7EBFid: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //多折线点位数据不符合,直接跳过
                if (!(item.paths && item.paths.length >= 2)) {
                    console.error('\u591A\u6298\u7EBFpaths\u6570\u636E\u9519\u8BEF');
                    return false;
                }
                if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                var lineOption = {
                    color: cg.color,
                    opacity: cg.pellucidity,
                    weight: cg.lineWidth,
                    lineStyle: cg.lineType,
                    path: item.paths || []
                    //天地图没有hidden方法,所以用weight为0来实现
                };if (cg.isHidden) {
                    lineOption.weight = 0;
                }
                var p = lineOption.path.map(function (itm, ind) {
                    return new T.LngLat(itm[0], itm[1]);
                });
                var polyline = new T.Polyline(p, lineOption);
                t.state.gis.addOverLay(polyline);
                // 添加点击事件
                polyline.addEventListener('click', function (e) {
                    t.isNotClickMap = true;
                    t.clickGraphic(item.id, e);
                });
                polyline.addEventListener('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                polyline.addEventListener('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                //缓存图元的数据,便于后期操作
                var pts = item.paths.map(function (itm, ind) {
                    return [].concat(_toConsumableArray(itm));
                });
                _this5.GM.setGraphic(item.id, polyline).setGraphicParam(item.id, {
                    attributes: _extends({}, item, {
                        paths: [pts],
                        other: item
                    }),
                    geometryType: 'polyline',
                    geometry: {
                        type: 'polyline',
                        paths: [pts]
                    }
                });
                lsids.push(item.id);
                //state中缓存 line的id...用于数据判断
                t.state.lineIds.push(item.id);
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
                    //获取原有的线属性,转换key值
                    var cg = {
                        color: gc.getColor(),
                        pellucidity: gc.getOpacity(),
                        lineWidth: gc.getWeight(),
                        lineType: gc.getLineStyle()
                    };
                    //重新初始化值
                    if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    //更新线
                    gc.setColor(cg.color);
                    gc.setOpacity(cg.pellucidity);
                    gc.setLineStyle(cg.lineType);
                    //根据参数判断是否显示多折线
                    gc.setWeight(cg.lineWidth || 5);
                    if (item.config && item.config.isHidden) {
                        gc.setWeight(0);
                    }
                    //更新经纬度
                    var p = item.paths.map(function (itm, ind) {
                        return new T.LngLat(itm[0], itm[1]);
                    });
                    gc.setLngLats(p);
                    //处理数据  用于其他事件返回
                    var pts = item.paths.map(function (itm, ind) {
                        return [].concat(_toConsumableArray(itm));
                    });
                    _this6.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, {
                            paths: [pts],
                            other: item
                        }),
                        geometryType: 'polyline',
                        geometry: {
                            type: 'polyline',
                            paths: [pts]
                        }
                    });
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
            var pgsids = [].concat(_toConsumableArray(t.state.polygonIds));
            //遍历添加面(图元)
            mapPolygons.map(function (item, index) {
                var cg = {
                    lineType: 'solid',
                    lineWidth: 5,
                    lineColor: '#277ffa',
                    lineOpacity: 1,
                    color: '#fff',
                    pellucidity: 0.5
                    // isHidden: false  //后期跟百度一起加

                    //如果id重复,直接跳过不执行.
                };if (_this7.GM.isRepetition(item.id)) {
                    console.error('\u591A\u8FB9\u5F62id: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //多边形点位数据不符合,直接跳过
                if (!(item.rings && item.rings.length >= 3)) {
                    console.error('\u591A\u8FB9\u5F62rings\u6570\u636E\u9519\u8BEF');
                    return false;
                }
                if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                var polygonOption = {
                    color: cg.lineColor,
                    opacity: cg.lineOpacity,
                    weight: cg.lineWidth,
                    lineStyle: cg.lineType,
                    fillColor: cg.color,
                    fillOpacity: cg.pellucidity,
                    path: item.rings || []
                };
                var r = polygonOption.path.map(function (itm, ind) {
                    return new T.LngLat(itm[0], itm[1]);
                });
                var polygon = new T.Polygon(r, polygonOption);
                _this7.state.gis.addOverLay(polygon);
                //添加点击事件
                polygon.on('click', function (e) {
                    t.isNotClickMap = true;
                    t.clickGraphic(item.id, e);
                });
                polygon.on('mouseover', function (e) {
                    t.mouseOverGraphic(item.id, e);
                });
                polygon.on('mouseout', function (e) {
                    t.mouseOutGraphic(item.id, e);
                });
                //缓存图元的数据,便于后期操作
                var pts = item.rings.map(function (itm, ind) {
                    return [].concat(_toConsumableArray(itm));
                });
                _this7.GM.setGraphic(item.id, polygon).setGraphicParam(item.id, {
                    attributes: _extends({}, item, {
                        rings: [pts],
                        other: item
                    }),
                    geometryType: 'polygon',
                    geometry: {
                        type: 'polygon',
                        rings: [pts]
                    }
                });
                pgsids.push(item.id);
            });
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
                    //获取原有的面属性,转换key值
                    var cg = {
                        lineType: gc.getLineStyle(),
                        lineWidth: gc.getWeight(),
                        lineColor: gc.getColor(),
                        lineOpacity: gc.getOpacity(),
                        color: gc.getFillColor(),
                        pellucidity: gc.getFillOpacity()
                        //重新初始化值
                    };if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    gc.setLineStyle(cg.lineType);
                    gc.setWeight(cg.lineWidth);
                    gc.setColor(cg.lineColor);
                    gc.setOpacity(cg.lineOpacity);
                    gc.setFillColor(cg.color);
                    gc.setFillOpacity(cg.pellucidity);
                    var r = item.rings.map(function (itm, ind) {
                        return new T.LngLat(itm[0], itm[1]);
                    });
                    gc.setLngLats(r);
                    var pts = item.rings.map(function (itm, ind) {
                        return [].concat(_toConsumableArray(itm));
                    });
                    _this8.GM.setGraphicParam(item.id, {
                        attributes: _extends({}, item, {
                            rings: [pts],
                            other: item
                        }),
                        geometryType: 'polygon',
                        geometry: {
                            type: 'polygon',
                            rings: [pts]
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
            var _this9 = this;

            var t = this;
            var ccsids = [].concat(_toConsumableArray(t.state.circleIds));
            mapCircles.map(function (item, index) {
                var cg = {
                    lineType: 'solid',
                    lineWidth: 5,
                    lineColor: '#277ffa',
                    lineOpacity: 1,
                    color: '#fff',
                    pellucidity: 0.5
                    // isHidden: false  //后期跟百度一起加

                    //如果id重复,直接跳过不执行.
                };if (_this9.GM.isRepetition(item.id)) {
                    console.error('\u5706id: ' + item.id + ' \u91CD\u590D');
                    return false;
                }
                //圆 点位数据不符合,直接跳过
                if (!item.longitude || !item.latitude) {
                    console.error('\u5706 \u7ECF\u7EAC\u5EA6 \u6570\u636E\u9519\u8BEF');
                    return false;
                }
                if (item.config) {
                    cg = _extends({}, cg, item.config);
                }
                //初始化配置数据
                var circleOption = {
                    color: cg.lineColor,
                    opacity: cg.lineOpacity,
                    weight: cg.lineWidth,
                    lineStyle: cg.lineType,
                    fillColor: cg.color,
                    fillOpacity: cg.pellucidity
                    //创建圆对象
                };var circle = new T.Circle(new T.LngLat(item.longitude, item.latitude), item.radius, circleOption);
                _this9.state.gis.addOverLay(circle);
                //添加点击事件
                circle.on('click', function (e) {
                    t.isNotClickMap = true;
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
                ccsids.push(item.id);
            });
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
                    //获取原有的面属性,转换key值
                    var cg = {
                        lineType: gc.getLineStyle(),
                        lineWidth: gc.getWeight(),
                        lineColor: gc.getColor(),
                        lineOpacity: gc.getOpacity(),
                        color: gc.getFillColor(),
                        pellucidity: gc.getFillOpacity()
                        //重新初始化值
                    };if (item.config) {
                        cg = _extends({}, cg, item.config);
                    }
                    gc.setLineStyle(cg.lineType);
                    gc.setWeight(cg.lineWidth);
                    gc.setColor(cg.lineColor);
                    gc.setOpacity(cg.lineOpacity);
                    gc.setFillColor(cg.color);
                    gc.setFillOpacity(cg.pellucidity);
                    gc.setRadius(item.radius || 0);
                    gc.setCenter(new T.LngLat(item.longitude, item.latitude));

                    //缓存图元的数据,便于后期操作
                    _this10.GM.setGraphicParam(item.id, {
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
        //添加海量点

    }, {
        key: 'addPointCollection',
        value: function addPointCollection() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var t = this;
            data.map(function (item, index) {
                var d = item || {};
                var points = (d.points || []).map(function (d, i) {
                    var p = new T.LngLat(d.lng, d.lat);
                    p = t.state.gis.lngLatToContainerPoint(p);
                    return [p.x, p.y];
                });
                var options = {
                    size: d.size,
                    shape: d.shape,
                    color: d.color,
                    width: t.state.gis.getSize().x,
                    height: t.state.gis.getSize().y,
                    mapId: t.props.mapId
                };
                //和arcgis使用同一个海量点
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
                            var p = new T.LngLat(d.lng, d.lat);
                            p = t.state.gis.lngLatToContainerPoint(p);
                            return [p.x, p.y];
                        });
                        var options = {
                            size: ds.size,
                            shape: ds.shape,
                            color: ds.color,
                            width: t.state.gis.getSize().x,
                            height: t.state.gis.getSize().y
                        };
                        item.value.reDraw(points, options);
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
                t.heatmap = new TMapLib.HeatmapOverlay({
                    visible: cg.visible
                });
                t.heatmap.initialize(t.state.gis, t.pointCollectionId);
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
                t.isHideHeatMap = false;
                t.heatmap.show();
            } else {
                t.isHideHeatMap = true;
                t.heatmap.hide();
            }
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
                switch (drawParam.geometryType) {
                    case 'point':
                        this.markerTool.clear();
                        break;
                    case 'polyline':
                        this.polylineTool.clear();
                        break;
                    case 'polygon':
                        this.polygonTool.clear();
                        break;
                    case 'circle':
                        this.circleTool.clear();
                        break;
                    case 'rectangle':
                        this.rectangleTool.clear();
                        break;
                }
                t.state.drawIds[drawParam.geometryType].splice(len, 1);
            }
            var param = {};
            var paramgcr = {};
            window.map = this.state.gis;
            if (drawParam.geometryType == 'polygon' || drawParam.geometryType == 'circle' || drawParam.geometryType == 'rectangle') {
                paramgcr.fillColor = drawParam.parameter.color;
                paramgcr.color = drawParam.parameter.lineColor;
                paramgcr.opacity = drawParam.parameter.lineOpacity;
                paramgcr.weight = drawParam.parameter.lineWidth;
                paramgcr.fillOpacity = drawParam.parameter.pellucidity;
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
                    param.icon = new T.Icon({
                        iconUrl: drawParam.parameter.url || _default2.default.mapServerURL + '/images/defaultMarker.png',
                        iconSize: new T.Point(drawParam.parameter.width || 33, drawParam.parameter.height || 33),
                        iconAnchor: new T.Point(drawParam.parameter.width ? drawParam.parameter.width / 2 : 16.5, drawParam.parameter.height ? drawParam.parameter.height : 33)
                    });
                    param.follow = false;
                    if (this.markerTool) this.markerTool.close();
                    this.markerTool = new T.MarkTool(this.state.gis, param);
                    this.markerTool.open();
                    this.markerTool.addEventListener('mouseup', function (ob) {
                        var type = ob.type,
                            target = ob.target,
                            currentLnglat = ob.currentLnglat,
                            currentMarker = ob.currentMarker,
                            allMarkers = ob.allMarkers;

                        t.GM.setGraphic(drawParam.data.id, currentMarker);
                        var backobj = {
                            id: drawParam.data.id,
                            attributes: {
                                id: drawParam.data.id,
                                url: currentMarker.getIcon().options.iconUrl,
                                config: {
                                    width: currentMarker.getIcon().options.iconSize.x,
                                    height: currentMarker.getIcon().options.iconSize.y
                                }
                            },
                            geometry: {
                                type: 'point',
                                x: currentLnglat.lng,
                                y: currentLnglat.lat
                            },
                            geometryType: 'point',
                            mapLayer: currentMarker
                        };
                        t.GM.setGraphicParam(drawParam.data.id, backobj);
                        if ('drawEnd' in t.props) {
                            t.props.drawEnd(backobj);
                        }
                    });
                    break;
                case 'polyline':
                    param.color = drawParam.parameter.color;
                    param.opacity = drawParam.parameter.pellucidity;
                    param.weight = drawParam.parameter.lineWidth;
                    if (this.polylineTool) this.polylineTool.close();
                    this.polylineTool = new T.PolylineTool(this.state.gis, param);
                    this.polylineTool.open();
                    this.polylineTool.addEventListener('draw', function (ob) {
                        var type = ob.type,
                            target = ob.target,
                            currentLnglats = ob.currentLnglats,
                            currentDistance = ob.currentDistance,
                            currentPolyline = ob.currentPolyline,
                            allPolylines = ob.allPolylines;

                        var lnglatAry = (currentLnglats || []).map(function (item, index) {
                            return { lngX: item.lng, latX: item.lat };
                        });
                        t.GM.setGraphic(drawParam.data.id, currentPolyline);
                        var backobj = {
                            geometryType: 'polyline',
                            distance: currentDistance,
                            id: drawParam.data.id,
                            attributes: {
                                id: drawParam.data.id,
                                config: {
                                    color: currentPolyline.getColor(),
                                    pellucidity: currentPolyline.getOpacity(),
                                    lineWidth: currentPolyline.getWeight()
                                }
                            },
                            mapLayer: currentPolyline,
                            geometry: {
                                type: 'polyline',
                                lnglatAry: lnglatAry,
                                paths: (0, _MapToolFunction.getMaxMin)(currentLnglats).path
                            },
                            lnglatAry: lnglatAry
                        };
                        t.GM.setGraphicParam(drawParam.data.id, backobj);
                        if ('drawEnd' in t.props) {
                            t.props.drawEnd(backobj);
                        }
                    });
                    break;
                case 'polygon':
                    if (this.polygonTool) this.polygonTool.close();
                    this.polygonTool = new T.PolygonTool(this.state.gis, paramgcr);
                    this.polygonTool.open();
                    this.polygonTool.addEventListener('draw', function (ob) {
                        var type = ob.type,
                            target = ob.target,
                            currentLnglats = ob.currentLnglats,
                            currentArea = ob.currentArea,
                            currentPolygon = ob.currentPolygon,
                            allPolygons = ob.allPolygons;

                        t.GM.setGraphic(drawParam.data.id, currentPolygon);
                        var lnglatAry = (currentLnglats || []).map(function (item, index) {
                            return { lngX: item.lng, latX: item.lat };
                        });
                        var backobj = {
                            geometryType: 'polygon',
                            id: drawParam.data.id,
                            attributes: {
                                id: drawParam.data.id,
                                config: {
                                    color: currentPolygon.getFillColor(),
                                    lineColor: currentPolygon.getColor(),
                                    lineOpacity: currentPolygon.getOpacity(),
                                    pellucidity: currentPolygon.getFillOpacity(),
                                    lineWidth: currentPolygon.getWeight()
                                }
                            },
                            mapLayer: currentPolygon,
                            geometry: {
                                type: 'polygon',
                                lnglatAry: lnglatAry,
                                rings: (0, _MapToolFunction.getMaxMin)(currentLnglats).path,
                                _extent: (0, _MapToolFunction.getMaxMin)(currentLnglats)._extent,
                                area: currentArea
                            },
                            lnglatAry: lnglatAry,
                            area: currentArea
                        };
                        t.GM.setGraphicParam(drawParam.data.id, backobj);
                        if ('drawEnd' in t.props) {
                            t.props.drawEnd(backobj);
                        }
                    });
                    break;
                case 'circle':
                    if (this.circleTool) this.circleTool.close();
                    this.circleTool = new T.CircleTool(this.state.gis, paramgcr);
                    this.circleTool.open();
                    this.circleTool.addEventListener('drawend', function (ob) {
                        var type = ob.type,
                            target = ob.target,
                            currentCenter = ob.currentCenter,
                            currentRadius = ob.currentRadius,
                            currentCircle = ob.currentCircle,
                            allCircles = ob.allCircles;

                        t.GM.setGraphic(drawParam.data.id, currentCircle);
                        var area = Math.PI * Math.pow(currentRadius, 2);
                        var backobj = {
                            geometryType: 'circle',
                            id: drawParam.data.id,
                            attributes: {
                                id: drawParam.data.id,
                                config: {
                                    color: currentCircle.getFillColor(),
                                    lineColor: currentCircle.getColor(),
                                    lineOpacity: currentCircle.getOpacity(),
                                    pellucidity: currentCircle.getFillOpacity(),
                                    lineWidth: currentCircle.getWeight()
                                }
                            },
                            mapLayer: currentCircle,
                            geometry: {
                                type: 'circle',
                                x: currentCenter.lng,
                                y: currentCenter.lat,
                                radius: currentRadius,
                                area: area
                            },
                            area: area
                        };
                        t.GM.setGraphicParam(drawParam.data.id, backobj);
                        if ('drawEnd' in t.props) {
                            t.props.drawEnd(backobj);
                        }
                    });
                    break;
                case 'rectangle':
                    if (this.rectangleTool) this.rectangleTool.close();
                    this.rectangleTool = new T.RectangleTool(this.state.gis, paramgcr);
                    this.rectangleTool.open();
                    this.rectangleTool.addEventListener('draw', function (ob) {
                        var type = ob.type,
                            target = ob.target,
                            currentBounds = ob.currentBounds,
                            currentRectangle = ob.currentRectangle,
                            allRectangles = ob.allRectangles;

                        t.GM.setGraphic(drawParam.data.id, currentRectangle);
                        var currentLnglats = [currentBounds.getNorthEast(), currentBounds.getSouthWest(), { lng: currentBounds.getSouthWest().lng, lat: currentBounds.getNorthEast().lat }, { lng: currentBounds.getNorthEast().lng, lat: currentBounds.getSouthWest().lat }];
                        var lnglatAry = (currentLnglats || []).map(function (item, index) {
                            return { lngX: item.lng, latX: item.lat };
                        });
                        var area = currentBounds.getNorthEast().distanceTo(new T.LngLat(currentBounds.getNorthEast().lng, currentBounds.getSouthWest().lat)) * currentBounds.getNorthEast().distanceTo(new T.LngLat(currentBounds.getSouthWest().lng, currentBounds.getNorthEast().lat));
                        var backobj = {
                            geometryType: 'rectangle',
                            id: drawParam.data.id,
                            attributes: {
                                id: drawParam.data.id,
                                config: {
                                    color: currentRectangle.getFillColor(),
                                    lineColor: currentRectangle.getColor(),
                                    lineOpacity: currentRectangle.getOpacity(),
                                    pellucidity: currentRectangle.getFillOpacity(),
                                    lineWidth: currentRectangle.getWeight()
                                }
                            },
                            mapLayer: currentRectangle,
                            geometry: {
                                type: 'rectangle',
                                lnglatAry: lnglatAry,
                                rings: (0, _MapToolFunction.getMaxMin)(currentLnglats).path,
                                _extent: (0, _MapToolFunction.getMaxMin)(currentLnglats)._extent,
                                area: area
                            },
                            lnglatAry: lnglatAry,
                            area: area
                        };
                        t.GM.setGraphicParam(drawParam.data.id, backobj);
                        if ('drawEnd' in t.props) {
                            t.props.drawEnd(backobj);
                        }
                    });
                    break;
            }
            //保存绘制图元的id便于后期比对
            t.state.drawIds[drawParam.geometryType].push(drawParam.data.id);
        }
        //关闭绘制图元

    }, {
        key: 'closeDraw',
        value: function closeDraw() {
            if (this.markerTool) {
                this.markerTool.close();
            }
            if (this.polylineTool) {
                this.polylineTool.close();
            }
            if (this.polygonTool) {
                this.polygonTool.close();
            }
            if (this.rectangleTool) {
                this.rectangleTool.close();
            }
            if (this.circleTool) {
                this.circleTool.close();
            }
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
            if (ms.getType === 1) {
                return false;
            }
            if (!!t.state.editId) {
                t.endEdit();
            }
            this.isEditId = id;
            switch (ms.geometryType) {
                case 'point':
                    ms.mapLayer.enableDragging();
                    // ms.mapLayer.addEventListener('dragend',t.editGraphicChange);
                    if (ms.mapLayer.label) {
                        ms.mapLayer.addEventListener('drag', t.showLabel);
                    }
                    break;
                case 'polyline':
                case 'polygon':
                case 'rectangle':
                case 'circle':
                    ms.mapLayer.enableEdit();
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
            this.isEditId = null;
            switch (ms.geometryType) {
                case 'point':
                    ms.mapLayer.disableDragging();
                    // ms.mapLayer.removeEventListener('dragend',t.editGraphicChange);
                    if (ms.mapLayer.label) {
                        ms.mapLayer.removeEventListener('drag', t.showLabel);
                    }
                    break;
                case 'polyline':
                case 'polygon':
                case 'rectangle':
                case 'circle':
                    ms.mapLayer.disableEdit();
                    break;
            }
            t.editGraphicChange(t.state.editId);
            t.setState({
                editId: '',
                editGraphic: ''
            });
        }
    }, {
        key: 'showLabel',
        value: function showLabel() {
            //这里的this指向调用的 点的对象
            this.showLabel();
        }
        //编辑变动后

    }, {
        key: 'editGraphicChange',
        value: function editGraphicChange(id) {
            var t = this;
            var ms = t.getGraphic(id);
            var obj = {
                id: id
            };
            switch (ms.geometryType) {
                case 'point':
                    obj.geometry = ms.geometry;
                    obj.param = ms;
                    break;
                case 'polyline':
                    ms.geometry._extent = (0, _MapToolFunction.getMaxMin)(ms.mapLayer.getLngLats())._extent;
                    obj.geometry = ms.geometry;
                    obj.param = ms;
                    obj.distance = t.calculateDistance(ms.mapLayer.getLngLats());
                    break;
                case 'polygon':
                case 'rectangle':
                    ms.geometry._extent = (0, _MapToolFunction.getMaxMin)(ms.mapLayer.getLngLats()[0])._extent;
                    obj.geometry = ms.geometry;
                    obj.param = ms;
                    obj.area = (0, _MapToolFunction.getPolygonArea)(ms.mapLayer.getLngLats()[0]);
                    break;
                case 'circle':
                    obj.geometry = ms.geometry;
                    obj.param = ms;
                    obj.area = Math.PI * Math.pow(ms.geometry.radius, 2);
                    break;
            }
            t.props.editGraphicChange(obj);
        }
        //删除图元

    }, {
        key: 'removeGraphic',
        value: function removeGraphic(id, type) {
            var t = this;
            if (!!this.GM.getGraphic(id)) {
                //清除聚合点 避免异常
                if (t.clusterObj) {
                    t.clusterObj.removeMarker(this.GM.getGraphic(id));
                }
                //清除地图中图元
                this.state.gis.removeOverLay(this.GM.getGraphic(id));
                //删除含 label点的label(天地图的坑)
                if (type === 'point' && this.GM.getGraphic(id).label) {
                    this.state.gis.removeOverLay(this.GM.getGraphic(id).getLabel());
                }
                //清除对应id的图元数据缓存
                this.GM.removeGraphic(id);
                this.GM.removeGraphicParam(id);
            } else {
                return false;
            }
            for (var i = 0; i < t.movePoints.length; i++) {
                if (t.movePoints[i].id == id) {
                    t.movePoints.splice(i, 1);
                    continue;
                }
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
                    top: e.containerPoint.y + t.mapTop, //当前点所在的位置(屏幕)
                    left: e.containerPoint.x + t.mapLeft,
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
            if (typeof t.props.mouseOverGraphic === 'function') {
                if (id === t.isEditId) {
                    return false;
                }
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
                if (id === t.isEditId) {
                    return false;
                }
                var obj = {
                    e: e, id: id,
                    param: t.getGraphic(id)
                };
                t.props.mouseOutGraphic(obj);
            }
        }
        //拖拽地图开始

    }, {
        key: 'dragMapStart',
        value: function dragMapStart() {
            var t = this;
            if (typeof t.props.dragMapStart === "function") {
                t.state.gis.addEventListener('dragstart', function (e) {
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
                t.state.gis.addEventListener('dragend', function (e) {
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
                t.state.gis.addEventListener('movestart', function (e) {
                    if (!t.isZoom) {
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
                t.state.gis.addEventListener('moveend', function (e) {
                    var xylist = [],
                        mapPane = t.state.gis.getPanes().mapPane;
                    if (mapPane.style.top) {
                        xylist = [mapPane.style.left, mapPane.style.top];
                    } else {
                        xylist = (mapPane.style.transform || '').substr(12).split(',');
                    }
                    //重画海量点
                    $('#' + t.pointCollectionId).css({
                        top: -eval((xylist[1] || '').replace('px', '')) + 'px',
                        left: -eval((xylist[0] || '').replace('px', '')) + 'px'
                    });
                    if (t.morepoints.length > 0) {
                        t.updatePointCollection(t.props.mapPointCollection);
                    }
                    if (t.isZoom) {
                        t.isZoom = false;
                    } else {
                        var obj = t.getMapExtent();
                        obj.e = e;
                        //处理下数据,符合拖拽事件
                        t.props.moveEnd(obj);
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
                t.state.gis.addEventListener('zoomstart', function (e) {
                    if (t.heatmap && !t.isHideHeatMap) {
                        t.heatmap.hide();
                    }
                    $('#' + t.pointCollectionId).css({ display: 'none' });
                    t.isZoom = true;
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
                t.state.gis.addEventListener('zoomend', function (e) {
                    //重画热力图
                    if (t.heatmap && !t.isHideHeatMap) {
                        t.heatmap.show();
                        t.heatmap.draw();
                    }
                    //重画海量点
                    $('#' + t.pointCollectionId).css({ display: 'inline-block' });
                    if (t.morepoints.length > 0) {
                        t.updatePointCollection(t.props.mapPointCollection);
                    }
                    //避免zoom切换后,chrome的旋转角度被替换
                    for (var i in t.GM.allParam) {
                        if (t.GM.allParam[i].geometryType == 'point' && t.GM.allParam[i].deg) {
                            t.GM.getGraphic(i).getElement().style.transform = t.GM.getGraphic(i).getElement().style.transform + (' rotate(' + t.GM.allParam[i].deg + 'deg)');
                        }
                    }
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
                t.state.gis.addEventListener('click', function (e) {
                    if (t.isNotClickMap) {
                        t.isNotClickMap = false;
                    } else {
                        var obj = t.getMapExtent();
                        obj.e = e;
                        obj.clickLngLat = e.lnglat;
                        obj.pixel = e.containerPoint;
                        t.props.clickMap(obj);
                    }
                });
            }
        }
        //点的跳动动画

    }, {
        key: 'pointAnimation',
        value: function pointAnimation(id, marker) {
            var t = this;
            //null时关闭跳动
            if (!!marker) {
                if (t.animTimer[id]) {
                    clearInterval(t.animTimer[id]);
                }
                t.animTimer[id] = setInterval(function () {
                    //点被隐藏时,没有执行,定时不关
                    if (marker.getIcon()) {
                        var shape = _extends({}, marker.getIcon().getIconAnchor());
                        //初始数据  点位有变动,重新刷新数据
                        if (!t.animCount[id] || shape.y != t.animCount[id].now) {
                            t.animCount[id] = {
                                start: shape.y,
                                now: shape.y,
                                notation: -1
                            };
                        }
                        if (t.animCount[id].now - t.animCount[id].start == 20) {
                            t.animCount[id].notation = -1;
                        }
                        if (t.animCount[id].now - t.animCount[id].start == 0) {
                            t.animCount[id].notation = 1;
                        }
                        shape.y = t.animCount[id].now = t.animCount[id].now + t.animCount[id].notation * 2;
                        marker.getIcon().setIconAnchor(shape);
                    }
                }, 35);
            } else {
                clearInterval(t.animTimer[id]);
            }
        }
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
                        deleteTime = _nowMovePoints$_i.deleteTime,
                        ddeg = _nowMovePoints$_i.ddeg;

                    var gc = t.GM.getGraphic(id);
                    if (!gc) {
                        clearInterval(t.moveToTimer[id]);
                    } else {
                        var gg = gc.getLngLat();
                        var tx = gg.lng + rx,
                            ty = gg.lat + ry;
                        var lglt = new T.LngLat(tx, ty);
                        if (t.movePoints[_i].url) {
                            gc.getIcon().setIconUrl(t.movePoints[_i].url);
                        }
                        gc.setLngLat(lglt);
                        t.GM.setGraphicParam(id, _extends({}, t.GM.getGraphicParam(id), { deg: ddeg }));
                        //旋转角度
                        gc.getElement().style.transform = gc.getElement().style.transform + (' rotate(' + ddeg + 'deg)');
                        gc.getElement().style['-ms-transform'] = ' rotate(' + ddeg + 'deg)';
                        if (gc.label) {
                            gc.showLabel();
                        }
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
        /*公共方法*/

    }, {
        key: 'moveTo',
        value: function moveTo(id, lnglat, delay, autoRotation, urlright, urlleft) {
            delay = delay || 3;
            var t = this,
                timer = 10;
            delay = eval(delay) * 1000;
            var count = delay / timer,
                gc = this.GM.getGraphic(id);
            var s = gc.getLngLat(),
                e = new T.LngLat(lnglat[0], lnglat[1]);
            if (s.equals(e)) {
                return false;
            } else {
                var ddeg = 0,
                    url = null;
                //计算角度,旋转
                if (autoRotation) {
                    //自己实现旋转
                    ddeg = t.rotateDeg(gc.getLngLat(), lnglat);
                    if (urlleft && ddeg < -90 && ddeg > -270) {
                        ddeg += 180;
                        url = urlleft;
                    } else {
                        url = urlright;
                    }
                }
                //拆分延迟移动定位
                var rx = (e.lng - s.lng) / count,
                    ry = (e.lat - s.lat) / count;
                var isHave = false;
                for (var i = 0; i < t.movePoints.length; i++) {
                    if (t.movePoints[i].id == id) {
                        t.movePoints.splice(i, 1, {
                            id: id, rx: rx, ry: ry, ddeg: ddeg, url: url,
                            waitTime: 0,
                            deleteTime: delay
                        });
                        isHave = true;
                    }
                }
                if (!isHave) {
                    t.movePoints.push({
                        id: id, rx: rx, ry: ry, ddeg: ddeg, url: url,
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
            var s = t.state.gis.lngLatToLayerPoint(sp),

            //获取当前点位的经纬度
            e = t.state.gis.lngLatToLayerPoint(new T.LngLat(ep[0], ep[1])),
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
            var lnglat1 = new T.LngLat(f[0], f[1]);
            var lnglat2 = new T.LngLat(s[0], s[1]);
            return Math.round(lnglat1.distanceTo(lnglat2));
        }
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
                    if ('distanceTo' in ps[i]) {
                        totalDistance += ps[i].distanceTo(ps[i + 1]);
                    } else {
                        totalDistance += new T.LngLat(ps[i][0], ps[i][1]).distanceTo(new T.LngLat(ps[i + 1][0], ps[i + 1][1]));
                    }
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
            return new Promise(function (resolve) {
                var searchConfig = {
                    pageCapacity: pageSize * pageIndex, //每页显示的数量
                    //接收数据的回调函数
                    onSearchComplete: function onSearchComplete(result) {
                        if (!result.pois) {
                            resolve([]);;
                        } else {
                            var list = result.pois.map(function (r) {
                                return {
                                    id: r.hotPointID,
                                    longitude: r.lonlat.split(' ')[0],
                                    latitude: r.lonlat.split(' ')[1],
                                    canShowLabel: true,
                                    config: {
                                        labelContent: r.name,
                                        labelPixelY: 27
                                    },
                                    other: 'search'
                                };
                            });
                            resolve(list);
                        }
                    }
                };
                //创建搜索对象
                var localsearch = new T.LocalSearch(t.state.gis, searchConfig);
                localsearch.search(searchValue);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this;
            return _react2.default.createElement('div', { id: t.props.mapId, style: { width: '100%', height: '100%', zIndex: '1' } });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var t = this;
            this.loadMapComplete.then(function () {
                t.mapLeft = document.getElementById(t.props.mapId).offsetLeft;
                t.mapTop = document.getElementById(t.props.mapId).offsetTop;
                t.init();
                //初始化完成后,再走更新
                t.isLoading = true;
            });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            //重新渲染结束
            var t = this;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps, prevProps) {
            //已加载组件，收到新的参数时调用
            var t = this;
            var receive = function receive() {
                //点/线旧数据
                var _t$state2 = t.state,
                    pointIds = _t$state2.pointIds,
                    lineIds = _t$state2.lineIds,
                    polygonIds = _t$state2.polygonIds,
                    circleIds = _t$state2.circleIds,
                    drawIds = _t$state2.drawIds;
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
                    isClearAll = nextProps.isClearAll,
                    isSetAreaRestriction = nextProps.isSetAreaRestriction,
                    areaRestriction = nextProps.areaRestriction,
                    isClearAreaRestriction = nextProps.isClearAreaRestriction;

                // 等待地图加载

                if (!t.state.mapCreated) return;
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
                if (typeof isclearAllPointCollection == 'boolean' && isclearAllPointCollection || isclearAllPointCollection && isclearAllPointCollection !== t.props.isclearAllPointCollection) {
                    t.clearAllPointCollection();
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
                    if (!!t.state.editId) {
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
                if (mapLines instanceof Array && !t.deepEqual(mapLines, t.props.mapLines)) {
                    var oldMapLines = t.props.mapLines;
                    var newMapLines = mapLines;
                    if (!!t.state.editId) {
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
                if (customizedBoundary instanceof Array && !t.deepEqual(customizedBoundary, t.props.customizedBoundary)) {
                    var _t$dataMatch4 = t.dataMatch(t.props.customizedBoundary, customizedBoundary, 'id'),
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
                if (mapPolygons instanceof Array && !t.deepEqual(mapPolygons, t.props.mapPolygons)) {
                    var oldMapPolygons = t.props.mapPolygons;
                    var newMapPolygons = mapPolygons;
                    if (!!t.state.editId) {
                        oldMapPolygons = t.props.mapPolygons.filter(function (item) {
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
                if (mapCircles instanceof Array && !t.deepEqual(mapCircles, t.props.mapCircles)) {
                    var oldMapCircles = t.props.mapCircles;
                    var newMapCircles = mapCircles;
                    if (!!t.state.editId) {
                        oldMapCircles = t.props.mapCircles.filter(function (item) {
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
                // //绘制边界线
                // if(boundaryName instanceof Array && !t.deepEqual(boundaryName,t.props.boundaryName)){
                //     let newBDName = Set(boundaryName);
                //     let oldBDName = Set(t.props.boundaryName);
                //     let removedBoundaryName = oldBDName.subtract(newBDName).toJS();
                //     let addedBoundaryName = newBDName.subtract(oldBDName).toJS();
                //     t.removeBaiduBoundary(removedBoundaryName);
                //     t.addBaiduBoundary(addedBoundaryName);
                // }
                // 获取热力图
                if (heatMapData && !t.deepEqual(heatMapData, t.props.heatMapData)) {
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
                // //是否打开路况
                // if(isOpenTrafficInfo){
                //     t.openTrafficInfo();
                // }else{
                //     t.hideTrafficInfo();
                // }
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
            };
            if (t.waitReceive) {
                clearInterval(t.waitReceive);
            }
            //等等天地图初始化
            if (t.isLoading) {
                receive();
            } else {
                t.waitReceive = setInterval(function () {
                    if (t.isLoading) {
                        clearInterval(t.waitReceive);
                        receive();
                    }
                }, 100);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            //关闭moveTo定时
            var t = this;
            if (t.moveToTimer) {
                clearInterval(t.moveToTimer);
            }
            if (t.waitReceive) {
                clearInterval(t.waitReceive);
            }
            if (t.waitInit) {
                clearInterval(t.waitInit);
            }
            //关闭animation定时
            for (var j in t.animTimer) {
                if (t.animTimer[j]) {
                    clearInterval(t.animTimer[j]);
                }
            }
        }
    }]);

    return TMap;
}(_react2.default.Component);

exports.default = TMap;
module.exports = exports['default'];