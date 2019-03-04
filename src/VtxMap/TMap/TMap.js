import React from 'react';
import './TMap.css';
import {graphicManage,getMaxMin,getPolygonArea} from '../MapToolFunction';
import Immutable from 'immutable';
const {Set} = Immutable;
//公共地址配置
import configUrl from '../../default';
class TMap extends React.Component{
    constructor(props){
        super(props);
        //初始化 图元管理方法
        this.GM = new graphicManage();
        this.getPolygonArea = getPolygonArea;
        this.pointCollectionId = 'vtx_gmap_html_pointCollection';//海量点canvas点位容器id class管理
        this.isNotClickMap = false;//阻止点击事件冒泡到地图
        this.isZoom = false;//阻止 zoom事件后触发的移动事件
        this.mapLeft = 0;//地图offset的Left值
        this.mapTop = 0;//地图offset的Top值
        this.clusterObj = null;//聚合对象
        this.clusterMarkers = null;//聚合的点集合
        this.markerTool = null;//绘制点对象
        this.polylineTool = null;//绘制线对象
        this.polygonTool = null;//绘制面对象
        this.rectangleTool = null;//绘制矩形对象
        this.circleTool = null;//绘制圆对象
        this.isEditId = null;//记录当前编辑的id,过滤移入移出事件
        this.moveToTimer = null;//moveTo时间对象
        this.movePoints = [];//move点的对象集合
        this.morepoints = [];//海量点集合
        this.heatmap = null;//热力图对象
        this.animTimer = {};//点位跳动动画
        this.animCount = {};//点位跳动动画 位置记录
        this.waitInit = null; //等加载定时
        this.isLoading = false; //是否加载完
        this.waitReceive = null;//等初始化,更新定时
        this.state={
            gis: null,//地图对象
            mapId: props.mapId,
            mapCreated: false,
            pointIds:[], //地图上点的ids
            lineIds:[], //地图上线的ids
            polygonIds:[], //地图上面的ids
            circleIds:[], //地图上圆的ids
            editId: '',//当前编辑的图元id
            editGraphic: '',//当前编辑完后图元所有数据
            // center: props.mapCenter,
            mapZoomLevel: props.mapZoomLevel,
            boundaryInfo: [],//当前画出的边界线的id和区域名
            drawIds: {//绘制工具id集合
                point: [],
                polyline: [],
                polygon: [],
                circle: [],
                rectangle: []
            },
            controlStyle: 'lt'
        }
        this.loadMapJs();
    }
    loadMapJs(){
        let t = this;
        this.loadMapComplete = new Promise((resolve,reject)=>{
            if(window.T){
                resolve(window.T);
            }
            else{
                $.getScript(`${configUrl.mapServerURL}/T_content.js`,()=>{
                    $.getScript('http://api.tianditu.gov.cn/api?v=4.0&tk=e781ae595c43649431fb7270328e0669',()=>{
                        let Heatmap = new Promise((resolve,reject)=>{
                            //对象问题  和arcgis使用不同的热力图
                            $.getScript(`${configUrl.mapServerURL}/Theatmap.js`,()=>{
                                resolve();
                            });
                        });
                        let PointCollection = new Promise((resolve,reject)=>{
                            $.getScript(`${configUrl.mapServerURL}/GPointCollection.js`,()=>{
                                resolve();
                            });
                        });
                        // let components = new Promise((resolve,reject)=>{
                        //     $.getScript(`${configUrl.mapServerURL}/T_toolComponents.js`,()=>{
                        //         resolve();
                        //     })
                        // });
                        Promise.all([Heatmap,PointCollection/*,components*/]).then(()=>{
                            if(t.waitInit){
                                clearInterval(t.waitInit);
                            }
                            t.waitInit = setInterval(()=>{
                                if(T.Tool){
                                    clearInterval(t.waitInit);
                                    resolve(window.T);
                                }
                            },50)
                        })
                    })
                })
            }
        });
    }
    init(){
        let t = this;
        const {
            mapPoints,mapLines,mapPolygons,mapCircles,
            setVisiblePoints,mapVisiblePoints,
            mapCenter,mapZoomLevel,
            mapCluster,mapPointCollection,
            showControl,boundaryName,
            areaRestriction,heatMapData
        } = t.props;
        //创建地图
        t.createMap();
        //添加点
        if(mapPoints instanceof Array){
            t.addPoint(mapPoints);
        }
        //添加线
        if(mapLines instanceof Array){
            t.addLine(mapLines);
        }
        // //添加面
        if(mapPolygons instanceof Array){
            t.addPolygon(mapPolygons);
        }
        //添加圆
        if(mapCircles instanceof Array){
            t.addCircle(mapCircles);
        }
        /*设置指定图元展示*/
        if(mapVisiblePoints){
            t.setVisiblePoints(mapVisiblePoints);
        }
        // 画热力图
        if(heatMapData){
            t.heatMapOverlay(heatMapData);
        }
        //添加海量点
        if(mapPointCollection instanceof Array){
            setTimeout(()=>{
                t.addPointCollection(mapPointCollection);
            },100)
        }
        //设置比例尺
        if(mapZoomLevel){
            t.setZoomLevel(mapZoomLevel);
        }
        //设置点聚合
        if(mapCluster){
            t.cluster(mapCluster);
        }
        // //展示比例尺
        if(showControl){
            t.showControl();
        }

        // //画边界线
        // if(boundaryName instanceof Array && boundaryName.length>0){
        //     t.addBaiduBoundary(boundaryName);
        // }

        //设置区域限制
        if(areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]){
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
            mapCreated:true
        });
    }
    createMap(){
        let t = this;
        const {mapCenter=[],mapId,mapZoomLevel,minZoom,maxZoom} = t.props;
        window.VtxMap = {};
        window.VtxMap[mapId] = t.state.gis = new T.Map(mapId,{
            //zoom等级,和百度一样默认10
            zoom: mapZoomLevel || 10,
            //必须有中心点,不传默认在北京(不设置中心点,报错)
            center: mapCenter?new T.LngLat(mapCenter[0] || 116.40769, mapCenter[1] || 39.906705)
                                :new T.LngLat(116.40769, 39.89945),
            minZoom: minZoom || 1,
            maxZoom: maxZoom || 18
        });
        //海量点图元容器
        t.pointCollectionId = `${mapId}_${t.pointCollectionId}`;
        let pointCollectionDiv = document.createElement('div');
        pointCollectionDiv.id = t.pointCollectionId;
        pointCollectionDiv.class = 'vtx_gmap_html_pointCollection_t';
        pointCollectionDiv.className = 'vtx_gmap_html_pointCollection_t';
        $(t.state.gis.getPanes().mapPane.children[0]).before(pointCollectionDiv);
    }
    //清空地图所有图元
    clearAll (){
        let t = this;
        //清空热力图
        if(t.heatmap){
            t.heatmap.clear();
        }
        t.heatmap = null;
        //先清除所有标记
        if(t.clusterMarkers){
            t.clusterObj.removeMarkers(t.clusterMarkers);
        }
        t.clearAllPointCollection();
        //清空点
        t.state.gis.getOverlays().map((item,index)=>{
            t.state.gis.removeOverLay(item);
        })
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
    setCenter (gt) {
        let t =this;
        if(gt){
            t.state.gis.centerAndZoom(new T.LngLat(gt[0], gt[1]),t.state.gis.getZoom());
        }else{
            t.state.gis.centerAndZoom(new T.LngLat(116.400433, 39.906705),t.state.gis.getZoom());
        }
    }
    /*地图区域限制*/
    setAreaRestriction(sw_ne){
        let t =this;
        let bounds = new T.LngLatBounds(new T.LngLat(sw_ne[0][0],sw_ne[0][1]),new T.LngLat(sw_ne[1][0],sw_ne[1][1]))
        t.state.gis.setMaxBounds(bounds);
    }
    clearAreaRestriction(){
        this.state.gis.setMaxBounds(null);
    }
    //设置指定图元展示   高德只有zoom和center全适应,单适应暂时无法实现
    setVisiblePoints(obj){
        let t = this;
        let ls = [];
        let {pointIds,lineIds,polygonIds,circleIds} = t.state;
        let getLngLats = (ids)=>{
            let alnglat = [];
            t.GM.getMoreGraphic(ids).map((item,index)=>{
                //根据天地图 覆盖物类型获取lnglat
                switch(item.getType()){
                    case 1:
                    case 2:
                        alnglat.push(item.getLngLat());
                    break;
                    case 4:
                        alnglat.push(...item.getLngLats());
                    break;
                    case 5://多边形 返回的是 三维数组
                        alnglat.push(...item.getLngLats()[0]);
                    break;
                    case 8:
                        alnglat.push(item.getCenter());
                    break;
                }
            });
            return alnglat;
        }
        //算出 要展示的图元点位
        switch(obj.fitView){
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
                ls = getLngLats([...pointIds,...lineIds,...polygonIds,...circleIds]);
            break;
            default:
                let ids = [];
                if(obj.fitView instanceof Array){
                    ids = obj.fitView;
                }else if(typeof(obj.fitView) === 'string'){
                    ids = obj.fitView.split(',');
                }
                if(ids[0] instanceof Array){
                    for(let i = 0 ; i < ids.length ; i++){
                        ls = new T.LngLat(ids[i][0],ids[i][1]);
                    }
                }else{
                    ls = getLngLats(ids);
                }
            break;
        }
        if(ls.length >= 1){
            if(obj.type == 'zoom'){
                t.setZoomLevel(t.state.gis.getViewport(ls).zoom);
            }else if(obj.type == 'center'){
                let {center} = (t.state.gis.getViewport(ls));
                t.setCenter([center.lng,center.lat]);
            }else{
                t.state.gis.setViewport(ls);
            }
        }
    }

    //设置地图比例尺
    setZoomLevel (zoom) {
        let t =this;
        t.state.gis.centerAndZoom(t.state.gis.getCenter(),zoom);
    }
    //获取当前地图的中心位置
    getCurrentCenter(){
        let t =this;
        return {
            lat: t.state.gis.getCenter().lat,
            lng: t.state.gis.getCenter().lng
        };
    }
    //获取当前比例尺
    getZoomLevel (){
        let t = this;
        return t.state.gis.getZoom();
    }
    //获取当前地图边框左右边角经纬度,中心点位置,和比例尺,半径距离
    getMapExtent(){
        let t =this;
        let {gis} = t.state;
        let obj = {
            mapSize: {width:gis.getSize().x,height:gis.getSize().y},
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
        }
        obj.radius = t.calculatePointsDistance([obj.nowCenter.lng,obj.nowCenter.lat],[
            gis.getBounds().getNorthEast().getLng(),gis.getBounds().getNorthEast().getLat()]);
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
        let ms = this.GM.getMoreGraphic(ary).filter((item,index)=>{
            // return !item && item != 0 ? false : true;
            return item && item.getType() === 2 && !item.label;
        });
        //聚合的对象,便于后期清除时调用
        this.clusterObj = new T.MarkerClusterer(t.state.gis, {markers: ms});
        //记录聚合的点,便于后期清除
        this.clusterMarkers = ms;
    }
    //设置比例尺
    showControl(){
        let t =this;
        let zlt = T_ANCHOR_BOTTOM_RIGHT;
        let zls = T_ANCHOR_BOTTOM_RIGHT;
        if(t.props.showControl){
            switch(t.props.showControl.location){
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
        let zoomControl,scaleControl;
        switch(t.props.showControl.type){
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
        let fdom = document.getElementById(t.props.mapId);
        //天地图 api问题  使用js dom操作css
        if(t.props.showControl && t.props.showControl.location == 'bl'){
            let dom = fdom.getElementsByClassName('tdt-control-scale')[0];
            dom.style.position = 'relative';
            dom.style.top = '65px';
            dom.style.left = '45px';
        }
        if(t.props.showControl && t.props.showControl.location == 'br'){
            let dom = fdom.getElementsByClassName('tdt-control-scale')[0];
            dom.style.position = 'relative';
            dom.style.top = '65px';
            dom.style.right = '45px';
        }
    }
    //测距
    vtxRangingTool () {
        let t = this;
        //将map对象放到全局中.是因为天地图api中使用了全局map.(坑B)
        window.map = t.state.gis;
        //创建标注工具对象
        let lineTool = new T.PolylineTool(t.state.gis,{showLabel: true});
        lineTool.open();
        this.isNotClickMap = true;
        //监听每次点击事件,阻止地图点击事件冒泡
        lineTool.addEventListener('addpoint',()=>{
            this.isNotClickMap = true;
        })
        lineTool.addEventListener('draw',(obj)=>{
            if('mapRangingTool' in t.props){
                t.props.mapRangingTool({
                    distance: obj.currentDistance,
                    lnglats: obj.currentLnglats.map((item,index)=>{
                        return [item.lng,item.lat];
                    })
                });
            }
        })
    }
    //获取图元数据
    getGraphic (id) {
        let t = this;
        if(!id){
            return false;
        }
        let gp = t.GM.getGraphicParam(id);
        let gg = t.GM.getGraphic(id);
        if(!gg){
            return false;
        }
        let p = {},pts = [],lng = 0,lat = 0;
        switch(gp.geometryType){
            case 'point':
                lng = gg.getLngLat().getLng();
                lat = gg.getLngLat().getLat();
                p = {
                    ...gp,
                    mapLayer: gg,
                    geometry: {
                        ...gp.geometry,
                        x: lng,
                        y: lat
                    },
                    attributes: {
                        ...gp.attributes,
                        longitude: lng,
                        latitude: lat,
                        other: {
                            ...gp.attributes.other,
                            longitude: lng,
                            latitude: lat,
                        }
                    }
                }
            break;
            case 'polyline':
                pts = gg.getLngLats().map((item,index)=>{
                    return [item.lng,item.lat]
                });
                p = {
                    ...gp,
                    mapLayer: gg,
                    geometry: {
                        ...gp.geometry,
                        paths: pts
                    },
                    attributes: {
                        ...gp.attributes,
                        paths: pts,
                        other: {
                            ...gp.attributes.other,
                            paths: pts
                        }
                    }
                }
            break;
            case 'polygon':
                pts = gg.getLngLats()[0].map((item,index)=>{
                    return [item.lng,item.lat]
                });
                p = {
                    ...gp,
                    mapLayer: gg,
                    geometry: {
                        ...gp.geometry,
                        rings: pts
                    },
                    attributes: {
                        ...gp.attributes,
                        rings: pts,
                        other: {
                            ...gp.attributes.other,
                            rings: pts
                        }
                    }
                }
            break;
            case 'circle':
                lng = gg.getCenter().getLng();
                lat = gg.getCenter().getLat();
                let radius = gg.getRadius();
                p = {
                    ...gp,
                    mapLayer: gg,
                    geometry: {
                        ...gp.geometry,
                        x: lng,
                        y: lat,
                        radius
                    },
                    attributes: {
                        ...gp.attributes,
                        longitude: lng,
                        latitude: lat,
                        radius,
                        other: {
                            ...gp.attributes.other,
                            longitude: lng,
                            latitude: lat,
                            radius
                        }
                    }
                }
            break;
        }
        return p;
    }
    //添加点
    addPoint(mapPoints,type){
        let t = this;
        let psids = [...t.state.pointIds];
        mapPoints.map((item,index)=>{
            let cg = {
                width: 33,
                height: 33,
                labelContent: '',
                labelPixelX: 0,
                labelPixelY: 33,
                markerContentX: -16.5,
                markerContentY: -33,
                zIndex: 100,
                deg: 0
            }
            //如果id重复,直接跳过不执行.
            if (this.GM.isRepetition(item.id)) {
                console.error(`加点id: ${item.id} 重复`);
                return false;
            }
            //点位数据不符合,直接跳过
            if(!item.longitude || !item.latitude){
                console.error(`点 经纬度 数据错误`);
                return false;
            }
            if(item.markerContent){
                cg = {...cg,markerContentX: 0,markerContentY: 0,width:100,height:30};
            }
            //初始化默认数据
            if(item.config){
                cg = {...cg,...item.config};
            }
            //覆盖物参数
            let markerOption = {
                zIndexOffset: cg.zIndex,
                opacity: 1
            }
            let marker = null;
            //判断html还是图片
            if(!!item.markerContent){
                markerOption.icon = new T.Icon({
                    iconUrl: item.url || `${configUrl.mapServerURL}/images/touming.png`,
                    iconSize: new T.Point(cg.width,cg.height),
                    iconAnchor: new T.Point(-cg.markerContentX,-cg.markerContentY)
                });
                if(cg.zIndex !== undefined || cg.zIndex !== null){
                    markerOption.zIndexOffset = cg.zIndex;
                }
                //获得覆盖物对象
                marker = new T.Marker(new T.LngLat(item.longitude,item.latitude),markerOption);
                t.state.gis.addOverLay(marker);
                //-12,+15测试的阈值
                marker.label = new T.Label({
                    text: item.markerContent,
                    offset: new T.Point(cg.markerContentX-12,cg.markerContentY+15)
                });
                marker.showLabel();
                //统一加点
            }else{
                markerOption.icon = new T.Icon({
                    iconUrl: item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                    iconSize: new T.Point(cg.width,cg.height),
                    iconAnchor: new T.Point(-cg.markerContentX,-cg.markerContentY)
                });
                if(cg.zIndex !== undefined || cg.zIndex !== null){
                    markerOption.zIndexOffset = cg.zIndex;
                }
                //获得覆盖物对象
                marker = new T.Marker(new T.LngLat(item.longitude,item.latitude),markerOption);
                //添加点击事件
                //统一加点
                t.state.gis.addOverLay(marker);
                //是否展示label
                if(item.canShowLabel){
                    let labelClass = item.labelClass || 'label-content';
                    marker.label = new T.Label({
                        text: `<div class='${labelClass}'>${cg.labelContent}</div>`,
                        offset: new T.Point((cg.labelPixelX - (cg.width/2)),cg.labelPixelY + (cg.markerContentY + cg.height/2))
                    })
                    marker.showLabel();
                }
            }
            //点跳动动画
            if(!item.markerContent && cg.BAnimationType == 0){
                t.pointAnimation(item.id,marker);
            }else{
                t.pointAnimation(item.id,null);
            }
            if(cg.deg){
                marker.getElement().style.transform = marker.getElement().style.transform + ` rotate(${cg.deg}deg)`;
                marker.getElement().style['-ms-transform'] = ` rotate(${cg.deg}deg)`;
            }
            marker.addEventListener( 'click', (e)=>{
                t.clickGraphic(item.id,e);
            });
            marker.addEventListener( 'mouseover', (e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            marker.addEventListener( 'mouseout', (e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            psids.push(item.id);
            //缓存图元的数据,偏于后期操作
            this.GM.setGraphic(
                item.id,marker
            ).setGraphicParam(
                item.id,
                {
                    attributes: {...item,other: item},
                    geometryType: 'point',
                    geometry: {
                        type: 'point',
                        x: item.longitude,
                        y: item.latitude
                    },
                    deg: cg.deg
                }
            );
        });
        if(type !== 'defined'){
            t.setState({
                pointIds: psids
            });
        }
    }
    //更新点
    updatePoint(mapPoints){
        let t = this;
        mapPoints.map((item,index)=>{
            //判断图元是否存在.
            if (this.GM.isRepetition(item.id)) {
                //点位数据不符合,直接跳过
                if(!item.longitude || !item.latitude){
                    console.error(`点 经纬度 数据错误`);
                    return false;
                }
                //获取原有的图元
                let gc = this.GM.getGraphic(item.id);
                let cg = null;
                if(!!item.markerContent){
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
                    if(!(item.config || {}).isAnimation){
                        //修改经纬度
                        gc.setLngLat(new T.LngLat(item.longitude,item.latitude));
                    }
                    if(gc.label){
                        this.state.gis.removeOverLay(gc.label);
                    }
                    gc.label = new T.Label({
                        text: item.markerContent,
                        offset: new T.Point(cg.markerContentX-12,cg.markerContentY+15)
                    });
                    gc.showLabel();
                }else{
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
                        labelPixelY: 33,
                    };
                    gc.setIcon(new T.Icon({
                        iconUrl: item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                        iconSize: new T.Point(cg.width,cg.height),
                        iconAnchor: new T.Point(-cg.markerContentX,-cg.markerContentY)
                    }));
                    if(!(item.config || {}).isAnimation){
                        //修改经纬度
                        gc.setLngLat(new T.LngLat(item.longitude,item.latitude));
                    }
                    //是否展示label
                    if(item.canShowLabel){
                        if(gc.label){
                            this.state.gis.removeOverLay(gc.label);
                        }
                        // cg.labelPixelX= (item.config || {}).labelPixelX?(item.config || {}).labelPixelX - (cg.width/2):gc.getLabel().options.offset.x;
                        // cg.labelPixelY= (item.config || {}).labelPixelY?(item.config || {}).labelPixelY + (cg.markerContentY + cg.height/2):gc.getLabel().options.offset.y;
                        // cg.labelContent= (item.config || {}).labelContent || gc.getLabel().options.text;
                        cg.labelPixelX= (item.config || {}).labelPixelX?(item.config || {}).labelPixelX - (cg.width/2):cg.labelPixelX - cg.width/2;
                        cg.labelPixelY= (item.config || {}).labelPixelY?(item.config || {}).labelPixelY + (cg.markerContentY + cg.height/2):cg.labelPixelY + (cg.markerContentY + cg.height/2);
                        cg.labelContent= (item.config || {}).labelContent || '';
                        let labelClass = item.labelClass || 'label-content';
                        //更新label
                        gc.label = new T.Label({
                            text: `<div class='${labelClass}'>${cg.labelContent}</div>`,
                            offset: new T.Point(cg.labelPixelX,cg.labelPixelY)
                        })
                        gc.showLabel();
                    }
                    //设置点的标记添加顺序
                    gc.setZIndexOffset(cg.zIndex);
                }
                //点跳动动画
                if(!item.markerContent && cg.BAnimationType == 0){
                    t.pointAnimation(item.id,gc);
                }else{
                    t.pointAnimation(item.id,null);
                }
                if(cg.deg){
                    gc.getElement().style.transform = gc.getElement().style.transform + ` rotate(${cg.deg}deg)`;
                    gc.getElement().style['-ms-transform'] = ` rotate(${cg.deg}deg)`;
                }
                //动画效果会延迟执行经纬度的切换
                if((item.config || {}).isAnimation){
                    t.moveTo(item.id,[item.longitude,item.latitude],(item.config || {}).animationDelay,(item.config || {}).autoRotation,item.url,item.urlleft);
                }
                this.GM.setGraphicParam(
                    item.id,
                    {
                        attributes: {...item,other: item},
                        geometryType: 'point',
                        geometry: {
                            type: 'point',
                            x: item.longitude,
                            y: item.latitude
                        },
                        deg: cg.deg || 0
                    }
                );
            }else{
                console.error(`更新的点id不存在!`);
                return false;
            }
        });
        t.moveAnimation();
    }
    //添加线
    addLine(mapLines,type){
        let t = this;
        let lsids = [...t.state.lineIds];
        //遍历添加线(图元)
        mapLines.map((item,index)=>{
            let cg = {
                color: '#277ffa',
                pellucidity: 0.9,
                lineWidth: 5,
                lineType: 'solid',
                isHidden: false
            }
            //如果id重复,直接跳过不执行.
            if (this.GM.isRepetition(item.id)) {
                console.error(`多折线id: ${item.id} 重复`);
                return false;
            }
            //多折线点位数据不符合,直接跳过
            if(!(item.paths && item.paths.length >= 2)){
                console.error(`多折线paths数据错误`);
                return false;
            }
            if(item.config){
                cg = {...cg,...item.config};
            }
            let lineOption = {
                color: cg.color,
                opacity: cg.pellucidity,
                weight: cg.lineWidth,
                lineStyle: cg.lineType,
                path: item.paths || [],
            }
            //天地图没有hidden方法,所以用weight为0来实现
            if(cg.isHidden){
               lineOption.weight = 0;
            }
            let p = lineOption.path.map((itm,ind)=>{
                return new T.LngLat(itm[0],itm[1]);
            });
            let polyline = new T.Polyline(p,lineOption);
            t.state.gis.addOverLay(polyline);
            // 添加点击事件
            polyline.addEventListener( 'click', (e)=>{
                t.isNotClickMap = true;
                t.clickGraphic(item.id,e);
            });
            polyline.addEventListener( 'mouseover', (e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            polyline.addEventListener( 'mouseout', (e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            //缓存图元的数据,便于后期操作
            let pts = item.paths.map((itm,ind)=>{
                return [...itm];
            });
            this.GM.setGraphic(item.id,polyline).setGraphicParam(
                item.id,
                {
                    attributes: {
                        ...item,
                        paths: [pts],
                        other: item
                    },
                    geometryType: 'polyline',
                    geometry: {
                        type: 'polyline',
                        paths: [pts]
                    }
                }
            );
            lsids.push(item.id);
            //state中缓存 line的id...用于数据判断
            t.state.lineIds.push(item.id);
        });
        if(type !== 'defined'){
            t.setState({
                lineIds: lsids
            });
        }
    }
    //更新线
    updateLine(mapLines){
        let t = this;
        //遍历添加线(图元)
        mapLines.map((item,index)=>{
            //判断图元是否存在.
            if (this.GM.isRepetition(item.id)) {
                //多折线点位数据不符合,直接跳过
                if(!(item.paths && item.paths.length >= 2)){
                    console.error(`多折线paths数据错误`);
                    return false;
                }
                //获取原有的图元
                let gc = this.GM.getGraphic(item.id);
                //获取原有的线属性,转换key值
                let cg = {
                    color: gc.getColor(),
                    pellucidity: gc.getOpacity(),
                    lineWidth: gc.getWeight(),
                    lineType: gc.getLineStyle()
                };
                //重新初始化值
                if(item.config){
                    cg = {...cg,...item.config};
                }
                //更新线
                gc.setColor(cg.color);
                gc.setOpacity(cg.pellucidity);
                gc.setLineStyle(cg.lineType);
                //根据参数判断是否显示多折线
                gc.setWeight(cg.lineWidth || 5);
                if(item.config && item.config.isHidden){
                    gc.setWeight(0);
                }
                //更新经纬度
                let p = item.paths.map((itm,ind)=>{
                    return new T.LngLat(itm[0],itm[1]);
                });
                gc.setLngLats(p);
                //处理数据  用于其他事件返回
                let pts = item.paths.map((itm,ind)=>{
                    return [...itm];
                });
                this.GM.setGraphicParam(
                    item.id,
                    {
                        attributes: {
                            ...item,
                            paths: [pts],
                            other: item
                        },
                        geometryType: 'polyline',
                        geometry: {
                            type: 'polyline',
                            paths: [pts]
                        }
                    }
                );
            }else{
                console.error(`更新的多折线id不存在!`);
                return false;
            }
        });
    }
    //添加面
    addPolygon(mapPolygons){
        let t = this;
        let pgsids = [...t.state.polygonIds];
        //遍历添加面(图元)
        mapPolygons.map((item,index)=>{
            let cg = {
                lineType: 'solid',
                lineWidth: 5,
                lineColor: '#277ffa',
                lineOpacity: 1,
                color: '#fff',
                pellucidity: 0.5
                // isHidden: false  //后期跟百度一起加
            }
            //如果id重复,直接跳过不执行.
            if (this.GM.isRepetition(item.id)) {
                console.error(`多边形id: ${item.id} 重复`);
                return false;
            }
            //多边形点位数据不符合,直接跳过
            if(!(item.rings && item.rings.length >= 3)){
                console.error(`多边形rings数据错误`);
                return false;
            }
            if(item.config){
                cg = {...cg,...item.config};
            }
            let polygonOption = {
                color: cg.lineColor,
                opacity: cg.lineOpacity,
                weight: cg.lineWidth,
                lineStyle: cg.lineType,
                fillColor: cg.color,
                fillOpacity: cg.pellucidity,
                path: item.rings || []
            }
            let r = polygonOption.path.map((itm,ind)=>{
                return new T.LngLat(itm[0],itm[1]);
            });
            let polygon = new T.Polygon(r,polygonOption);
            this.state.gis.addOverLay(polygon);
            //添加点击事件
            polygon.on( 'click', (e)=>{
                t.isNotClickMap = true;
                t.clickGraphic(item.id,e);
            });
            polygon.on( 'mouseover', (e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            polygon.on( 'mouseout', (e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            //缓存图元的数据,便于后期操作
            let pts = item.rings.map((itm,ind)=>{
                return [...itm];
            });
            this.GM.setGraphic(item.id,polygon).setGraphicParam(
                item.id,
                {
                    attributes: {
                        ...item,
                        rings: [pts],
                        other: item
                    },
                    geometryType: 'polygon',
                    geometry: {
                        type: 'polygon',
                        rings: [pts]
                    },
                }
            );
            pgsids.push(item.id);

        });
        t.setState({
            polygonIds: pgsids
        })
    }
    //更新面
    updatePolygon(mapPolygons){
        let t = this;
        mapPolygons.map((item,index)=>{
            //判断图元是否存在.
            if (this.GM.isRepetition(item.id)) {
                //多边形点位数据不符合,直接跳过
                if(!(item.rings && item.rings.length >= 3)){
                    console.error(`多边形rings数据错误`);
                    return false;
                }
                //获取原有的图元
                let gc = this.GM.getGraphic(item.id);
                //获取原有的面属性,转换key值
                let cg = {
                    lineType: gc.getLineStyle(),
                    lineWidth: gc.getWeight(),
                    lineColor: gc.getColor(),
                    lineOpacity: gc.getOpacity(),
                    color: gc.getFillColor(),
                    pellucidity: gc.getFillOpacity()
                }
                //重新初始化值
                if(item.config){
                    cg = {...cg,...item.config};
                }
                gc.setLineStyle(cg.lineType);
                gc.setWeight(cg.lineWidth);
                gc.setColor(cg.lineColor);
                gc.setOpacity(cg.lineOpacity);
                gc.setFillColor(cg.color);
                gc.setFillOpacity(cg.pellucidity);
                let r = item.rings.map((itm,ind)=>{
                    return new T.LngLat(itm[0],itm[1]);
                })
                gc.setLngLats(r);
                let pts = item.rings.map((itm,ind)=>{
                    return [...itm];
                });
                this.GM.setGraphicParam(
                    item.id,
                    {
                        attributes: {
                            ...item,
                            rings: [pts],
                            other: item
                        },
                        geometryType: 'polygon',
                        geometry: {
                            type: 'polygon',
                            rings: [pts]
                        }
                    }
                );
            }else{
                console.error(`更新的多边形id不存在!`);
                return false;
            }
        });
    }
    //添加圆  circle
    addCircle(mapCircles){
        let t = this;
        let ccsids = [...t.state.circleIds];
        mapCircles.map((item,index)=>{
            let cg = {
                lineType: 'solid',
                lineWidth: 5,
                lineColor: '#277ffa',
                lineOpacity: 1,
                color: '#fff',
                pellucidity: 0.5
                // isHidden: false  //后期跟百度一起加
            }
            //如果id重复,直接跳过不执行.
            if (this.GM.isRepetition(item.id)) {
                console.error(`圆id: ${item.id} 重复`);
                return false;
            }
            //圆 点位数据不符合,直接跳过
            if(!item.longitude || !item.latitude){
                console.error(`圆 经纬度 数据错误`);
                return false;
            }
            if(item.config){
                cg = {...cg,...item.config};
            }
            //初始化配置数据
            let circleOption = {
                color: cg.lineColor,
                opacity: cg.lineOpacity,
                weight: cg.lineWidth,
                lineStyle: cg.lineType,
                fillColor: cg.color,
                fillOpacity: cg.pellucidity
            }
            //创建圆对象
            let circle = new T.Circle(new T.LngLat(item.longitude,item.latitude),item.radius,circleOption);
            this.state.gis.addOverLay(circle);
            //添加点击事件
            circle.on( 'click', (e)=>{
                t.isNotClickMap = true;
                t.clickGraphic(item.id,e);
            });
            circle.on( 'mouseover', (e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            circle.on( 'mouseout', (e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            //缓存图元的数据,便于后期操作
            this.GM.setGraphic(item.id,circle).setGraphicParam(
                item.id,
                {
                    attributes: {...item,other: item},
                    geometryType: 'circle',
                    geometry: {
                        type: 'circle',
                        x: item.longitude,
                        y: item.latitude,
                        radius: item.radius
                    }
                }
            );
            ccsids.push(item.id);
        });
        t.setState({
            circleIds: ccsids
        })
    }
    //更新圆
    updateCircle(mapCircles){
        let t = this;
        mapCircles.map((item,index)=>{
            //判断图元是否存在.
            if (this.GM.isRepetition(item.id)) {
                //圆 点位数据不符合,直接跳过
                if(!item.longitude || !item.latitude){
                    console.error(`圆 经纬度 数据错误`);
                    return false;
                }
                //获取原有的图元
                let gc = this.GM.getGraphic(item.id);
                //获取原有的面属性,转换key值
                let cg = {
                    lineType: gc.getLineStyle(),
                    lineWidth: gc.getWeight(),
                    lineColor: gc.getColor(),
                    lineOpacity: gc.getOpacity(),
                    color: gc.getFillColor(),
                    pellucidity: gc.getFillOpacity()
                }
                //重新初始化值
                if(item.config){
                    cg = {...cg,...item.config};
                }
                gc.setLineStyle(cg.lineType);
                gc.setWeight(cg.lineWidth);
                gc.setColor(cg.lineColor);
                gc.setOpacity(cg.lineOpacity);
                gc.setFillColor(cg.color);
                gc.setFillOpacity(cg.pellucidity);
                gc.setRadius(item.radius || 0);
                gc.setCenter(new T.LngLat(item.longitude,item.latitude));

                //缓存图元的数据,便于后期操作
                this.GM.setGraphicParam(
                    item.id,
                    {
                        attributes: {...item,other: item},
                        geometryType: 'circle',
                        geometry: {
                            type: 'circle',
                            x: item.longitude,
                            y: item.latitude,
                            radius: item.radius
                        }
                    }
                );
            }else{
                console.error(`更新的圆id不存在!`);
                return false;
            }
        });
    }
    //添加海量点
    addPointCollection(data = []) {
        let t = this;
        data.map((item,index)=>{
            let d = item || {};
            let points = (d.points || []).map((d,i)=>{
                let p = new T.LngLat(d.lng,d.lat);
                    p = t.state.gis.lngLatToContainerPoint(p);
                return [p.x,p.y];
            });
            let options = {
                size: d.size,
                shape: d.shape,
                color: d.color,
                width: t.state.gis.getSize().x,
                height: t.state.gis.getSize().y,
                mapId: t.props.mapId
            };
            //和arcgis使用同一个海量点
            let VotexpointCollection = new GMapLib.PointCollection(points,options);
            t.morepoints.push({
                id: d.id,
                value: VotexpointCollection
            });
            VotexpointCollection.draw();
        });
    }
    //更新海量点
    updatePointCollection(data = []) {
        let t = this;
        data.map((ds,ind)=>{
            t.morepoints.map((item,index)=>{
                if(item.id == ds.id){
                    let points = (ds.points || []).map((d,i)=>{
                        let p = new T.LngLat(d.lng,d.lat);
                            p = t.state.gis.lngLatToContainerPoint(p);
                        return [p.x,p.y];
                    });
                    let options = {
                        size: ds.size,
                        shape: ds.shape,
                        color: ds.color,
                        width: t.state.gis.getSize().x,
                        height: t.state.gis.getSize().y
                    };
                    item.value.reDraw(points,options);
                }
            })
        })
    }
    //清空单个海量点
    clearPointCollection(ids) {
        let t = this;
        ids.map((id,ind)=>{
            t.morepoints.map(function (item,index) {
                if(id == item.id){
                    item.value.clear();
                }
            });
        });
    }
    //清空海量点
    clearAllPointCollection() {
        let t = this;
        t.morepoints.map(function (item,index) {
            item.value.clear();
        });
    }
    //热力图
    heatMapOverlay(d = {}){
        let t = this;
        let cg = {
            radius: 20,
            max: 100,
            visible: true,
            opacity: 1
        };
        if(d.config){
            cg = {...cg,...d.config};
        }
        if(!t.heatmap){
            t.heatmap = new TMapLib.HeatmapOverlay({
                visible: cg.visible
            });
            t.heatmap.initialize(t.state.gis,t.pointCollectionId);
        }
        let option = {
            radius: cg.radius,
            //百度是1-100,高德是0-1
            opacity: eval(cg.opacity) * 100,
            visible: cg.visible
        }
        if(cg.gradient){
            option.gradient = cg.gradient;
        }
        t.heatmap.setOptions(option);
        t.heatmap.setDataSet({
            max: cg.max,
            data: d.data || []
        });
        if(cg.visible){
            t.isHideHeatMap = false;
            t.heatmap.show();
        }else{
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
    draw (obj) {
        var t = this,drawParam = {};
        //初始化参数
        drawParam.geometryType = obj.geometryType || 'point';
        drawParam.parameter = obj.parameter?{...obj.parameter}:{};
        drawParam.data = obj.data?{...obj.data}:{};
        drawParam.data.id = (obj.data || {}).id || `draw${new Date().getTime()}`;
        //判断id是否存在
        let len = t.state.drawIds[drawParam.geometryType].indexOf(drawParam.data.id);
        if(len > -1){
            //如果id存在 删除存在的图元,清除drawId中的id数据
            switch(drawParam.geometryType){
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
            t.state.drawIds[drawParam.geometryType].splice(len,1);
        }
        let param = {};
        let paramgcr = {};
        window.map = this.state.gis;
        if(drawParam.geometryType == 'polygon' || drawParam.geometryType == 'circle' || drawParam.geometryType == 'rectangle'){
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
        switch(drawParam.geometryType){
            case 'point':
                param.icon = new T.Icon({
                    iconUrl: drawParam.parameter.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                    iconSize: new T.Point(drawParam.parameter.width || 33,drawParam.parameter.height || 33),
                    iconAnchor: new T.Point(drawParam.parameter.width?drawParam.parameter.width/2:16.5,
                            drawParam.parameter.height?drawParam.parameter.height:33)
                });
                param.follow = false;
                if(this.markerTool)this.markerTool.close();
                this.markerTool = new T.MarkTool(this.state.gis, param);
                this.markerTool.open();
                this.markerTool.addEventListener('mouseup',(ob)=>{
                    let { type, target, currentLnglat,currentMarker, allMarkers } = ob;
                    t.GM.setGraphic(drawParam.data.id,currentMarker);
                    let backobj = {
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
                    t.GM.setGraphicParam(drawParam.data.id,backobj);
                    if('drawEnd' in t.props){
                        t.props.drawEnd(backobj);
                    }
                });
            break;
            case 'polyline':
                param.color = drawParam.parameter.color;
                param.opacity = drawParam.parameter.pellucidity;
                param.weight = drawParam.parameter.lineWidth;
                if(this.polylineTool)this.polylineTool.close();
                this.polylineTool = new T.PolylineTool(this.state.gis, param);
                this.polylineTool.open();
                this.polylineTool.addEventListener('draw',(ob)=>{
                    let {type,target,currentLnglats,currentDistance,currentPolyline,allPolylines} = ob;
                    let lnglatAry = (currentLnglats || []).map((item,index)=>{
                        return {lngX: item.lng,latX: item.lat};
                    });
                    t.GM.setGraphic(drawParam.data.id,currentPolyline);
                    let backobj ={
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
                            paths: getMaxMin(currentLnglats).path
                        },
                        lnglatAry: lnglatAry
                    };
                    t.GM.setGraphicParam(drawParam.data.id,backobj);
                    if('drawEnd' in t.props){
                        t.props.drawEnd(backobj);
                    }
                });
            break;
            case 'polygon':
                if(this.polygonTool)this.polygonTool.close();
                this.polygonTool = new T.PolygonTool(this.state.gis, paramgcr);
                this.polygonTool.open();
                this.polygonTool.addEventListener('draw',(ob)=>{
                    let {type,target,currentLnglats,currentArea,currentPolygon,allPolygons} = ob;
                    t.GM.setGraphic(drawParam.data.id,currentPolygon);
                    let lnglatAry = (currentLnglats || []).map((item,index)=>{
                        return {lngX: item.lng,latX: item.lat};
                    });
                    let backobj = {
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
                            rings: getMaxMin(currentLnglats).path,
                            _extent: getMaxMin(currentLnglats)._extent,
                            area: currentArea
                        },
                        lnglatAry: lnglatAry,
                        area: currentArea
                    };
                    t.GM.setGraphicParam(drawParam.data.id,backobj);
                    if('drawEnd' in t.props){
                        t.props.drawEnd(backobj);
                    }
                });
            break;
            case 'circle':
                if(this.circleTool)this.circleTool.close();
                this.circleTool = new T.CircleTool(this.state.gis, paramgcr);
                this.circleTool.open();
                this.circleTool.addEventListener('drawend',(ob)=>{
                    let {type,target,currentCenter,currentRadius,currentCircle,allCircles} = ob;
                    t.GM.setGraphic(drawParam.data.id,currentCircle);
                    let area = Math.PI * Math.pow(currentRadius,2);
                    let backobj = {
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
                    t.GM.setGraphicParam(drawParam.data.id,backobj);
                    if('drawEnd' in t.props){
                        t.props.drawEnd(backobj);
                    }
                });
            break;
            case 'rectangle':
                if(this.rectangleTool)this.rectangleTool.close();
                this.rectangleTool = new T.RectangleTool(this.state.gis, paramgcr);
                this.rectangleTool.open();
                this.rectangleTool.addEventListener('draw',(ob)=>{
                    let {type,target,currentBounds,currentRectangle,allRectangles} = ob;
                    t.GM.setGraphic(drawParam.data.id,currentRectangle);
                    let currentLnglats = [
                        currentBounds.getNorthEast(),
                        currentBounds.getSouthWest(),
                        {lng: currentBounds.getSouthWest().lng,lat: currentBounds.getNorthEast().lat},
                        {lng: currentBounds.getNorthEast().lng,lat: currentBounds.getSouthWest().lat}
                    ];
                    let lnglatAry = (currentLnglats || []).map((item,index)=>{
                        return {lngX: item.lng,latX: item.lat};
                    });
                    let area = currentBounds.getNorthEast().distanceTo(
                            new T.LngLat(currentBounds.getNorthEast().lng,
                                currentBounds.getSouthWest().lat)
                        )* currentBounds.getNorthEast().distanceTo(
                            new T.LngLat(currentBounds.getSouthWest().lng,
                                currentBounds.getNorthEast().lat)
                        );
                    let backobj = {
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
                            rings: getMaxMin(currentLnglats).path,
                            _extent: getMaxMin(currentLnglats)._extent,
                            area: area
                        },
                        lnglatAry: lnglatAry,
                        area: area
                    };
                    t.GM.setGraphicParam(drawParam.data.id,backobj);
                    if('drawEnd' in t.props){
                        t.props.drawEnd(backobj);
                    }
                });
            break;
        }
        //保存绘制图元的id便于后期比对
        t.state.drawIds[drawParam.geometryType].push(drawParam.data.id);
    }
    //关闭绘制图元
    closeDraw(){
        if(this.markerTool){
            this.markerTool.close();
        }
        if(this.polylineTool){
            this.polylineTool.close();
        }
        if(this.polygonTool){
            this.polygonTool.close();
        }
        if(this.rectangleTool){
            this.rectangleTool.close();
        }
        if(this.circleTool){
            this.circleTool.close();
        }
    }

    /*根据图元id,使图元变成可编辑状态*/
    doEdit(id){
        let t = this;
        let ms = t.getGraphic(id);
        if(!ms){
            return false;
        }
        if(ms.getType === 1){
            return false;
        }
        if(!!t.state.editId){
            t.endEdit();
        }
        this.isEditId = id;
        switch(ms.geometryType){
            case 'point':
                ms.mapLayer.enableDragging();
                // ms.mapLayer.addEventListener('dragend',t.editGraphicChange);
                if(ms.mapLayer.label){
                    ms.mapLayer.addEventListener('drag',t.showLabel);
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
        })
    }
    //关闭编辑
    endEdit(){
        let t = this;
        let ms = t.getGraphic(t.state.editId);
        this.isEditId = null;
        switch(ms.geometryType){
            case 'point':
                ms.mapLayer.disableDragging();
                // ms.mapLayer.removeEventListener('dragend',t.editGraphicChange);
                if(ms.mapLayer.label){
                    ms.mapLayer.removeEventListener('drag',t.showLabel);
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
        })
    }
    showLabel(){
        //这里的this指向调用的 点的对象
        this.showLabel();
    }
    //编辑变动后
    editGraphicChange(id){
        let t = this;
        let ms = t.getGraphic(id);
        let obj = {
            id: id
        }
        switch(ms.geometryType){
            case 'point':
                obj.geometry = ms.geometry;
                obj.param = ms;
            break;
            case 'polyline':
                ms.geometry._extent = getMaxMin(ms.mapLayer.getLngLats())._extent;
                obj.geometry = ms.geometry;
                obj.param = ms;
                obj.distance = t.calculateDistance(ms.mapLayer.getLngLats());
            break;
            case 'polygon':
            case 'rectangle':
                ms.geometry._extent = getMaxMin(ms.mapLayer.getLngLats()[0])._extent;
                obj.geometry = ms.geometry;
                obj.param = ms;
                obj.area = getPolygonArea(ms.mapLayer.getLngLats()[0]);
            break;
            case 'circle':
                obj.geometry = ms.geometry;
                obj.param = ms;
                obj.area = Math.PI*Math.pow(ms.geometry.radius,2);
            break;
        }
        t.props.editGraphicChange(obj);
    }
    //删除图元
    removeGraphic(id,type){
        let t = this;
        if(!!this.GM.getGraphic(id)){
            //清除聚合点 避免异常
            if(t.clusterObj){
                t.clusterObj.removeMarker(this.GM.getGraphic(id));
            }
            //清除地图中图元
            this.state.gis.removeOverLay(this.GM.getGraphic(id));
            //删除含 label点的label(天地图的坑)
            if(type === 'point' && this.GM.getGraphic(id).label){
                this.state.gis.removeOverLay(this.GM.getGraphic(id).getLabel());
            }
            //清除对应id的图元数据缓存
            this.GM.removeGraphic(id);
            this.GM.removeGraphicParam(id);
        }else{
            return false;
        }
        for(let i = 0 ; i < t.movePoints.length ; i++){
            if(t.movePoints[i].id == id){
                t.movePoints.splice(i,1);
                continue;
            }
        }
        //清除 state中id的缓存
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
            case 'draw':
                if(t.state.drawIds.point.indexOf(id) > -1){
                    t.state.drawIds.point.splice(t.state.drawIds.point.indexOf(id),1);
                }
                if(t.state.drawIds.polyline.indexOf(id) > -1){
                    t.state.drawIds.polyline.splice(t.state.drawIds.polyline.indexOf(id),1);
                }
                if(t.state.drawIds.polygon.indexOf(id) > -1){
                    t.state.drawIds.polygon.splice(t.state.drawIds.polygon.indexOf(id),1);
                }
                if(t.state.drawIds.circle.indexOf(id) > -1){
                    t.state.drawIds.circle.splice(t.state.drawIds.circle.indexOf(id),1);
                }
                if(t.state.drawIds.rectangle.indexOf(id) > -1){
                    t.state.drawIds.rectangle.splice(t.state.drawIds.rectangle.indexOf(id),1);
                }
            break;
            default:
                if(t.state.pointIds.indexOf(id) > -1){
                    t.state.pointIds.splice(t.state.pointIds.indexOf(id),1);
                }
                if(t.state.lineIds.indexOf(id) > -1){
                    t.state.lineIds.splice(t.state.lineIds.indexOf(id),1);
                }
                if(t.state.polygonIds.indexOf(id) > -1){
                    t.state.polygonIds.splice(t.state.polygonIds.indexOf(id),1);
                }
                if(t.state.circleIds.indexOf(id) > -1){
                    t.state.circleIds.splice(t.state.circleIds.indexOf(id),1);
                }
            break;
        }
        if(id == t.state.editId){
            t.state.editId = '';
        }
        if(ids.indexOf(id) != -1){
            ids.splice(ids.indexOf(id),1);
        }
    }
    //点击图元事件
    clickGraphic (id,e) {
        let t = this;
        if(typeof(t.props.clickGraphic) ==="function"){
            let param = t.getGraphic(id);
            let obj = {
                param,
                type: param.geometry.type,//图元类型
                attributes: {...param.attributes.other,...{config:param.attributes.config}},//添加时图元信息
                top: e.containerPoint.y + t.mapTop,//当前点所在的位置(屏幕)
                left: e.containerPoint.x + t.mapLeft,
                e: e
            }
            t.props.clickGraphic(obj);
        }
    }
    //图元鼠标悬浮事件
    mouseOverGraphic(id,e){
        let t = this;
        if(typeof(t.props.mouseOverGraphic) === 'function'){
            if(id === t.isEditId){
                return false;
            }
            let obj = {
                e,id,
                param: t.getGraphic(id)
            }
            t.props.mouseOverGraphic(obj);
        }
    }
    //图元鼠标移开事件
    mouseOutGraphic(id,e){
        let t = this;
        if(typeof(t.props.mouseOutGraphic) ==="function"){
            if(id === t.isEditId){
                return false;
            }
            let obj = {
                e,id,
                param: t.getGraphic(id)
            }
            t.props.mouseOutGraphic(obj);
        }
    }
    //拖拽地图开始
    dragMapStart(){
        let t = this;
        if(typeof(t.props.dragMapStart) ==="function"){
            t.state.gis.addEventListener('dragstart', function(e) {
                let obj = t.getMapExtent();
                obj.e = e;
                //处理下数据,符合拖拽事件
                t.props.dragMapStart(obj);
            });
        }
    }
    //拖拽地图结束事件
    dragMapEnd(){
        let t = this;
        if(typeof(t.props.dragMapEnd) ==="function"){
            t.state.gis.addEventListener('dragend', function(e) {
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
            t.state.gis.addEventListener('movestart', function(e) {
                if(!t.isZoom){
                    let obj = t.getMapExtent();
                    obj.e = e;
                    //处理下数据,符合拖拽事件
                    t.props.moveStart(obj);
                }
            });
        }
    }
    //地图移动结束事件
    moveEnd(){
        let t = this;
        if(typeof(t.props.moveEnd) ==="function"){
            t.state.gis.addEventListener('moveend', function(e) {
                let xylist = [],mapPane = t.state.gis.getPanes().mapPane;
                if(mapPane.style.top){
                    xylist = [mapPane.style.left,mapPane.style.top];
                }else{
                    xylist = (mapPane.style.transform || '').substr(12).split(',');
                }
                //重画海量点
                $(`#${t.pointCollectionId}`).css({
                    top: `${-eval((xylist[1] || '').replace('px',''))}px`,
                    left: `${-eval((xylist[0] || '').replace('px',''))}px`
                })
                if(t.morepoints.length > 0){
                    t.updatePointCollection(t.props.mapPointCollection);
                }
                if(t.isZoom){
                    t.isZoom = false;
                }else{
                    let obj = t.getMapExtent();
                    obj.e = e;
                    //处理下数据,符合拖拽事件
                    t.props.moveEnd(obj);
                }
            });
        }
    }
    //地图更改缩放级别开始时触发触发此事件
    zoomStart(){
        let t =this;
        if(typeof(t.props.zoomStart) ==="function"){
            t.state.gis.addEventListener('zoomstart', function(e) {
                if(t.heatmap && !t.isHideHeatMap){
                    t.heatmap.hide();
                }
                $(`#${t.pointCollectionId}`).css({display: 'none'});
                t.isZoom = true;
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
            t.state.gis.addEventListener('zoomend', function(e) {
                //重画热力图
                if(t.heatmap && !t.isHideHeatMap){
                    t.heatmap.show();
                    t.heatmap.draw();
                }
                //重画海量点
                $(`#${t.pointCollectionId}`).css({display: 'inline-block'});
                if(t.morepoints.length > 0){
                    t.updatePointCollection(t.props.mapPointCollection);
                }
                //避免zoom切换后,chrome的旋转角度被替换
                for(let i in t.GM.allParam){
                    if(t.GM.allParam[i].geometryType == 'point' && t.GM.allParam[i].deg){
                        t.GM.getGraphic(i).getElement().style.transform = 
                            t.GM.getGraphic(i).getElement().style.transform + ` rotate(${t.GM.allParam[i].deg}deg)`;
                    }
                }
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
            t.state.gis.addEventListener('click', function(e) {
                if(t.isNotClickMap){
                    t.isNotClickMap = false;
                }else{
                    let obj = t.getMapExtent();
                    obj.e = e;
                    obj.clickLngLat = e.lnglat;
                    obj.pixel = e.containerPoint;
                    t.props.clickMap(obj);
                }
            });
        }
    }
    //点的跳动动画
    pointAnimation(id,marker){
        let t = this;
        //null时关闭跳动
        if(!!marker){
            if(t.animTimer[id]){
                clearInterval(t.animTimer[id]);
            }
            t.animTimer[id] = setInterval(()=>{
                //点被隐藏时,没有执行,定时不关
                if(marker.getIcon()){
                    let shape = {...marker.getIcon().getIconAnchor()};
                    //初始数据  点位有变动,重新刷新数据
                    if(!t.animCount[id] || shape.y != t.animCount[id].now){
                        t.animCount[id] = {
                            start: shape.y,
                            now: shape.y,
                            notation: -1
                        };
                    }
                    if(t.animCount[id].now - t.animCount[id].start == 20){
                        t.animCount[id].notation = -1;
                    }
                    if(t.animCount[id].now - t.animCount[id].start == 0){
                        t.animCount[id].notation = 1;
                    }
                    shape.y = t.animCount[id].now = (t.animCount[id].now + (t.animCount[id].notation)*2);
                    marker.getIcon().setIconAnchor(shape);
                }
            },35);
        }else{
            clearInterval(t.animTimer[id]);
        }
    }
    moveAnimation(){
        let t = this;
        if(t.moveToTimer){
            clearInterval(t.moveToTimer);
        }
        t.moveToTimer = setInterval(()=>{
            for(let i = 0;i < t.movePoints.length; i++){
                t.movePoints[i].waitTime += 10;
                t.movePoints[i].deleteTime -= 10;
            }
            t.movePoints.sort((x,y)=>{
                return y.waitTime -x.waitTime;
            });
            let nowMovePoints = t.movePoints.slice(0,10),deleteIndex=[];
            for(let i = 0;i < nowMovePoints.length; i++){
                let {id,rx,ry,waitTime,deleteTime,ddeg} = nowMovePoints[i];
                let gc = t.GM.getGraphic(id);
                if(!gc){
                    clearInterval(t.moveToTimer[id]);
                }else{
                    let gg = gc.getLngLat();
                    let tx = gg.lng + rx,ty = gg.lat + ry;
                    let lglt = new T.LngLat(tx,ty);
                    if(t.movePoints[i].url){
                        gc.getIcon().setIconUrl(t.movePoints[i].url);
                    }
                    gc.setLngLat(lglt);
                    t.GM.setGraphicParam(id,{...t.GM.getGraphicParam(id),deg: ddeg});
                    //旋转角度
                    gc.getElement().style.transform = gc.getElement().style.transform + ` rotate(${ddeg}deg)`;
                    gc.getElement().style['-ms-transform'] = ` rotate(${ddeg}deg)`;
                    if(gc.label){
                        gc.showLabel();
                    }
                    t.movePoints[i].waitTime = 0;
                    if(deleteTime <= 0){
                        deleteIndex.push(i);
                    }
                }
            }
            deleteIndex.sort((a,b)=>{return b-a});
            for(let i = 0 ; i < deleteIndex.length ; i++){
                t.movePoints.splice(deleteIndex[i],1);
            }
            if(nowMovePoints.length == 0){
                clearInterval(t.moveToTimer);
            }
        },10);
    }
    /*公共方法*/
    moveTo(id,lnglat,delay,autoRotation,urlright,urlleft){
        delay = delay || 3;
        let t = this,timer = 10;
        delay = eval(delay)*1000;
        let count = delay/timer,
            gc = this.GM.getGraphic(id);
        let s = gc.getLngLat(),e = new T.LngLat(lnglat[0],lnglat[1]);
        if(s.equals(e)){
            return false;
        }else{
            let ddeg = 0,url= null;
            //计算角度,旋转
            if(autoRotation){
                //自己实现旋转
                ddeg = t.rotateDeg(gc.getLngLat(),lnglat);
                if(urlleft && (ddeg < -90 && ddeg > -270)){
                    ddeg += 180;
                    url = urlleft;
                }else{
                    url = urlright;
                }
            }
            //拆分延迟移动定位
            let rx = (e.lng - s.lng)/count, ry = (e.lat - s.lat)/count;
            let isHave = false;
            for(let i = 0 ; i < t.movePoints.length ;i++){
                if(t.movePoints[i].id == id){
                    t.movePoints.splice(i,1,{
                        id,rx,ry,ddeg,url,
                        waitTime: 0,
                        deleteTime: delay
                    });
                    isHave = true;
                }
            }
            if(!isHave){
                t.movePoints.push({
                    id,rx,ry,ddeg,url,
                    waitTime: 0,
                    deleteTime: delay
                });
            }
        }
    }
    //点位角度旋转(以指向东(右)为0°)
    rotateDeg(sp,ep){
        let t = this;
        let s = t.state.gis.lngLatToLayerPoint(sp),
        //获取当前点位的经纬度
            e = t.state.gis.lngLatToLayerPoint(new T.LngLat(ep[0],ep[1])),
            deg = 0;
        if(e.x != s.x){
            var tan = (e.y - s.y)/(e.x - s.x),
            atan  = Math.atan(tan);
            deg = atan*360/(2*Math.PI);
            //degree  correction;
            if(e.x < s.x){
                deg = -deg + 90 + 90;

            } else {
                deg = -deg;
            }
            deg = -deg;
        }else {
            var disy = e.y- s.y ;
            var bias = 0;
            if(disy > 0)
                bias=-1;
            else
                bias = 1;
            if(disy == 0)
                bias = 0;            
            deg = -bias * 90;
        }
        return deg;
    }
    //对比对象数据是否相等
    deepEqual(a,b){
        return Immutable.is(Immutable.fromJS(a),Immutable.fromJS(b));
    }
    //计算2点间距离 单位m 精确到个位
    calculatePointsDistance(f,s){
        let lnglat1 = new T.LngLat(f[0],f[1]);
        let lnglat2 = new T.LngLat(s[0],s[1]);
        return Math.round(lnglat1.distanceTo(lnglat2));
    }
    calculateDistance(ps){
        let t = this,totalDistance = 0;
        if (ps.length < 0) {return false;}
        for(let i= 0 ; i< ps.length ; i++){
            if(i < ps.length-1){
                if('distanceTo' in ps[i]){
                    totalDistance += ps[i].distanceTo(ps[i + 1]);
                }else{
                    totalDistance += new T.LngLat(ps[i][0],ps[i][1]).distanceTo(new T.LngLat(ps[i + 1][0],ps[i + 1][1]));
                }
            }
        }
        return Math.round(totalDistance*100)/100;
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
    //处理需要增加图元的数据(避免意外问题)
    dealAdd(ary,ids){
        let ads = [], otherupds = [];
        for(let i = 0 ; i < ary.length ; i++){
            if(ids.indexOf(ary[i].id) > -1){
                otherupds.push(ary[i]);
            }else{
                ads.push(ary[i]);
            }
        }
        return {ads,otherupds};
    }
    //处理需要更新图元的数据(避免意外问题)
    dealUpdate(ary,ids){
        let upds = [], otherads = [];
        for(let i = 0 ; i < ary.length ; i++){
            if(ids.indexOf(ary[i].id) > -1){
                upds.push(ary[i]);
            }else{
                otherads.push(ary[i]);
            }
        }
        return {upds,otherads};
    }
    searchPoints(searchValue,pageSize=10,pageIndex=1){
        let t = this;
        return new Promise((resolve)=>{
            let searchConfig = {
                pageCapacity: pageSize*pageIndex,   //每页显示的数量
                //接收数据的回调函数
                onSearchComplete: (result)=>{
                    if(!result.pois){
                        resolve([]);;
                    }else{
                        let list = result.pois.map((r)=>{
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
                            }
                        })
                        resolve(list);
                    }
                } 
            };
            //创建搜索对象
            let localsearch = new T.LocalSearch(t.state.gis, searchConfig);
            localsearch.search(searchValue);
        });

    }
    render(){
        let t = this;
        return (
            <div id={t.props.mapId} style={{width:'100%',height:'100%',zIndex: '1'}}></div>
        );
    }
    componentDidMount(){
        let t = this;
        this.loadMapComplete.then(()=>{
            t.mapLeft = document.getElementById(t.props.mapId).offsetLeft;
            t.mapTop = document.getElementById(t.props.mapId).offsetTop;
            t.init();
            //初始化完成后,再走更新
            t.isLoading = true;
        })
    }
    componentDidUpdate(prevProps, prevState) {//重新渲染结束
        let t = this;
    }
    componentWillReceiveProps(nextProps,prevProps) {//已加载组件，收到新的参数时调用
        let t = this;
        let receive = ()=>{
            //点/线旧数据
            let {pointIds,lineIds,polygonIds,circleIds,drawIds} = t.state;
            let {point,polyline,polygon,circle,rectangle} = drawIds;
            //点/线新数据
            let {
                mapPoints,mapLines,mapPolygons,mapCircles,customizedBoundary,
                isOpenTrafficInfo,boundaryName,heatMapData,
                mapVisiblePoints,setVisiblePoints,
                setCenter,mapCenter,
                setZoomLevel,mapZoomLevel,
                setCluster,mapCluster,
                isRangingTool,mapRangingTool,
                isRemove,mapRemove,
                mapDraw,isDraw,isCloseDraw,
                editGraphicId,isDoEdit,isEndEdit,
                mapPointCollection,isclearAllPointCollection,
                isClearAll,
                isSetAreaRestriction,areaRestriction,isClearAreaRestriction
            } = nextProps;

            // 等待地图加载
            if(!t.state.mapCreated)return;
            /*添加海量点*/
            if(mapPointCollection instanceof Array && !t.deepEqual(mapPointCollection,t.props.mapPointCollection)){
                let {deletedDataIDs,addedData,updatedData} = t.dataMatch(t.props.mapPointCollection,mapPointCollection,'id');
                t.clearPointCollection(deletedDataIDs);
                t.addPointCollection(addedData);
                t.updatePointCollection(updatedData);
            }
            if((typeof(isclearAllPointCollection) == 'boolean' && isclearAllPointCollection) || (isclearAllPointCollection && isclearAllPointCollection !== t.props.isclearAllPointCollection)){
                t.clearAllPointCollection();
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
                if(!!t.state.editId){
                    oldMapPoints = t.props.mapPoints.filter((item)=>{return item.id !== editGraphicId});
                    newMapPoints = mapPoints.filter((item)=>{return item.id !== editGraphicId});
                }
                let {deletedDataIDs,addedData,updatedData} = t.dataMatch(oldMapPoints,newMapPoints,'id');
                let {ads,otherupds} = t.dealAdd(addedData,[...pointIds,...point]);
                let {upds,otherads} = t.dealUpdate(updatedData,[...pointIds,...point]);
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
                for(let id of deletedDataIDs){
                    t.removeGraphic(id,'point');
                }
                //增加
                t.addPoint([...ads,...otherads]);
                //更新
                t.updatePoint([...upds,...otherupds]);
            }
            /*
                线数据处理
                先全删除,再新增
            */
            if(mapLines instanceof Array && !t.deepEqual(mapLines,t.props.mapLines)){
                let oldMapLines = t.props.mapLines;
                let newMapLines = mapLines;
                if(!!t.state.editId){
                    oldMapLines = t.props.mapLines.filter((item)=>{return item.id !== editGraphicId});
                    newMapLines = mapLines.filter((item)=>{return item.id !== editGraphicId});
                }
                let {deletedDataIDs,addedData,updatedData} = t.dataMatch(oldMapLines,newMapLines,'id');
                let {ads,otherupds} = t.dealAdd(addedData,[...lineIds,...polyline]);
                let {upds,otherads} = t.dealUpdate(updatedData,[...lineIds,...polyline]);
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
                for(let id of deletedDataIDs){
                    t.removeGraphic(id,'line');
                }
                //增加
                t.addLine([...ads,...otherads]);
                //更新
                t.updateLine([...upds,...otherupds]);          
            }
            //画其他特例线专用
            if(customizedBoundary instanceof Array && !t.deepEqual(customizedBoundary,t.props.customizedBoundary)){
                let {deletedDataIDs,addedData,updatedData} = t.dataMatch(t.props.customizedBoundary,customizedBoundary,'id');
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
                for(let id of deletedDataIDs){
                    t.removeGraphic(id,'line');
                }
                t.updateLine(updatedData);
                t.addLine(addedData);            
            }
            /*
                面数据处理
                先全删除,再新增
            */
            if(mapPolygons instanceof Array && !t.deepEqual(mapPolygons,t.props.mapPolygons)){
                let oldMapPolygons = t.props.mapPolygons;
                let newMapPolygons = mapPolygons;
                if(!!t.state.editId){
                    oldMapPolygons = t.props.mapPolygons.filter((item)=>{return item.id !== editGraphicId});
                    newMapPolygons = mapPolygons.filter((item)=>{return item.id !== editGraphicId});
                }
                let {deletedDataIDs,addedData,updatedData} = t.dataMatch(oldMapPolygons,newMapPolygons,'id');
                let {ads,otherupds} = t.dealAdd(addedData,[...rectangle,...polygon,...polygonIds]);
                let {upds,otherads} = t.dealUpdate(updatedData,[...rectangle,...polygon,...polygonIds]);
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
                for(let id of deletedDataIDs){
                    t.removeGraphic(id,'polygon');
                }
                //增加
                t.addPolygon([...ads,...otherads]);
                //更新
                t.updatePolygon([...upds,...otherupds]);
            }
            /*
                圆数据处理
                先全删除,再新增
            */
            if(mapCircles instanceof Array && !t.deepEqual(mapCircles,t.props.mapCircles)){
                let oldMapCircles = t.props.mapCircles;
                let newMapCircles = mapCircles;
                if(!!t.state.editId){
                    oldMapCircles = t.props.mapCircles.filter((item)=>{return item.id !== editGraphicId});
                    newMapCircles = mapCircles.filter((item)=>{return item.id !== editGraphicId});
                }
                let {deletedDataIDs,addedData,updatedData} = t.dataMatch(oldMapCircles,newMapCircles,'id');
                let {ads,otherupds} = t.dealAdd(addedData,[...circleIds,...circle]);
                let {upds,otherads} = t.dealUpdate(updatedData,[...circleIds,...circle]);
                //删在增之前,(因为增加后会刷新pointIds的值,造成多删的问题)
                for(let id of deletedDataIDs){
                    t.removeGraphic(id,'circle');
                }
                //增加
                t.addCircle([...ads,...otherads]);
                //更新
                t.updateCircle([...upds,...otherupds]);
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
            if(heatMapData && !t.deepEqual(heatMapData,t.props.heatMapData)){
                t.heatMapOverlay(heatMapData);
            }
            //图元编辑调用
            if((typeof(isDoEdit) == 'boolean' && isDoEdit) || (isDoEdit && isDoEdit !== t.props.isDoEdit)){
                t.doEdit(editGraphicId);
            }
            //是否关闭图元编辑
            if((typeof(isEndEdit) == 'boolean' && isEndEdit) || (isEndEdit && isEndEdit !== t.props.isEndEdit)){
                t.endEdit();
            }
            /*设置指定图元展示*/
            if((typeof(setVisiblePoints) == 'boolean' && setVisiblePoints) || (setVisiblePoints && setVisiblePoints !== t.props.setVisiblePoints)){
                t.setVisiblePoints(mapVisiblePoints);
            }
            //绘制图元
            if((typeof(isDraw) == 'boolean' && isDraw) || (isDraw && isDraw !== t.props.isDraw)){
                t.draw(mapDraw);
            }
            //关闭绘制
            if((typeof(isCloseDraw) == 'boolean' && isCloseDraw) || (isCloseDraw && isCloseDraw !== t.props.isCloseDraw)){
                t.closeDraw();
            }
            //清空地图
            if((typeof(isClearAll) == 'boolean' && isClearAll) || (isClearAll && isClearAll !== t.props.isClearAll)){
                t.clearAll();
            }
            //设置中心点
            if((typeof(setCenter) == 'boolean' && setCenter) || (setCenter && setCenter !== t.props.setCenter)){
                if(!(t.getCurrentCenter().lng == mapCenter[0] && t.getCurrentCenter().lat == mapCenter[1])){
                    t.setCenter(mapCenter);
                }
            }
            //设置比例尺
            if((typeof(setZoomLevel) == 'boolean' && setZoomLevel) || (setZoomLevel && setZoomLevel !== t.props.setZoomLevel)){
                if(!(t.getZoomLevel() == mapZoomLevel)){
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
            if((typeof(setCluster) == 'boolean' && setCluster) || (setCluster && setCluster !== t.props.setCluster)){
                t.cluster(mapCluster);
            }
            //测距工具调用
            if((typeof(isRangingTool) == 'boolean' && isRangingTool) || (isRangingTool && isRangingTool !== t.props.isRangingTool)){
                t.vtxRangingTool();
            }
            //单独删除操作
            if((typeof(isRemove) == 'boolean' && isRemove) || (isRemove && isRemove !== t.props.isRemove)){
                mapRemove.map((item,index)=>{
                    t.removeGraphic(item.id,item.type);
                });
            }
            //设置区域限制
            if((typeof(isSetAreaRestriction) == 'boolean' && isSetAreaRestriction) 
                || (isSetAreaRestriction && isSetAreaRestriction !== t.props.isSetAreaRestriction) 
                && areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]){
                t.setAreaRestriction(areaRestriction);
            }
            //关闭区域限制
            if((typeof(isClearAreaRestriction) == 'boolean' && isClearAreaRestriction) || (isClearAreaRestriction && isClearAreaRestriction !== t.props.isClearAreaRestriction)){
                t.clearAreaRestriction();
            }
        }
        if(t.waitReceive){
            clearInterval(t.waitReceive);
        }
        //等等天地图初始化
        if(t.isLoading){
            receive();
        }else{
            t.waitReceive = setInterval(()=>{
                if(t.isLoading){
                    clearInterval(t.waitReceive);
                    receive();
                }
            },100);
        }
    }
    componentWillUnmount() {
        //关闭moveTo定时
        let t = this;
        if(t.moveToTimer){
            clearInterval(t.moveToTimer);
        }
        if(t.waitReceive){
            clearInterval(t.waitReceive);
        }
        if(t.waitInit){
            clearInterval(t.waitInit);
        }
        //关闭animation定时
        for(let j in t.animTimer){
            if(t.animTimer[j]){
                clearInterval(t.animTimer[j]);
            }
        }
    }
}
export default TMap;
