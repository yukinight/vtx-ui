import React from 'react';
import './AMap.css';
import {graphicManage,getPolygonArea} from '../MapToolFunction';
import Immutable from 'immutable';
//公共地址配置
import configUrl from '../../default';
const {Set} = Immutable;
class VortexAMap extends React.Component{
    constructor(props){
        super(props);
        //初始化 图元管理方法
        this.GM = new graphicManage();
        this.getPolygonArea = getPolygonArea;
        this.pointCollectionId = 'vtx_gmap_html_pointCollection';//海量点canvas点位容器id class管理
        this.morepoints = [];//海量点集合
        this.htmlXY = {x:0,y:0,px:0,py:0,isCount: false};
        this.stopMove = true;//防止zoom事件触发时,联动的触发move事件
        this.mapLeft = 0;//地图offset的Left值
        this.mapTop = 0;//地图offset的Top值
        this.clusterObj = null;//聚合点类对象
        this.trafficLayer = null;//路况类对象
        this.scale = null;//比例尺控件对象
        this.tool = null;//比例尺工具对象
        this.ruler = null;//测距对象
        this.mousetool = null;//绘制图元对象
        this.districeSearch = null;//行政区划搜索对象
        this.polyEdit = null;//折线和多边形编辑对象
        this.circleEdit = null;//圆编辑对象
        this.editTimeout = null;//圆编辑时的延迟回调,避免重复调用
        this.heatmap = null;//热力图对象
        //为了样式相同,引用百度的鼠标样式
        this.csr = 
            /webkit/.test(navigator.userAgent.toLowerCase()) ?
                'url("http://api.map.baidu.com/images/ruler.cur") 3 6, crosshair' :
                'url("http://api.map.baidu.com/images/ruler.cur"), crosshair';
        this.state = {
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
            }
        }
        this.loadMapJs();
    }
    loadMapJs(){
        this.loadMapComplete = new Promise((resolve,reject)=>{
            if(window.AMap){
                resolve(window.AMap);
            }
            else{
                $.getScript('http://webapi.amap.com/maps?v=1.4.6&key=e59ef9272e3788ac59d9a22f0f8cf9fe&plugin=AMap.MarkerClusterer,AMap.Scale,AMap.ToolBar,AMap.DistrictSearch,AMap.RangingTool,AMap.MouseTool,AMap.PolyEditor,AMap.CircleEditor,AMap.PlaceSearch,AMap.Heatmap',()=>{
                    let PointCollection = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/GPointCollection.js`,()=>{
                            resolve();
                        });
                    });
                    Promise.all([PointCollection]).then(()=>{
                        resolve(window.AMap);
                    })
                })
            }
        });
    }
    //初始化地图
    init(){
        let t = this;
        const {
            mapPoints,mapLines,mapPolygons,mapCircles,
            setVisiblePoints,mapVisiblePoints,
            mapCenter,mapZoomLevel,
            mapCluster,mapPointCollection,
            showControl,boundaryName,heatMapData,
            areaRestriction
        } = t.props;
        //创建地图
        t.createMap();
        //初始化中心点
        t.setCenter(mapCenter);
        //添加点
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
        /*设置指定图元展示*/
        if(mapVisiblePoints){
            t.setVisiblePoints(mapVisiblePoints);
        }
        //设置比例尺
        if(mapZoomLevel){
            t.setZoomLevel(mapZoomLevel);
        }
        //设置点聚合
        if(mapCluster){
            t.cluster(mapCluster);
        }
        //展示比例尺
        if(showControl){
            t.showControl();
        }

        //画边界线
        if(boundaryName instanceof Array && boundaryName.length>0){
            t.addBaiduBoundary(boundaryName);
        }

        //回调显示方法
        if(t.props.showGraphicById){
            t.props.showGraphicById(t.showGraphicById.bind(t));
        }
        //回调隐藏方法
        if(t.props.hideGraphicById){
            t.props.hideGraphicById(t.hideGraphicById.bind(t));
        }
        //设置区域限制
        if(areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]){
            t.setAreaRestriction(areaRestriction);
        }
        // 画热力图
        if(heatMapData){
            t.heatMapOverlay(heatMapData);
        }
        //添加海量点
        if(mapPointCollection instanceof Array){
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
            mapCreated:true
        });
    }
    //地图方法
    createMap(divId){
        let t = this;
        const {mapCenter,mapId,mapZoomLevel,minZoom,maxZoom} = t.props;
        //缓存Map的对象,方便后期的功能操作
        //后期不会操作gis数据,直接通过state缓存.
        if(window.VtxMap){
            window.VtxMap[mapId] = {};
        }else{
            window.VtxMap = {};
        }
        window.VtxMap[mapId] = t.state.gis = new AMap.Map(mapId,{
            resizeEnable: true,
            //zoom等级,和百度一样默认10
            zoom: mapZoomLevel || 10,
            //不传中心点,高德地图默认使用用户所在地的城市为中心点
            center: mapCenter,
            zooms: [minZoom || 3, maxZoom || 18]
        });
        //创建海量点图层
        //加上mapId 实现多地图
        t.pointCollectionId = `${mapId}_${t.pointCollectionId}`
        $($(`#${mapId} .amap-maps`)[0]).append(
            `<div class='vtx_gmap_html_pointCollection_a' id='${t.pointCollectionId}' ></div>`
        )
        //聚合点类对象
        t.clusterObj = new AMap.MarkerClusterer(t.state.gis,[]);
        //比例尺控件对象
        /*算出比例尺位置偏移量*/
        let offsetS = new AMap.Pixel(60,17);
        let offsetT = new AMap.Pixel(25,10);
        let zlt = 'RB';
        let zls = 'RB';
        if(t.props.showControl){
            switch(t.props.showControl.location){
                case 'tl':
                    zlt = 'LT';
                    zls = 'LB';
                    offsetS = new AMap.Pixel(10,17);
                    offsetT = new AMap.Pixel(5,10);
                break;
                case 'bl':
                    zlt = 'LB';
                    zls = 'LB';
                    offsetS = new AMap.Pixel(60,19);
                    offsetT = new AMap.Pixel(5,12);
                break;
                case 'tr':
                    zlt = 'RT';
                    zls = 'RB';
                    offsetS = new AMap.Pixel(25,17);
                    offsetT = new AMap.Pixel(25,10);
                break;
                case 'br':
                    zlt = 'RB';
                    zls = 'RB';
                    offsetS = new AMap.Pixel(70,17);
                    offsetT = new AMap.Pixel(25,10);
                break;
            }
            //默认是all
            let tp = {
                ruler: true,
                direction: true
            }
            switch(t.props.showControl.type){
                case 'small':
                    tp = {
                        ruler: false,
                        direction: true
                    }
                break;
                case 'pan':
                    tp = {
                        ruler: false,
                        direction: true
                    }
                break;
                case 'zoom':
                    tp = {
                        ruler: false,
                        direction: false
                    }
                break;
            }
            t.scale = new AMap.Scale({
                position: zls,
                offset: offsetS
            });
            //比例尺工具对象
            t.tool = new AMap.ToolBar({
                position: zlt,
                offset: offsetT,
                locate: false,
                ...tp
            });
        }
        //搜索服务
        let opts = {
            subdistrict: 1,   //返回下一级行政区
            extensions: 'all',  //返回行政区边界坐标组等具体信息
            level: 'country'  //查询行政级别为 市
        };
        //实例化DistrictSearch
        t.districeSearch = new AMap.DistrictSearch(opts);
        //实例化RangingTool
        t.ruler = new AMap.RangingTool(t.state.gis);
        t.ruler.on('end',({type,polyline,points,distance})=>{
            let lnglats = points.map((item,index)=>{
                return [item.lng,item.lat];
            })
            //恢复鼠标默认样式
            t.state.gis.setDefaultCursor();
            t.ruler.turnOff();
            if(typeof(t.props.mapRangingTool) ==="function"){
                t.props.mapRangingTool({
                    distance,lnglats
                });
            }
        });
        //绘制图元类
        t.mousetool = new AMap.MouseTool(t.state.gis);
        //绘制完后的回调
        t.mousetool.on('draw',({type,obj})=>{
            let drawExtData = obj.getExtData();
            let backobj = {
                id: drawExtData.id,
                attributes: drawExtData.attributes,
                geometryType: drawExtData.type,
                mapLayer: obj,
                geometry: {
                    type: drawExtData.type
                }
            };
            //缓存绘制的图元信息
            t.GM.setGraphic(drawExtData.id,obj);
            t.GM.setGraphicParam(drawExtData.id,backobj);
            //区别点和圆的经纬度数据处理
            let {lnglatAry,_extent,path} = t.dealData(obj);
            //处理返回数据
            switch(drawExtData.type){
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
                    backobj.area = Math.PI*Math.pow(backobj.geometry.radius,2);
                break;
            }
            //恢复鼠标默认样式
            t.state.gis.setDefaultCursor();
            t.mousetool.close();
            if('drawEnd' in t.props){
                t.props.drawEnd(backobj);
            }
        });
        t.heatmap =  new AMap.Heatmap(t.state.gis);
        t.state.gis.on('mapmove',(e)=>{
            if(t.htmlXY.isCount){
                let nowXY = t.state.gis.lnglatToPixel(t.state.gis.getCenter());
                $(`#${t.pointCollectionId}`).css({
                    top: t.htmlXY.y - nowXY.y,
                    left: t.htmlXY.x - nowXY.x,
                    display: 'none'
                });
            }
        })
    }
    //清空地图所有图元
    clearAll (){
        let t = this;
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
    setCenter (gt) {
        let t =this;
        if(gt){
            t.state.gis.setCenter(gt);
            // t.setState({center:gt});
        }else{
            t.state.gis.setCenter([116.400433,39.906705]);
            // t.setState({center:[117.468021,39.890092]});
        }
    }
    /*地图区域限制*/
    setAreaRestriction(sw_ne){
        let bounds = new AMap.Bounds(new AMap.LngLat(sw_ne[0][0],sw_ne[0][1]),new AMap.LngLat(sw_ne[1][0],sw_ne[1][1]));
        this.state.gis.setLimitBounds(bounds);
    }
    clearAreaRestriction(){
        this.state.gis.clearLimitBounds();
    }
    //展示路况信息
    openTrafficInfo(){
        let t = this;
        //判断是否已经创建路况对象
        if(this.trafficLayer){
            this.trafficLayer.show();
        }else{
            //路况类对象
            let trafficLayer = new AMap.TileLayer.Traffic({
                zIndex: 10
            });
            t.state.gis.add(trafficLayer);
            this.trafficLayer = trafficLayer;
        }
    }
    //隐藏路况信息
    hideTrafficInfo(){
        if(this.trafficLayer){
            this.trafficLayer.hide();
        }
    }
    //设置指定图元展示   高德只有zoom和center全适应,单适应暂时无法实现
    setVisiblePoints(obj){
        let t = this;
        let ids = [];
        switch(obj.fitView){
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
                let pts = [...t.state.gis.getAllOverlays('marker'),...t.state.gis.getAllOverlays('polyline'),
                            ...t.state.gis.getAllOverlays('polygon'),...t.state.gis.getAllOverlays('circle')];
                t.state.gis.setFitView(pts);
            break;
            default:
                if(obj.fitView instanceof Array){
                    ids = obj.fitView;
                }else if(typeof(obj.fitView) === 'string'){
                    ids = obj.fitView.split(',');
                }
                if(ids[0] instanceof Array){
                    let l = new AMap.LngLat(ids[0][0],ids[0][1]),
                        r = new AMap.LngLat(ids[1][0],ids[1][1]); 
                    let b = new AMap.Bounds(l,r); 
                    t.state.gis.setBounds(b);
                }else{
                    t.state.gis.setFitView(this.GM.getMoreGraphic(ids));
                }
            break;
        }
    }
    //设置地图比例尺
    setZoomLevel (zoom) {
        let t =this;
        t.state.gis.setZoom(zoom);
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
        ary = ary.filter((item,index)=>{
            return !(t.GM.getGraphicParam(item).attributes.config || {}).isAnimation;
        });
        let ms = this.GM.getMoreGraphic(ary).filter((item,index)=>{
            return !item && item != 0 ? false : true;
        });
        t.clusterObj.setMarkers(ms);
    }
    //展示比例尺
    showControl (){
        let t = this;
        t.state.gis.addControl(t.scale);
        if(t.props.showControl.type !== 'null' && !!t.props.showControl.type){
            t.state.gis.addControl(t.tool);
        }
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
        let {lnglatAry,_extent,path} = t.dealData(gg);
        switch(gp.geometryType){
            case 'point':
                lng = gg.getPosition().getLng();
                lat = gg.getPosition().getLat();
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
                pts = gg.getPath().map((item,index)=>{
                    return [item.lng,item.lat]
                });
                p = {
                    ...gp,
                    lnglatAry,
                    mapLayer: gg,
                    geometry: {
                        ...gp.geometry,
                        paths: pts,
                        _extent
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
                pts = gg.getPath().map((item,index)=>{
                    return [item.lng,item.lat]
                });
                p = {
                    ...gp,
                    lnglatAry,
                    mapLayer: gg,
                    geometry: {
                        ...gp.geometry,
                        rings: pts,
                        _extent
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
    //显示隐藏的图元
    showGraphicById (id){
        let t = this;
        t.GM.getGraphic(id).show();
    }
    //隐藏图元
    hideGraphicById(id){
        let t = this;
        t.GM.getGraphic(id).hide();
    }
    //画出对应边界线 name区域名
    addBaiduBoundary(bdNames){
        let t = this;
        this.districeSearch;
        bdNames.forEach(name=>{
            t.districeSearch.search(name,(status,result)=>{
                if(status == 'complete'){
                    let id = 'boundary' + new Date().getTime();
                    let paths = result.districtList[0].boundaries[0].map((item,index)=>{
                        return [item.lng,item.lat];
                    });
                    t.addPolygon([{id,rings:paths}]);
                    t.state.boundaryInfo.push({id,name:name});
                }   
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
        let option = {
            radius: cg.radius,
            opacity: [0,cg.opacity]
        }
        if(cg.gradient){
            option.gradient = cg.gradient;
        }
        t.heatmap.setOptions(option);
        t.heatmap.setDataSet({
            max: cg.max,
            data: d.data || []
        })
        if(cg.visible){
            t.heatmap.show();
        }else{
            t.heatmap.hide();
        }
    }
    //添加海量点
    addPointCollection(data = []){
        let t = this;
        data.map((item,index)=>{
            let d = item || {};
            let points = (d.points || []).map((d,i)=>{
                let p = new AMap.LngLat(d.lng,d.lat);
                    p = t.state.gis.lngLatToContainer(p);
                return [p.x,p.y];
            });
            let options = {
                size: d.size,
                shape: d.shape,
                color: d.color,
                width: t.state.gis.getSize().width,
                height: t.state.gis.getSize().height,
                mapId: t.props.mapId
            };
            let VotexpointCollection = new GMapLib.PointCollection(points,options);
            t.morepoints.push({
                id: d.id,
                value: VotexpointCollection
            });
            VotexpointCollection.draw();
        })
    }
    //更新海量点
    updatePointCollection(data = []){
        let t = this;
        data.map((ds,ind)=>{
            t.morepoints.map((item,index)=>{
                if(item.id == ds.id){
                    let points = (ds.points || []).map((d,i)=>{
                        let p = new AMap.LngLat(d.lng,d.lat);
                            p = t.state.gis.lngLatToContainer(p);
                        return [p.x,p.y];
                    });
                    let options = {
                        size: ds.size,
                        shape: ds.shape,
                        color: ds.color,
                        width: t.state.gis.getSize().width,
                        height: t.state.gis.getSize().height
                    };
                    item.value.reDraw(points,options);
                }
            })
        })
    }
    //删除海量点
    clearPointCollection(ids = []){
        let t = this;
        ids.map((id,ind)=>{
            t.morepoints.map(function (item,index) {
                if(id == item.id){
                    item.value.clear();
                }
            });
        });
    }
    //删除全部海量点
    clearAllPointCollection(){
        let t = this;
        t.morepoints.map(function (item,index) {
            item.value.clear();
        });
    }
    //添加点
    addPoint(mapPoints,type){
        let t = this;
        let ps = [];
        let psids = [...t.state.pointIds];
        mapPoints.map((item,index)=>{
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
            let cg = {
                width: 30,
                height: 30,
                labelContent: '',
                labelPixelX: 0,
                labelPixelY: 34,
                markerContentX: -13,
                markerContentY: -42,
                zIndex: 100,
                deg: 0,
            }
            //初始化默认数据
            if(item.config){
                cg = {...cg,...item.config};
            }
            //覆盖物参数
            let markerOption = {
                position: new AMap.LngLat(item.longitude,item.latitude),
                offset: new AMap.Pixel(cg.markerContentX,cg.markerContentY),
                zIndex: cg.zIndex,
                angle: cg.deg,
                clickable: true,
                cursor: 'pointer',
                bubble: true,
                extData: {
                    id: item.id
                }
            }
            if(cg.BAnimationType == 0){
                markerOption.animation ='AMAP_ANIMATION_BOUNCE';
            }else if(cg.BAnimationType == 1){
                markerOption.animation = 'AMAP_ANIMATION_DROP';
            }else{
                markerOption.animation = 'AMAP_ANIMATION_NONE';
            }
            //判断html还是图片
            if(!!item.markerContent){
                markerOption.content = item.markerContent;
            }else{
                markerOption.icon = item.url;
            }
            //是否展示label
            if(item.canShowLabel){
                let labelClass = item.labelClass || 'label-content';
                markerOption.label = {
                    content: `<div class='${labelClass}'>${cg.labelContent}</div>`,
                    offset: new AMap.Pixel(cg.labelPixelX,cg.labelPixelY)
                }
            }
            //获得覆盖物对象
            let marker = new AMap.Marker(markerOption);
            //添加点击事件
            marker.on( 'click', (e)=>{
                t.clickGraphic(item.id,e);
            });
            marker.on( 'mouseover', (e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            marker.on( 'mouseout', (e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            ps.push(marker);
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
                    }
                }
            );
        });
        //统一加点
        t.state.gis.add(ps);
        if(type !== 'defined'){
            t.setState({
                pointIds: psids
            })
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
                if(!item.config){
                    item.config = {};
                }
                //获取原有的图元
                let gc = this.GM.getGraphic(item.id),isuserUrlLeft = false;
                let cg = {
                    labelContent: item.config.labelContent || gc.getLabel(),
                    markerContentX: item.config.markerContentX || gc.getOffset().getX(),
                    markerContentY: item.config.markerContentY || gc.getOffset().getY(),
                    deg: item.config.deg || gc.getAngle(),
                    zIndex: item.config.zIndex || gc.getzIndex(),
                    labelClass: item.config.labelContent || 'label-content'
                };
                if(item.config){
                    cg = {...cg,...item.config};
                }
                //是否展示label
                if(item.canShowLabel){
                    cg.labelPixelX= item.config.labelPixelX || gc.getLabel().offset.getX();
                    cg.labelPixelY= item.config.labelPixelY || gc.getLabel().offset.getY();
                    cg.labelContent= item.config.labelContent || gc.getLabel().offset.content;
                    let labelClass = item.labelClass || 'label-content';
                    //更新label
                    gc.setLabel({
                        content: `<div class='${labelClass}'>${cg.labelContent}</div>`,
                        offset: new AMap.Pixel(cg.labelPixelX,cg.labelPixelY)
                    })
                }
                //更新偏移量
                gc.setOffset(new AMap.Pixel(cg.markerContentX,cg.markerContentY));
                //设置偏转角度
                gc.setAngle(cg.deg);
                //设置点的标记添加顺序
                gc.setzIndex(cg.zIndex);
                //更新经纬度
                if(!item.config.isAnimation){
                    gc.setPosition(new AMap.LngLat(item.longitude,item.latitude));
                }else{
                    let distance = t.calculatePointsDistance([item.longitude,item.latitude],[
                        gc.getPosition().getLng(),gc.getPosition().getLat()]);
                    if(distance > 0){
                        let delay = item.config.animationDelay || 3;
                        let speed = distance/delay*3600/1000;
                        if(cg.autoRotation){
                            let ddeg = t.rotateDeg(gc.getPosition(),[item.longitude,item.latitude]);
                            if(item.urlleft && (ddeg < -90 && ddeg > -270)){
                                ddeg += 180;
                                isuserUrlLeft = true;
                            }
                            gc.setAngle(ddeg);
                        }
                        gc.moveTo(new AMap.LngLat(item.longitude,item.latitude),speed,function(k){
                            return k;
                        })
                    }
                }
                if(item.config.BAnimationType == 0){
                    gc.setAnimation('AMAP_ANIMATION_BOUNCE');
                }else if(item.config.BAnimationType == 1){
                    gc.setAnimation('AMAP_ANIMATION_DROP');
                }else{
                    gc.setAnimation('AMAP_ANIMATION_NONE');
                }
                //判断html还是图片
                if(!!item.markerContent){
                    gc.setContent(item.markerContent);
                }else{
                    if(isuserUrlLeft){
                        gc.setIcon(item.urlleft);
                    }else{
                        if(item.url){
                            gc.setIcon(item.url);
                        }
                    }
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
                        }
                    }
                );
            }else{
                console.error(`更新的点位id不存在!`);
                return false;
            }
        })
    }
    //添加线
    addLine(mapLines,type){
        let t = this;
        let ls = [];
        let lsids = [...t.state.lineIds];
        //遍历添加线(图元)
        mapLines.map((item,index)=>{
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
            let cg = {
                color: '#277ffa',
                pellucidity: 0.9,
                lineWidth: 5,
                lineType: 'solid',
                isHidden: false
            }
            if(item.config){
                cg = {...cg,...item.config};
            }
            let lineOption = {
                strokeColor: cg.color,
                strokeOpacity: cg.pellucidity,
                strokeWeight: cg.lineWidth,
                strokeStyle: cg.lineType,
                path: (item.paths || []).map((itt,indd)=>{
                    return [...itt];
                }),
                cursor: 'pointer',
                bubble: true
            }
            let polyline = new AMap.Polyline(lineOption);
            //添加点击事件
            polyline.on( 'click', (e)=>{
                t.clickGraphic(item.id,e);
            });
            polyline.on( 'mouseover', (e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            polyline.on( 'mouseout', (e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            //缓存图元的数据,便于后期操作
            let pts = item.paths.map((itt,ind)=>{
                return [...itt]
            });
            this.GM.setGraphic(item.id,polyline).setGraphicParam(
                item.id,
                {
                    attributes: {
                        ...item,
                        paths: pts,
                        other: item
                    },
                    geometryType: 'polyline',
                    geometry: {
                        type: 'polyline',
                        paths: pts
                    }
                }
            );
            ls.push(polyline);
            lsids.push(item.id);
            //添加线
            // polyline.setMap(t.state.gis);
            //根据参数判断是否显示多折线
            if(cg.isHidden){
                polyline.hide();
            }else{
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
                let op = gc.getOptions();
                if(!item.config){
                    item.config = {};
                }
                //根据参数判断是否显示多折线
                if(item.config && item.config.isHidden){
                    gc.hide();
                }else{
                    gc.show();
                }
                //获取原有的线属性,转换key值
                let cg = {
                    color: op.strokeColor,
                    pellucidity: op.strokeOpacity,
                    lineWidth: op.strokeWeight,
                    lineType: op.strokeStyle
                };
                //重新初始化值
                if(item.config){
                    cg = {...cg,...item.config};
                }
                //重新赋值
                let lineOption = {
                    strokeColor: cg.color,
                    strokeOpacity: cg.pellucidity,
                    strokeWeight: cg.lineWidth,
                    strokeStyle: cg.lineType,
                    path: (item.paths || op.path).map((itt,indd)=>{
                        return [...itt];
                    }),
                    cursor: 'pointer'
                }
                let pts = item.paths.map((itt,ind)=>{
                    return [...itt]
                });
                this.GM.setGraphicParam(
                    item.id,
                    {
                        attributes: {
                            ...item,
                            paths: pts,
                            other: item
                        },
                        geometryType: 'polyline',
                        geometry: {
                            type: 'polyline',
                            paths: pts
                        }
                    }
                );
                //更新线
                gc.setOptions(lineOption);
            }else{
                console.error(`更新的多折线id不存在!`);
                return false;
            }
        });
    }
    //添加面
    addPolygon(mapPolygons){
        let t = this;
        let pgs = [];
        let pgsids = [...t.state.polygonIds];
        //遍历添加面(图元)
        mapPolygons.map((item,index)=>{
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
            let cg = {
                lineType: 'solid',
                lineWidth: 5,
                lineColor: '#277ffa',
                lineOpacity: 1,
                color: '#fff',
                pellucidity: 0.5
                // isHidden: false  //后期跟百度一起加
            }
            if(!item.config){
                cg = {...cg,...item.config};
            }
            let polygonOption = {
                strokeColor: cg.lineColor,
                strokeOpacity: cg.lineOpacity,
                strokeWeight: cg.lineWidth,
                strokeStyle: cg.lineType,
                fillColor: cg.color,
                fillOpacity: cg.pellucidity,
                path: (item.rings || []).map((itt,indd)=>{
                    return [...itt];
                }),
                cursor: 'pointer',
                bubble: true
            }
            let polygon = new AMap.Polygon(polygonOption);
            //添加点击事件
            polygon.on( 'click', (e)=>{
                t.clickGraphic(item.id,e);
            });
            polygon.on( 'mouseover', (e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            polygon.on( 'mouseout', (e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            //缓存图元的数据,便于后期操作
            let pts = item.rings.map((itt,ind)=>{
                return [...itt]
            });
            this.GM.setGraphic(item.id,polygon).setGraphicParam(
                item.id,
                {
                    attributes: {
                        ...item,
                        rings: pts,
                        other: item
                    },
                    geometryType: 'polygon',
                    geometry: {
                        type: 'polygon',
                        rings: pts
                    },
                }
            );
            pgs.push(polygon);
            pgsids.push(item.id);

        });
        t.state.gis.add(pgs);
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
                let op = gc.getOptions();
                if(!item.config){
                    item.config = {};
                }
                //根据参数判断是否显示面
                // if(item.config && item.config.isHidden){
                //     gc.hide();
                // }else{
                //     gc.show();
                // }
                //获取原有的面属性,转换key值
                let cg = {
                    lineType: op.strokeStyle,
                    lineWidth: op.strokeWeight,
                    lineColor: op.strokeColor,
                    lineOpacity: op.strokeOpacity,
                    color: op.fillColor,
                    pellucidity: op.fillOpacity
                }
                //重新初始化值
                if(item.config){
                    cg = {...cg,...item.config};
                }
                //重新赋值
                let polygonOption = {
                    strokeColor: cg.lineColor,
                    strokeOpacity: cg.lineOpacity,
                    strokeWeight: cg.lineWidth,
                    strokeStyle: cg.lineType,
                    fillColor: cg.color,
                    fillOpacity: cg.pellucidity,
                    path: (item.rings || op.path).map((itt,indd)=>{
                        return [...itt];
                    }),
                    cursor: 'pointer'
                }
                let pts = item.rings.map((itt,ind)=>{
                    return [...itt]
                });
                this.GM.setGraphicParam(
                    item.id,
                    {
                        attributes: {
                            ...item,
                            rings: pts,
                            other: item
                        },
                        geometryType: 'polygon',
                        geometry: {
                            type: 'polygon',
                            rings: pts
                        }
                    }
                );
                //更新线
                gc.setOptions(polygonOption);
            }else{
                console.error(`更新的多边形id不存在!`);
                return false;
            }
        });
    }
    //添加圆  circle
    addCircle(mapCircles){
        let t = this;
        let ccs = [];
        let ccsids = [...t.state.circleIds];
        mapCircles.map((item,index)=>{
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
            let cg = {
                lineType: 'solid',
                lineWidth: 5,
                lineColor: '#277ffa',
                lineOpacity: 1,
                color: '#fff',
                pellucidity: 0.5
                // isHidden: false  //后期跟百度一起加
            }
            if(item.config){
                cg = {...cg,...item.config};
            }
            //初始化配置数据
            let circleOption = {
                strokeColor: cg.lineColor,
                strokeOpacity: cg.lineOpacity,
                strokeWeight: cg.lineWidth,
                strokeStyle: cg.lineType,
                fillColor: cg.color,
                fillOpacity: cg.pellucidity,
                center: new AMap.LngLat(item.longitude,item.latitude),
                radius: item.radius,
                cursor: 'pointer',
                bubble: true
            }
            //创建圆对象
            let circle = new AMap.Circle(circleOption);
            //添加点击事件
            circle.on( 'click', (e)=>{
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
            ccs.push(circle);
            ccsids.push(item.id);
        });
        t.state.gis.add(ccs);
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
                let op = gc.getOptions();
                if(!item.config){
                    item.config = {};
                }
                //获取原有的面属性,转换key值
                let cg = {
                    lineType: op.strokeStyle,
                    lineWidth: op.strokeWeight,
                    lineColor: op.strokeColor,
                    lineOpacity: op.strokeOpacity,
                    color: op.fillColor,
                    pellucidity: op.fillOpacity
                }
                //重新初始化值
                if(item.config){
                    cg = {...cg,...item.config};
                }
                //重新赋值
                let circleOption = {
                    strokeColor: cg.lineColor,
                    strokeOpacity: cg.lineOpacity,
                    strokeWeight: cg.lineWidth,
                    strokeStyle: cg.lineType,
                    fillColor: cg.color,
                    fillOpacity: cg.pellucidity,
                    center: new AMap.LngLat(item.longitude,item.latitude) || op.center,
                    radius: !item.radius && item != 0?op.radius:item.radius,
                    cursor: 'pointer'
                }
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
                //更新线
                gc.setOptions(circleOption);
            }else{
                console.error(`更新的圆id不存在!`);
                return false;
            }
        });
    }
    /*根据图元id,使图元变成可编辑状态*/
    doEdit(id){
        let t = this;
        let ms = t.getGraphic(id);
        if(!ms){
            return false;
        }
        if(!!t.state.editId){
            t.endEdit();
        }
        switch(ms.geometryType){
            case 'point':
                ms.mapLayer.setDraggable(true);
                ms.mapLayer.on('dragend',t.editGraphicChange,t);
            break;
            case 'polyline':
            // break;
            case 'polygon':
            case 'rectangle':
                t.polyEdit = new AMap.PolyEditor(t.state.gis,ms.mapLayer);
                t.polyEdit.open();
                t.polyEdit.on('adjust',t.editGraphicChange,t);
            break;
            case 'circle':
                t.circleEdit = new AMap.CircleEditor(t.state.gis,ms.mapLayer);
                t.circleEdit.open();
                t.circleEdit.on('move',t.editGraphicChange,t);
                t.circleEdit.on('adjust',t.editGraphicChange,t);
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
        switch(ms.geometryType){
            case 'point':
                ms.mapLayer.setDraggable(false);
                ms.mapLayer.off('dragend',t.editGraphicChange,t);
            break;
            case 'polyline':
            case 'polygon':
            case 'rectangle':
                t.polyEdit.close();
                t.polyEdit.off('adjust',t.editGraphicChange,t);
            break;
            case 'circle':
                t.circleEdit.close();
                t.circleEdit.off('move',t.editGraphicChange,t);
                t.circleEdit.off('adjust',t.editGraphicChange,t);
            break;
        }
        let editGraphic = t.state.editGraphic;
        if(editGraphic){
            t.setState({
                editId: '',
                editGraphic: ''
            },()=>{
                t.props.editGraphicChange(editGraphic);
            })
        }
    }
    //编辑变动后
    editGraphicChange(e){
        let t = this;
        let ms = t.getGraphic(t.state.editId);
        let obj = {
            id: t.state.editId,
            e: e
        };
        switch(ms.geometryType){
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
                if(!('lnglat' in e)){
                    obj.e.lnglat = new AMap.LngLat(ms.geometry.x,ms.geometry.y);
                }
                if(!('radius' in e)){
                    obj.e.radius = ms.geometry.radius;
                }
                obj.geometry = ms.geometry;
                obj.param = ms;
                obj.area = Math.pow(ms.geometry.radius,2)*Math.PI;
            break;
        }
        if(ms.geometryType == 'circle'){
            if(t.editTimeout){
                clearTimeout(t.editTimeout);
            }
            t.editTimeout = setTimeout(()=>{
                t.setState({
                    editGraphic: obj
                },()=>{
                    t.props.editGraphicChange(obj);
                });
            },300);
        }else{
            t.setState({
                editGraphic: obj
            },()=>{
                t.props.editGraphicChange(obj);
            });
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
                top: e.pixel.y + t.mapTop,//当前点所在的位置(屏幕)
                left: e.pixel.x + t.mapLeft,
                e: e
            }
            t.props.clickGraphic(obj);
        }
    }
    //拖拽地图开始
    dragMapStart(){
        let t = this;
        if(typeof(t.props.dragMapStart) ==="function"){
            t.state.gis.on('dragstart', function(e) {
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
            t.state.gis.on('dragend', function(e) {
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
            t.state.gis.on('movestart', function(e) {
                t.htmlXY = {
                    px:0,py:0,isCount: true,
                    ...t.state.gis.lnglatToPixel(t.state.gis.getCenter())
                };
                $(`#${t.pointCollectionId}`).css({top: '0px',left: '0px',display: 'none'});
                t.updatePointCollection(t.props.mapPointCollection);
                if(t.stopMove){
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
            t.state.gis.on('moveend', function(e) {
                t.htmlXY.isCount = false;
                $(`#${t.pointCollectionId}`).css({top: '0px',left: '0px',display: 'block'});
                t.updatePointCollection(t.props.mapPointCollection);
                if(t.stopMove){
                    let obj = t.getMapExtent();
                    obj.e = e;
                    //处理下数据,符合拖拽事件
                    t.props.moveEnd(obj);
                }else{
                    t.stopMove = true;
                }
            });
        }
    }
    //地图更改缩放级别开始时触发触发此事件
    zoomStart(){
        let t =this;
        if(typeof(t.props.zoomStart) ==="function"){
            t.state.gis.on('zoomstart', function(e) {
                $(`#${t.pointCollectionId}`).css({display: 'none'});
                t.stopMove = false;
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
            t.state.gis.on('zoomend', function(e) {
                $(`#${t.pointCollectionId}`).css({display: 'inline-block'});
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.zoomEnd(obj);
            });
        }
    }
    //图元鼠标悬浮事件
    mouseOverGraphic(id,e){
        let t = this;
        if(typeof(t.props.mouseOverGraphic) === 'function'){
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
            let obj = {
                e,id,
                param: t.getGraphic(id)
            }
            t.props.mouseOutGraphic(obj);
        }
    }
    //地图点击事件
    clickMap(){
        let t =this;
        if(typeof(t.props.clickMap) ==="function"){
            t.state.gis.on('click', function(e) {
                let obj = t.getMapExtent();
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
    vtxRangingTool () {
        let t = this;
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
            t.removeGraphic(drawParam.data.id);
            t.state.drawIds[drawParam.geometryType].splice(len,1);
        }
        //引用百度测距样式
        t.state.gis.setDefaultCursor('crosshair');
        let param = {};
        let paramgcr = {};
        if(drawParam.geometryType == 'polygon' || drawParam.geometryType == 'circle' || drawParam.geometryType == 'rectangle'){
            paramgcr.fillColor = drawParam.parameter.color;
            paramgcr.strokeColor = drawParam.parameter.lineColor;
            paramgcr.strokeOpacity = drawParam.parameter.lineOpacity;
            paramgcr.strokeWeight = drawParam.parameter.lineWidth;
            paramgcr.fillOpacity = drawParam.parameter.pellucidity;
            paramgcr.strokeStyle =  drawParam.parameter.lineType;
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
                param.icon = new AMap.Icon({
                    image: drawParam.parameter.url || 'http://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png',
                    size: new AMap.Size(drawParam.parameter.width || 36,drawParam.parameter.height || 36),
                    offset: new AMap.Pixel(drawParam.parameter.labelPixelX || -10,drawParam.parameter.labelPixelY || -34)
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
                param.strokeStyle =  drawParam.parameter.lineType;
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
    closeDraw(){
        let t = this;
        //恢复鼠标默认样式
        t.state.gis.setDefaultCursor();
        t.mousetool.close();
    }
    //处理线和面的 经纬度数据
    dealData(ms){
        //区别点和圆的经纬度数据处理
        let lnglatAry = [],_extent = {xmax: 0,xmin: 0,ymax: 0,ymin: 0},path=[];
        if('getPath' in ms){
            path = ms.getPath();
            path = path.map((item,index)=>{
                let lng = item.lng,lat = item.lat;
                if(lng > _extent.xmax){
                    _extent.xmax = lng;
                }
                if(lng < _extent.xmin || _extent.xmin == 0){
                    _extent.xmin = lng;
                }
                if(lat > _extent.ymax){
                    _extent.ymax = lat;
                }
                if(lat < _extent.ymin || _extent.ymin == 0){
                    _extent.ymin = lat;
                }
                lnglatAry.push({
                    lngX: lng,
                    latX: lat
                });
                return [lng,lat];
            })
        }
        return {lnglatAry,_extent,path};
    }
    //删除图元
    removeGraphic(id,type){
        let t = this;
        if(!!this.GM.getGraphic(id)){
            if((t.GM.getGraphicParam(id).attributes.config || {}).isAnimation){
                this.GM.getGraphic(id).stopMove();
            }
            //清除聚合点 避免异常
            t.clusterObj.removeMarker(this.GM.getGraphic(id));
            //清除地图中图元
            this.GM.getGraphic(id).setMap();
            //清除对应id的图元数据缓存
            this.GM.removeGraphic(id);
        }else{
            return false;
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
    //点位角度旋转(以指向东(右)为0°)
    rotateDeg(sp,ep){
        let t = this;
        let s = t.state.gis.lngLatToContainer(sp),
        //获取当前点位的经纬度
            e = t.state.gis.lngLatToContainer(new AMap.LngLat(ep[0],ep[1])),
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
        let lnglat1 = new AMap.LngLat(f[0],f[1]);
        let lnglat2 = new AMap.LngLat(s[0],s[1]);
        return Math.round(lnglat1.distance(lnglat2));
    }
    //计算多个点的距离(常用于线计算)
    calculateDistance(ps){
        let t = this,totalDistance = 0;
        if (ps.length < 0) {return false;}
        for(let i= 0 ; i< ps.length ; i++){
            if(i < ps.length-1){
                totalDistance += t.calculatePointsDistance(ps[i],ps[i+1]);
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
        let psc = new AMap.PlaceSearch({
            pageSize,
            pageIndex
        });
        return new Promise((resolve)=>{
            psc.search(searchValue,(status,result)=>{
                let list = result.poiList.pois.map((r)=>({
                    id: r.id,
                    longitude: r.location.lng,
                    latitude: r.location.lat,
                    canShowLabel: true,
                    config: {
                        labelContent: r.name,
                        labelPixelY: 27
                    },
                    other: 'search'
                }));
                resolve(list)
            })
        })
    }
    render(){
        let t = this;  
        let _map = this.props;
        return(
            <div id={_map.mapId} style={{width:'100%',height:'100%'}}></div>
        );
    }
    componentDidMount(){
        let t = this;
        this.loadMapComplete.then(()=>{
            t.mapLeft = document.getElementById(t.props.mapId).offsetLeft;
            t.mapTop = document.getElementById(t.props.mapId).offsetTop;
            t.init();
        })
    }
    componentWillUnmount(){
        let t = this;
        //关闭moveTo定时
        for(let i in t.GM.allParam){
            if(t.GM.allParam.type == 'point'){
                t.GM.getGraphic[i].stopMove();
            }
        }
        this.state.gis.destroy();
        this.state.gis = null;
    }
    componentDidUpdate(prevProps, prevState) {//重新渲染结束
        let t = this;
        let props = t.props;
        // 等待地图加载
        if(!t.state.mapCreated)return;

        //回调显示方法
        if(props.showGraphicById){
            props.showGraphicById(t.showGraphicById.bind(t));
        }
        //回调隐藏方法
        if(props.hideGraphicById){
            props.hideGraphicById(t.hideGraphicById.bind(t));
        }  
        
    }
    componentWillReceiveProps(nextProps,prevProps) {//已加载组件，收到新的参数时调用
        let t = this;
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
            isClearAll,mapPointCollection,isclearAllPointCollection,
            isSetAreaRestriction,areaRestriction,isClearAreaRestriction
        } = nextProps;
        let props = t.props;

        // 等待地图加载
        if(!t.state.mapCreated)return;
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
        if(mapPoints instanceof Array && !t.deepEqual(mapPoints,props.mapPoints)){
            let oldMapPoints = props.mapPoints;
            let newMapPoints = mapPoints;
            //过滤编辑的图元
            if(!!t.state.editId){
                oldMapPoints = props.mapPoints.filter((item)=>{return item.id !== editGraphicId});
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
        if(mapLines instanceof Array && !t.deepEqual(mapLines,props.mapLines)){
            let oldMapLines = props.mapLines;
            let newMapLines = mapLines;
            if(!!t.state.editId){
                oldMapLines = props.mapLines.filter((item)=>{return item.id !== editGraphicId});
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
        if(customizedBoundary instanceof Array && !t.deepEqual(customizedBoundary,props.customizedBoundary)){
            let {deletedDataIDs,addedData,updatedData} = t.dataMatch(props.customizedBoundary,customizedBoundary,'id');
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
        if(mapPolygons instanceof Array && !t.deepEqual(mapPolygons,props.mapPolygons)){
            let oldMapPolygons = props.mapPolygons;
            let newMapPolygons = mapPolygons;
            if(!!t.state.editId){
                oldMapPolygons = props.mapPolygons.filter((item)=>{return item.id !== editGraphicId});
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
            面数据处理
            先全删除,再新增
        */
        if(mapCircles instanceof Array && !t.deepEqual(mapCircles,props.mapCircles)){
            let oldMapCircles = props.mapCircles;
            let newMapCircles = mapCircles;
            if(!!t.state.editId){
                oldMapCircles = props.mapCircles.filter((item)=>{return item.id !== editGraphicId});
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
        //绘制边界线
        if(boundaryName instanceof Array && !t.deepEqual(boundaryName,props.boundaryName)){
            let newBDName = Set(boundaryName);
            let oldBDName = Set(props.boundaryName);
            let removedBoundaryName = oldBDName.subtract(newBDName).toJS();
            let addedBoundaryName = newBDName.subtract(oldBDName).toJS();
            t.removeBaiduBoundary(removedBoundaryName);
            t.addBaiduBoundary(addedBoundaryName);
        }
        // 获取热力图
        if(heatMapData && !t.deepEqual(heatMapData,props.heatMapData)){
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
        //是否打开路况
        if(isOpenTrafficInfo){
            t.openTrafficInfo();
        }else{
            t.hideTrafficInfo();
        }
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
    componentWillUnmount() {
        //关闭moveTo定时
        let t = this;
        for(let i in t.GM.allParam){
            if(t.GM.allParam[i].geometryType == 'point'){
                if(t.GM.getGraphic[i]){
                    t.GM.getGraphic[i].stopMove();
                }
            }
        }
    }
}

export default VortexAMap;