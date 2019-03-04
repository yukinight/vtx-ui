'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./VtxSearchMap.css');

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

require('antd/lib/button/style/css');

var _input = require('antd/lib/input');

var _input2 = _interopRequireDefault(_input);

require('antd/lib/input/style/css');

var _message = require('antd/lib/message');

var _message2 = _interopRequireDefault(_message);

require('antd/lib/message/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

var _checkbox = require('antd/lib/checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

require('antd/lib/checkbox/style/css');

var _VtxModal = require('../VtxModal');

var _VtxMap = require('../VtxMap');

var _default = require('../default');

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var styles = {
    searchModal: 'vtx-ui-searchmap-searchmodal',
    searchMap: 'vtx-ui-searchmap-searchmap',
    top: 'vtx-ui-searchmap-top',
    bottom: 'vtx-ui-searchmap-bottom',
    content: 'vtx-ui-searchmap-content',
    show: 'vtx-ui-searchmap-show',
    hidden: 'vtx-ui-searchmap-hidden',
    w_l: 'vtx-ui-searchmap-w_l',
    content_left: 'vtx-ui-searchmap-content_left',
    listTitle: 'vtx-ui-searchmap-listtitle',
    title: 'vtx-ui-searchmap-title',
    btn: 'vtx-ui-searchmap-btn',
    lists: 'vtx-ui-searchmap-lists',
    select: 'vtx-ui-searchmap-select',
    scrollauto: 'vtx-ui-searchmap-scrollauto',
    content_right: 'vtx-ui-searchmap-content_right',
    showLabel: 'vtx-ui-searchmap-showlabel',
    hiddenLabel: 'vtx-ui-searchmap-hiddenlabel',
    otherModal: 'vtx-ui-searchmap-othermodal'
};
//公共地址配置

// message.config({
//   top: document.getElementById('root').offsetHeight/3,
//   duration: 5,
// });
var warning = function warning() {
    _message2.default.warning('位置点查询失败,请缩小比例尺或切换关键字后再重新查询!');
};
function distinct(ary) {
    var pts = [].concat(_toConsumableArray(ary));
    if (pts[0][0] == pts[pts.length - 1][0] && pts[0][1] == pts[pts.length - 1][1]) {
        pts.pop();
        return distinct(pts);
    } else {
        return pts;
    }
}

var VtxSearchMap = function (_React$Component) {
    _inherits(VtxSearchMap, _React$Component);

    function VtxSearchMap(props) {
        _classCallCheck(this, VtxSearchMap);

        var _this = _possibleConstructorReturn(this, (VtxSearchMap.__proto__ || Object.getPrototypeOf(VtxSearchMap)).call(this, props));

        _this.map = null; //Map组件的ref对象
        _this.mapLoaded = false;
        _this.isDrawStatus = false;
        _this.isClickMap = false;
        _this.apid = []; //所有点id,除编辑点外
        _this.loadExtent = null;
        _this.mapId = 'searchMap' + new Date().getTime();
        _this.state = {
            //列表和地图宽度切换的动画需要
            isShowList: false,
            //可拖动用于定位的点
            locationPoint: [],
            //搜索框文字
            searchValue: '',
            //搜索出来的列表点位
            listPoint: [],
            //列表数据
            listMess: [],
            // 返回点位/图形
            graphicType: props.graphicType || 'point',
            isDraw: props.graphicType !== 'point',
            parameter: props.drawParameter || {},
            graphicValue: null,
            drawGraphID: 'drawnGraph',
            /*地图Api参数*/
            mapCenter: props.mapCenter || '',
            maxZoom: props.maxZoom,
            minZoom: props.minZoom,
            wkid: props.wkid,
            mapType: props.mapType || 'bmap',
            mapServer: props.mapServer,
            setCenter: false,
            mapVisiblePoints: {
                fitView: [],
                type: 'all'
            },
            setVisiblePoints: false,
            isDoEdit: false,
            isEndEdit: false,
            editGraphicId: '',
            editGraphic: null,
            mapZoomLevel: props.mapZoomLevel || 11,
            setZoomLevel: false,
            /*modal参数*/
            modal1Visible: props.modal1Visible || false,
            isShowOther: props.isShowOther || false,
            otherText: props.otherText || '显示服务区域',
            isShowOtherGraph: props.isShowOther || false
        };
        return _this;
    }
    //经纬度回调


    _createClass(VtxSearchMap, [{
        key: 'callback',
        value: function callback() {
            var fun = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'callback';

            if (fun in this.props && typeof this.props[fun] === 'function') {
                var editGraphicId = this.state.editGraphicId;

                switch (this.state.graphicType) {
                    case 'point':
                        var locationPoint = this.state.locationPoint;

                        if (this.map.getGraphic('locationPoint')) {
                            var p = this.map.getGraphic(locationPoint[0].id).geometry;
                            this.props[fun]([p.x, p.y]);
                        } else {
                            return [];
                        }
                        break;
                    case 'circle':
                        this.props[fun](this.state.graphicValue ? {
                            x: this.state.graphicValue.geometry.x,
                            y: this.state.graphicValue.geometry.y,
                            radius: this.state.graphicValue.geometry.radius,
                            area: this.state.graphicValue.area
                        } : null);
                        break;
                    case 'polygon':
                        if (this.map.getGraphic(editGraphicId)) {
                            var _p = this.map.getGraphic(editGraphicId);
                            this.props[fun]({
                                rings: distinct(_p.geometry.rings),
                                area: this.map.getPolygonArea(distinct(_p.geometry.rings))
                            });
                        } else {
                            this.props[fun](this.state.graphicValue ? {
                                rings: distinct(this.state.graphicValue.geometry.rings),
                                area: this.state.graphicValue.area
                            } : null);
                        }
                        break;
                    case 'rectangle':
                        this.props[fun](this.state.graphicValue ? {
                            rings: distinct(this.state.graphicValue.geometry.rings),
                            area: this.state.graphicValue.area
                        } : null);
                        break;
                    case 'polyline':
                        if (this.map.getGraphic(editGraphicId)) {
                            var _p2 = this.map.getGraphic(editGraphicId);
                            this.props[fun]({
                                paths: _p2.geometry.paths,
                                length: this.map.calculateDistance(_p2.geometry.paths)
                            });
                        } else {
                            this.props[fun](this.state.graphicValue ? {
                                paths: this.state.graphicValue.geometry.paths,
                                length: this.map.calculateDistance(this.state.graphicValue.geometry.paths)
                            } : null);
                        }
                        break;
                }
            }
            if (this.props.clearDrawnGraph) {
                this.clearDrawnGraph();
            }
        }
    }, {
        key: 'showOrhidden',
        value: function showOrhidden(bealoon) {
            this.setState({
                isShowList: bealoon
            });
        }
        //绘制定位点(以当前的中心点位参照 => 同时开启点位编辑)

    }, {
        key: 'drawLocationPoint',
        value: function drawLocationPoint() {
            var t = this;
            //判断arcgis,是: 判断中心点是否已经确定,确定,继续走逻辑.不确认.轮询等待
            if (this.props.mapType !== 'gmap' || this.map.state.gis.extent && !!this.map.state.gis.extent.xmax) {
                var lglt = this.map.getMapExtent(),
                    editGraphic = null,
                    editGraphicId = 'locationPoint';
                if (this.props.editParam && (this.props.graphicType == 'polyline' || this.props.graphicType == 'polygon')) {
                    editGraphic = _extends({}, this.props.editParam, { id: 'drawnGraph' });
                    editGraphicId = 'drawnGraph';
                }
                this.isinit = false;
                this.setState({
                    editGraphic: editGraphic,
                    locationPoint: [{
                        id: 'locationPoint',
                        longitude: (t.props.mapCenter || [])[0] || lglt.nowCenter.lng,
                        latitude: (t.props.mapCenter || [])[1] || lglt.nowCenter.lat,
                        url: _default2.default.mapServerURL + '/images/defaultMarker.png',
                        config: {
                            zIndex: 1000
                        }
                    }]
                }, function () {
                    t.setState({
                        isDoEdit: true,
                        editGraphicId: editGraphicId
                    }, function () {
                        setTimeout(function () {
                            t.setState({
                                isDoEdit: false
                            });
                        }, 100);
                    });
                });
            } else {
                t.loadExtent = setTimeout(function () {
                    t.drawLocationPoint();
                }, 50);
            }
        }
        //校正定位的点位位置到当前的中心点

    }, {
        key: 'correction',
        value: function correction() {
            var t = this;
            //获取当前中心点经纬度
            var lglt = this.map.getMapExtent();
            var locationPoint = t.state.locationPoint;

            locationPoint = locationPoint.map(function (item, index) {
                return _extends({}, item, {
                    longitude: lglt.nowCenter.lng,
                    latitude: lglt.nowCenter.lat
                });
            });
            this.map.updatePoint(locationPoint);
        }
        //搜索关键字切换

    }, {
        key: 'changeValue',
        value: function changeValue(e) {
            this.setState({
                searchValue: e.target.value
            });
        }
        //根据关键字搜索数据

    }, {
        key: 'searchList',
        value: function searchList() {
            //因为antd组件问题,这边使用手动关键位,控制方法执行
            var t = this;
            var searchPoints = t.map.searchPoints(this.state.searchValue);
            searchPoints.then(function (results) {
                if (results.length > 0) {
                    var lsp = [],
                        lsm = [];
                    t.apid = [];
                    for (var i = 0; i < results.length; i++) {
                        var r = results[i];
                        lsp.push(_extends({}, results[i], {
                            url: _default2.default.mapServerURL + '/images/defaultMarker_selected.png',
                            labelClass: styles.hiddenLabel
                        }));
                        lsm.push({
                            id: r.id,
                            title: r.config.labelContent,
                            isSelect: false
                        });
                        t.apid.push(r.id);
                    }
                    t.setState({
                        listPoint: lsp,
                        listMess: lsm,
                        isShowList: true
                    });
                    t.setFitView();
                } else {
                    warning();
                }
            });
        }
        //返回最佳位置(zoom,center)

    }, {
        key: 'setFitView',
        value: function setFitView() {
            var _this2 = this;

            this.setState({
                mapVisiblePoints: {
                    fitView: this.apid,
                    type: 'all'
                },
                setVisiblePoints: true
            }, function () {
                _this2.setState({
                    setVisiblePoints: false
                });
            });
        }
        //清空列表的所有数据(包括点位)

    }, {
        key: 'clearList',
        value: function clearList() {
            this.apid = [];
            this.setState({
                searchValue: '',
                listPoint: [],
                listMess: [],
                isShowList: false
            });
        }
        //列表选中地址

    }, {
        key: 'chooseAddress',
        value: function chooseAddress(id) {
            var _this3 = this;

            var _state = this.state,
                listPoint = _state.listPoint,
                listMess = _state.listMess;

            var mapCenter = [];
            listPoint = listPoint.map(function (item, index) {
                if (item.id === id) {
                    mapCenter = [item.longitude, item.latitude];
                    return _extends({}, item, {
                        labelClass: styles.showLabel
                    });
                } else {
                    return _extends({}, item, {
                        labelClass: styles.hiddenLabel
                    });
                }
            });
            listMess = listMess.map(function (item, index) {
                if (item.id === id) {
                    return _extends({}, item, {
                        isSelect: true
                    });
                } else {
                    return _extends({}, item, {
                        isSelect: false
                    });
                }
            });
            this.setState({
                listPoint: listPoint,
                listMess: listMess,
                mapCenter: mapCenter,
                setCenter: true
            }, function () {
                _this3.setState({
                    setCenter: false
                });
            });
        }
    }, {
        key: 'clickGraphic',
        value: function clickGraphic(obj) {
            if (obj.type === 'point' && obj.attributes.other === 'search') {
                this.chooseAddress(obj.attributes.id);
            }
        }
    }, {
        key: 'closeModal',
        value: function closeModal(e) {
            if (this.isDrawStatus && this.isClickMap) {
                _message2.default.warning('请双击结束图元编辑');
            } else {
                if ('closeModal' in this.props) {
                    this.props.closeModal();
                } else {
                    this.setState({
                        modal1Visible: false
                    });
                }
                // if(this.props.clearDrawnGraph){
                this.clearDrawnGraph();
                // }
            }
        }
    }, {
        key: 'clearDrawnGraph',
        value: function clearDrawnGraph() {
            var _this4 = this;

            this.isDrawStatus = true;
            this.setState({
                isDraw: true,
                graphicValue: null,
                isEndEdit: this.state.graphicType !== 'point'
            }, function () {
                _this4.setState({ isEndEdit: false });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var t = this;
            var _state2 = this.state,
                isShowList = _state2.isShowList,
                searchValue = _state2.searchValue,
                locationPoint = _state2.locationPoint,
                listPoint = _state2.listPoint,
                listMess = _state2.listMess,
                mapZoomLevel = _state2.mapZoomLevel,
                setZoomLevel = _state2.setZoomLevel,
                maxZoom = _state2.maxZoom,
                minZoom = _state2.minZoom,
                wkid = _state2.wkid,
                mapServer = _state2.mapServer,
                mapCenter = _state2.mapCenter,
                setCenter = _state2.setCenter,
                mapType = _state2.mapType,
                mapVisiblePoints = _state2.mapVisiblePoints,
                setVisiblePoints = _state2.setVisiblePoints,
                isDoEdit = _state2.isDoEdit,
                editGraphicId = _state2.editGraphicId,
                isEndEdit = _state2.isEndEdit,
                modal1Visible = _state2.modal1Visible,
                drawGraphID = _state2.drawGraphID,
                isShowOther = _state2.isShowOther,
                otherText = _state2.otherText,
                isShowOtherGraph = _state2.isShowOtherGraph,
                editGraphic = _state2.editGraphic,
                graphicType = _state2.graphicType;

            var InputProps = {
                style: { 'width': '200px' },
                placeholder: '输入关键字',
                value: searchValue,
                onChange: this.changeValue.bind(this),
                onPressEnter: this.searchList.bind(this),
                onKeyDown: this.changeValue.bind(this)
            };
            var drawProps = this.state.graphicType == 'point' || t.isinit ? null : {
                isDraw: this.state.isDraw,
                drawEnd: function drawEnd(obj) {
                    _this5.isDrawStatus = false;
                    _this5.isClickMap = false;
                    var objparam = {
                        graphicValue: obj,
                        isDraw: false
                    };
                    if (obj.geometryType == 'polyline' || obj.geometryType == 'polygon') {
                        objparam.editGraphicId = obj.id;
                        objparam.isDoEdit = true;
                    }
                    _this5.setState(objparam, function () {
                        _this5.setState({
                            isDoEdit: false
                        });
                    });
                },
                mapDraw: {
                    geometryType: this.state.graphicType,
                    parameter: this.state.parameter,
                    data: { id: drawGraphID }
                }
            };
            var mapPoints = [],
                mapLines = [],
                mapPolygons = [],
                mapCircles = [];
            if (graphicType == 'point') {
                mapPoints = [].concat(_toConsumableArray(locationPoint), _toConsumableArray(listPoint));
            } else {
                mapPoints = [].concat(_toConsumableArray(listPoint));
            }
            if (graphicType === 'polygon') {
                if (editGraphic) {
                    mapPolygons.push(editGraphic);
                    drawProps = null;
                }
            }
            if (graphicType === 'polyline') {
                if (editGraphic) {
                    mapLines.push(editGraphic);
                    drawProps = null;
                }
            }
            if (isShowOtherGraph) {
                var otherGraph = this.props.otherGraph;

                if (otherGraph) {
                    mapPoints = [].concat(_toConsumableArray(mapPoints), _toConsumableArray(otherGraph.point || []));
                    mapLines = [].concat(_toConsumableArray(mapLines), _toConsumableArray(otherGraph.polyline || []));
                    mapPolygons = [].concat(_toConsumableArray(mapPolygons), _toConsumableArray(otherGraph.polygon || []));
                    mapCircles = [].concat(_toConsumableArray(mapCircles), _toConsumableArray(otherGraph.circle || []));
                }
            }
            return _react2.default.createElement(
                _VtxModal.VtxModal,
                {
                    title: this.state.graphicType == 'point' ? "定位" : "绘制",
                    style: { top: 50 },
                    visible: modal1Visible,
                    wrapClassName: styles.searchModal,
                    bodyStyle: { height: window.innerHeight * 0.7 + 'px' },
                    maskClosable: false,
                    onCancel: this.closeModal.bind(this),
                    footer: null
                },
                _react2.default.createElement(
                    'div',
                    { className: styles.searchMap },
                    _react2.default.createElement(
                        'div',
                        { className: styles.top },
                        mapType == 'gmap' ? '' : [_react2.default.createElement(_input2.default, _extends({ key: '1' }, InputProps)), _react2.default.createElement(
                            _button2.default,
                            { key: '2', type: 'primary', onClick: this.searchList.bind(this), icon: 'search' },
                            '\u67E5\u8BE2'
                        ), _react2.default.createElement(
                            _button2.default,
                            { key: '3', onClick: this.clearList.bind(this), icon: 'close' },
                            '\u6E05\u7A7A'
                        )],
                        this.state.graphicType == 'point' ? _react2.default.createElement(
                            _button2.default,
                            { onClick: this.correction.bind(this), icon: 'environment-o' },
                            '\u6821\u6B63'
                        ) : null,
                        this.state.graphicType != 'point' ? _react2.default.createElement(
                            _button2.default,
                            { disabled: this.isDrawStatus, onClick: function onClick() {
                                    _this5.isDrawStatus = true;
                                    _this5.setState({
                                        isDraw: true,
                                        graphicValue: null,
                                        editGraphic: null,
                                        isEndEdit: true
                                    }, function () {
                                        t.map.removeGraphic('drawnGraph', 'draw');
                                        t.setState({
                                            isEndEdit: false
                                        });
                                    });
                                    _this5.callback('editDraw');
                                }, icon: 'edit' },
                            '\u91CD\u65B0\u7ED8\u5236'
                        ) : null,
                        mapType == 'gmap' ? '' : _react2.default.createElement(
                            _button2.default,
                            { onClick: this.setFitView.bind(this), icon: 'sync' },
                            '\u8FD4\u56DE\u5168\u5C40\u5730\u56FE'
                        ),
                        isShowOther ? _react2.default.createElement(
                            'div',
                            { className: styles.otherModal },
                            _react2.default.createElement(
                                _checkbox2.default,
                                { checked: isShowOtherGraph, onChange: function onChange(e) {
                                        _this5.setState({ isShowOtherGraph: e.target.checked });
                                    } },
                                otherText
                            )
                        ) : ''
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: styles.content, style: { paddingLeft: mapType == 'gmap' ? '0px' : '25px' } },
                        mapType == 'gmap' ? '' : _react2.default.createElement(
                            'div',
                            { className: styles.content_left + ' ' + (isShowList ? styles.w_l : '') },
                            _react2.default.createElement(
                                'div',
                                { className: '' + (isShowList ? styles.show : styles.hidden) },
                                _react2.default.createElement(
                                    'div',
                                    { className: styles.listTitle },
                                    _react2.default.createElement(
                                        'div',
                                        { className: styles.title },
                                        '\u67E5\u8BE2\u7ED3\u679C'
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { onClick: function onClick() {
                                                return _this5.showOrhidden(false);
                                            }, className: styles.btn },
                                        _react2.default.createElement(_icon2.default, { type: 'double-left' })
                                    )
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { className: styles.scrollauto },
                                    listMess.map(function (item, index) {
                                        return _react2.default.createElement(
                                            'div',
                                            {
                                                key: index,
                                                onClick: function onClick() {
                                                    return _this5.chooseAddress(item.id);
                                                },
                                                className: styles.lists + ' ' + (item.isSelect ? styles.select : '')
                                            },
                                            item.title
                                        );
                                    })
                                )
                            ),
                            _react2.default.createElement(
                                'div',
                                { onClick: function onClick() {
                                        return _this5.showOrhidden(true);
                                    }, className: styles.btn + ' ' + (!isShowList ? styles.show : styles.hidden) },
                                _react2.default.createElement(_icon2.default, { type: 'double-right' })
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: styles.content_right },
                            _react2.default.createElement(_VtxMap.VtxMap, _extends({
                                getMapInstance: function getMapInstance(map) {
                                    if (map) _this5.map = map;
                                },
                                mapType: mapType,
                                mapServer: mapServer,
                                wkid: wkid,
                                mapId: t.mapId,
                                setCenter: setCenter,
                                mapCenter: mapCenter,
                                minZoom: minZoom,
                                maxZoom: maxZoom,
                                mapZoomLevel: mapZoomLevel,
                                setZoomLevel: setZoomLevel,
                                mapPoints: mapPoints,
                                mapLines: mapLines,
                                mapPolygons: mapPolygons,
                                mapCircles: mapCircles,
                                mapVisiblePoints: mapVisiblePoints,
                                setVisiblePoints: setVisiblePoints,
                                isDoEdit: isDoEdit,
                                isEndEdit: isEndEdit,
                                editGraphicId: editGraphicId,
                                editGraphicChange: function editGraphicChange() {},
                                clickGraphic: this.clickGraphic.bind(this),
                                clickMap: function clickMap() {
                                    t.isClickMap = true;
                                }
                            }, drawProps))
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: styles.bottom },
                        _react2.default.createElement(
                            _button2.default,
                            { type: 'primary', onClick: function onClick() {
                                    _this5.callback();
                                }, icon: 'check' },
                            '\u786E\u5B9A'
                        ),
                        _react2.default.createElement(
                            _button2.default,
                            { onClick: this.closeModal.bind(this), icon: 'close' },
                            '\u5173\u95ED'
                        )
                    )
                )
            );
        }
    }, {
        key: 'initSearchMap',
        value: function initSearchMap() {
            var _this6 = this;

            if (this.props.modal1Visible /*&& !this.state.locationPoint[0]*/) {
                    if (this.map) {
                        this.map.loadMapComplete.then(function () {
                            if (!_this6.mapLoaded) {
                                _this6.mapLoaded = true;
                                _this6.drawLocationPoint();
                            }
                        });
                    }
                }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            //绘制定位点(以当前的中心点位参照=>初始化好后才有ref可以获取中心点)
            this.initSearchMap();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            //重新渲染结束
            this.initSearchMap();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this7 = this;

            var t = this;
            if (t.state.graphicType !== nextProps.graphicType && !!this.map) {
                this.map.clearAll();
                t.mapLoaded = false;
                t.isinit = true;
            }
            if (nextProps.editParam) {
                t.mapLoaded = false;
            }
            t.isDrawStatus = nextProps.graphicType !== 'point' && !nextProps.editParam;
            this.setState({
                modal1Visible: nextProps.modal1Visible,
                maxZoom: nextProps.maxZoom,
                minZoom: nextProps.minZoom,
                wkid: nextProps.wkid,
                mapCenter: nextProps.mapCenter || '',
                mapType: nextProps.mapType || 'bmap',
                mapServer: nextProps.mapServer,
                graphicType: nextProps.graphicType || 'point',
                isDraw: nextProps.graphicType !== 'point' && !nextProps.editParam,
                editGraphicId: ''
            }, function () {
                t.initSearchMap();
            });
            setTimeout(function () {
                //实现2+次进入时,清理数据
                if (nextProps.modal1Visible) {
                    _this7.clearList();
                    _this7.setState({
                        setZoomLevel: true
                    }, function () {
                        _this7.setState({
                            setZoomLevel: false
                        });
                    });
                    if (!!_this7.map && !!_this7.state.locationPoint[0] && nextProps.mapCenter && !!nextProps.mapCenter[0]) {
                        if (_this7.map.getGraphic('locationPoint')) {
                            switch (nextProps.mapType) {
                                case 'bmap':
                                    _this7.map.getGraphic('locationPoint').mapLayer.setPosition(new BMap.Point(nextProps.mapCenter[0], nextProps.mapCenter[1]));
                                    break;
                                case 'amap':
                                    _this7.map.getGraphic('locationPoint').mapLayer.setPosition(new AMap.LngLat(nextProps.mapCenter[0], nextProps.mapCenter[1]));
                                    break;
                                case 'tmap':
                                    _this7.map.getGraphic('locationPoint').mapLayer.setLngLat(new T.LngLat(nextProps.mapCenter[0], nextProps.mapCenter[1]));
                                    break;
                                case 'gmap':
                                    _this7.map.getGraphic('locationPoint').mapLayer.geometry.setLatitude(nextProps.mapCenter[1]);
                                    _this7.map.getGraphic('locationPoint').mapLayer.geometry.setLongitude(nextProps.mapCenter[0]);
                                    _this7.map.state.gis.graphics.refresh();
                                    break;
                            }
                        }
                        _this7.map.setCenter(nextProps.mapCenter);
                    }
                }
            }, 100);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            //关闭moveTo定时
            var t = this;
            if (t.loadExtent) {
                clearInterval(t.loadExtent);
            }
        }
    }]);

    return VtxSearchMap;
}(_react2.default.Component);

exports.default = VtxSearchMap;
module.exports = exports['default'];