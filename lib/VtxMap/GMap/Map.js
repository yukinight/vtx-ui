'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Map = require('./Map.css');

var _Map2 = _interopRequireDefault(_Map);

var _MapToolFunction = require('../MapToolFunction');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _default = require('../../default');

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
//公共地址配置


var Set = _immutable2.default.Set;

var ArcgisMap = function (_React$Component) {
    _inherits(ArcgisMap, _React$Component);

    function ArcgisMap(props) {
        _classCallCheck(this, ArcgisMap);

        var _this = _possibleConstructorReturn(this, (ArcgisMap.__proto__ || Object.getPrototypeOf(ArcgisMap)).call(this, props));

        _this.grwkid = 4326; //wkid 坐标系对应,全局使用.
        _this.wkid = (isNaN(parseInt(props.wkid)) ? props.wkid : parseInt(props.wkid)) || 4326; //wkid 坐标系对应,全局使用.
        _this.wkidStr = isNaN(parseInt(props.wkid)) ? 'wkt' : 'wkid';
        _this.zIndexGraphics = []; //需要放在最后的图元,zoom和pan时刷新dom到最后
        _this.htmlPointsId = 'vtx_gmap_html_points'; //html点位容器id class管理
        _this.pointCollectionId = 'vtx_gmap_html_pointCollection'; //海量点canvas点位容器id class管理
        _this.Label = {}; //所有label 集合
        _this.labelLayer = { x: 0, y: 0 }; //label图层 位置管理
        _this.GM = new _MapToolFunction.graphicManage(); //初始化 图元管理方法
        _this.getPolygonArea = _MapToolFunction.getPolygonArea;
        _this.loadTimer = null; //初始化地图 load时延缓数据处理
        _this.animTimer = {}; //点位跳动动画 定时集合
        _this.animCount = {}; //点位跳动动画 定时计数
        _this.moveToTimer = null; //moveTo时间对象
        _this.drawToolbar = null; //绘制对象
        _this.drawParam = {}; //缓存 绘制的数据
        _this.editToolbar = null; //编辑对象
        _this.editToolbarC = null; //编辑对象
        _this.editId = ''; //当前编辑的图元id
        _this.canMoveLabel = false; //编辑点时,label跟着移动开关
        //当前鼠标的经纬度,便捷含label点时刷新 
        //x,y鼠标坐标  px,py鼠标与点中心偏移坐标  isCount是否计算偏移
        _this.mouseNowPosition = { x: 0, y: 0, px: 0, py: 0, isCount: false };
        _this.heatmap = null; //热力图对象
        _this.clusterMarkers = []; //聚合点位id数组
        _this.clusterPs = []; //聚合集合点
        _this.clusterPt = []; //地图中聚合点集合
        _this.morepoints = []; //海量点集合
        _this.areaRestriction = null; //区域限制数据
        _this.movePoints = [];
        //是否绘制测距
        _this.rangingTool = {
            isRanging: false, //是否开启状态
            line: {}, //线
            points: [], //点
            distance: 0, //测距长度
            mapRangingTool: null //测距回调
        };
        _this.rangingTools = {}; //测距点线缓存
        _this.state = {
            gis: null, //地图对象
            mapId: props.mapId,
            mapCreated: false,
            pointIds: [], //地图上点的ids
            lineIds: [], //地图上线的ids
            polygonIds: [], //地图上面的ids
            circleIds: [], //地图上圆的ids
            // editId: '',//当前编辑的图元id
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
    //加载地图信息


    _createClass(ArcgisMap, [{
        key: 'loadMapJs',
        value: function loadMapJs() {
            this.loadMapComplete = new Promise(function (resolve, reject) {
                if (window.GMap) {
                    resolve(window.GMap);
                } else {
                    //加载 js
                    // $.getScript('http://222.92.212.126:25048/gis/html/js/arcgis_js_api/library/3.9/3.9/init.js',()=>{
                    $.getScript(_default2.default.arcgisServerURL + '/html/js/arcgis_js_api/library/3.9/3.9/init.js', function () {
                        var Heatmap = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/gisheatmap.js', function () {
                                resolve();
                            });
                        });
                        var PointCollection = new Promise(function (resolve, reject) {
                            $.getScript(_default2.default.mapServerURL + '/GPointCollection.js', function () {
                                resolve();
                            });
                        });
                        Promise.all([Heatmap, PointCollection]).then(function () {
                            //require是关键字 这边用window区别
                            window.require(["esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "dojo/on", 'esri/geometry/Point', 'esri/symbols/SimpleMarkerSymbol', "esri/Color", "esri/graphic", "esri/domUtils", "esri/toolbars/edit", "esri/symbols/PictureMarkerSymbol", "esri/symbols/TextSymbol", "esri/symbols/SimpleLineSymbol", "esri/toolbars/draw", "esri/layers/WMTSLayer", "esri/geometry/Extent", "esri/layers/WMTSLayerInfo", "esri/geometry/Polyline", "esri/symbols/SimpleFillSymbol", "esri/geometry/Circle", "esri/layers/TileInfo", "esri/SpatialReference", "esri/dijit/BasemapToggle"], function (Map) {
                                window.GMap = Map;
                                resolve(window.GMap);
                            });
                        });
                    });
                    //加载 css
                    $("<link>").attr({ rel: "stylesheet", type: "text/css", href: "http://120.26.217.62:25048/gis/html/js/arcgis_js_api/library/3.9/3.9/js/dojo/dijit/themes/tundra/tundra.css" }).appendTo("head");
                    $("<link>").attr({ rel: "stylesheet", type: "text/css", href: "http://120.26.217.62:25048/gis/html/js/arcgis_js_api/library/3.9/3.9/js/esri/css/esri.css" }).appendTo("head");
                }
            });
        }
        //初始化地图数据

    }, {
        key: 'init',
        value: function init() {
            var _this2 = this;

            var t = this;
            //创建地图
            t.createMap();
            // 处理数据(整合)
            var initData = function initData() {
                var _t$props = t.props,
                    mapPoints = _t$props.mapPoints,
                    mapLines = _t$props.mapLines,
                    mapPolygons = _t$props.mapPolygons,
                    mapCircles = _t$props.mapCircles,
                    mapVisiblePoints = _t$props.mapVisiblePoints,
                    mapCluster = _t$props.mapCluster,
                    mapZoomLevel = _t$props.mapZoomLevel,
                    isOpenTrafficInfo = _t$props.isOpenTrafficInfo,
                    mapPointCollection = _t$props.mapPointCollection,
                    areaRestriction = _t$props.areaRestriction;
                var _t$props2 = t.props,
                    boundaryName = _t$props2.boundaryName,
                    heatMapData = _t$props2.heatMapData,
                    customizedBoundary = _t$props2.customizedBoundary;
                var _t$state = t.state,
                    boundaryInfo = _t$state.boundaryInfo,
                    pointIds = _t$state.pointIds,
                    lineIds = _t$state.lineIds,
                    polygonIds = _t$state.polygonIds,
                    circleIds = _t$state.circleIds;
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
                //是否设置比例尺
                if (t.props.showControl) {
                    t.showControl();
                }
                // 画热力图
                if (heatMapData) {
                    t.heatMapOverlay(heatMapData);
                }
                //设置点聚合
                if (mapCluster instanceof Array) {
                    t.cluster(mapCluster);
                }
                //添加海量点
                if (mapPointCollection instanceof Array) {
                    t.addPointCollection(mapPointCollection);
                }
                //设置区域限制
                if (areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]) {
                    t.setAreaRestriction(areaRestriction);
                }
                t.setState({
                    mapCreated: true
                });
            };
            //事件监听
            var event = function event() {
                //html点位 根据地图移动和zoom计算位置
                var changeLabel = function changeLabel() {
                    for (var i in t.Label) {
                        var cmids = t.clusterMarkers.map(function (item) {
                            return item.id;
                        });
                        if (t.Label[i]) {
                            var position = t.GM.getGraphic(i).geometry;
                            var tl = t.state.gis.toScreen(position);
                            // let tl = t.state.gis.toScreen(t.Label[i].position);
                            //渲染優化
                            if (!(tl.y < -50 || tl.x < -50 || tl.y > t.state.gis.height || tl.x > t.state.gis.width)) {
                                t.Label[i].html.css({
                                    position: 'absolute',
                                    top: tl.y + t.Label[i].offset.y - t.labelLayer.y,
                                    left: tl.x + t.Label[i].offset.x - t.labelLayer.x
                                });
                                if (!t.Label[i].add && cmids.indexOf(i) == -1) {
                                    $('#' + t.htmlPointsId).append(t.Label[i].html);
                                    t.Label[i].add = true;
                                }
                            } else {
                                if (t.Label[i].add && cmids.indexOf(i) == -1) {
                                    t.Label[i].html.remove();
                                    t.Label[i].add = false;
                                }
                            }
                        }
                    }
                };
                //见需要在顶部显示的图元重新排位置
                var czIndex = function czIndex() {
                    for (var i = 0; i < t.zIndexGraphics.length; i++) {
                        $('#' + t.props.mapId + '_graphics_layer').append(t.GM.getGraphic(t.zIndexGraphics[i]).getNode());
                    }
                };
                /*测距功能*/
                var rangingToolFun = function rangingToolFun(e, status) {
                    if (t.rangingTool.isRanging) {
                        //测距开始
                        //点击位置
                        var lnlt = [e.mapPoint.x, e.mapPoint.y];
                        //2个点以上 计算长度
                        if (t.rangingTool.points.length > 0) {
                            t.rangingTool.distance += (0, _MapToolFunction.getDistance)(lnlt, [t.rangingTool.points[t.rangingTool.points.length - 1].longitude, t.rangingTool.points[t.rangingTool.points.length - 1].latitude], t.state.gis, t.grwkid);
                        } else {
                            t.rangingTool.line.paths = [];
                        }
                        t.rangingTool.line.paths.push([].concat(lnlt));
                        //处理距离展示
                        var distext = t.rangingTool.distance > 0 ? t.rangingTool.distance > 1000 ? '\u603B\u957F:' + Math.round(t.rangingTool.distance / 10) / 100 + '\u516C\u91CC' : '\u603B\u957F:' + t.rangingTool.distance + '\u7C73' : '起点';
                        //加点
                        var point = {
                            id: t.rangingTool.points.length + 'vtx_g_rang_p' + Math.random(),
                            longitude: lnlt[0],
                            latitude: lnlt[1],
                            markerContent: '\n                            <div style=\'z-index:1;\'>\n                                <div class=\'vtx-g-rangingPoint\'></div>\n                                <div class=\'vtx-g-rangingDistance\'>' + distext + '</div>\n                            </div>\n                        ',
                            config: {
                                width: 130,
                                height: 30,
                                markerContentX: -5.5,
                                markerContentY: -12.5
                            }
                        };
                        //用addpoint方法加点
                        t.addPoint([point]);
                        //缓存点信息
                        t.rangingTool.points.push(point);
                        if (t.rangingTool.line.paths.length == 2) {
                            //加线
                            t.rangingTool.line = {
                                id: 'vtx_g_rang_line' + Math.random(),
                                paths: [].concat(_toConsumableArray(t.rangingTool.line.paths)),
                                config: {
                                    color: '#ff0000',
                                    lineWidth: 2,
                                    lineType: 'solid'
                                }
                            };
                            t.addLine([t.rangingTool.line]);
                        } else if (t.rangingTool.line.paths.length > 2) {
                            t.updateLine([_extends({}, t.rangingTool.line, {
                                paths: [].concat(_toConsumableArray(t.rangingTool.line.paths))
                            })]);
                        }
                        //双击 测距结束
                        if (status == 'dbl') {
                            //开启双击缩放功能
                            t.state.gis.enableDoubleClickZoom();
                            var rangkey = new Date().getTime() + Math.random();
                            //加结束点
                            var end = {
                                id: 'vtx_g_rang_end' + Math.random(),
                                longitude: lnlt[0],
                                latitude: lnlt[1],
                                markerContent: '\n                                <div>\n                                    <div class=\'vtx-g-rang-exit\'>x</div>\n                                </div>\n                            ',
                                config: {
                                    width: 13,
                                    height: 13,
                                    markerContentX: -20,
                                    markerContentY: -20
                                },
                                index: rangkey
                            };
                            //用addpoint方法加点
                            t.addPoint([end]);
                            //删除提示框  
                            t.removeGraphic('vtx-g-rang-showRangTool', 'point');
                            t.removeGraphic('vtx-g-rang-showRangTool-line', 'line');
                            //缓存当前这一条测距数据
                            t.rangingTools[rangkey] = _extends({}, t.rangingTool);
                            //回调测距参数
                            if (t.rangingTool.mapRangingTool) {
                                t.rangingTool.mapRangingTool({
                                    distance: t.rangingTool.distance,
                                    lnglats: t.rangingTool.line.paths
                                });
                            }
                            t.rangingTool.isRanging = false;
                            t.rangingTool = _extends({}, t.rangingTool, {
                                isRanging: false, //是否开启状态
                                line: {}, //线缓存
                                points: [], //点
                                distance: 0 //测距长度
                            });
                        }
                    }
                };
                //地图鼠标移入事件
                t.state.gis.on('mouse-over', function (e) {
                    //鼠标移出地图时,删除测距显示点
                    if (t.rangingTool.isRanging) {
                        var rp = {
                            id: 'vtx-g-rang-showRangTool',
                            longitude: e.mapPoint.x,
                            latitude: e.mapPoint.y,
                            markerContent: '\n                            <div class=\'vtx-g-rang-showRangTool\'>\u5355\u51FB\u786E\u5B9A\u8D77\u70B9</div>\n                        ',
                            config: {
                                markerContentX: 20,
                                markerContentY: 20
                            }
                        };
                        t.addPoint([rp]);
                    }
                });
                //地图鼠标移出事件
                t.state.gis.on('mouse-out', function (e) {
                    //鼠标移出地图时,删除测距显示点
                    if (t.rangingTool.isRanging) {
                        t.removeGraphic('vtx-g-rang-showRangTool', 'point');
                    }
                });
                //地图鼠标移动事件
                t.state.gis.on('mouse-move', function (e) {
                    //鼠标移动地图时,删除测距显示点
                    if (t.rangingTool.isRanging) {
                        //获取测距提示点位
                        var rp = _extends({}, t.GM.getGraphicParam('vtx-g-rang-showRangTool').attributes);
                        //删除多余数据,避免other层级太多
                        delete rp.other;
                        var rcontent = rp.markerContent;
                        if (t.rangingTool.points.length > 0) {
                            var distance = (0, _MapToolFunction.getDistance)([e.mapPoint.x, e.mapPoint.y], [t.rangingTool.points[t.rangingTool.points.length - 1].longitude, t.rangingTool.points[t.rangingTool.points.length - 1].latitude], t.state.gis, t.grwkid);
                            // 实时计算距离
                            distance += t.rangingTool.distance;
                            var distext = distance > 1000 ? '\u603B\u957F:' + Math.round(distance / 10) / 100 + '\u516C\u91CC' : '\u603B\u957F:' + distance + '\u7C73';
                            rcontent = '\n                            <div class=\'vtx-g-rang-showRangTool\'>\n                                <div>' + distext + '</div>\n                                <div>\u5355\u51FB\u786E\u5B9A\u5730\u70B9,\u53CC\u51FB\u7ED3\u675F</div>\n                            </div>\n                        ';
                            //测距移动的线
                            var sl = {
                                id: 'vtx-g-rang-showRangTool-line',
                                paths: [[t.rangingTool.points[t.rangingTool.points.length - 1].longitude, t.rangingTool.points[t.rangingTool.points.length - 1].latitude], [e.mapPoint.x, e.mapPoint.y]],
                                config: {
                                    color: '#ff0000',
                                    lineWidth: 2,
                                    lineType: 'solid',
                                    pellucidity: 0.5
                                }
                            };
                            if (!t.GM.getGraphic('vtx-g-rang-showRangTool-line')) {
                                t.addLine([sl]);
                            } else {
                                t.updateLine([sl]);
                            }
                        }
                        rp = _extends({}, rp, {
                            longitude: e.mapPoint.x,
                            latitude: e.mapPoint.y,
                            markerContent: rcontent
                        });
                        t.updatePoint([rp]);
                    }
                    //编辑移动
                    if (t.editId && t.canMoveLabel) {
                        t.mouseNowPosition = _extends({}, t.mouseNowPosition, {
                            x: e.mapPoint.x,
                            y: e.mapPoint.y
                        });
                    }
                });
                //地图双击事件
                t.state.gis.on('dbl-click', function (e) {
                    /*测距功能*/
                    rangingToolFun(e, 'dbl');
                });
                //地图点击事件
                t.state.gis.on('click', function (e) {
                    var t = _this2;
                    /*测距功能*/
                    rangingToolFun(e);
                    //地图点击事件
                    t.clickMap(e);
                });
                //鼠标拖拽开始事件
                t.state.gis.on('mouse-drag-start', function (e) {
                    t.dragMapStart(e);
                });
                //鼠标拖拽结束事件
                t.state.gis.on('mouse-drag-end', function (e) {
                    t.dragMapEnd(e);
                });
                //1.地图移动事件
                t.state.gis.on('pan', function (e) {
                    //切换html图层位置
                    $('#' + t.htmlPointsId).css({
                        top: t.labelLayer.y + e.delta.y,
                        left: t.labelLayer.x + e.delta.x
                    });
                    $('#' + t.pointCollectionId).css({
                        top: e.delta.y,
                        left: e.delta.x
                    });

                    if (t.heatmap) {
                        t.heatmap.changeDiv(e.delta.y, e.delta.x);
                    }
                });
                //地图拖动开始
                t.state.gis.on('pan-start', function (e) {
                    t.moveStart(e);
                });
                //地图拖动结束
                t.state.gis.on('pan-end', function (e) {
                    t.moveEnd(e);
                    //聚合点位id存在,则执行聚合运算
                    if (t.clusterMarkers.length > 0) {
                        t.dealClusterPoint();
                    }
                    $('#' + t.pointCollectionId).css({
                        top: 0,
                        left: 0
                    });
                    //重画海量点
                    if (t.morepoints.length > 0) {
                        t.updatePointCollection(t.props.mapPointCollection);
                    }
                    //记录html图层位置
                    t.labelLayer = {
                        x: eval($('#' + t.htmlPointsId).css('left').replace('px', '')),
                        y: eval($('#' + t.htmlPointsId).css('top').replace('px', ''))
                        //html点位 根据地图移动和zoom计算位置
                    };changeLabel();
                    //热力图重绘
                    if (t.heatmap) {
                        t.heatmap.draw();
                    }
                    //见需要在顶部显示的图元重新排位置
                    for (var i = 0; i < t.zIndexGraphics.length; i++) {
                        t.czIndex(t.zIndexGraphics[i]);
                    }
                    //处理区域限制逻辑
                    if (t.areaRestriction) {
                        t.dealAreaRestriction(e);
                    }
                });
                // 地图zoom开始
                t.state.gis.on('zoom-start', function (e) {
                    t.zoomStart(e);
                    //隐藏label根节点
                    $('#' + t.htmlPointsId).css({ display: 'none' });
                    //海量点dom
                    $('#' + t.pointCollectionId).css({ display: 'none' });
                    if (t.heatmap && !t.isHideHeatMap) {
                        t.heatmap.hide();
                    }
                });
                // 地图zoom结束
                t.state.gis.on('zoom-end', function (e) {
                    t.zoomEnd(e);
                    //聚合点位id存在,则执行聚合运算
                    if (t.clusterMarkers.length > 0) {
                        t.dealClusterPoint();
                    }
                    //显示label根节点
                    $('#' + t.htmlPointsId).css({ display: 'inline-block' });
                    //海量点dom
                    $('#' + t.pointCollectionId).css({ display: 'inline-block' });
                    //刷新label点位位置
                    changeLabel();
                    if (t.heatmap && !t.isHideHeatMap) {
                        t.heatmap.show();
                        t.heatmap.draw();
                    }
                    //重画海量点
                    if (t.morepoints.length > 0) {
                        t.updatePointCollection(t.props.mapPointCollection);
                    }
                    //见需要在顶部显示的图元重新排位置
                    for (var i = 0; i < t.zIndexGraphics.length; i++) {
                        t.czIndex(t.zIndexGraphics[i]);
                    }
                    //重新计算比例尺
                    if ($('#' + t.props.mapId + '_zoom_slider_show')[0]) {
                        var getScale = t.state.gis.getScale() * 0.025399998 / 96;
                        //分母系数
                        var coefficient = Math.pow(10, Math.floor(getScale).toString().length - 1);
                        //判断系数 , 总长度值
                        var gs = getScale / coefficient,
                            toldis = 1,
                            isCent = false;
                        //计算比例尺数值和长度
                        if (gs < 1) {
                            isCent = true;
                            gs *= 10;
                        }
                        if (gs >= 5) {
                            toldis = 5 * coefficient * 100;
                        } else if (gs >= 2) {
                            toldis = 2 * coefficient * 100;
                        } else {
                            toldis = 1 * coefficient * 100;
                        }
                        var scaleW = toldis / getScale;
                        if (isCent) {
                            scaleW /= 10;
                            toldis /= 10;
                        }
                        //宽度矫正处理
                        if (scaleW < 50) {
                            toldis *= 1.5;
                            scaleW = toldis / getScale;
                        }
                        //处理比例尺值显示
                        toldis = toldis >= 1000 ? Math.round(toldis / 1000) + '\u516C\u91CC' : toldis + '\u7C73';
                        $('#' + t.props.mapId + '_zoom_slider_show').css({ width: scaleW - 2 });
                        $($('#' + t.props.mapId + '_zoom_slider_show').children()[0]).html(toldis);
                    }
                });
                //2.图元事件
                //图元点击事件
                t.state.gis.graphics.on('click', function (e) {
                    if (!e.graphic.attributes) {
                        return;
                    }
                    var gid = e.graphic.attributes.id;
                    //聚合点位不执行 图元事件
                    if (gid == 'vtx-clusterPoint') {
                        t.setVisiblePoints(e.graphic.attributes.ids);
                        return false;
                    }
                    t.clickGraphic(gid, e);
                    if (_typeof(e.graphic.attributes) == 'object') {
                        //点击图元的id
                        //判断是否点击的测距关闭点位
                        if (gid && gid.indexOf('vtx_g_rang_end') > -1) {
                            var index = t.GM.getGraphicParam(gid).attributes.index;
                            var ls = t.rangingTools[index].line,
                                ps = t.rangingTools[index].points;
                            //删除测距线
                            t.removeGraphic(ls.id, 'line');
                            //删除关闭点
                            t.removeGraphic(gid, 'point');
                            //删除中间点
                            for (var i = 0; i < ps.length; i++) {
                                t.removeGraphic(ps[i].id, 'point');
                            }
                            //清除测距数据缓存
                            delete t.rangingTools[index];
                        }
                    }
                });
                //图元鼠标移入事件
                t.state.gis.graphics.on('mouse-over', function (e) {
                    if (!e.graphic.attributes) {
                        return;
                    }
                    var gid = e.graphic.attributes.id;
                    //聚合点位不执行 图元事件
                    if (gid == 'vtx-clusterPoint') {
                        return false;
                    }
                    t.mouseOverGraphic(gid, e);
                });
                //图元鼠标移除事件
                t.state.gis.graphics.on('mouse-out', function (e) {
                    if (!e.graphic.attributes) {
                        return;
                    }
                    var gid = e.graphic.attributes.id;
                    //聚合点位不执行 图元事件
                    if (gid == 'vtx-clusterPoint') {
                        return false;
                    }
                    t.mouseOutGraphic(gid, e);
                });
            };
            //graphics对象存在 直接处理数据,不存在 通过load事件等待
            if (t.state.gis.graphics) {
                $('#' + t.props.mapId + '_gc').css({ 'z-index': 1 });
                //添加自定义图元 图层
                $('#' + t.props.mapId + '_layers').append('<div id=' + t.htmlPointsId + ' class=\'vtx_gmap_html_points\' ></div>');
                //海量点图元容器
                $('#' + t.props.mapId + '_layers').append('<div id=' + t.pointCollectionId + ' class=\'vtx_gmap_html_pointCollection\' ></div>');
                //隐藏比例尺控制 (便于后期控制显示)
                $('#' + t.props.mapId + '_zoom_slider').css({ display: 'none' });
                //事件监听
                event();
                t.setCenter(t.props.mapCenter);
                //处理数据
                initData();
            }
            t.state.gis.on('load', function () {
                $('#' + t.props.mapId + '_gc').css({ 'z-index': 1 });
                //添加自定义图元 图层
                $('#' + t.props.mapId + '_layers').append('<div id=' + t.htmlPointsId + ' class=\'vtx_gmap_html_points\' ></div>');
                //海量点图元容器
                $('#' + t.props.mapId + '_layers').append('<div id=' + t.pointCollectionId + ' class=\'vtx_gmap_html_pointCollection\' ></div>');
                //隐藏比例尺控制 (便于后期控制显示)
                $('#' + t.props.mapId + '_zoom_slider').css({ display: 'none' });
                //事件监听
                event();
                t.setCenter(t.props.mapCenter);
                //处理数据
                initData();
            });
        }
        //创建地图  1.gis服务  需要load   2.wmts  wms等服务无需load

    }, {
        key: 'createMap',
        value: function createMap() {
            var t = this;
            var _t$props3 = t.props,
                mapCenter = _t$props3.mapCenter,
                mapId = _t$props3.mapId,
                mapZoomLevel = _t$props3.mapZoomLevel,
                minZoom = _t$props3.minZoom,
                maxZoom = _t$props3.maxZoom,
                mapServer = _t$props3.mapServer;

            var options = {
                zoom: mapZoomLevel || 10,
                center: mapCenter || [120.404, 30.915]
            };
            if (minZoom) {
                options.minZoom = parseInt(minZoom);
            }
            if (maxZoom) {
                options.maxZoom = parseInt(maxZoom);
            }
            if (!window.VtxMap) {
                window.VtxMap = {};
            }
            var fullExtent = (mapServer || {}).fullExtent || {
                xmin: -180.0, ymin: -90.0, xmax: 180.0, ymax: 90.0
            };
            var map = window.VtxMap[mapId] = t.state.gis = new GMap(t.props.mapId, _extends({
                autoResize: true,
                logo: false,
                isKeyboardNavigation: false,
                showAttribution: true,
                backgroundColor: '#f1f1f1',
                extent: new esri.geometry.Extent(_extends({}, fullExtent, {
                    spatialReference: _defineProperty({}, t.wkidStr, t.wkid)
                }))
            }, options));
            t.addMapLayers(mapServer);
            t.htmlPointsId = mapId + '_' + t.htmlPointsId;
            t.pointCollectionId = mapId + '_' + t.pointCollectionId;
        }
        //处理图层

    }, {
        key: 'addMapLayers',
        value: function addMapLayers() {
            var mapServer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var t = this;
            //清除所有图层服务
            t.state.gis.removeAllLayers();
            var services = [].concat(_toConsumableArray(mapServer.services || [])),
                servs = [];
            for (var im = 0; im < services.length; im++) {
                var url = services[im].url;
                //从新加载图层
                switch (services[im].type) {
                    case 'gis':
                        for (var i = 0; i < url.length; i++) {
                            var basemap = new esri.layers[services[im].gisServer || 'ArcGISTiledMapServiceLayer'](url[i]);
                            servs.push(basemap);
                        }
                        break;
                    case 'wmts':
                        for (var _i = 0; _i < url.length; _i++) {
                            var tileInfo = new esri.layers.TileInfo({
                                "dpi": 96,
                                "format": services[im].format || "format/png",
                                "compressionQuality": 0,
                                "spatialReference": new esri.SpatialReference(_defineProperty({}, t.wkidStr, t.wkid || 4326)),
                                "rows": 256,
                                "cols": 256,
                                "origin": mapServer.origin || { x: -180, y: 90 },
                                "lods": mapServer.lods || []
                            });
                            var tileExtent = new esri.geometry.Extent(mapServer.fullExtent.xmin, mapServer.fullExtent.ymin, mapServer.fullExtent.xmax, mapServer.fullExtent.ymax, new esri.SpatialReference(_defineProperty({}, t.wkidStr, t.wkid)));
                            var inTileExtent = new esri.geometry.Extent(mapServer.initialExtent.xmin, mapServer.initialExtent.ymin, mapServer.initialExtent.xmax, mapServer.initialExtent.ymax, new esri.SpatialReference(_defineProperty({}, t.wkidStr, t.wkid)));
                            var layerInfo = new esri.layers.WMTSLayerInfo({
                                tileInfo: tileInfo,
                                fullExtent: tileExtent,
                                initialExtent: inTileExtent,
                                identifier: (services[im].layer || {})[_i] || "SRTM_Color_Index",
                                tileMatrixSet: services[im].tilematrixset || "31.25m",
                                format: services[im].format || "png",
                                style: "default"
                            });
                            var resourceInfo = {
                                version: "1.0.0",
                                layerInfos: [layerInfo],
                                copyright: ''
                            };
                            var options = {
                                serviceMode: "KVP",
                                resourceInfo: resourceInfo,
                                layerInfo: layerInfo
                            };
                            var wmtsLayer = new esri.layers.WMTSLayer(url[_i], options);
                            wmtsLayer.UrlTemplate = wmtsLayer.UrlTemplate.replace(wmtsLayer.UrlTemplate.substring(wmtsLayer.UrlTemplate.indexOf('&FORMAT'), wmtsLayer.UrlTemplate.indexOf('&TILEMATRIXSET')), '&FORMAT=' + (services[im].format || 'format/png'));
                            servs.push(wmtsLayer);
                        }
                        break;
                }
            }
            if (services.length <= 0) {
                console.warn('!warning 图层服务必选,或图层类型暂不支持,默认天地图浙江地理wmts图层服务!');
                for (var _im = 0; _im < _MapToolFunction.defaultWmtsMapLayers.services.length; _im++) {
                    var _url = _MapToolFunction.defaultWmtsMapLayers.services[_im].url;
                    var dtileInfo = new esri.layers.TileInfo({
                        "dpi": 96,
                        // "format": "tiles",
                        "compressionQuality": 0,
                        "spatialReference": new esri.SpatialReference(_defineProperty({}, t.wkidStr, t.wkid || 4326)),
                        "rows": 256,
                        "cols": 256,
                        "origin": _MapToolFunction.defaultWmtsMapLayers.origin || { x: -180, y: 90 },
                        "lods": _MapToolFunction.defaultWmtsMapLayers.lods || []
                    });
                    var dtileExtent = new esri.geometry.Extent(_MapToolFunction.defaultWmtsMapLayers.fullExtent.xmin, _MapToolFunction.defaultWmtsMapLayers.fullExtent.ymin, _MapToolFunction.defaultWmtsMapLayers.fullExtent.xmax, _MapToolFunction.defaultWmtsMapLayers.fullExtent.ymax, new esri.SpatialReference(_defineProperty({}, t.wkidStr, t.wkid)));
                    var dinTileExtent = new esri.geometry.Extent(_MapToolFunction.defaultWmtsMapLayers.initialExtent.xmin, _MapToolFunction.defaultWmtsMapLayers.initialExtent.ymin, _MapToolFunction.defaultWmtsMapLayers.initialExtent.xmax, _MapToolFunction.defaultWmtsMapLayers.initialExtent.ymax, new esri.SpatialReference(_defineProperty({}, t.wkidStr, t.wkid)));
                    for (var _i2 = 0; _i2 < _url.length; _i2++) {
                        var dlayerInfo = new esri.layers.WMTSLayerInfo({
                            tileInfo: dtileInfo,
                            fullExtent: dtileExtent,
                            initialExtent: dinTileExtent,
                            identifier: _MapToolFunction.defaultWmtsMapLayers.services[_im].layer[_i2] || "SRTM_Color_Index",
                            tileMatrixSet: _MapToolFunction.defaultWmtsMapLayers.services[_im].tilematrixset || "31.25m",
                            format: _MapToolFunction.defaultWmtsMapLayers.services[_im].format || "png",
                            style: "default"
                        });
                        var dresourceInfo = {
                            version: "1.0.0",
                            layerInfos: [dlayerInfo],
                            copyright: ''
                        };
                        var doptions = {
                            serviceMode: "KVP",
                            resourceInfo: dresourceInfo,
                            layerInfo: dlayerInfo
                        };
                        var _wmtsLayer = new esri.layers.WMTSLayer(_url[_i2], doptions);
                        _wmtsLayer.UrlTemplate = _wmtsLayer.UrlTemplate.replace(_wmtsLayer.UrlTemplate.substr(_wmtsLayer.UrlTemplate.indexOf('&FORMAT='), _wmtsLayer.UrlTemplate.substr(_wmtsLayer.UrlTemplate.indexOf('&FORMAT=') + 1).indexOf('&') + 1), '&FORMAT=' + (_MapToolFunction.defaultWmtsMapLayers.services[_im].format || 'format/png'));
                        servs.push(_wmtsLayer);
                    }
                }
            }
            for (var j = 0; j < servs.length; j++) {
                t.state.gis.addLayer(servs[j]);
            }
        }
        //新增点位

    }, {
        key: 'addPoint',
        value: function addPoint(mapPoints, type) {
            var _this3 = this;

            var t = this;
            var psids = [].concat(_toConsumableArray(t.state.pointIds));
            //添加绘制点
            if (type && type !== 'defined') {
                psids = [].concat(_toConsumableArray(t.state.drawIds[type]));
            }
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
                //创建arcgis的经纬度对象
                var position = new esri.geometry.Point({
                    longitude: item.longitude,
                    latitude: item.latitude,
                    spatialReference: { wkid: t.grwkid }
                });
                var marker = null,
                    label = null;
                if (item.markerContent) {
                    //html点位
                    //添加透明点(便于事件处理)
                    var markerSymbol = new esri.symbol.PictureMarkerSymbol(_default2.default.mapServerURL + '/images/touming.png', cg.width, cg.height);
                    //设置偏移点的位置到左上角(原来在中心)
                    markerSymbol.setOffset(cg.markerContentX + cg.width / 2, -(cg.markerContentY + cg.height / 2));
                    marker = new esri.Graphic(position, markerSymbol, { id: item.id });
                    //设置markercontent的数据,用于label加点到地图
                    label = {
                        html: $(item.markerContent),
                        offset: {
                            x: cg.markerContentX,
                            y: cg.markerContentY
                        },
                        position: position
                    };
                } else {
                    //图片点位
                    var _markerSymbol = new esri.symbol.PictureMarkerSymbol(item.url || _default2.default.mapServerURL + '/images/defaultMarker.png', cg.width, cg.height);
                    _markerSymbol.setAngle(cg.deg);
                    //设置偏移点的位置到左上角(原来在中心)
                    _markerSymbol.setOffset(cg.markerContentX + cg.width / 2, -(cg.markerContentY + cg.height / 2));
                    //点位图元
                    marker = new esri.Graphic(position, _markerSymbol, { id: item.id });
                    //添加label
                    if (item.canShowLabel && cg.labelContent) {
                        //label默认样式
                        var labelClass = 'label-content';
                        //接受label自定义样式
                        if (item.labelClass) {
                            labelClass = item.labelClass.split(',').join(' ');
                        }
                        //设置label的数据,用于label加点到地图
                        label = {
                            html: $('<div style=\'margin-left: 0;z-index: ' + (cg.zIndex || 0) + ';\'>\n                                <div class=\'' + labelClass + '\'>' + cg.labelContent + '</div>\n                            </div>'),
                            //offset 需要处理 图片点位的位置(将点位偏移和宽度加入计算)
                            offset: {
                                x: cg.labelPixelX + (cg.markerContentX + cg.width / 2),
                                y: cg.labelPixelY + cg.markerContentY
                            },
                            position: position
                        };
                    }
                }
                //点跳动动画
                if (!item.markerContent && cg.BAnimationType == 0) {
                    t.pointAnimation(item.id, marker);
                } else {
                    t.pointAnimation(item.id, null);
                }
                //添加图元到地图
                t.state.gis.graphics.add(marker);
                //统一处理添加点位 含label和html的添加
                //处理label的加点
                t.dealLabelGraphics(item.id, label);
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
                //添加绘制点
                if (type) {
                    t.setState({
                        drawIds: _extends({}, t.state.drawIds, _defineProperty({}, type, psids))
                    });
                } else {
                    //所有点缓存在state中
                    t.setState({
                        pointIds: psids
                    });
                }
            }
        }
        //更新点位

    }, {
        key: 'updatePoint',
        value: function updatePoint(mapPoints) {
            var _this4 = this;

            var t = this;
            // let dpoints = [],apoints = [];
            mapPoints.map(function (item, index) {
                //判断图元是否存在.
                if (_this4.GM.isRepetition(item.id)) {
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
                    //创建arcgis的经纬度对象
                    var position = new esri.geometry.Point({
                        longitude: item.longitude,
                        latitude: item.latitude,
                        spatialReference: { wkid: t.grwkid }
                    });
                    //label对象
                    var label = null;
                    if (item.markerContent) {
                        //symbol 样式信息修改
                        if (gc.symbol) {
                            gc.symbol.setUrl(_default2.default.mapServerURL + '/images/touming.png');
                        }
                        //设置markercontent的数据,用于label加点到地图
                        label = {
                            html: $(item.markerContent),
                            offset: {
                                x: cg.markerContentX,
                                y: cg.markerContentY
                            },
                            position: position
                        };
                    } else {
                        //symbol 样式信息修改
                        if (gc.symbol) {
                            gc.symbol.setUrl(item.url || _default2.default.mapServerURL + '/images/defaultMarker.png');
                        }
                        gc.symbol.setAngle(cg.deg);
                        //添加label
                        if (item.canShowLabel && cg.labelContent) {
                            //label默认样式
                            var labelClass = 'label-content';
                            //接受label自定义样式
                            if (item.labelClass) {
                                labelClass = item.labelClass.split(',').join(' ');
                            }
                            //设置label的数据,用于label加点到地图
                            label = {
                                html: $('<div style=\'margin-left: 0;\'>\n                                    <div class=\'' + labelClass + '\'>' + cg.labelContent + '</div>\n                                </div>'),
                                //offset 需要处理 图片点位的位置(将点位偏移和宽度加入计算)
                                offset: {
                                    x: cg.labelPixelX + (cg.markerContentX + cg.width / 2),
                                    y: cg.labelPixelY + cg.markerContentY
                                },
                                position: position
                            };
                        }
                    }
                    //symbol 样式信息修改
                    if (gc.symbol) {
                        gc.symbol.setOffset(cg.markerContentX + cg.width / 2, -(cg.markerContentY + cg.height / 2));
                        gc.symbol.setWidth(cg.width);
                        gc.symbol.setHeight(cg.height);
                    }
                    //点位动画效果
                    if (!item.markerContent && cg.BAnimationType == 0) {
                        t.pointAnimation(item.id, gc);
                    } else {
                        t.pointAnimation(item.id, null);
                    }

                    //动画效果会延迟执行经纬度的切换
                    if (cg.isAnimation) {
                        t.moveTo(item.id, [item.longitude, item.latitude], cg.animationDelay, cg.autoRotation, item.url, item.urlleft);
                    } else {
                        //gometry 位置信息修改
                        if (gc.geometry) {
                            gc.geometry.setLatitude(item.latitude);
                            gc.geometry.setLongitude(item.longitude);
                            //设置完点位后  需要刷新下点位的显示范围
                            gc._extent.update(item.longitude, item.latitude, item.longitude, item.latitude, new esri.SpatialReference({ wkid: t.grwkid }));
                            if (gc._extent._parts && gc._extent._parts[0]) {
                                gc._extent._parts[0].extent.update(item.longitude, item.latitude, item.longitude, item.latitude, new esri.SpatialReference({ wkid: t.grwkid }));
                            }
                            // gc._extent.update(new esri.geometry.Extent(item.longitude,item.latitude,item.longitude,item.latitude,{ wkid: t.grwkid }));
                            // gc._extent._parts[0].extent = gc._extent.centerAt(position);
                        }
                    }
                    //删除原有的label  下面从新加载
                    if (t.Label[item.id]) {
                        t.Label[item.id].html.remove();
                    }
                    //刷新点位
                    t.dealLabelGraphics(item.id, label);
                    //刷新缓存数据
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
            t.state.gis.graphics.refresh();
            t.moveAnimation();
        }
        //添加线

    }, {
        key: 'addLine',
        value: function addLine(mapLines, type) {
            var t = this;
            var lsids = [].concat(_toConsumableArray(t.state.lineIds));
            if (type && type !== 'defined') {
                lsids = [].concat(_toConsumableArray(t.state.drawIds[type]));
            }
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
                var linePath = new esri.geometry.Polyline({
                    paths: [[].concat(_toConsumableArray(item.paths))],
                    spatialReference: { wkid: t.grwkid }
                });
                //线类型
                var style = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                switch (cg.lineType) {
                    case 'solid':
                        style = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                        break;
                    case 'dashed':
                        style = esri.symbol.SimpleLineSymbol.STYLE_DASH;
                        break;
                }
                //处理颜色和透明度  使用rgba处理透明度
                var color = new esri.Color(cg.color);
                color.a = cg.pellucidity;
                //线类型对象
                var lineSymbol = new esri.symbol.SimpleLineSymbol(style, color, cg.lineWidth);
                //创建线对象
                var line = new esri.Graphic(linePath, lineSymbol, { id: item.id });
                //判断线显示和隐藏
                if (cg.isHidden) {
                    line.hide();
                } else {
                    line.show();
                }
                lsids.push(item.id);
                //添加线图元
                t.state.gis.graphics.add(line);
                //处理线缓存
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
                //添加绘制点
                if (type) {
                    t.setState({
                        drawIds: _extends({}, t.state.drawIds, _defineProperty({}, type, lsids))
                    });
                } else {
                    t.setState({
                        lineIds: lsids
                    });
                }
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
                //删除原来的点位
                gc.geometry.removePath(0);
                //添加新的点位
                gc.geometry.addPath([].concat(_toConsumableArray(item.paths)));

                var _t$dealData = t.dealData(item.paths),
                    _extent = _t$dealData._extent;
                //设置完点位后  需要刷新下点位的显示范围/


                gc._extent.update(_extent.longitude, _extent.latitude, _extent.longitude, _extent.latitude, new esri.SpatialReference({ wkid: t.grwkid }));
                // gc._extent.update(new esri.geometry.Extent(_extent.xmin,_extent.ymin,_extent.xmax,_extent.ymax,{ wkid: t.grwkid }));
                // gc._extent._parts[0].extent = {...gc._extent._parts[0].extent,..._extent};
                //处理颜色和透明度  使用rgba处理透明度
                var color = new esri.Color(cg.color);
                color.a = cg.pellucidity;
                gc.symbol.setColor(color);
                //设置线类型
                var style = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                switch (cg.lineType) {
                    case 'solid':
                        style = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                        break;
                    case 'dashed':
                        style = esri.symbol.SimpleLineSymbol.STYLE_DASH;
                        break;
                }
                gc.symbol.setStyle(style);
                //设置线宽
                gc.symbol.setWidth(cg.lineWidth);
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
            //刷新图元
            t.state.gis.graphics.refresh();
        }
        //添加面

    }, {
        key: 'addPolygon',
        value: function addPolygon(mapPolygons, type) {
            var t = this;
            var pgsids = [].concat(_toConsumableArray(t.state.polygonIds));
            if (type) {
                pgsids = [].concat(_toConsumableArray(t.state.drawIds[type]));
            }
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
                //处理面的点数据
                var polygonPath = esri.geometry.Polygon({
                    //添加最后一个点,使面闭合
                    rings: [[].concat(_toConsumableArray(item.rings), [item.rings[0]])],
                    spatialReference: { wkid: t.grwkid }
                });
                //线类型
                var lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                switch (cg.lineType) {
                    case 'solid':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                        break;
                    case 'dashed':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_DASH;
                        break;
                }
                //处理边框线颜色和透明度  使用rgba处理透明度
                var lineColor = new esri.Color(cg.lineColor);
                lineColor.a = cg.lineOpacity;
                //生成线类型对象
                var lineSymbol = new esri.symbol.SimpleLineSymbol(lineStyle, lineColor, cg.lineWidth);
                //创建面对象
                var polygonSymbol = new esri.symbol.SimpleFillSymbol();
                //添加边框线数据
                polygonSymbol.setOutline(lineSymbol);
                //处理填充颜色和透明度  使用rgba处理透明度
                var polygonColor = new esri.Color(cg.color);
                polygonColor.a = cg.pellucidity;
                polygonSymbol.setColor(polygonColor);
                //创建面对象
                var polygon = new esri.Graphic(polygonPath, polygonSymbol, { id: item.id });
                //添加面图元
                t.state.gis.graphics.add(polygon);
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
            //添加绘制点
            if (type) {
                t.setState({
                    drawIds: _extends({}, t.state.drawIds, _defineProperty({}, type, pgsids))
                });
            } else {
                t.setState({
                    polygonIds: pgsids
                });
            }
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
                } else {
                    console.error('\u66F4\u65B0\u7684\u591A\u8FB9\u5F62id\u4E0D\u5B58\u5728!');
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
                //删除原来的点位
                gc.geometry.removeRing(0);
                //添加新的点位
                gc.geometry.addRing([].concat(_toConsumableArray(item.rings), [item.rings[0]]));

                var _t$dealData2 = t.dealData(item.rings),
                    _extent = _t$dealData2._extent;
                //设置完点位后  需要刷新下点位的显示范围


                gc._extent.update(_extent.xmin, _extent.ymin, _extent.xmax, _extent.ymax, new esri.SpatialReference({ wkid: t.grwkid }));
                // gc._extent.update(new esri.geometry.Extent(_extent.xmin,_extent.ymin,_extent.xmax,_extent.ymax,{ wkid: t.grwkid }));
                // gc._extent._parts[0].extent = {...gc._extent._parts[0].extent,..._extent};

                //线类型
                var lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                switch (cg.lineType) {
                    case 'solid':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                        break;
                    case 'dashed':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_DASH;
                        break;
                }
                gc.symbol.outline.setStyle(lineStyle);
                //处理边框线颜色和透明度  使用rgba处理透明度
                var lineColor = new esri.Color(cg.lineColor);
                lineColor.a = cg.lineOpacity;
                gc.symbol.outline.setColor(lineColor);
                //设置线宽
                gc.symbol.outline.setWidth(cg.lineWidth);
                //处理填充颜色和透明度  使用rgba处理透明度
                var polygonColor = new esri.Color(cg.color);
                polygonColor.a = cg.pellucidity;
                gc.symbol.setColor(polygonColor);
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
            });
            //刷新图元
            t.state.gis.graphics.refresh();
        }
        //添加圆  circle

    }, {
        key: 'addCircle',
        value: function addCircle(mapCircles, type) {
            var t = this;
            var ccsids = [].concat(_toConsumableArray(t.state.circleIds));
            if (type) {
                ccsids = [].concat(_toConsumableArray(t.state.drawIds[type]));
            }
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
                var center = new esri.geometry.Point(parseFloat(item.longitude), parseFloat(item.latitude));
                //创建圆 位置对象
                var position = new esri.geometry.Circle({ center: center, radius: parseFloat(item.radius) });
                //线类型
                var lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                switch (cg.lineType) {
                    case 'solid':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                        break;
                    case 'dashed':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_DASH;
                        break;
                }
                //处理边框线颜色和透明度  使用rgba处理透明度
                var lineColor = new esri.Color(cg.lineColor);
                lineColor.a = cg.lineOpacity;
                //生成线类型对象
                var lineSymbol = new esri.symbol.SimpleLineSymbol(lineStyle, lineColor, parseFloat(cg.lineWidth));
                //创建面对象
                var circleSymbol = new esri.symbol.SimpleFillSymbol();
                //添加边框线数据
                circleSymbol.setOutline(lineSymbol);
                //处理填充颜色和透明度  使用rgba处理透明度
                var circleColor = new esri.Color(cg.color);
                circleColor.a = cg.pellucidity;
                circleSymbol.setColor(circleColor);
                //创建圆对象
                var circle = new esri.Graphic(position, circleSymbol, { id: item.id });
                //添加图元对象
                t.state.gis.graphics.add(circle);
                //缓存数据
                ccsids.push(item.id);
                t.GM.setGraphic(item.id, circle).setGraphicParam(item.id, {
                    attributes: _extends({}, item, { other: item }),
                    geometryType: 'circle',
                    geometry: {
                        type: 'circle',
                        x: parseFloat(item.longitude),
                        y: parseFloat(item.latitude),
                        radius: parseFloat(item.radius)
                    }
                });
            });
            //添加绘制点
            if (type) {
                t.setState({
                    drawIds: _extends({}, t.state.drawIds, _defineProperty({}, type, ccsids))
                });
            } else {
                t.setState({
                    circleIds: ccsids
                });
            }
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
                } else {
                    console.error('\u66F4\u65B0\u7684\u5706id\u4E0D\u5B58\u5728!');
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
                var center = new esri.geometry.Point(parseFloat(item.longitude), parseFloat(item.latitude));
                //创建圆 位置对象
                var position = new esri.geometry.Circle({ center: center, radius: parseFloat(item.radius) });
                //线类型
                var lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                switch (cg.lineType) {
                    case 'solid':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                        break;
                    case 'dashed':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_DASH;
                        break;
                }
                //处理边框线颜色和透明度  使用rgba处理透明度
                var lineColor = new esri.Color(cg.lineColor);
                lineColor.a = cg.lineOpacity;
                //生成线类型对象
                var lineSymbol = new esri.symbol.SimpleLineSymbol(lineStyle, lineColor, parseFloat(cg.lineWidth));
                //创建面对象
                var circleSymbol = new esri.symbol.SimpleFillSymbol();
                //添加边框线数据
                circleSymbol.setOutline(lineSymbol);
                //处理填充颜色和透明度  使用rgba处理透明度
                var circleColor = new esri.Color(cg.color);
                circleColor.a = cg.pellucidity;
                circleSymbol.setColor(circleColor);
                //更新位置
                gc.setGeometry(position);
                //更新样式
                gc.setSymbol(circleSymbol);
                t.GM.setGraphicParam(item.id, {
                    attributes: _extends({}, item, { other: item }),
                    geometryType: 'circle',
                    geometry: {
                        type: 'circle',
                        x: parseFloat(item.longitude),
                        y: parseFloat(item.latitude),
                        radius: parseFloat(item.radius)
                    }
                });
            });
            //刷新图元
            t.state.gis.graphics.refresh();
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
                    var p = new esri.geometry.Point(d.lng, d.lat);
                    p = t.state.gis.toScreen(p);
                    return [p.x, p.y];
                });
                var options = {
                    size: d.size,
                    shape: d.shape,
                    color: d.color,
                    width: t.state.gis.width,
                    height: t.state.gis.height,
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
                            var p = new esri.geometry.Point(d.lng, d.lat);
                            p = t.state.gis.toScreen(p);
                            return [p.x, p.y];
                        });
                        var options = {
                            size: ds.size,
                            shape: ds.shape,
                            color: ds.color,
                            width: t.state.gis.width,
                            height: t.state.gis.height
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
                t.heatmap = new GMapLib.HeatmapOverlay({
                    visible: cg.visible
                });
                t.heatmap.initialize(t.state.gis, t.props.mapId);
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
        /*事件处理*/
        //图元事件

    }, {
        key: 'clickGraphic',
        value: function clickGraphic(id, e) {
            var t = this;
            //编辑中的图元关闭其他事件返回
            if (t.editId == id) return false;
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
        /*地图事件*/
        //地图点击事件

    }, {
        key: 'clickMap',
        value: function clickMap(e) {
            var t = this;
            if (typeof t.props.clickMap === 'function') {
                var obj = t.getMapExtent();
                obj.e = e;
                obj.clickLngLat = {
                    lng: (e.mapPoint || {}).x,
                    lat: (e.mapPoint || {}).y
                };
                obj.pixel = {
                    x: (e.screenPoint || {}).x,
                    y: (e.screenPoint || {}).y
                };
                t.props.clickMap(obj);
            }
        }
        //地图拖动之前事件

    }, {
        key: 'dragMapStart',
        value: function dragMapStart(e) {
            var t = this;
            if (typeof t.props.dragMapStart === 'function') {
                var obj = t.getMapExtent();
                obj.e = e;
                t.props.dragMapStart(obj);
            }
        }
        //地图拖动结束后事件

    }, {
        key: 'dragMapEnd',
        value: function dragMapEnd(e) {
            var t = this;
            if (typeof t.props.dragMapEnd === 'function') {
                var obj = t.getMapExtent();
                obj.e = e;
                t.props.dragMapEnd(obj);
            }
        }
        //地图移动之前事件

    }, {
        key: 'moveStart',
        value: function moveStart(e) {
            var t = this;
            if (typeof t.props.moveStart === 'function') {
                var obj = t.getMapExtent();
                obj.e = e;
                t.props.moveStart(obj);
            }
        }
        //地图移动结束后事件

    }, {
        key: 'moveEnd',
        value: function moveEnd(e) {
            var t = this;
            if (typeof t.props.moveEnd === 'function') {
                var obj = t.getMapExtent();
                obj.e = e;
                t.props.moveEnd(obj);
            }
        }
        //地图更改缩放级别开始时触发触发此事件

    }, {
        key: 'zoomStart',
        value: function zoomStart(e) {
            var t = this;
            if (typeof t.props.zoomStart === 'function') {
                var obj = t.getMapExtent();
                obj.e = e;
                t.props.zoomStart(obj);
            }
        }
        //地图更改缩放级别结束时触发触发此事件

    }, {
        key: 'zoomEnd',
        value: function zoomEnd(e) {
            var t = this;
            if (typeof t.props.zoomEnd === 'function') {
                var obj = t.getMapExtent();
                obj.e = e;
                t.props.zoomEnd(obj);
            }
        }
        /*set方法*/
        //设置地图中心位置 lng/经度  lat/纬度

    }, {
        key: 'setCenter',
        value: function setCenter(gt) {
            var t = this;
            if (gt) {
                //经纬度 必须存在 否则不操作
                if (!gt[0] || !gt[1]) {
                    return false;
                }
                //如果设置的经纬度 与当前中心点一样 不操作
                var c = t.getCenter();
                if (c.lng == gt[0] && c.lat == gt[1]) {
                    return false;
                }
                t.state.gis.centerAt(new esri.geometry.Point(gt[0], gt[1], new esri.SpatialReference(_defineProperty({}, t.wkidStr, t.wkid))));
            }
        }
        //设置地图比例尺

    }, {
        key: 'setZoomLevel',
        value: function setZoomLevel(zoom) {
            var t = this;
            var z = t.state.gis.getZoom();
            if (z == zoom) {
                return false;
            }
            t.state.gis.setZoom(parseInt(zoom));
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
            var ary = []; //图元id集合
            var obj = []; //经纬度集合
            if (typeof arg === 'string') {
                ary = arg.split(',');
            } else if (arg instanceof Array) {
                ary = arg;
            }
            if (ary[0] instanceof Array) {
                obj = [].concat(_toConsumableArray(obj), _toConsumableArray(ary));
            } else {
                for (var i = 0; i < ary.length; i++) {
                    var g = t.GM.getGraphicParam(ary[i]);
                    switch (g.geometry.type) {
                        case 'point':
                        case 'circle':
                            obj.push([g.geometry.x, g.geometry.y]);
                            break;
                        case 'polyline':
                            obj = [].concat(_toConsumableArray(obj), _toConsumableArray(g.geometry.paths));
                            break;
                        case 'polygon':
                            obj = [].concat(_toConsumableArray(obj), _toConsumableArray(g.geometry.rings));
                            break;
                    }
                }
            }

            var _t$dealData3 = t.dealData(obj),
                _extent = _t$dealData3._extent;

            if (_extent.xmin && _extent.xmax && _extent.ymin && _extent.ymax) {
                //避免偏移引起的点位漏看
                _extent = t.dealExtendBounds(_extent, 100);
                var ext = new esri.geometry.Extent(_extends({}, _extent, { spatialReference: _defineProperty({}, t.wkidStr, t.wkid) }));
                if (!type || type == 'all' || type == 'zoom') {
                    t.state.gis.setExtent(ext);
                } else if (type == 'center') {
                    t.state.gis.centerAt(ext.getCenter());
                }
            }
        }
        /*get方法*/
        //获取当前地图的中心位置

    }, {
        key: 'getCurrentCenter',
        value: function getCurrentCenter() {
            var t = this;
            var extent = t.state.gis.geographicExtent;
            return [(extent.xmax + extent.xmin) / 2, (extent.ymax + extent.ymin) / 2];
        }
        //获取当前比例尺

    }, {
        key: 'getZoomLevel',
        value: function getZoomLevel() {
            var t = this;
            return t.state.gis.getLevel();
        }
        //获取当前中心点

    }, {
        key: 'getCenter',
        value: function getCenter() {
            var t = this;
            var _t$state$gis$extent = t.state.gis.extent,
                xmin = _t$state$gis$extent.xmin,
                ymin = _t$state$gis$extent.ymin,
                xmax = _t$state$gis$extent.xmax,
                ymax = _t$state$gis$extent.ymax;

            return { lng: (xmin + xmax) / 2, lat: (ymin + ymax) / 2 };
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
                    lng = gg.geometry.x;
                    lat = gg.geometry.y;
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
                    pts = gg.geometry.paths[0];
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
                    pts = gg.geometry.rings[0];
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
                        }),
                        area: (0, _MapToolFunction.getPolygonArea)(pts)
                    });
                    break;
                case 'circle':
                    lng = gg.geometry.center.x;
                    lat = gg.geometry.center.y;
                    var radius = 0;
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
                        }),
                        area: Math.PI * radius * radius
                    });
                    break;
            }
            return p;
        }
        //获取地图当前的位置状态信息

    }, {
        key: 'getMapExtent',
        value: function getMapExtent() {
            var t = this;
            var nowBounds = t.state.gis._getAvailExtent();
            var obj = {};
            obj.southWest = {
                lng: nowBounds.xmin,
                lat: nowBounds.ymin
            };
            obj.northEast = {
                lng: nowBounds.xmax,
                lat: nowBounds.ymax
            };
            obj.nowCenter = t.getCenter();
            obj.zoom = t.getZoomLevel();
            obj.mapSize = { width: t.state.gis.width, height: t.state.gis.height };
            obj.radius = t.calculatePointsDistance([obj.nowCenter.lng, obj.nowCenter.lat], [obj.northEast.lng, obj.northEast.lat]);
            return obj;
        }
        /*工具方法*/

    }, {
        key: 'vtxRangingTool',
        value: function vtxRangingTool(mapRangingTool) {
            var t = this;
            //关闭测距时双击地图缩放功能
            t.state.gis.disableDoubleClickZoom();
            //开启测距状态
            if (!t.rangingTool.isRanging) {
                t.rangingTool.isRanging = true;
            }
            //初始测距回调
            if (!t.rangingTool.mapRangingTool) {
                t.rangingTool.mapRangingTool = mapRangingTool;
            }
        }
        /*功能方法*/
        //单个删除图元

    }, {
        key: 'removeGraphic',
        value: function removeGraphic(id, type) {
            var t = this;
            var graphic = t.GM.getGraphic(id);
            //刪除label
            if (t.Label[id]) {
                t.Label[id].html.remove();
                delete t.Label[id];
            }
            if (!!graphic) {
                //清除聚合点 避免异常
                // t._cluster.removeMarker(this.GM.getGraphic(id));
                //清除地图中图元
                t.state.gis.graphics.remove(graphic);
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
        //清空地图

    }, {
        key: 'clearAll',
        value: function clearAll() {
            var t = this;
            //清空热力图
            if (t.heatmap) {
                t.heatmap.clear();
            }
            t.heatmap = null;
            t.movePoints = [];
            t.clearAllPointCollection();
            //循环所有id删除
            var _t$state2 = t.state,
                pointIds = _t$state2.pointIds,
                lineIds = _t$state2.lineIds,
                polygonIds = _t$state2.polygonIds,
                circleIds = _t$state2.circleIds,
                drawIds = _t$state2.drawIds;
            //拷贝数组,避免原数组操作,影响循环

            var ps = [].concat(_toConsumableArray(pointIds)),
                ls = [].concat(_toConsumableArray(lineIds)),
                pgs = [].concat(_toConsumableArray(polygonIds)),
                cs = [].concat(_toConsumableArray(circleIds));
            // 删除点
            for (var i = 0; i < ps.length; i++) {
                t.removeGraphic(ps[i], 'point');
            }
            // 删除线
            for (var _i3 = 0; _i3 < ls.length; _i3++) {
                t.removeGraphic(ls[_i3], 'line');
            }
            // 删除面
            for (var _i4 = 0; _i4 < pgs.length; _i4++) {
                t.removeGraphic(pgs[_i4], 'polygon');
            }
            // 删除圆
            for (var _i5 = 0; _i5 < cs.length; _i5++) {
                t.removeGraphic(cs[_i5], 'circle');
            }
            //删除绘制的点
            var point = drawIds.point,
                polyline = drawIds.polyline,
                polygon = drawIds.polygon,
                circle = drawIds.circle,
                rectangle = drawIds.rectangle;

            for (var _i6 = 0; _i6 < point.length; _i6++) {
                t.removeGraphic(point[_i6]);
            }
            for (var _i7 = 0; _i7 < polyline.length; _i7++) {
                t.removeGraphic(polyline[_i7]);
            }
            for (var _i8 = 0; _i8 < polygon.length; _i8++) {
                t.removeGraphic(polygon[_i8]);
            }
            for (var _i9 = 0; _i9 < circle.length; _i9++) {
                t.removeGraphic(circle[_i9]);
            }
            for (var _i10 = 0; _i10 < rectangle.length; _i10++) {
                t.removeGraphic(rectangle[_i10]);
            }
        }
        //展示比例尺

    }, {
        key: 'showControl',
        value: function showControl() {
            var t = this,
                type = '',
                location = { top: 20, left: 20 },
                ls = { top: 20, left: 60 },
                w = t.state.gis.width,
                h = t.state.gis.height;
            switch (t.props.showControl.location) {
                case 'tl':
                    location = { top: 20, left: 20 };
                    ls = { top: 20, left: 70 };
                    if (!t.props.showControl.type) {
                        ls = { top: 20, left: 20 };
                    }
                    break;
                case 'bl':
                    location = { top: h - 83, left: 20 };
                    ls = { top: h - 50, left: 70 };
                    if (!t.props.showControl.type) {
                        ls = { top: h - 50, left: 20 };
                    }
                    break;
                case 'tr':
                    location = { top: 20, left: w - 52 };
                    ls = { top: 20, left: w - 152 };
                    if (!t.props.showControl.type) {
                        ls = { top: 20, left: w - 93 };
                    }
                    break;
                case 'br':
                    location = { top: h - 83, left: w - 52 };
                    ls = { top: h - 50, left: w - 152 };
                    if (!t.props.showControl.type) {
                        ls = { top: h - 50, left: w - 93 };
                    }
                    break;
            }
            if (!$('#' + t.props.mapId + '_zoom_slider_show')[0]) {
                var getScale = t.state.gis.getScale() * 0.025399998 / 96;
                //分母系数
                var coefficient = Math.pow(10, Math.floor(getScale).toString().length - 1);
                //判断系数 , 总长度值
                var gs = getScale / coefficient,
                    toldis = 1,
                    isCent = false;
                if (gs < 1) {
                    isCent = true;
                    gs *= 10;
                }
                //计算比例尺数值和长度
                if (gs >= 5) {
                    toldis = 5 * coefficient * 100;
                } else if (gs >= 2) {
                    toldis = 2 * coefficient * 100;
                } else {
                    toldis = 1 * coefficient * 100;
                }
                var scaleW = toldis / getScale;
                if (isCent) {
                    scaleW /= 10;
                    toldis /= 10;
                }
                //宽度矫正处理
                if (scaleW < 50) {
                    toldis *= 1.5;
                    scaleW = toldis / getScale;
                }
                //处理比例尺值显示
                toldis = toldis >= 1000 ? Math.round(toldis / 1000) + '\u516C\u91CC' : toldis + '\u7C73';
                var sliderShow = '\n                <div id=\'' + t.props.mapId + '_zoom_slider_show\' \n                    style=\'position:absolute;z-index:100;width:' + (scaleW - 2) + 'px;\'\n                >\n                    <div class=\'zoom_slider_show_scale\'>' + toldis + '</div>\n                    <div class=\'zoom_slider_show_bottom\'></div>\n                </div>\n           ';
                $('#' + t.props.mapId + '_root').append(sliderShow);
            }
            switch (t.props.showControl.type) {
                case 'all':
                case 'small':
                case 'pan':
                case 'zoom':
                    $('#' + t.props.mapId + '_zoom_slider').css(_extends({}, location, {
                        display: 'block'
                    }));
                default:
                    $('#' + t.props.mapId + '_zoom_slider_show').css(_extends({}, ls));
                    break;
            }
        }
        //编辑图元

    }, {
        key: 'doEdit',
        value: function doEdit(id) {
            var t = this;
            if (!t.editToolbar) {
                t.editToolbar = new esri.toolbars.Edit(t.state.gis);
                t.editToolbarC = new esri.toolbars.Edit(t.state.gis);
                var changeLabel = function changeLabel(point, eid, gcparam) {
                    var label = '',
                        cg = gcparam.attributes.config;
                    //判断是不是html点
                    if (!!gcparam.attributes.markerContent) {
                        label = {
                            html: t.Label[eid].html,
                            offset: {
                                x: cg.markerContentX || 100,
                                y: cg.markerContentY || 30
                            },
                            position: point
                        };
                    } else {
                        //判断是否有label
                        if (gcparam.attributes.canShowLabel && cg.labelContent) {
                            label = {
                                html: t.Label[eid].html,
                                //offset 需要处理 图片点位的位置(将点位偏移和宽度加入计算)
                                offset: {
                                    x: (cg.labelPixelX || 0) + ((cg.markerContentX || -15) + (cg.width || 30) / 2),
                                    y: (cg.labelPixelY || 34) + (cg.markerContentY || -15)
                                },
                                position: point
                            };
                        }
                    }
                    if (label) {
                        t.dealLabelGraphics(eid, label);
                    }
                };
                /*点位编辑事件*/
                //编辑关闭事件
                t.editToolbar.on('deactivate', function (e) {
                    var eid = e.graphic.attributes.id;
                    var gcparam = t.GM.getGraphicParam(eid);
                    //关闭label移动限制开关
                    t.canMoveLabel = false;
                    t.mouseNowPosition.isCount = false;
                    if ('editGraphicChange' in t.props && typeof t.props.editGraphicChange == 'function') {
                        var obj = {};
                        if (eid == 'vtx-circleMove') {
                            var param = t.getGraphic(t.editId);
                            obj = {
                                area: Math.PI * Math.pow(t.GM.getGraphic(t.editId).geometry.radius, 2),
                                e: t.GM.getGraphic(t.editId),
                                param: param,
                                id: t.editId,
                                geometry: t.GM.getGraphic(t.editId).geometry
                            };
                        } else {
                            var _param = t.getGraphic(eid);
                            obj = {
                                e: e.graphic, param: _param,
                                id: eid,
                                geometry: e.graphic.geometry
                            };
                            switch (obj.geometry.type) {
                                case 'polyline':
                                    obj.geometry = _extends({}, obj.geometry, {
                                        paths: obj.geometry.paths[0]
                                    });
                                    obj.distance = t.calculateDistance(obj.geometry.paths);
                                    break;
                                case 'polygon':
                                    obj.geometry = _extends({}, obj.geometry, {
                                        rings: obj.geometry.rings[0]
                                    });
                                    obj.area = (0, _MapToolFunction.getPolygonArea)(obj.geometry.rings);
                                    break;
                            }
                        }
                        t.props.editGraphicChange(obj);
                    }
                    if (eid == 'vtx-circleMove') {
                        t.removeGraphic('vtx-circleMove', 'point');
                        t.removeGraphic('vtx-circleRadius', 'point');
                        if (t.zIndexGraphics.indexOf('vtx-circleMove') > -1) {
                            t.zIndexGraphics.splice(t.zIndexGraphics.indexOf('vtx-circleMove'), 1);
                        }
                        if (t.zIndexGraphics.indexOf('vtx-circleRadius') > -1) {
                            t.zIndexGraphics.splice(t.zIndexGraphics.indexOf('vtx-circleRadius'), 1);
                        }
                    }
                    if (t.zIndexGraphics.indexOf(eid) > -1) {
                        t.zIndexGraphics.splice(t.zIndexGraphics.indexOf(eid), 1);
                    }
                    t.editId = '';
                });
                //移动开始事件 开启开关
                t.editToolbar.on('graphic-move-start', function (e) {
                    //label可以跟着点位移动,避免label直接跟着鼠标移动
                    t.canMoveLabel = true;
                });
                //移动中事件
                t.editToolbar.on('graphic-move', function (e) {
                    //计算鼠标点 与中心点的偏移值
                    if (!t.mouseNowPosition.isCount) {
                        t.mouseNowPosition.isCount = true;
                        t.mouseNowPosition.px = t.mouseNowPosition.x - e.graphic.geometry.x;
                        t.mouseNowPosition.py = t.mouseNowPosition.y - e.graphic.geometry.y;
                    }
                    var eid = e.graphic.attributes.id,
                        position = new esri.geometry.Point({
                        longitude: t.mouseNowPosition.x - t.mouseNowPosition.px,
                        latitude: t.mouseNowPosition.y - t.mouseNowPosition.py,
                        spatialReference: { wkid: t.grwkid }
                    });
                    //圆中心点的移动
                    if (eid == 'vtx-circleMove') {
                        t.GM.getGraphic('vtx-circleMove').setGeometry(position);
                        var circleCenter = new esri.geometry.Circle({
                            center: position,
                            radius: t.GM.getGraphic(t.editId).geometry.radius
                        });
                        t.GM.getGraphic(t.editId).setGeometry(circleCenter);
                        t.GM.getGraphic('vtx-circleRadius').setGeometry(new esri.geometry.Point({
                            longitude: t.mouseNowPosition.x - t.mouseNowPosition.px - t.circleEditPXY.px,
                            latitude: t.mouseNowPosition.y - t.mouseNowPosition.py - t.circleEditPXY.py,
                            spatialReference: { wkid: t.grwkid }
                        }));
                        t.state.gis.graphics.refresh();
                        return false;
                    }
                    var gcparam = t.GM.getGraphicParam(eid);
                    changeLabel(position, eid, gcparam);
                });
                //移动结束后事件
                t.editToolbar.on('graphic-move-stop', function (e) {
                    var eid = e.graphic.attributes.id;
                    var gcparam = t.GM.getGraphicParam(eid);
                    //关闭label移动限制开关
                    t.canMoveLabel = false;
                    t.mouseNowPosition.isCount = false;
                    //判断是不是点
                    if (gcparam.geometryType == 'point') {
                        changeLabel(e.graphic.geometry, eid, gcparam);
                    }
                    //圆中心点的移动
                    if (eid == 'vtx-circleMove') {
                        t.GM.getGraphic('vtx-circleMove').setGeometry(e.graphic.geometry);
                        var circleCenter = new esri.geometry.Circle({
                            center: e.graphic.geometry,
                            radius: t.GM.getGraphic(t.editId).geometry.radius
                        });
                        t.GM.getGraphic(t.editId).setGeometry(circleCenter);
                        t.GM.getGraphic('vtx-circleRadius').setGeometry(new esri.geometry.Point({
                            longitude: e.graphic.geometry.x - t.circleEditPXY.px,
                            latitude: e.graphic.geometry.y - t.circleEditPXY.py,
                            spatialReference: { wkid: t.grwkid }
                        }));
                        t.state.gis.graphics.refresh();
                        if ('editGraphicChange' in t.props && typeof t.props.editGraphicChange == 'function') {
                            var param = t.getGraphic(t.editId);
                            t.props.editGraphicChange({
                                area: Math.PI * Math.pow(t.GM.getGraphic(t.editId).geometry.radius, 2),
                                e: t.GM.getGraphic(t.editId),
                                param: param,
                                id: t.editId,
                                geometry: t.GM.getGraphic(t.editId).geometry
                            });
                        }
                        return false;
                    }
                    if ('editGraphicChange' in t.props && typeof t.props.editGraphicChange == 'function') {
                        var _param2 = t.getGraphic(eid);
                        t.props.editGraphicChange({
                            e: e.graphic, param: _param2,
                            id: eid,
                            geometry: e.graphic.geometry
                        });
                    }
                });
                //多折线 多边形  圆事件处理
                t.editToolbar.on('vertex-move-stop', function (e) {
                    var eid = e.graphic.attributes.id;
                    var gcparam = t.GM.getGraphicParam(eid);
                    if ('editGraphicChange' in t.props && typeof t.props.editGraphicChange == 'function') {
                        var param = t.getGraphic(eid);
                        var obj = {
                            e: e.graphic, param: param,
                            id: eid,
                            geometry: e.graphic.geometry
                        };
                        switch (obj.geometry.type) {
                            case 'polyline':
                                obj.geometry = _extends({}, obj.geometry, {
                                    paths: obj.geometry.paths[0]
                                });
                                obj.distance = t.calculateDistance(obj.geometry.paths);
                                break;
                            case 'polygon':
                                obj.geometry = _extends({}, obj.geometry, {
                                    rings: obj.geometry.rings[0]
                                });
                                obj.area = (0, _MapToolFunction.getPolygonArea)(obj.geometry.rings);
                                break;
                        }
                        t.props.editGraphicChange(obj);
                    }
                });
                //移动开始事件 开启开关 [圆半径]
                t.editToolbarC.on('graphic-move-start', function (e) {
                    //label可以跟着点位移动,避免label直接跟着鼠标移动
                    t.canMoveLabel = true;
                });
                //移动中事件 [圆半径]
                t.editToolbarC.on('graphic-move', function (e) {
                    //计算鼠标点 与中心点的偏移值
                    if (!t.mouseNowPosition.isCount) {
                        t.mouseNowPosition.isCount = true;
                        t.mouseNowPosition.px = t.mouseNowPosition.x - e.graphic.geometry.x;
                        t.mouseNowPosition.py = t.mouseNowPosition.y - e.graphic.geometry.y;
                    }
                    var cgc = t.GM.getGraphic(t.editId),
                        eid = e.graphic.attributes.id,
                        position = new esri.geometry.Point({
                        longitude: t.mouseNowPosition.x - t.mouseNowPosition.px,
                        latitude: t.mouseNowPosition.y - t.mouseNowPosition.py,
                        spatialReference: { wkid: t.grwkid }
                    }),
                        radius = t.calculatePointsDistance([cgc.geometry.center.x, cgc.geometry.center.y], [t.mouseNowPosition.x - t.mouseNowPosition.px, t.mouseNowPosition.y - t.mouseNowPosition.py]);
                    t.circleEditPXY = {
                        px: cgc.geometry.center.x - (t.mouseNowPosition.x - t.mouseNowPosition.px),
                        py: cgc.geometry.center.y - (t.mouseNowPosition.y - t.mouseNowPosition.py)
                    };
                    cgc.setGeometry(new esri.geometry.Circle({
                        center: new esri.geometry.Point(cgc.geometry.center.x, cgc.geometry.center.y),
                        radius: radius
                    }));
                    t.GM.getGraphic('vtx-circleRadius').setGeometry(position);
                    t.state.gis.graphics.refresh();
                });
                //移动结束后事件 [圆半径]
                t.editToolbarC.on('graphic-move-stop', function (e) {
                    t.canMoveLabel = false;
                    t.mouseNowPosition.isCount = false;
                    var cgc = t.GM.getGraphic(t.editId),
                        eid = e.graphic.attributes.id,
                        position = new esri.geometry.Point({
                        longitude: t.mouseNowPosition.x - t.mouseNowPosition.px,
                        latitude: t.mouseNowPosition.y - t.mouseNowPosition.py,
                        spatialReference: { wkid: t.grwkid }
                    }),
                        radius = t.calculatePointsDistance([cgc.geometry.center.x, cgc.geometry.center.y], [t.mouseNowPosition.x - t.mouseNowPosition.px, t.mouseNowPosition.y - t.mouseNowPosition.py]);
                    t.circleEditPXY = {
                        px: cgc.geometry.center.x - (t.mouseNowPosition.x - t.mouseNowPosition.px),
                        py: cgc.geometry.center.y - (t.mouseNowPosition.y - t.mouseNowPosition.py)
                    };
                    cgc.setGeometry(new esri.geometry.Circle({
                        center: new esri.geometry.Point(cgc.geometry.center.x, cgc.geometry.center.y),
                        radius: radius
                    }));
                    t.GM.getGraphic('vtx-circleRadius').setGeometry(position);
                    t.state.gis.graphics.refresh();
                    if ('editGraphicChange' in t.props && typeof t.props.editGraphicChange == 'function') {
                        var param = t.getGraphic(t.editId);
                        t.props.editGraphicChange({
                            area: Math.PI * Math.pow(t.GM.getGraphic(t.editId).geometry.radius, 2),
                            e: t.GM.getGraphic(t.editId),
                            param: param,
                            id: t.editId,
                            geometry: t.GM.getGraphic(t.editId).geometry
                        });
                    }
                });
            }
            //取消上一次的编辑
            if (t.editId) {
                t.editToolbar.deactivate();
                t.editToolbarC.deactivate();
            }
            //获取图元对象
            var gc = t.GM.getGraphic(id);
            var gp = t.GM.getGraphicParam(id);
            if (!gc) return;
            switch (gp.geometryType) {
                case 'point':
                    //将编辑的图元放在最上面
                    t.czIndex(id);
                    if (t.zIndexGraphics.indexOf(id) == -1) {
                        t.zIndexGraphics.push(id);
                    }
                    t.editToolbar.activate(esri.toolbars.Edit.MOVE, gc);
                    break;
                case 'polyline':
                case 'polygon':
                    t.editToolbar.activate(esri.toolbars.Edit.EDIT_VERTICES, gc);
                    break;
                case 'circle':
                    // 移动圆的中心点   和  移动圆的半径点
                    t.addPoint([{
                        id: 'vtx-circleMove',
                        longitude: gc.geometry.center.x,
                        latitude: gc.geometry.center.y,
                        url: 'http://api0.map.bdimg.com/images/node.gif',
                        config: {
                            width: 11,
                            height: 11,
                            markerContentY: -5.5,
                            markerContentX: -5.5
                        }
                    }, {
                        id: 'vtx-circleRadius',
                        longitude: gc.geometry.rings[0][0][0],
                        latitude: gc.geometry.rings[0][0][1],
                        url: 'http://api0.map.bdimg.com/images/node.gif',
                        config: {
                            width: 11,
                            height: 11,
                            markerContentY: -5.5,
                            markerContentX: -5.5
                        }
                    }]);
                    t.circleEditPXY = {
                        px: gc.geometry.center.x - gc.geometry.rings[0][0][0],
                        py: gc.geometry.center.y - gc.geometry.rings[0][0][1]
                    };
                    t.czIndex('vtx-circleMove');
                    t.czIndex('vtx-circleRadius');
                    if (t.zIndexGraphics.indexOf('vtx-circleMove') == -1) {
                        t.zIndexGraphics.push('vtx-circleMove');
                    }
                    if (t.zIndexGraphics.indexOf('vtx-circleRadius') == -1) {
                        t.zIndexGraphics.push('vtx-circleRadius');
                    }
                    t.editToolbar.activate(esri.toolbars.Edit.MOVE, t.GM.getGraphic('vtx-circleMove'));
                    t.editToolbarC.activate(esri.toolbars.Edit.MOVE, t.GM.getGraphic('vtx-circleRadius'));
                    break;
            }
            //开启点编辑功能
            t.editId = id;
        }
        //关闭编辑

    }, {
        key: 'endEdit',
        value: function endEdit() {
            var t = this;
            t.editToolbar.deactivate();
            //单独为了圆的
            t.editToolbarC.deactivate();
        }
        //绘制图元

    }, {
        key: 'draw',
        value: function draw(obj) {
            var t = this;
            if (!t.drawToolbar) {
                t.drawToolbar = new esri.toolbars.Draw(t.state.gis, {
                    drawTime: 90,
                    showTooltips: false
                });
                t.drawToolbar.on('draw-complete', function (e) {
                    //关闭绘制事件
                    t.closeDraw();
                    //返回参数
                    var param = {};
                    // 绘制内部管理的图元
                    if (t.drawParam.geometryType == 'point') {
                        t.addPoint([{
                            id: t.drawParam.data.id,
                            longitude: e.geometry.x,
                            latitude: e.geometry.y,
                            url: t.drawParam.parameter.url || _default2.default.mapServerURL + '/images/defaultMarker.png',
                            config: _extends({}, t.drawParam.parameter)
                        }], 'point');
                        //处理点返回参数
                        param = {
                            id: t.drawParam.data.id,
                            attributes: {
                                id: t.drawParam.data.id,
                                url: t.drawParam.parameter.url || _default2.default.mapServerURL + '/images/defaultMarker.png',
                                config: {
                                    width: t.drawParam.parameter.width || 30,
                                    height: t.drawParam.parameter.height || 30
                                }
                            },
                            geometry: e.geometry,
                            geometryType: 'point',
                            mapLayer: t.GM.getGraphic(t.drawParam.data.id)
                        };
                    }
                    //线
                    if (t.drawParam.geometryType == 'polyline') {
                        t.addLine([{
                            id: t.drawParam.data.id,
                            paths: e.geometry.paths[0],
                            config: _extends({}, t.drawParam.parameter)
                        }], 'polyline');
                        //处理线返回参数

                        var _t$dealData4 = t.dealData(e.geometry.paths[0]),
                            lnglatAry = _t$dealData4.lnglatAry,
                            _extent = _t$dealData4._extent;

                        param = {
                            lnglatAry: lnglatAry,
                            id: t.drawParam.data.id,
                            geometry: _extends({}, e.geometry, {
                                paths: e.geometry.paths[0],
                                _extent: _extent
                            }),
                            attributes: {
                                id: t.drawParam.data.id,
                                config: _extends({}, t.drawParam.parameter)
                            },
                            distance: t.calculateDistance(e.geometry.paths[0]),
                            geometryType: 'polyline',
                            mapLayer: t.GM.getGraphic(t.drawParam.data.id)
                        };
                    }
                    if (t.drawParam.geometryType == 'polygon' || t.drawParam.geometryType == 'rectangle') {
                        var rs = [].concat(_toConsumableArray(e.geometry.rings[0]));
                        rs.pop();
                        t.addPolygon([{
                            id: t.drawParam.data.id,
                            rings: rs,
                            config: _extends({}, t.drawParam.parameter)
                        }], t.drawParam.geometryType);
                        //处理面返回参数

                        var _t$dealData5 = t.dealData(e.geometry.rings[0]),
                            _lnglatAry = _t$dealData5.lnglatAry,
                            _extent2 = _t$dealData5._extent;

                        param = {
                            lnglatAry: _lnglatAry,
                            id: t.drawParam.data.id,
                            geometry: _extends({}, e.geometry, {
                                rings: e.geometry.rings[0],
                                type: t.drawParam.geometryType,
                                _extent: _extent2
                            }),
                            attributes: {
                                id: t.drawParam.data.id,
                                config: _extends({}, t.drawParam.parameter)
                            },
                            area: (0, _MapToolFunction.getPolygonArea)(e.geometry.rings[0]),
                            geometryType: t.drawParam.geometryType,
                            mapLayer: t.GM.getGraphic(t.drawParam.data.id)
                        };
                    }
                    if (t.drawParam.geometryType == 'circle') {
                        if (e.geometry._extent) {
                            var radius = (0, _MapToolFunction.getDistance)([e.geometry._extent.xmin, e.geometry._extent.ymin], [e.geometry._extent.xmax, e.geometry._extent.ymax], t.state.gis, t.grwkid) / 2;
                            radius = Math.sqrt(Math.pow(radius, 2) * 2) / 2;
                            t.addCircle([{
                                id: t.drawParam.data.id,
                                longitude: (e.geometry._extent.xmin + e.geometry._extent.xmax) / 2,
                                latitude: (e.geometry._extent.ymin + e.geometry._extent.ymax) / 2,
                                radius: radius,
                                config: _extends({}, t.drawParam.parameter)
                            }], t.drawParam.geometryType);
                            param = {
                                area: Math.PI * Math.pow(radius, 2),
                                attributes: {
                                    id: t.drawParam.data.id,
                                    config: _extends({}, t.drawParam.parameter)
                                },
                                geometry: {
                                    type: t.drawParam.geometryType,
                                    x: (e.geometry._extent.xmin + e.geometry._extent.xmax) / 2,
                                    y: (e.geometry._extent.ymin + e.geometry._extent.ymax) / 2,
                                    radius: radius
                                },
                                geometryType: t.drawParam.geometryType,
                                mapLayer: t.GM.getGraphic(t.drawParam.data.id)
                            };
                        }
                    }
                    // t.GM.setGraphicParam(t.drawParam.data.id,param);
                    //绘制返回
                    if ('drawEnd' in t.props && typeof t.props.drawEnd == 'function') {
                        t.props.drawEnd(param);
                    }
                });
            }
            //避免连点
            t.closeDraw();
            $('#' + t.props.mapId + '_container').css({
                cursor: 'crosshair'
            });
            var drawParam = {};
            //初始化参数
            drawParam.geometryType = obj.geometryType || 'point';
            drawParam.parameter = obj.parameter ? _extends({}, obj.parameter) : {};
            drawParam.data = obj.data ? _extends({}, obj.data) : {};
            drawParam.data.id = (obj.data || {}).id || 'draw' + new Date().getTime();
            //缓存 绘制的数据
            t.drawParam = drawParam;
            //判断id是否存在
            var len = t.state.drawIds[drawParam.geometryType].indexOf(drawParam.data.id);
            if (len > -1) {
                //如果id存在 删除存在的图元,清除drawId中的id数据
                t.removeGraphic(drawParam.data.id);
                t.state.drawIds[drawParam.geometryType].splice(len, 1);
            }
            var lineSymbol = null,
                fillSymbol = null;
            if (drawParam.geometryType !== 'point') {
                //线类型
                var lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                switch (drawParam.parameter.lineType) {
                    case 'solid':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                        break;
                    case 'dashed':
                        lineStyle = esri.symbol.SimpleLineSymbol.STYLE_DASH;
                        break;
                }
                //处理边框线颜色和透明度  使用rgba处理透明度
                var lineColor = null;
                //线和面圆的线透明参数不同
                if (drawParam.geometryType == 'polyline') {
                    lineColor = new esri.Color(drawParam.parameter.color);
                    lineColor.a = drawParam.parameter.pellucidity;
                } else {
                    lineColor = new esri.Color(drawParam.parameter.lineColor);
                    lineColor.a = drawParam.parameter.lineOpacity;
                }
                //生成线类型对象
                lineSymbol = new esri.symbol.SimpleLineSymbol(lineStyle, lineColor, drawParam.parameter.lineWidth);
            } else {
                //点的样式
                var markerSymbol = new esri.symbol.PictureMarkerSymbol(drawParam.parameter.url || _default2.default.mapServerURL + '/images/defaultMarker.png', drawParam.parameter.width || 30, drawParam.parameter.height || 30);
                //设置点偏移
                markerSymbol.setOffset((drawParam.parameter.markerContentX || -15) + (drawParam.parameter.width || 30) / 2, -((drawParam.parameter.markerContentY || -15) + (drawParam.parameter.height || 30) / 2));
                t.drawToolbar.setMarkerSymbol(markerSymbol);
            }
            //处理面 矩形 圆的样式
            if (drawParam.geometryType == 'polygon' || drawParam.geometryType == 'circle' || drawParam.geometryType == 'rectangle') {
                //创建面对象
                fillSymbol = new esri.symbol.SimpleFillSymbol();
                //添加边框线数据
                fillSymbol.setOutline(lineSymbol);
                //处理填充颜色和透明度  使用rgba处理透明度
                var dColor = new esri.Color(drawParam.parameter.color);
                dColor.a = drawParam.parameter.pellucidity;
                fillSymbol.setColor(dColor);
                //添加线的样式
                t.drawToolbar.setFillSymbol(fillSymbol);
                t.drawToolbar.setRespectDrawingVertexOrder(true);
            }
            //重新设置绘制类型和数据
            var geometryType = esri.toolbars.Draw.POINT;
            switch (drawParam.geometryType) {
                case 'point':
                    geometryType = esri.toolbars.Draw.POINT;

                    break;
                case 'polyline':
                    geometryType = esri.toolbars.Draw.POLYLINE;
                    //添加线的样式
                    t.drawToolbar.setLineSymbol(lineSymbol);
                    break;
                case 'polygon':
                    geometryType = esri.toolbars.Draw.POLYGON;
                    break;
                case 'circle':
                    geometryType = esri.toolbars.Draw.CIRCLE;
                    break;
                case 'rectangle':
                    geometryType = esri.toolbars.Draw.RECTANGLE;
                    break;
            }
            t.drawToolbar.activate(geometryType);
        }
        //关闭绘制

    }, {
        key: 'closeDraw',
        value: function closeDraw() {
            var t = this;
            if (t.drawToolbar) {
                $('#' + t.props.mapId + '_container').css({
                    cursor: 'default'
                });
                //先关闭上次绘制的事件
                t.drawToolbar.finishDrawing();
                //销毁上次绘制的类型设定
                t.drawToolbar.deactivate();
            }
        }
        //点聚合

    }, {
        key: 'cluster',
        value: function cluster(ids) {
            var t = this;
            //获取聚合点id  空则是全部点位
            t.clusterMarkers = t.clusterToolFunction(ids);
            //处理聚合点逻辑
            t.dealClusterPoint();
        }
        //处理聚合点逻辑

    }, {
        key: 'dealClusterPoint',
        value: function dealClusterPoint() {
            var t = this;
            //当前窗口信息
            var ext = t.dealExtendBounds(t.state.gis.extent);
            t.clusterPs = [];
            //清除原来聚合点
            for (var i = 0; i < t.clusterPt.length; i++) {
                t.state.gis.graphics.remove(t.clusterPt[i].graphic);
                t.state.gis.graphics.remove(t.clusterPt[i].graphicText);
            }
            for (var _i11 = 0; _i11 < t.clusterMarkers.length; _i11++) {
                t.clusterMarkers[_i11].isCluster = false;
            }
            //处理后的聚合点位数据
            for (var _i12 = 0; _i12 < t.clusterMarkers.length; _i12++) {
                var gc = t.clusterMarkers[_i12].marker,
                    distance = 4000000,
                    newCluster = null;
                //过滤不是点的图元id
                if (gc.geometry.type !== 'point') {
                    console.warning('\u8BBE\u7F6E\u805A\u5408\u7684\u56FE\u5143\u4E0D\u7B26\u53F7\u7C7B\u578B!');
                } else {
                    //过滤窗口视线外的点位
                    if (ext.contains(gc.geometry)) {
                        //聚合点集合空时 创建一个集合
                        if (t.clusterPs.length === 0) {
                            t.createCluster(t.clusterMarkers[_i12]);
                        } else {
                            for (var j = 0; j < t.clusterPs.length; j++) {
                                //判断点是否在聚合点范围内
                                var d = t.calculatePointsDistance([gc.geometry.x, gc.geometry.y], [t.clusterPs[j].center.x, t.clusterPs[j].center.y]);
                                //获取最优聚合点
                                if (d < distance) {
                                    distance = d;
                                    newCluster = t.clusterPs[j];
                                }
                            }
                            //存在聚合 就添加进聚合  没有聚合就新建一个自己的聚合
                            if (newCluster && newCluster.extent.contains(gc.geometry)) {
                                t.clusterMarkers[_i12].isCluster = true;
                                newCluster.markers.push(t.clusterMarkers[_i12]);
                                newCluster.isreal = true;
                            } else {
                                t.createCluster(t.clusterMarkers[_i12]);
                            }
                        }
                    }
                }
            }
            //添加cluster聚合点
            for (var _i13 = 0; _i13 < t.clusterPs.length; _i13++) {
                if (t.clusterPs[_i13].isreal) {
                    //添加聚合集合点
                    t.addClusterPoint(t.clusterPs[_i13]);
                } else {
                    var m = t.clusterPs[_i13].markers[0];
                    if (!m.marker.getNode()) {
                        //存在html的label处理
                        if (m.html) {
                            t.dealLabelGraphics(m.id, m.html);
                        }
                        //添加回原有的点
                        t.state.gis.graphics.add(m.marker);
                    }
                }
            }
        }
        //处理聚合点的添加

    }, {
        key: 'addClusterPoint',
        value: function addClusterPoint(cluster) {
            var t = this;
            var len = cluster.markers.length,
                ids = [];
            var url = 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/images/m4.png',
                w = 90;
            if (len < 50) {
                url = 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/images/m3.png';
                w = 78;
            }
            if (len < 30) {
                url = 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/images/m2.png';
                w = 66;
            }
            if (len < 20) {
                url = 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/images/m1.png';
                w = 56;
            }
            if (len < 10) {
                url = 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/images/m0.png';
                w = 53;
            }
            //处理聚合中点位
            for (var i = 0; i < len; i++) {
                ids.push(cluster.markers[i].id);
                if (cluster.markers[i].marker.getNode()) {
                    t.state.gis.graphics.remove(cluster.markers[i].marker);
                    if (cluster.markers[i].html) {
                        cluster.markers[i].html.html.remove();
                    }
                }
            }
            //添加聚合点
            var markerSymbol = new esri.symbol.PictureMarkerSymbol(url, w, w);
            //设置文字点位(记录聚合点数量)
            var text = new esri.symbol.TextSymbol(len).setColor(new esri.Color('#fff'));
            //文字居中
            text.setOffset(0.5, -5);
            //创建点位对象
            var graphic = new esri.Graphic(cluster.center, markerSymbol, { id: 'vtx-clusterPoint', ids: ids, cluster: cluster }),
                graphicText = new esri.Graphic(cluster.center, text, { id: 'vtx-clusterPoint', ids: ids, cluster: cluster });
            //添加聚合点位到地图
            t.state.gis.graphics.add(graphic);
            t.state.gis.graphics.add(graphicText);
            t.clusterPt.push({ graphic: graphic, graphicText: graphicText });
        }
        //新增cluster

    }, {
        key: 'createCluster',
        value: function createCluster(m) {
            var t = this;
            var gc = m.marker;
            //不是集合里面的点
            if (!m.isCluster) {
                m.isCluster = true;
                t.clusterPs.push({
                    extent: t.dealExtendBounds(gc._extent),
                    center: gc.geometry,
                    markers: [m],
                    isreal: false
                });
            }
        }
        //处理聚合的间距

    }, {
        key: 'dealExtendBounds',
        value: function dealExtendBounds(extent, area) {
            var t = this,
                bound = area || 60;
            var ne = new esri.geometry.Point(extent.xmax, extent.ymax),
                sw = new esri.geometry.Point(extent.xmin, extent.ymin),
                pixelNe = t.state.gis.toScreen(ne),
                pixelSw = t.state.gis.toScreen(sw);
            pixelNe.x += bound;
            pixelNe.y -= bound;
            pixelSw.x -= bound;
            pixelSw.y += bound;
            var newNe = t.state.gis.toMap(pixelNe),
                newSw = t.state.gis.toMap(pixelSw);
            return new esri.geometry.Extent(newSw.x, newSw.y, newNe.x, newNe.y, new esri.SpatialReference({ wkid: t.grwkid }));
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
            var markerList = [];
            for (var i = 0; i < ary.length; i++) {
                var obj = {
                    id: ary[i],
                    marker: t.GM.getGraphic(ary[i]),
                    isCluster: false
                };
                if (t.Label[ary[i]]) {
                    obj.html = t.Label[ary[i]];
                }
                markerList.push(obj);
            }
            return markerList;
        }
        //设置区域限制

    }, {
        key: 'setAreaRestriction',
        value: function setAreaRestriction(areaRestriction) {
            var t = this;

            var _t$dealData6 = t.dealData(areaRestriction),
                _et = _t$dealData6._extent;

            t.areaRestriction = new esri.geometry.Extent(_extends({}, _et, { spatialReference: { wkid: t.grwkid }
            }));
        }
        //关闭区域限制

    }, {
        key: 'clearAreaRestriction',
        value: function clearAreaRestriction() {
            var t = this;
            t.areaRestriction = null;
        }
        //区域限制逻辑

    }, {
        key: 'dealAreaRestriction',
        value: function dealAreaRestriction(e) {
            var t = this;
            //如果在区域内,不处理
            if (t.areaRestriction.contains(e.extent.getCenter())) {
                return;
            }
            // if(t.containsExtent(t.areaRestriction,e.extent)){
            //    return; 
            // }
            var _t$areaRestriction = t.areaRestriction,
                xmin1 = _t$areaRestriction.xmin,
                xmax1 = _t$areaRestriction.xmax,
                ymin1 = _t$areaRestriction.ymin,
                ymax1 = _t$areaRestriction.ymax;
            var _e$extent = e.extent,
                xmin2 = _e$extent.xmin,
                xmax2 = _e$extent.xmax,
                ymin2 = _e$extent.ymin,
                ymax2 = _e$extent.ymax;

            var x = e.extent.getCenter().x,
                y = e.extent.getCenter().y;
            if (x < xmin1) x = xmin1 + 0.1;
            if (x > xmax1) x = xmax1 - 0.1;
            if (y < ymin1) y = ymin1 + 0.1;
            if (y > ymax1) y = ymax1 - 0.1;
            var center = new esri.geometry.Point(x, y);
            t.state.gis.centerAt(center);
        }
        /*公共方法*/
        //判断extent1是否在extent2内部

    }, {
        key: 'containsExtent',
        value: function containsExtent(e1, e2) {
            var xmin1 = e1.xmin,
                xmax1 = e1.xmax,
                ymin1 = e1.ymin,
                ymax1 = e1.ymax;
            var xmin2 = e2.xmin,
                xmax2 = e2.xmax,
                ymin2 = e2.ymin,
                ymax2 = e2.ymax;

            return xmin2 > xmin1 && xmax2 < xmax1 && ymin2 > ymin1 && ymax2 < ymax1;
        }
        //将图元z-index设置成最高

    }, {
        key: 'czIndex',
        value: function czIndex(id) {
            var t = this;
            $('#' + t.props.mapId + '_graphics_layer').append(t.GM.getGraphic(id).getNode());
        }
    }, {
        key: 'equalsPoint',
        value: function equalsPoint(a, b) {
            return a.x == b.x && a.y == b.y;
        }
        //计算2点间距离 单位m 精确到2位小数

    }, {
        key: 'calculatePointsDistance',
        value: function calculatePointsDistance(fp, ep) {
            return (0, _MapToolFunction.getDistance)(fp, ep, this.state.gis, this.state.grwkid);
        }
        //计算多个点的距离(常用于线计算)

    }, {
        key: 'calculateDistance',
        value: function calculateDistance(ps) {
            var t = this,
                totalDistance = 0;
            if (ps.length < 0) {
                return 0;
            }
            for (var i = 0; i < ps.length; i++) {
                if (i < ps.length - 1) {
                    totalDistance += t.calculatePointsDistance(ps[i], ps[i + 1]);
                }
            }
            return totalDistance;
        }
        //处理线和面的 经纬度数据

    }, {
        key: 'dealData',
        value: function dealData(paths) {
            //区别点和圆的经纬度数据处理
            var lnglatAry = [],
                _extent = { xmax: 0, xmin: 0, ymax: 0, ymin: 0 },
                path = [];
            path = paths.map(function (item, index) {
                var lng = item[0],
                    lat = item[1];
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
            return { lnglatAry: lnglatAry, _extent: _extent, path: path };
        }
        //处理点位图元的添加 和 更新

    }, {
        key: 'dealLabelGraphics',
        value: function dealLabelGraphics(id, label) {
            var t = this;
            if (label) {
                var position = (t.GM.getGraphic(id) || {}).geometry || label.position;
                //经纬度转top和left
                var tl = t.state.gis.toScreen(position),
                    lbl = _extends({}, label);
                //渲染優化
                if (!(tl.y < -50 || tl.x < -50 || tl.y > t.state.gis.height || tl.x > t.state.gis.width)) {
                    //设置label的位置(通过定位来实现)
                    label.html.css({
                        position: 'absolute',
                        top: tl.y + (label.offset.y || 0) - t.labelLayer.y,
                        left: tl.x + (label.offset.x || 0) - t.labelLayer.x
                    });
                    //添加点位到(地图)
                    $('#' + t.htmlPointsId).append(label.html);
                    lbl.add = true;
                } else {
                    lbl.add = false;
                }
                //记录下label的dom对象,用于后期修改和删除(基本是删除)
                t.Label[id] = lbl;
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
                    if (marker.symbol) {
                        var shape = _extends({}, marker.symbol);
                        //初始数据  点位有变动,重新刷新数据
                        if (!t.animCount[id] || shape.yoffset != t.animCount[id].now) {
                            t.animCount[id] = {
                                start: shape.yoffset,
                                now: shape.yoffset,
                                notation: -1
                            };
                        }
                        if (t.animCount[id].now - t.animCount[id].start == 20) {
                            t.animCount[id].notation = -1;
                        }
                        if (t.animCount[id].now - t.animCount[id].start == 0) {
                            t.animCount[id].notation = 1;
                        }
                        shape.yoffset = t.animCount[id].now = t.animCount[id].now + t.animCount[id].notation * 2;
                        marker.symbol.setOffset(shape.xoffset, shape.yoffset);
                        t.state.gis.graphics.refresh();
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
                for (var _i14 = 0; _i14 < nowMovePoints.length; _i14++) {
                    var _nowMovePoints$_i = nowMovePoints[_i14],
                        id = _nowMovePoints$_i.id,
                        rx = _nowMovePoints$_i.rx,
                        ry = _nowMovePoints$_i.ry,
                        waitTime = _nowMovePoints$_i.waitTime,
                        deleteTime = _nowMovePoints$_i.deleteTime,
                        ddeg = _nowMovePoints$_i.ddeg;

                    var gc = t.GM.getGraphic(id);
                    if (!gc || !gc._graphicsLayer) {
                        clearInterval(t.moveToTimer);
                    } else {
                        var gg = gc.geometry;
                        var tx = gg.x + rx,
                            ty = gg.y + ry;
                        var lglt = new esri.geometry.Point(tx, ty);
                        gc.geometry.setLatitude(ty);
                        gc.geometry.setLongitude(tx);
                        //设置完点位后  需要刷新下点位的显示范围
                        gc._extent.update(tx, ty, tx, ty, new esri.SpatialReference({ wkid: t.grwkid }));
                        if (gc._extent._parts && gc._extent._parts[0]) {
                            gc._extent._parts[0].extent.update(tx, ty, tx, ty, new esri.SpatialReference({ wkid: t.grwkid }));
                        }
                        // gc._extent._parts[0].extent = gc._extent.centerAt(lglt);
                        gc._graphicsLayer.refresh();
                        if (t.Label[id] && t.Label[id].add) {
                            var tl = t.state.gis.toScreen(lglt);
                            //设置label的位置(通过定位来实现)
                            t.Label[id].html.css({
                                position: 'absolute',
                                top: tl.y + (t.Label[id].offset.y || 0) - t.labelLayer.y,
                                left: tl.x + (t.Label[id].offset.x || 0) - t.labelLayer.x
                            });
                        }
                        t.GM.setGraphicParam(id, _extends({}, t.GM.getGraphicParam(id), { deg: ddeg }));
                        t.movePoints[_i14].waitTime = 0;
                        if (deleteTime <= 0) {
                            deleteIndex.push(_i14);
                        }
                    }
                }
                deleteIndex.sort(function (a, b) {
                    return b - a;
                });
                for (var _i15 = 0; _i15 < deleteIndex.length; _i15++) {
                    t.movePoints.splice(deleteIndex[_i15], 1);
                }
                if (nowMovePoints.length == 0) {
                    clearInterval(t.moveToTimer);
                }
            }, 10);
        }
        //点位移动动画效果

    }, {
        key: 'moveTo',
        value: function moveTo(id, lnglat, delay, autoRotation, urlright, urlleft) {
            delay = delay || 3;
            var t = this,
                timer = 10;
            delay = eval(delay) * 1000;
            var count = delay / timer,
                gc = this.GM.getGraphic(id);
            var s = gc.geometry,
                e = new esri.geometry.Point(lnglat[0], lnglat[1]);
            if (t.equalsPoint(s, e)) {
                return false;
            } else {
                var ddeg = 0,
                    url = null;
                //计算角度,旋转
                if (autoRotation) {
                    //自己实现旋转
                    ddeg = t.rotateDeg(gc.geometry, lnglat);
                    if (urlleft && ddeg < -90 && ddeg > -270) {
                        ddeg += 180;
                        url = urlleft;
                    } else {
                        url = urlright;
                    }
                    gc.symbol.setUrl(url);
                    gc.symbol.setAngle(ddeg);
                    gc._graphicsLayer.refresh();
                }
                //拆分延迟移动定位
                var rx = (e.x - s.x) / count,
                    ry = (e.y - s.y) / count;
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
            var s = t.state.gis.toScreen(sp),

            //获取当前点位的经纬度
            e = t.state.gis.toScreen(new esri.geometry.Point(ep[0], ep[1])),
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
        //渲染

    }, {
        key: 'render',
        value: function render() {
            var t = this;
            var _map = this.props;
            return _react2.default.createElement('div', { id: _map.mapId, style: { width: '100%', height: '100%', backgroundColor: '#f1f1f1' } });
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
        //已加载组件，收到新的参数时调用

    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this5 = this;

            var t = this;
            t.grwkid = nextProps.grwkid || 4326;
            //新参数处理方法
            var initData = function initData() {
                var t = _this5;
                //点/线旧数据
                var _t$state3 = t.state,
                    pointIds = _t$state3.pointIds,
                    lineIds = _t$state3.lineIds,
                    polygonIds = _t$state3.polygonIds,
                    circleIds = _t$state3.circleIds,
                    drawIds = _t$state3.drawIds;
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
                    if (!!t.editId) {
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
                    if (!!t.editId) {
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

                    t.addLine(_addedData3);
                    t.updateLine(_updatedData3);
                }
                /*
                    面数据处理
                    先全删除,再新增
                */
                if (mapPolygons instanceof Array && !t.deepEqual(mapPolygons, t.props.mapPolygons)) {
                    var oldMapPolygons = t.props.mapPolygons;
                    var newMapPolygons = mapPolygons;
                    if (!!t.editId) {
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
                    if (!!t.editId) {
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
                //绘制边界线
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
                // //开关路况
                // if(isOpenTrafficInfo){
                //     t.openTrafficInfo();
                // }else{
                //     t.hideTrafficInfo();
                // }
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
            };
            //graphics对象存在 直接处理数据,不存在 延迟处理数据
            if (!t.state.gis || !t.state.gis.graphics) {
                if (t.loadTimer) {
                    clearTimeout(t.loadTimer);
                }
                t.loadTimer = setTimeout(function () {
                    initData();
                }, 300);
            } else {
                initData();
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
            //关闭animation定时
            for (var j in t.animTimer) {
                if (t.animTimer[j]) {
                    clearInterval(t.animTimer[j]);
                }
            }
        }
    }]);

    return ArcgisMap;
}(_react2.default.Component);

exports.default = ArcgisMap;
module.exports = exports['default'];