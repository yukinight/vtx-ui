import React, {Component,PropTypes} from 'react';
import styles from './Map.less';
import Immutable from 'immutable';
const {Set} = Immutable;
class Map extends React.Component {
    constructor(props){
        super(props);
        this.editTimeout = null;//圆编辑时的延迟回调,避免重复调用
        this.state = {
            mapId: props.mapId,
            center: props.mapCenter,
            maxZoom: props.maxZoom,
            minZoom: props.minZoom,
            gis: new VortexBMap(),
            pointIds: [],//点的所有id
            lineIds: [],//线的所有id
            polygonIds: [],//面的所有id
            circleIds: [],//圆的所有id
            editId: '',//当前编辑的图元id
            editGraphic: '',//当前编辑完后图元所有数据
            boundaryInfo: [],//当前画出的边界线的id和区域名
            defaultPoint: './resources/images/defaultMarker.png',//默认点
            drawIds: {//绘制工具id集合
                point: [],
                polyline: [],
                polygon: [],
                circle: [],
                rectangle: []
            }
        }
    }
    init(){
        let t =this;
        t.createMap();
        const {
            mapPoints,mapLines,mapPolygons,mapCircles,
            mapVisiblePoints,mapCluster,mapZoomLevel,
            isOpenTrafficInfo,mapPointCollection,areaRestriction
        } = this.props;
        let {boundaryName,heatMapData,customizedBoundary} = this.props;
        let {boundaryInfo,pointIds,lineIds,polygonIds,circleIds} = this.state;
        //添加点
        //Math.max(2,3)
        //MapUtil.isArray
        if(mapPoints instanceof Array){
            t.addPoint(mapPoints);
        }
        //添加线
        if(mapLines instanceof Array){
            t.addLine(mapLines);
        }
        //添加面
        if(mapPolygons instanceof Array){
            t.addPolygon(mapPolygons);
        }
        //添加圆
        if(mapCircles instanceof Array){
            t.addCircle(mapCircles);
        }
        if(mapPointCollection instanceof Array){
            t.addPointCollection(mapPointCollection);
        }
        //初始展示的视野范围
        if(mapVisiblePoints){
            switch(mapVisiblePoints.fitView){
                case 'point':
                    t.setVisiblePoints(pointIds,mapVisiblePoints.type);
                break;
                case 'line':
                    t.setVisiblePoints(lineIds,mapVisiblePoints.type);
                break;
                case 'polygon':
                    t.setVisiblePoints(polygonIds,mapVisiblePoints.type);
                break;
                case 'circle':
                    t.setVisiblePoints(circleIds,mapVisiblePoints.type);
                break;
                case 'all':
                    t.setVisiblePoints(pointIds.concat(lineIds).concat(polygonIds).concat(circleIds),mapVisiblePoints.type);
                break;
                default:
                    t.setVisiblePoints(mapVisiblePoints,mapVisiblePoints.type);
                break;
            }
        }
        //设置中心点
        t.setCenter(t.state.center);
        //设置点聚合
        if(mapCluster instanceof Array){
            t.cluster(mapCluster);
        }
        //设置比例尺
        if(mapZoomLevel){
            t.setZoomLevel(mapZoomLevel);
        }
        //画边界线
        if(boundaryName instanceof Array && boundaryName.length>0){
            t.addBaiduBoundary(boundaryName);
        }
        // 画热力图
        if(heatMapData){
            t.addHeatMap(heatMapData);
        }
        if(customizedBoundary instanceof Array){
            t.addLine(customizedBoundary);
        }
        if(isOpenTrafficInfo){
            t.openTrafficInfo();
        }else{
            t.hideTrafficInfo();
        }
        //设置区域限制
        if(areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]){
            t.setAreaRestriction(areaRestriction);
        }
        //图元点击事件
        t.clickGraphic();
        //地图拖动事件
        t.dragMapStart();//拖动之前
        t.dragMapEnd();//拖动结束后
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
        if(t.props.showControl){
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
    createMap () {
        let t =this;
        let options ={
            zoom: 10,
            center: [116.404,39.915]
        };
        if(!!t.state.maxZoom){
            options.maxZoom = t.state.maxZoom
        }
        if(!!t.state.minZoom){
            options.minZoom = t.state.minZoom
        }
        if(!!t.state.center){
            options.center = t.state.center;
        }
        if(!!t.props.mapZoomLevel){
            options.zoom = t.props.mapZoomLevel;
        }
        if(window.VtxMap){
            window.VtxMap[t.state.mapId]= {};
        }else{
            window.VtxMap = {};
        }
        let map = window.VtxMap[t.state.mapId] = new BMap.Map(t.state.mapId,{
            enableMapClick : false,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom
        });
        // 初始化地图,设置中心点坐标和地图级别
        map.centerAndZoom(new BMap.Point(parseFloat(options.center[0]),parseFloat(options.center[1])), options.zoom);
        if(!!t.props.satelliteSwitch){
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
    clearAll (){
        let t = this;
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
    setCenter (gt) {
        let t =this;
        if(gt){
            let c = t.state.gis.map.getCenter();
            if(c.lng == gt[0] && c.lat == gt[1]){
                return false;
            }
            t.state.gis.setCenter(gt[0],gt[1]);
            t.setState({center:gt});
        }else{
            t.state.gis.setCenter(117.468021,39.890092);
            t.setState({center:[117.468021,39.890092]});
        }
    }
    openTrafficInfo(){
        this.state.gis.openTrafficInfo();
    }
    hideTrafficInfo(){
        this.state.gis.hideTrafficInfo();
    }
    /*设置显示区域*/
    setAreaRestriction(sw_ne){
        let bounds = new BMap.Bounds(new BMap.Point(sw_ne[0][0],sw_ne[0][1]),new BMap.Point(sw_ne[1][0],sw_ne[1][1]));
        BMapLib.AreaRestriction.setBounds(this.state.gis.map,bounds);
    }
    /*取消显示区域*/
    clearAreaRestriction(){
        BMapLib.AreaRestriction.clearBounds();
    }
    //将制定图元展示在视野内 (强制改变地图中心位置)
    /*
        参数arg格式如下1,2
        1.string   格式如:'1,a,2,3,4'
        2.数组 ['1','2']
    */
    setVisiblePoints (arg,type) {
        let t = this;
        let ary = [];
        let obj = null;
        if(typeof(arg) === 'string'){
            ary = arg.split(',');
            obj = t.state.gis.getFitView(ary);
        }else if(arg instanceof Array){
            if(typeof(arg[0]) == 'string'){
                ary = arg;
                obj = t.state.gis.getFitView(ary);
            }else if(arg[0] instanceof Array){
                let xmax = 0,xmin = 0,ymax = 0,ymin = 0;
                arg.map((item,index)=>{
                    let lng = item[0],lat = item[1];
                    if(lng > xmax){
                        xmax = lng;
                    }
                    if(lng < xmin || xmin == 0){
                        xmin = lng;
                    }
                    if(lat > ymax){
                        ymax = lat;
                    }
                    if(lat < ymin || ymin == 0){
                        ymin = lat;
                    }
                });
                obj = t.state.gis.map.getViewport([new BMap.Point(xmax,ymax),new BMap.Point(xmin,ymin)]);
            }
        }
        if(!obj){return false} 
        if(type == 'all'){
            // t.state.gis.setFitview(ary);
            t.setZoomLevel(obj.zoom);
            t.setCenter([obj.center.lng,obj.center.lat]);
        }else if(type == 'zoom'){
            t.setZoomLevel(obj.zoom);
        }else if(type == 'center'){
            t.setCenter([obj.center.lng,obj.center.lat]);
        }
    }
    //设置地图比例尺
    setZoomLevel (zoom) {
        let t =this;
        let z = t.getZoomLevel();
        if(z == zoom){
            return false;
        }
        t.state.gis.setZoom(zoom);
    }
    /*get方法*/
    //获取当前地图的中心位置
    getCurrentCenter(){
        let t =this;
        return t.state.gis.getNowCenter();
    }
    //获取当前比例尺
    getZoomLevel (){
        let t =this;
        return t.state.gis.getZoom();
    }
    //获取当前地图边框左右边角经纬度,中心点位置,和比例尺,半径距离
    getMapExtent(){
        let t =this;
        let obj = t.state.gis.getMapExtent();
        let radius = t.calculatePointsDistance([obj.nowCenter.lng,obj.nowCenter.lat],[obj.northEast.lng,obj.northEast.lat]);
        obj.radius = radius;
        return obj;
    }
    //聚合地图图元(arg为空时聚合全部点)
    cluster (arg) {
        let t = this;
        let ary = [];
        if(!arg){
            let {pointIds} = t.state;
            ary = pointIds;
        }else{
            if(Object.prototype.toString.apply(arg) === '[object Array]'){
                ary = arg;
            }else if(typeof arg === 'string'){
                ary = arg.split(',');
            }
        }
        t.state.gis.cluster(ary);
    }
    //展示比例尺
    showControl (){
        let t = this;
        t.state.gis.showControl(t.props.showControl.type,t.props.showControl.location);
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
    getGraphic (id) {
        let t = this;
        return t.state.gis.getGraphic(id);
    }
    //显示隐藏的图元
    showGraphicById (id){
        let t = this;
        t.state.gis.showGraphicById(id);
    }
    //隐藏图元
    hideGraphicById(id){
        let t = this;
        t.state.gis.hideGraphicById(id);
    }
    //画出对应边界线 name区域名
    addBaiduBoundary(bdNames){
        let t = this;
        bdNames.forEach(name=>{
            t.state.gis.getBoundary(name,(ary)=>{
                let id = 'boundary' + new Date().getTime();
                let paths = ary.boundaries[0].split(';').map((item,index)=>{
                    return item.split(',');
                })
                t.addPolygon([{id,rings:paths}]);
                t.state.boundaryInfo.push({id,name:name});
            });
        })
    }
    removeBaiduBoundary(removedBDNames){
        let removedBDIds = this.state.boundaryInfo.filter(item=>removedBDNames.indexOf(item.name)>-1).map(item=>item.id);
        this.setState({boundaryInfo:this.state.boundaryInfo.filter(item=>removedBDNames.indexOf(item.name)==-1)});
        removedBDIds.forEach(id=>{
            this.removeGraphic(id,'polygon');
        });
    }
    addHeatMap(heatMapData) {
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
    addPoint (arg) {
        let t = this;
        let pointIds = t.state.pointIds;
        arg.map(function (item,index) {
            if(pointIds.indexOf(item.id) === -1){
                let config = {
                    labelContent: '',
                    labelPixelX: 0,
                    labelPixelY: 34,
                    width : 30,
                    height : 30,
                    BAnimationType: 3
                };
                config = {...config,...item.config};
                t.state.gis.addPoint({
                    id : item.id,
                    longitude : item.longitude,
                    labelClass: item.labelClass,
                    latitude : item.latitude,
                    infoWindow : item.infoWindow || true,
                    url : item.url || '',
                    markerContent: item.markerContent || '',
                    canShowLabel: item.canShowLabel || false,
                    config: config,
                    other:item
                });
                pointIds.push(item.id);
            }
        });
        t.setState({pointIds});
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
    updatePoint (arg) {
        var t = this;
        arg.map(function (item,index) {
            let config = {
                labelContent: '',
                labelPixelX: 0,
                labelPixelY: 34,
                width : 30,
                height : 30,
                BAnimationType: 3
            };
            t.state.gis.updatePoint({
                id : item.id,
                longitude : item.longitude,
                latitude : item.latitude,
                labelClass: item.labelClass,
                infoWindow : item.infoWindow || true,
                url : item.url || '',
                markerContent: item.markerContent || '',
                canShowLabel: item.canShowLabel || false,
                config : {...config,...item.config},
                other:item
            });
        })
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
    addLine (arg) {
        var t = this;
        let lineIds = t.state.lineIds;
        arg.map(function (item,index) {
            if(lineIds.indexOf(item.id) === -1){
                let config = {
                    lineType : 'solid',
                    lineWidth : 5,
                    color : '',
                    pellucidity : 1
                };
                t.state.gis.addLine({
                    id : item.id,
                    paths : [item.paths],
                    infoWindow : item.infoWindow || true,
                    config : {...config,...item.config},
                    other:item
                });
                lineIds.push(item.id);
            }
        });
        t.setState({lineIds});
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
    addPolygon (arg) {
        var t = this;
        let polygonIds = t.state.polygonIds;
        arg.map(function (item,index) {
            if(polygonIds.indexOf(item.id) === -1){
                let config = {
                    lineType : 'solid',
                    lineWidth : 5,
                    color : "#fff",
                    pellucidity : .5,
                    lineColor : "",
                    lineOpacity : 1
                };
                t.state.gis.addPolygon({
                    id : item.id,
                    rings : [item.rings],
                    infoWindow : item.infoWindow || true,
                    config : {...config,...item.config},
                    other:item
                });
                polygonIds.push(item.id);
            }
        });
        t.setState({polygonIds});
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
    addCircle (arg) {
        var t = this;
        let circleIds = t.state.circleIds;
        arg.map(function (item,index) {
            if(circleIds.indexOf(item.id) === -1){
                let config = {
                    lineType : 'solid',
                    lineWidth : 5,
                    color : "#FFF",
                    pellucidity : .5,
                    lineColor : "rgb(58, 107, 219)",
                    lineOpacity : 1
                }
                t.state.gis.addCircle({
                    id : item.id,
                    longitude : item.longitude,
                    latitude : item.latitude,
                    radius : item.radius || 50,
                    infoWindow : item.infoWindow || true,
                    config : {...config,...item.config},
                    other:item
                });
                circleIds.push(item.id);
            }
        });
        t.setState({circleIds});
    }
    //加海量点
    addPointCollection(points){
        let t = this;
        points.map((item,index)=>{
            t.state.gis.addPointCollection(item);
        })
    }
    //更新海量点
    updatePointCollection(points){
        let t = this;
        points.map((item,index)=>{
            t.state.gis.updatePointCollection(item);
        })
    }
    //根据id删除对应海量点
    clearPointCollection(ids){
        let t = this;
        ids.map((item,index)=>{
            t.state.gis.clearPointCollection(item);
        })
    }
    //清除所有海量点
    clearAllPointCollection(){
        let t = this;
        t.state.gis.clearAllPointCollection();
    }
    //点击海量点事件
    clickPointCollection(){
        let t = this;
        t.state.gis.bind('clickPointCollection', function(param,e) {
            let obj = {
                attributes: e.point.attributes,
                lng: e.point.lng,
                lat: e.point.lat,
                ...param
            }
            if(typeof(t.props.clickPointCollection) ==="function"){
                t.props.clickPointCollection(obj);
            }
        });
    }
    /*根据图元id,使图元变成可编辑状态*/
    doEdit (id){
        let t = this;
        let graphic = t.getGraphic(id);
        if(!graphic)
            return false;
        if(!!t.state.editId){
            t.endEdit();
        }
        t.state.gis.doEdit(graphic,id);
        t.setState({editId:id});
    }
    //关闭编辑
    endEdit (){
        let t = this;
        let graphic = t.getGraphic(t.state.editId);
        if(!graphic)
            return false;
        t.state.gis.endEdit(graphic);
        //避免死循环
        let editGraphic = t.state.editGraphic;
        if(editGraphic){
            t.setState({editGraphic:'',editId: ''},()=>{
                t.props.editGraphicChange(editGraphic);
            });
        }
    }
    //编辑变动后
    editGraphicChange(){
        let t = this;
        if(typeof(t.props.editGraphicChange) === 'function'){
            t.state.gis.bind('graphicVortexChange', function(param,e) {
                let obj = {
                    param,e,
                    id: param.attributes.id,
                    geometry: param.geometry
                }
                if(param.geometry.type == 'circle'){
                    if(t.editTimeout){
                        clearTimeout(t.editTimeout);
                    }
                    t.editTimeout = setTimeout(()=>{
                        t.setState({editGraphic:obj},()=>{
                            t.props.editGraphicChange(obj);
                        });
                    },300);
                }else{
                    t.setState({editGraphic:obj},()=>{
                        t.props.editGraphicChange(obj);
                    });
                }
            });
        }
    }
    //图元鼠标悬浮事件
    mouseOverGraphic(){
        let t = this;
        t.state.gis.bind('mouseOverGraphic', function(param,e) {
            let obj = {
                param,e,
                id: param.attributes.id,
            }
            // t.isSetTop(param.attributes.id,true);
            if(typeof(t.props.mouseOverGraphic) ==="function"){
                t.props.mouseOverGraphic(obj);
            }
        });
    }
    //图元鼠标移开事件
    mouseOutGraphic(){
        let t = this;
        t.state.gis.bind('mouseOutGraphic', function(param,e) {
            let obj = {
                param,e,
                id: param.attributes.id,
            }
            //取消点的置顶效果
            // t.isSetTop(param.attributes.id,false);
            if(typeof(t.props.mouseOutGraphic) ==="function"){
                t.props.mouseOutGraphic(obj);
            }
        });
    }
    //测距
    vtxRangingTool (backcall) {
        let t = this;
        t.state.gis.vtxRangingTool(function(obj){
            if(typeof(backcall) ==="function"){
                backcall(obj);
            }
        });
    }
    //是否置顶图元
    isSetTop(id,type){
        let t = this;
        let graphic = t.getGraphic(id);
        t.state.gis.isSetTop(graphic,type);
    }
    //删除图元
    removeGraphic (id,type) {
        let t = this;
        var graphic = t.getGraphic(id);
        if(!graphic)return false;
        t.state.gis.removeGraphic(graphic);
        let ids = [];
        switch(type){
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
        if(ids.indexOf(id) != -1){
            ids.splice(ids.indexOf(id),1);
        }
    }
    //点击图元事件
    clickGraphic () {
        let t = this;
        if(typeof(t.props.clickGraphic) ==="function"){
            t.state.gis.bind('clickGraphic', function(param,e) {
                let obj = {
                    param,
                    type: param.geometry.type,//图元类型
                    attributes: {...param.attributes.other,...{config:param.attributes.config}},//添加时图元信息
                    top: e.clientY,//当前点所在的位置(屏幕)
                    left: e.clientX,
                    e: e
                }
                t.props.clickGraphic(obj);
            });
        }
    }
    //拖拽地图开始
    dragMapStart(){
        let t = this;
        if(typeof(t.props.dragMapStart) ==="function"){
            t.state.gis.bind('dragMapStart', function(param,e) {
                let obj = t.getMapExtent();
                obj.e = e;
                //处理下数据,符合拖拽事件
               t.props.dragMapStart(obj);
            });
        }
    }
    //拖拽地图结束事件
    dragMapEnd() {
        let t = this;
        if(typeof(t.props.dragMapEnd) ==="function"){
            t.state.gis.bind('dragMapEnd', function(param,e) {
                let obj = t.getMapExtent();
                obj.e = e;
                //处理下数据,符合拖拽事件
               t.props.dragMapEnd(obj);
            });
        }
    }
    //地图移动开始事件
    moveStart(){
        let t = this;
        if(typeof(t.props.moveStart) ==="function"){
            t.state.gis.bind('moveStart', function(param,e) {
                let obj = t.getMapExtent();
                obj.e = e;
                //处理下数据,符合拖拽事件
                t.props.moveStart(obj);
            });
        }
    }
    //地图移动结束事件
    moveEnd(){
        let t = this;
        if(typeof(t.props.moveEnd) ==="function"){
            t.state.gis.bind('moveEnd', function(param,e) {
                let obj = t.getMapExtent();
                obj.e = e;
                //处理下数据,符合拖拽事件
                t.props.moveEnd(obj);
            });
        }
    }
    //地图更改缩放级别开始时触发触发此事件
    zoomStart(){
        let t =this;
        if(typeof(t.props.zoomStart) ==="function"){
            t.state.gis.bind('zoomStart', function(param,e) {
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.zoomStart(obj);
            });
        }
    }
    //地图更改缩放级别结束时触发触发此事件
    zoomEnd(){
        let t =this;
        if(typeof(t.props.zoomEnd) ==="function"){
            t.state.gis.bind('zoomEnd', function(param,e) {
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.zoomEnd(obj);
            });
        }
    }
    //地图点击事件
    clickMap(){
        let t =this;
        if(typeof(t.props.clickMap) ==="function"){
            t.state.gis.bind('clickMap', function(param,e) {
                let obj = t.getMapExtent();
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
    draw (obj) {
        var t = this;
        obj = obj || {};
        obj.data = obj.data || {};
        obj.data.id = obj.data.id || 'draw' + new Date().getTime();
        obj.geometryType = obj.geometryType || 'point';
        //判断有没有
        let len = t.state.drawIds[obj.geometryType].indexOf(obj.data.id);
        if(obj.data && obj.data.id && len > -1){
            t.removeGraphic(obj.data.id);
            t.state.drawIds[obj.geometryType].splice(len,1);
        }
        obj.parameter = obj.parameter || {url: t.state.defaultPoint};
        t.state.gis.draw(
            obj.geometryType,
            obj.parameter,
            obj.data
        );
        t.state.drawIds[obj.geometryType].push(obj.data.id);
    }
    //关闭绘制图元
    closeDraw(){
        this.state.gis.closeDraw();
    }
    //绘制图元结束回调
    drawEnd(){
        var t = this;
        if(typeof(t.props.drawEnd) ==="function"){
            t.state.gis.bind('drawEnd', function(src) {
                if(src.geometryType !== 'point'){
                    src.area = t.calculateArea(src.id);
                }
                t.props.drawEnd(src);
            });
        }
    }
    //计算图元面积(面,圆)
    calculateArea(id){
        var t = this;
        return t.state.gis.calculateArea(t.getGraphic(id));
    }
    //计算2点间距离 单位m 精确到个位
    calculatePointsDistance(f,s){
        return Math.round(this.state.gis.calculatePointsDistance(f,s));
    }
    /*公共方法*/
    //判断对应参数是否是数组
    isArray (ary) {
        return Object.prototype.toString.call(ary) === '[object Array]';
    }
    //判断对应参数是否是数组
    isObject (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
    //判断对应参数是否是函数
    isFunction(param){
        return typeof(param) === 'function';
    }
    //数据解析(分析,新增,更新,删除对应的数据)
    dataMatch(oldData,newData,type){
        let onlyOldData = Set(oldData).subtract(Set(newData)).toJS();
        let onlyNewData = Set(newData).subtract(Set(oldData)).toJS();
        let onlyOldIDs = onlyOldData.map(item=>item[type]);
        let onlyNewIDs = onlyNewData.map(item=>item[type]);
        let updateDataIDs = Set(onlyOldIDs).intersect(Set(onlyNewIDs)).toJS();
        let updatedData = onlyNewData.filter(item=> updateDataIDs.indexOf(item[type])>-1);
        let replacedData = onlyOldData.filter(item=> updateDataIDs.indexOf(item[type])>-1);
        let deletedDataIDs = onlyOldIDs.filter(oldID=>updateDataIDs.indexOf(oldID)==-1);
        let addedData = onlyNewData.filter(item=>updateDataIDs.indexOf(item[type])==-1)
       
        return {deletedDataIDs,addedData,updatedData,replacedData};
    }
    deepEqual(a,b){
        return Immutable.is(Immutable.fromJS(a),Immutable.fromJS(b));
    }
    render(){
        let t = this;
        let _map = this.props;
        return(
            <div id={_map.mapId} className={styles.map}></div>
        );
    }
    componentDidMount(){
        let t = this;
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
    componentDidUpdate(prevProps, prevState) {//重新渲染结束
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
    componentWillReceiveProps(nextProps) {//已加载组件，收到新的参数时调用
        let t = this;
        //点/线旧数据
        let {pointIds,lineIds,polygonIds,circleIds,center,boundaryInfo} = t.state;
        //点/线新数据
        let {
            mapPoints,mapLines,mapPolygons,mapCircles,
            mapCenter,setCenter,
            mapVisiblePoints,setVisiblePoints,
            mapCluster,setCluster,
            mapZoomLevel,setZoomLevel,
            isRangingTool,mapRangingTool,
            editGraphicId,isDoEdit,isEndEdit,
            boundaryName,heatMapData,customizedBoundary,
            mapDraw,isDraw,isCloseDraw,
            isClearAll,isOpenTrafficInfo,
            mapPointCollection,isclearAllPointCollection,
            isRemove,mapRemove,
            isSetAreaRestriction,areaRestriction,isClearAreaRestriction
        } = nextProps;
        /*添加海量点*/
        if(mapPointCollection instanceof Array && !t.deepEqual(mapPointCollection,t.props.mapPointCollection)){
            let {deletedDataIDs,addedData,updatedData} = t.dataMatch(t.props.mapPointCollection,mapPointCollection,'id');
            t.clearPointCollection(deletedDataIDs);
            t.addPointCollection(addedData);
            t.updatePointCollection(updatedData);
        }
        /*点数据处理
            pointData[2]相同的点,执行刷新
            pointData[1]的数据在idsForGraphicId中不存在的,执行新增
            pointData[0]数据中多余的id,执行删除
        */
        if(mapPoints instanceof Array && !t.deepEqual(mapPoints,t.props.mapPoints)){
            let oldMapPoints = t.props.mapPoints;
            let newMapPoints = mapPoints;
            //过滤编辑的图元
            if(!!t.state.editGraphic){
                oldMapPoints = t.props.mapPoints.filter((item)=>{return item.id !== editGraphicId});
                newMapPoints = mapPoints.filter((item)=>{return item.id !== editGraphicId});
            }
            let {deletedDataIDs,addedData,updatedData} = t.dataMatch(oldMapPoints,newMapPoints,'id');
            //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
            for(let id of deletedDataIDs){
                t.removeGraphic(id,'point');
            }
            //增加
            t.addPoint(addedData);
            //更新
            t.updatePoint(updatedData);
        }
        /*
            线数据处理
            先全删除,再新增
        */
        if(mapLines instanceof Array && !t.deepEqual(mapLines,t.props.mapLines)){
            let oldMapLines = t.props.mapLines;
            let newMapLines = mapLines;
            if(!!t.state.editGraphic){
                oldMapLines = t.props.mapLines.filter((item)=>{return item.id !== editGraphicId});
                newMapLines = mapLines.filter((item)=>{return item.id !== editGraphicId});
            }
            let {deletedDataIDs,addedData,updatedData} = t.dataMatch(oldMapLines,newMapLines,'id');
            //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
            let actDelIds = [...deletedDataIDs,...updatedData.map(item=>item.id)];
            for(let id of actDelIds){
                t.removeGraphic(id,'line');
            }
            t.addLine([...addedData,...updatedData]);            
        }
        /*
            面数据处理
            先全删除,再新增
        */
        if(mapPolygons instanceof Array && !t.deepEqual(mapPolygons,t.props.mapPolygons)){
            let oldMapPolygons = t.props.mapPolygons;
            let newMapPolygons = mapPolygons;
            if(!!t.state.editGraphic){
                oldMapPolygons = t.props.mapPolygons.filter((item)=>{return item.id !== editGraphicId});
                newMapPolygons = mapPolygons.filter((item)=>{return item.id !== editGraphicId});
            }
            let {deletedDataIDs,addedData,updatedData} = t.dataMatch(oldMapPolygons,newMapPolygons,'id');
            //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
            let actDelIds = [...deletedDataIDs,...updatedData.map(item=>item.id)];
            for(let id of actDelIds){
                t.removeGraphic(id,'polygon');
            }
            t.addPolygon([...addedData,...updatedData]);
        }
        /*
            圆数据处理
            先全删除,再新增
        */
        if(mapCircles instanceof Array && !t.deepEqual(mapCircles,t.props.mapCircles)){
            let oldMapCircles = t.props.mapCircles;
            let newMapCircles = mapCircles;
            if(!!t.state.editGraphic){
                oldMapCircles = t.props.mapCircles.filter((item)=>{return item.id !== editGraphicId});
                newMapCircles = mapCircles.filter((item)=>{return item.id !== editGraphicId});
            }
            let {deletedDataIDs,addedData,updatedData} = t.dataMatch(oldMapCircles,newMapCircles,'id');
            //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
            let actDelIds = [...deletedDataIDs,...updatedData.map(item=>item.id)];
            for(let id of actDelIds){
                t.removeGraphic(id,'circle');
            }
            t.addCircle([...addedData,...updatedData]);
        }
        //图元编辑调用
        if(isDoEdit){
            t.doEdit(editGraphicId);
        }
        if(isEndEdit){
            t.endEdit();
        }
        //绘制边界线
        if(boundaryName instanceof Array && !t.deepEqual(boundaryName,t.props.boundaryName)){
            let newBDName = Set(boundaryName);
            let oldBDName = Set(t.props.boundaryName);
            let removedBoundaryName = oldBDName.subtract(newBDName).toJS();
            let addedBoundaryName = newBDName.subtract(oldBDName).toJS();
            t.removeBaiduBoundary(removedBoundaryName);
            t.addBaiduBoundary(addedBoundaryName);
        }
        // 获取热力图
        if(heatMapData && !t.deepEqual(heatMapData,t.props.heatMapData)){
            t.addHeatMap(heatMapData);
        }
        if(customizedBoundary instanceof Array && !t.deepEqual(customizedBoundary,t.props.customizedBoundary)){
            let {deletedDataIDs,addedData,updatedData} = t.dataMatch(t.props.customizedBoundary,customizedBoundary,'id');
            //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
            let actDelIds = [...deletedDataIDs,...updatedData.map(item=>item.id)];
            for(let id of actDelIds){
                t.removeGraphic(id,'line');
            }
            t.addLine([...addedData,...updatedData]);            
        }
        //绘制图元
        if(isDraw){
            t.draw(mapDraw);
        }
        if(isCloseDraw){
            t.closeDraw();
        }
        if(isClearAll){
            t.clearAll();
        }
        if(setVisiblePoints){
            switch(mapVisiblePoints.fitView){
                case 'point':
                    t.setVisiblePoints(pointIds,mapVisiblePoints.type);
                break;
                case 'line':
                    t.setVisiblePoints(lineIds,mapVisiblePoints.type);
                break;
                case 'polygon':
                    t.setVisiblePoints(polygonIds,mapVisiblePoints.type);
                break;
                case 'circle':
                    t.setVisiblePoints(circleIds,mapVisiblePoints.type);
                break;
                case 'all':
                    t.setVisiblePoints(pointIds.concat(lineIds).concat(polygonIds).concat(circleIds),mapVisiblePoints.type);
                break;
                default:
                    t.setVisiblePoints(mapVisiblePoints.fitView,mapVisiblePoints.type);
                break;
            }
        }
        //设置中心点
        if(setCenter){
            if(!(t.getCurrentCenter()[0] == mapCenter[0] && t.getCurrentCenter()[1] == mapCenter[1])){
                t.setCenter(mapCenter);
            }
        }
        //设置点聚合
        if(setCluster){
            t.cluster(mapCluster);
        }
        //设置比例尺
        if(setZoomLevel){
            if(!(t.getZoomLevel() == mapZoomLevel)){
                t.setZoomLevel(mapZoomLevel);
            }
        }
        //测距工具调用
        if(isRangingTool){
            t.vtxRangingTool(mapRangingTool);
        }
        if(isOpenTrafficInfo){
            t.openTrafficInfo();
        }else{
            t.hideTrafficInfo();
        }
        if(isclearAllPointCollection){
            t.clearAllPointCollection();
        }
        if(isRemove){
            mapRemove.map((item,index)=>{
                switch(item.type){
                    case 'draw':
                        t.removeGraphic(item.id);
                        if(t.state.drawIds.point.indexOf(item.id) > -1){
                            t.state.drawIds.point.splice(t.state.drawIds.point.indexOf(item.id),1);
                        }
                        if(t.state.drawIds.polyline.indexOf(item.id) > -1){
                            t.state.drawIds.polyline.splice(t.state.drawIds.polyline.indexOf(item.id),1);
                        }
                        if(t.state.drawIds.polygon.indexOf(item.id) > -1){
                            t.state.drawIds.polygon.splice(t.state.drawIds.polygon.indexOf(item.id),1);
                        }
                        if(t.state.drawIds.circle.indexOf(item.id) > -1){
                            t.state.drawIds.circle.splice(t.state.drawIds.circle.indexOf(item.id),1);
                        }
                        if(t.state.drawIds.rectangle.indexOf(item.id) > -1){
                            t.state.drawIds.rectangle.splice(t.state.drawIds.rectangle.indexOf(item.id),1);
                        }
                    break;
                    default :
                        t.removeGraphic(item.id,item.type);
                    break;
                }
            });
        }
        //设置区域限制
        if(isSetAreaRestriction && areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]){
            t.setAreaRestriction(areaRestriction);
        }
        if(isClearAreaRestriction){
            t.clearAreaRestriction();
        }
    }
}

export default Map;