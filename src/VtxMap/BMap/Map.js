import React from 'react';
import './Map.css';
import {graphicManage,getPolygonArea} from '../MapToolFunction';
import Immutable from 'immutable';
const {Set} = Immutable;
//公共地址配置
import configUrl from '../../default';
const gisMapConstant = {
    circle: 'BMAP_POINT_SHAPE_CIRCLE',//圆形
    star: 1,//星形
    square: 4,//方形
    rhombus: 5,//菱形
    waterdrop: 2,//水滴状，该类型无size和color属性
    tiny: 1, //定义点的尺寸为超小，宽高为2px*2px
    smaller: 2,//定义点的尺寸为很小，宽高为4px*4px
    small: 3,//定义点的尺寸为小，宽高为8px*8px
    normal: 4,//定义点的尺寸为正常，宽高为10px*10px，为海量点默认尺寸
    big: 5,//定义点的尺寸为大，宽高为16px*16px
    bigger: 6,//定义点的尺寸为很大，宽高为20px*20px
    huge: 7,//定义点的尺寸为超大，宽高为30px*30px
}
class BaiduMap extends React.Component{
    constructor(props){
        super(props);
        this.GM = new graphicManage();//初始化 图元管理方法
        this.getPolygonArea = getPolygonArea;
        this.initPointIndex = 0;//初始化地图时记录点当前位置
        this._cluster = null;//点聚合对象
        this._rangingTool = null;//测距对象
        this._bmar = null;//区域限制对象
        this._drawmanager = null;//图元绘制对象
        this.editGraphicChange = null;//编辑方法回调
        this.editTimeout = null;//圆编辑回调延迟时间对象
        this._boundary = null;//获取行政区域数据的对象
        this.moveToTimer = null;//moveTo时间对象
        this.heatmap = null;//热力图对象
        this.morepoints = [];//海量点数组
        this.movePoints = [];//移动点的动画集合
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
            boundaryInfo: [],//当前画出的边界线的id和区域名
            drawIds: {//绘制工具id集合
                point: [],
                polyline: [],
                polygon: [],
                circle: [],
                rectangle: []
            }
        };
        this.loadMapJs();
    }
    loadMapJs(){
        this.loadMapComplete = new Promise((resolve,reject)=>{
            if(window.BMap){
                resolve(window.BMap);
            }
            else{
                $.getScript('http://api.map.baidu.com/getscript?v=2.0&ak=EVlFc6DZzAzU5avIjoxNcFgQ',()=>{
                    let DistanceTool = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/DistanceTool_min.js`,()=>{
                            resolve();
                        });
                    });
                    let TrafficControl = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/TrafficControl_min.js`,()=>{
                            resolve();
                        });
                    });
                    let MarkerClusterer = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/MarkerClusterer_min.js`,()=>{
                            resolve();
                        });
                    });
                    let AreaRestriction = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/AreaRestriction_min.js`,()=>{
                            resolve();
                        })
                    });
                    let DrawingManager = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/DrawingManager_min.js`,()=>{
                            resolve();
                        });
                    });
                    let Heatmap = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/Heatmap_min.js`,()=>{
                            resolve();
                        });
                    });
                    let GeoUtils = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/GeoUtils_min.js`,()=>{
                            resolve();
                        });
                    });
                    let TextIconOverlay = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/TextIconOverlay_min.js`,()=>{
                            resolve();
                        });
                    });

                    Promise.all([DistanceTool,TrafficControl,MarkerClusterer,AreaRestriction,DrawingManager,Heatmap,GeoUtils,TextIconOverlay]).then(()=>{
                        resolve(window.BMap);
                    });
                });
                $("<link>").attr({ rel: "stylesheet",type: "text/css",href: "http://api.map.baidu.com/library/TrafficControl/1.4/src/TrafficControl_min.css"}).appendTo("head");
            }
        });
    }
    //初始化地图数据
    init(){
        let t = this;
        //创建地图
        t.createMap();
        const {
            mapPoints,mapLines,mapPolygons,mapCircles,
            mapVisiblePoints,mapCluster,mapZoomLevel,
            isOpenTrafficInfo,mapPointCollection,areaRestriction
        } = this.props;
        let {boundaryName,heatMapData,customizedBoundary} = this.props;
        let {boundaryInfo,pointIds,lineIds,polygonIds,circleIds} = this.state;
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
        //画边界线
        if(boundaryName instanceof Array && boundaryName.length>0){
            t.addBaiduBoundary(boundaryName);
        }
        // 画热力图
        if(heatMapData){
            t.heatMapOverlay(heatMapData);
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
        //设置点聚合
        if(mapCluster instanceof Array){
            t.cluster(mapCluster);
        }
        //开关路况
        if(isOpenTrafficInfo){
            t.openTrafficInfo();
        }else{
            t.hideTrafficInfo();
        }
        //设置区域限制
        if(areaRestriction && !!areaRestriction[0] && !!areaRestriction[1]){
            t.setAreaRestriction(areaRestriction);
        }
        //是否设置比例尺
        if(t.props.showControl){
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
            mapCreated:true
        })
    }
    //创建地图
    createMap () {
        let t = this;
        const {mapCenter,mapId,mapZoomLevel,minZoom,maxZoom} = t.props;
        let options ={
            zoom: mapZoomLevel || 10,
            center: mapCenter || [116.404,39.915],
            minZoom,maxZoom
        };
        if(window.VtxMap){
            window.VtxMap[mapId]= {};
        }else{
            window.VtxMap = {};
        }
        let map = window.VtxMap[mapId] = t.state.gis = new BMap.Map(mapId,{
            enableMapClick : false,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom
        });
        setTimeout(()=>{
            $('#myCanvasElement').parent().children('svg').css({'z-index':1});
        },500);
        // 初始化地图,设置中心点坐标和地图级别
        map.centerAndZoom(new BMap.Point(parseFloat(options.center[0]),parseFloat(options.center[1])), options.zoom);
        //添加地图类型控件(几乎不用,先写着)
        if(t.props.satelliteSwitch){
            map.addControl(new BMap.MapTypeControl());   
        }
        //初始化路况控件
        if(!t._trafficCtrl){
            t._trafficCtrl = new BMapLib.TrafficControl({
                // 是否显示路况提示面板
                showPanel : false
            });
            map.addControl(t._trafficCtrl);
            if(document.getElementById('tcBtn').remove){
                document.getElementById('tcBtn').remove();
            }else{
                document.getElementById('tcBtn').removeNode();
            }
        }
        //开启鼠标滚轮缩放
        map.enableScrollWheelZoom(true);
        //初始化获取行政区域数据的对象
        if(!t._boundary){
            t._boundary = new BMap.Boundary();
        }
        //初始化点聚合对象
        if(!t._cluster){
            t._cluster = new BMapLib.MarkerClusterer(map,{maxZoom: 17}); 
        }
        //初始化测距对象
        if(!t._rangingTool){
            t._rangingTool = new BMapLib.DistanceTool(map);
        }
        //初始化区域限制对象
        if(!t._bmar){
            t._bmar = new BMapLib.AreaRestriction();
        }
        //初始化图元绘制对象
        if(!t._drawmanager){
            t._drawmanager = new BMapLib.DrawingManager(map);
            //监听绘制结束事件
            t._drawmanager.addEventListener('overlaycomplete', (e)=>{
                // console.log(e);
                // console.log(e.drawingMode);
                // console.log(e.overlay);
                // console.log(e.calculate);
                // console.log(e.label);
                // console.log(e.extData);
                if(e.label){
                    t.state.gis.removeOverlay(e.label);
                }
                let drawExtData = e.extData;
                //保存绘制图元的id便于后期比对
                t.state.drawIds[drawExtData.type].push(drawExtData.id);
                let backobj = {
                    id: drawExtData.id,
                    attributes: drawExtData.attributes,
                    geometryType: drawExtData.type,
                    mapLayer: e.overlay,
                    geometry: {
                        type: drawExtData.type
                    }
                };
                //缓存绘制的图元信息
                t.GM.setGraphic(drawExtData.id,e.overlay);

                //区别点和圆的经纬度数据处理
                let {lnglatAry,_extent,path} = t.dealData(e.overlay);
                //处理返回数据
                switch(drawExtData.type){
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
                t.GM.setGraphicParam(drawExtData.id,backobj);
                t._drawmanager.close();
                if('drawEnd' in t.props){
                    t.props.drawEnd(backobj);
                }
            });
        }
    }
    //新增点位
    addPoint(mapPoints,type){
        let t = this;
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
                width : 30,
                height : 30,
                labelContent: '',
                labelPixelX: 0,
                labelPixelY: 34,
                BAnimationType: 3,
                //高德以左上定位,百度以中心为定位
                //默认点的偏移值就不同
                markerContentX: -15,
                markerContentY: -30,
                deg: 0
            }
            if(item.markerContent){
                cg = {...cg,markerContentX: 0,markerContentY: 0,width:100,height:30};
            }
            //初始化默认数据
            if(item.config){
                cg = {...cg,...item.config};
            }
            let position = new BMap.Point(item.longitude,item.latitude);
            let marker = null;
            if(item.markerContent){
                /*自定义html加点
                 用Label来实现,无法再添加label(高德有判断,实现不同)*/
                 //覆盖物参数
                let markerOption = {
                    offset: new BMap.Size(cg.markerContentX + cg.width/2,
                                            cg.markerContentY + cg.height/2),
                    icon: null
                }
                let icon = new BMap.Icon(
                    `${configUrl.mapServerURL}/images/touming.png`,
                    new BMap.Size(cg.width,cg.height)
                );
                icon.setImageSize(new BMap.Size(cg.width,cg.height));
                markerOption = {...markerOption,icon};
                marker = new BMap.Marker(position,markerOption);

                //覆盖物参数
                let markerLOption = {
                    offset: new BMap.Size(0,0)
                };
                let markerL = new BMap.Label(item.markerContent,markerLOption);
                markerL.setStyle({
                    backgroundColor : '',
                    border : '0'
                });
                marker.setLabel(markerL);
            }else{
                /*添加非html点位*/
                //覆盖物参数
                let markerOption = {
                    offset: new BMap.Size(cg.markerContentX + cg.width/2,
                                            cg.markerContentY + cg.height/2),
                    icon: null
                }
                let icon = new BMap.Icon(
                    item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                    new BMap.Size(cg.width,cg.height)
                );
                icon.setImageSize(new BMap.Size(cg.width,cg.height));
                markerOption = {...markerOption,icon};
                marker = new BMap.Marker(position,markerOption);
                //设置选择角度
                marker.setRotation(cg.deg);
                //添加label
                if(item.canShowLabel && cg.labelContent){
                    //label默认样式
                    let labelClass = 'label-content';
                    //接受label自定义样式
                    if(item.labelClass){
                        labelClass = item.labelClass.split(',').join(' ');
                    }
                    let markerLabel = new BMap.Label(
                        "<div class='"+labelClass+"' style=\"margin-left: 0;\">"
                            + cg.labelContent + "</div>", {
                        offset : new BMap.Size(cg.labelPixelX,cg.labelPixelY)
                    });
                    markerLabel.setStyle({
                        border : '0',
                        backgroundColor : ''
                    });
                    marker.setLabel(markerLabel);
                }
            }
            if(cg.zIndex || cg.zIndex === 0){
                marker.setZIndex(cg.zIndex);
            }
            //添加点到地图
            t.state.gis.addOverlay(marker);
            if(!item.markerContent && cg.BAnimationType == 0){
                marker.setAnimation(BMAP_ANIMATION_BOUNCE);
            }else if(!item.markerContent && cg.BAnimationType == 1){
                marker.setAnimation(BMAP_ANIMATION_DROP);
            }
            //点击事件
            marker.addEventListener('click',(e)=>{
                t.clickGraphic(item.id,e);
            });
            //鼠标移入事件
            marker.addEventListener('mouseover',(e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            //鼠标移出事件
            marker.addEventListener('mouseout',(e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            //缓存所有点的id
            psids.push(item.id);
            //缓存当前点的图元对象和基本数据
            t.GM.setGraphic(item.id,marker)
            .setGraphicParam(item.id,{
                attributes: {...item,other: item},
                geometryType: 'point',
                geometry: {
                    type: 'point',
                    x: item.longitude,
                    y: item.latitude
                }
            });
        });
        if(type !== 'defined'){
            //所有点缓存在state中
            t.setState({
                pointIds: psids
            });
        }
    }
    //更新点位
    updatePoint(mapPoints){
        let t = this;
        // let dpoints = [],apoints = [];
        mapPoints.map((item,index)=>{
            //判断图元是否存在.
            if (this.GM.isRepetition(item.id)) {
                //点位数据不符合,直接跳过
                if(!item.longitude || !item.latitude){
                    console.error(`点 经纬度 数据错误`);
                    return false;
                }
                //获取原有的图元
                let gc = t.GM.getGraphic(item.id);
                let cg = {
                    width : 30,
                    height : 30,
                    labelContent: '',
                    labelPixelX: 0,
                    labelPixelY: 34,
                    BAnimationType: 3,
                    //高德以左上定位,百度以中心为定位
                    //默认点的偏移值就不同
                    markerContentX: -15,
                    markerContentY: -30,
                    deg: 0
                }
                if(item.markerContent){
                    cg = {...cg,markerContentX: 0,markerContentY: 0,width:100,height:30};
                }
                if(item.config){
                    cg = {...cg,...item.config};
                }
                if(item.markerContent){
                    gc.setOffset(new BMap.Size(cg.markerContentX + cg.width/2,
                                            cg.markerContentY + cg.height/2));
                    let icon = new BMap.Icon(
                        `${configUrl.mapServerURL}/images/touming.png`,
                        new BMap.Size(cg.width,cg.height)
                    );
                    icon.setImageSize(new BMap.Size(cg.width,cg.height));
                    gc.setIcon(icon);
                    if(!!gc.getLabel()){
                        gc.getLabel().setContent(item.markerContent);
                        gc.getLabel().setOffset(new BMap.Size(0,0));
                    }else{
                        //覆盖物参数
                        let markerLOption = {
                            offset: new BMap.Size(0,0)
                        };
                        let markerL = new BMap.Label(item.markerContent,markerLOption);
                        markerL.setStyle({
                            backgroundColor : '',
                            border : '0'
                        });
                        gc.setLabel(markerL);
                    }
                }else{
                    cg.width = cg.width || gc.getIcon().size.width;
                    cg.height = cg.height || gc.getIcon().size.height;
                    //未改变方式的点 直接修改数据
                    let icon = new BMap.Icon(
                        item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                        new BMap.Size(cg.width,cg.height)
                    );
                    icon.setImageSize(new BMap.Size(cg.width,cg.height));
                    gc.setIcon(icon);
                    gc.setOffset(new BMap.Size((cg.markerContentX || -15) + cg.width/2,
                                                (cg.markerContentY || -30) + cg.height/2));
                    //修改角度
                    gc.setRotation(cg.deg || 0);
                    //添加label
                    if(item.canShowLabel && cg.labelContent){
                        let markerLabel = gc.getLabel(),
                        //label默认样式
                        labelClass = 'label-content';
                        //接受label自定义样式
                        if(item.labelClass){
                            labelClass = item.labelClass.split(',').join(' ');
                        }
                        let labelContent = "<div class='"+labelClass+"' style=\"margin-left: 0;\">"
                                    + cg.labelContent + "</div>",
                            labelOffset = new BMap.Size(cg.labelPixelX,cg.labelPixelY);
                        if(markerLabel){
                            markerLabel.setContent(labelContent);
                            markerLabel.setOffset(labelOffset);
                        }else{
                            markerLabel = new BMap.Label(
                                labelContent, {
                                offset : labelOffset
                            });
                            markerLabel.setStyle({
                                border : '0',
                                backgroundColor : ''
                            });
                            gc.setLabel(markerLabel);
                        }
                    }else{
                        if(!!gc.getLabel()){
                            gc.getLabel().setContent('');
                        }
                    }
                    if(cg.BAnimationType == 0){
                        gc.setAnimation(BMAP_ANIMATION_BOUNCE);
                    }else if(cg.BAnimationType == 1){
                        gc.setAnimation(BMAP_ANIMATION_DROP);
                    }else{
                        gc.setAnimation(null);
                    }
                    /*moveTo*/
                }
                //动画效果会延迟执行经纬度的切换
                if(cg.isAnimation){
                    t.moveTo(item.id,[item.longitude,item.latitude],cg.animationDelay,cg.autoRotation,item.url,item.urlleft);
                }else{
                    //修改经纬度
                    gc.setPosition(new BMap.Point(item.longitude,item.latitude));
                }
                if(cg.zIndex || cg.zIndex === 0){
                    gc.setZIndex(cg.zIndex);
                }
                t.GM.setGraphicParam(
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
    addLine(mapLines,type){
        let t = this;
        let lsids = [...t.state.lineIds];
         //遍历添加线(图元)
        mapLines.map((item,index)=>{
            //如果id重复,直接跳过不执行.
            if (t.GM.isRepetition(item.id)) {
                console.error(`多折线id: ${item.id} 重复`);
                return false;
            }
            //多折线点位数据不符合,直接跳过
            if(!(item.paths && item.paths.length >= 2)){
                console.error(`多折线paths数据错误`);
                return false;
            }
            //初始化默认参数
            let cg = {
                color: '#277ffa',
                pellucidity: 0.9,
                lineWidth: 5,
                lineType: 'solid',
                isHidden: false
            }
            //合并参数
            if(item.config){
                cg = {...cg,...item.config};
            }
            //处理线的点数组
            let linePath = item.paths.map((item,index)=>{
                return new BMap.Point(item[0],item[1]);
            }),
            //处理线的参数
            lineOption = {
                strokeColor : cg.color, // 线颜色
                strokeWeight : cg.lineWidth, // 线宽
                strokeOpacity : cg.pellucidity, // 线透明度
                strokeStyle : cg.lineType// 线样式
            };
            //创建线对象
            let line = new BMap.Polyline(linePath,lineOption);
            //判断线显示和隐藏
            if(cg.isHidden){
                line.hide();
            }else{
                line.show();
            }
            lsids.push(item.id);
            //添加线至地图
            t.state.gis.addOverlay(line);
            //点击事件
            line.addEventListener('click',(e)=>{
                t.clickGraphic(item.id,e);
            });
            //鼠标移入事件
            line.addEventListener('mouseover',(e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            //鼠标移出事件
            line.addEventListener('mouseout',(e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            t.GM.setGraphic(item.id,line)
            .setGraphicParam(item.id,{
                attributes: {
                    ...item,
                    paths: item.paths,
                    other: item
                },
                geometryType: 'polyline',
                geometry: {
                    type: 'polyline',
                    paths: item.paths
                }
            });
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
            if (t.GM.isRepetition(item.id)) {
                //多折线点位数据不符合,直接跳过
                if(!(item.paths && item.paths.length >= 2)){
                    console.error(`多折线paths数据错误`);
                    return false;
                }
            }else{
                console.error(`更新的多折线id不存在!`);
                return false;
            }
            let gc = t.GM.getGraphic(item.id);
            //初始化默认参数
            let cg = {
                color: '#277ffa',
                pellucidity: 0.9,
                lineWidth: 5,
                lineType: 'solid',//'solid'  'dashed'
                isHidden: false
            }
            //合并参数
            if(item.config){
                cg = {...cg,...item.config};
            }
            //处理线的点数组
            let linePath = item.paths.map((item,index)=>{
                return new BMap.Point(item[0],item[1]);
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
            if(cg.isHidden){
                gc.hide();
            }else{
                gc.show();
            }
            t.GM.setGraphicParam(item.id,{
                attributes: {
                    ...item,
                    paths: item.paths,
                    other: item
                },
                geometryType: 'polyline',
                geometry: {
                    type: 'polyline',
                    paths: item.paths
                }
            });
        });
    }
    //添加面
    addPolygon(mapPolygons){
        let t = this;
        let pgsids = [...t.state.polygonIds];
        //遍历添加面(图元)
        mapPolygons.map((item,index)=>{
            //如果id重复,直接跳过不执行.
            if (t.GM.isRepetition(item.id)) {
                console.error(`多边形id: ${item.id} 重复`);
                return false;
            }
            //多边形点位数据不符合,直接跳过
            if(!(item.rings && item.rings.length >= 3)){
                console.error(`多边形rings数据错误`);
                return false;
            }
            //初始化参数
            let cg = {
                lineType: 'solid',
                lineWidth: 5,
                lineColor: '#277ffa',
                lineOpacity: 1,
                color: '#fff',
                pellucidity: 0.5
                // isHidden: false  //后期需要再加
            }
            if(item.config){
                cg = {...cg,...item.config};
            }
            //面的参数
            let polygonOption = {
                strokeColor: cg.lineColor,
                strokeOpacity: cg.lineOpacity,
                strokeWeight: cg.lineWidth,
                strokeStyle: cg.lineType,
                fillColor: cg.color,
                fillOpacity: cg.pellucidity
            },
            polygonPath = item.rings.map((item,index)=>{
                return new BMap.Point(item[0],item[1]);
            });
            //创建面对象
            let polygon = new BMap.Polygon(polygonPath,polygonOption);
            //添加面至地图
            t.state.gis.addOverlay(polygon);
            //点击事件
            polygon.addEventListener('click',(e)=>{
                t.clickGraphic(item.id,e);
            });
            //鼠标移入事件
            polygon.addEventListener('mouseover',(e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            //鼠标移出事件
            polygon.addEventListener('mouseout',(e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            //缓存面id
            pgsids.push(item.id);
            //缓存面图元对象和对于传入数据
            t.GM.setGraphic(item.id,polygon)
            .setGraphicParam(item.id,{
                attributes: {
                    ...item,
                    rings: item.rings,
                    other: item
                },
                geometryType: 'polygon',
                geometry: {
                    type: 'polygon',
                    rings: item.rings
                },
            });
        });
        t.setState({
            polygonIds: pgsids
        });
    }
    //更新面
    updatePolygon(mapPolygons){
        let t = this;
        mapPolygons.map((item,index)=>{
            //判断图元是否存在.
            if (t.GM.isRepetition(item.id)) {
                //多边形点位数据不符合,直接跳过
                if(!(item.rings && item.rings.length >= 3)){
                    console.error(`多边形rings数据错误`);
                    return false;
                }
                //获取原有的图元
                let gc = t.GM.getGraphic(item.id);
                //初始化参数
                let cg = {
                    lineType: 'solid',
                    lineWidth: 5,
                    lineColor: '#277ffa',
                    lineOpacity: 1,
                    color: '#fff',
                    pellucidity: 0.5
                    // isHidden: false  //后期需要再加
                }
                if(item.config){
                    cg = {...cg,...item.config};
                }
                let polygonPath = item.rings.map((item,index)=>{
                    return new BMap.Point(item[0],item[1]);
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
                t.GM.setGraphicParam(
                    item.id,
                    {
                        attributes: {
                            ...item,
                            rings: item.rings,
                            other: item
                        },
                        geometryType: 'polygon',
                        geometry: {
                            type: 'polygon',
                            rings: item.rings
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
            //如果id重复,直接跳过不执行.
            if (t.GM.isRepetition(item.id)) {
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
                // isHidden: false  //后期需要在加
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
                fillOpacity: cg.pellucidity
            },
            centerPoint = new BMap.Point(item.longitude,item.latitude);
            //创建圆图元实例
            let circle = new BMap.Circle(centerPoint,item.radius,circleOption);
            //添加圆至地图
            t.state.gis.addOverlay(circle);
            //点击事件
            circle.addEventListener('click',(e)=>{
                t.clickGraphic(item.id,e);
            });
            //鼠标移入事件
            circle.addEventListener('mouseover',(e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            //鼠标移出事件
            circle.addEventListener('mouseout',(e)=>{
                t.mouseOutGraphic(item.id,e);
            });
            ccsids.push(item.id);
            //缓存数据
            t.GM.setGraphic(item.id,circle)
            .setGraphicParam(item.id,{
                attributes: {...item,other: item},
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
    updateCircle(mapCircles){
        let t = this;
        mapCircles.map((item,index)=>{
            //判断图元是否存在.
            if (t.GM.isRepetition(item.id)) {
                //圆 点位数据不符合,直接跳过
                if(!item.longitude || !item.latitude){
                    console.error(`圆 经纬度 数据错误`);
                    return false;
                }
                //获取原有的图元
                let gc = t.GM.getGraphic(item.id);
                //获取原有的面属性,转换key值
                let cg = {
                    lineType: 'solid',
                    lineWidth: 5,
                    lineColor: '#277ffa',
                    lineOpacity: 1,
                    color: '#fff',
                    pellucidity: 0.5
                    // isHidden: false  //后期需要在加
                }
                if(item.config){
                    cg = {...cg,...item.config};
                }
                let centerPoint = new BMap.Point(item.longitude,item.latitude);
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
                t.GM.setGraphicParam(item.id,{
                    attributes: {...item,other: item},
                    geometryType: 'circle',
                    geometry: {
                        type: 'circle',
                        x: item.longitude,
                        y: item.latitude,
                        radius: item.radius
                    }
                });
            }else{
                console.error(`更新的圆id不存在!`);
                return false;
            }
        });
    }
    //画出对应边界线 name区域名
    addBaiduBoundary(bdNames){
        let t = this;
        bdNames.forEach(name=>{
            t._boundary.get(name,(ary)=>{
                let id = 'boundary' + new Date().getTime();
                let paths = ary.boundaries[0].split(';').map((item,index)=>{
                    return item.split(',');
                })
                t.addPolygon([{id,rings:paths}]);
                t.state.boundaryInfo.push({id,name:name});
            });
        })
    }
    //删除对应应边界线 name区域名
    removeBaiduBoundary(removedBDNames){
        let t = this;
        let removedBDIds = t.state.boundaryInfo.filter(item=>removedBDNames.indexOf(item.name)>-1).map(item=>item.id);
        t.setState({boundaryInfo:t.state.boundaryInfo.filter(item=>removedBDNames.indexOf(item.name)==-1)});
        removedBDIds.forEach(id=>{
            t.removeGraphic(id,'polygon');
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
            t.heatmap = new BMapLib.HeatmapOverlay({
                visible: cg.visible
            });
            t.state.gis.addOverlay(t.heatmap);
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
            t.heatmap.show();
        }else{
            t.heatmap.hide();
        }
    }
    //添加海量点   
    addPointCollection(data = []) {
        let t = this;
        data.map((item,index)=>{
            let d = item || {};
            let points = [];
            (d.points || []).map(function(d,i){
                let p = new BMap.Point(d.lng,d.lat);
                p.attributes = d;
                points.push(p);
            })
            let options = {
                size: gisMapConstant[d.size] || gisMapConstant['normal'],
                shape: gisMapConstant[d.shape] || gisMapConstant['circle'],
                color: d.color || '#d340c3'
            }
            // 初始化PointCollection
            let VotexpointCollection = new BMap.PointCollection(points, options);  
            t.state.gis.addOverlay(VotexpointCollection);  // 添加Overlay
            t.morepoints.push({
                id: d.id,
                value: VotexpointCollection
            });
            VotexpointCollection.addEventListener('click', function (e) {
                if('clickPointCollection' in t.props && typeof(t.props.clickPointCollection) == 'function'){
                    let obj = {
                        id: d.id,
                        ...e.point,
                        mapLayer: VotexpointCollection
                    }
                    t.props.clickPointCollection(obj);
                }
            });
        });
    }
    //更新海量点
    updatePointCollection(data = []) {
        let t = this;
        data.map((ds,i)=>{
            t.morepoints.map(function (item,index) {
                if(item.id == ds.id){
                    let points = [];
                    ds.points.map(function(d,i){
                        let p = new BMap.Point(d.lng,d.lat);
                        p.attributes = d;
                        points.push(p);
                    })
                    item.value.setPoints(points);
                    item.value.setStyles({
                        size: gisMapConstant[ds.size] || gisMapConstant['normal'],
                        shape: gisMapConstant[ds.shape] || gisMapConstant['circle'],
                        color: ds.color || '#d340c3'
                    })
                }
            });
        });
    }
    //清空单个海量点
    clearPointCollection(ids){
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
        })
    }
    /*图元事件处理*/
    //点击图元事件
    clickGraphic (id,e) {
        let t = this;
        //编辑中的图元关闭其他事件返回
        if(t.state.editId == id)return false;
        if(typeof(t.props.clickGraphic) ==="function"){
            let param = t.getGraphic(id);
            let obj = {
                param,
                type: param.geometry.type,//图元类型
                attributes: {...param.attributes.other,...{config:param.attributes.config}},//添加时图元信息
                top: e.clientY,//当前点所在的位置(屏幕)
                left: e.clientX,
                e: e
            }
            t.props.clickGraphic(obj);
        }
    }
    //图元鼠标悬浮事件
    mouseOverGraphic(id,e){
        let t = this;
        //编辑中的图元关闭其他事件返回
        if(t.state.editId == id)return false;
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
        //编辑中的图元关闭其他事件返回
        if(t.state.editId == id)return false;
        if(typeof(t.props.mouseOutGraphic) ==="function"){
            let obj = {
                e,id,
                param: t.getGraphic(id)
            }
            t.props.mouseOutGraphic(obj);
        }
    }
    /*地图事件处理*/
    //地图点击事件
    clickMap(){
        let t =this;
        if(typeof(t.props.clickMap) ==="function"){
            t.state.gis.addEventListener('click',(e)=>{
                let obj = t.getMapExtent();
                obj.e = e;
                obj.clickLngLat = e.point;
                obj.pixel = e.pixel;
                t.props.clickMap(obj);
            });
        }
    }
    //地图拖动之前事件
    dragMapStart(){
        let t = this;
        if(typeof(t.props.dragMapStart) === 'function'){
            t.state.gis.addEventListener('dragstart',(e)=>{
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.dragMapStart(obj);
            })
        }
    }
    //地图拖动结束后事件
    dragMapEnd(){
        let t = this;
        if(typeof(t.props.dragMapEnd) === 'function'){
            t.state.gis.addEventListener('dragend',(e)=>{
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.dragMapEnd(obj);
            })
        }
    }
    //地图移动之前事件
    moveStart(){
        let t = this;
        if(typeof(t.props.moveStart) === 'function'){
            t.state.gis.addEventListener('movestart',(e)=>{
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.moveStart(obj);
            })
        }
    }
    //地图移动结束后事件
    moveEnd(){
        let t = this;
        if(typeof(t.props.moveEnd) === 'function'){
            t.state.gis.addEventListener('moveend',(e)=>{
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.moveEnd(obj);
            })
        }
    }
    //地图更改缩放级别开始时触发触发此事件
    zoomStart(){
        let t = this;
        if(typeof(t.props.zoomStart) === 'function'){
            t.state.gis.addEventListener('zoomstart',(e)=>{
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.zoomStart(obj);
            });
        }
    }
    //地图更改缩放级别结束时触发触发此事件
    zoomEnd(){
        let t = this;
        if(typeof(t.props.zoomEnd) === 'function'){
            t.state.gis.addEventListener('zoomend',(e)=>{
                let obj = t.getMapExtent();
                obj.e = e;
                t.props.zoomEnd(obj);
            });
        }
    }
    /*set方法*/
    //设置地图中心位置 lng/经度  lat/纬度
    setCenter (gt) {
        let t =this;
        let mgt = [116.404,39.915];
        if(gt){
            //经纬度 必须存在 否则不操作
            if (!gt[0] || !gt[1]) {
                return false;
            }
            //如果设置的经纬度 与当前中心点一样 不操作
            let c = t.state.gis.getCenter();
            if(c.lng == gt[0] && c.lat == gt[1]){
                return false;
            }
            mgt = gt;
        }
        t.state.gis.setCenter(new BMap.Point(mgt[0],mgt[1]));
        t.setState({center: mgt});
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
            obj = t.getFitView(ary);
        }else if(arg instanceof Array){
            if(ary[0] instanceof Array){
                let a = [];
                for(let i = 0 ; i < ary.length ; i++){
                    a = new BMap.Point(ary[i][0],ary[i][1]);
                }
                obj = t.state.gis.getViewport(a);
            }else{
                obj = t.getFitView(arg);
            }
        }
        if(!obj){return false} 
        if(!type || type == 'all'){
            t.state.gis.centerAndZoom(obj.center, obj.zoom);
        }else if(type == 'zoom'){
            t.setZoomLevel(obj.zoom);
        }else if(type == 'center'){
            t.setCenter([obj.center.lng,obj.center.lat]);
        }
    }
    /*get方法*/
    //获取当前地图的中心位置
    getCurrentCenter(){
        let t =this;
        return t.state.gis.getCenter();
    }
    //获取当前比例尺
    getZoomLevel (){
        let t =this;
        return t.state.gis.getZoom();
    }
    //获取对应经纬的最优 zoomLevel和center
    getFitView(ids){
        let t = this;
        if(ids.length > 0){
            let allLayers = [];
            for(let i = 0 ; i < ids.length ; i++){
                switch((t.GM.getGraphicParam(ids[i]) || {}).geometryType){
                    case 'point':
                        allLayers.push(t.GM.getGraphic(ids[i]).getPosition());
                    break;
                    case 'polyline':
                    case 'polygon':
                        allLayers = [...allLayers,...t.GM.getGraphic(ids[i]).getPath()];
                    break;
                    case 'circle':
                        allLayers.push(t.GM.getGraphic(ids[i]).getCenter());
                    break;
                }
            }
            if(allLayers.length > 0){
                return t.state.gis.getViewport(allLayers);
            }
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
        switch(gp.geometryType){
            case 'point':
                lng = gg.getPosition().lng;
                lat = gg.getPosition().lat;
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
                pts = gg.getPath().map((item,index)=>{
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
                lng = gg.getCenter().lng;
                lat = gg.getCenter().lat;
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
    /*功能方法*/
    //单个删除图元
    removeGraphic(id,type){
        let t = this;
        let graphic = t.GM.getGraphic(id);
        if(!!graphic){
            //清除聚合点 避免异常
            t._cluster.removeMarker(this.GM.getGraphic(id));
            //清除地图中图元
            t.state.gis.removeOverlay(graphic);
            //清除对应id的图元数据缓存
            t.GM.removeGraphic(id);
        }else{
            return false;
        }
        for(let i = 0 ; i < t.movePoints.length ; i++){
            if(t.movePoints[i].id == id){
                t.movePoints.splice(i,1);
                continue;
            }
        }
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
    /*根据图元id,使图元变成可编辑状态*/
    doEdit (id){
        let t = this;
        //获取编辑点的图元和参数
        let graphic = t.GM.getGraphic(id);
        let gtp = t.GM.getGraphicParam(id);
        if(!graphic)return false;
        //关闭先前编辑的图元
        if(!!t.state.editId){
            t.endEdit();
        }
        if(!t.editGraphicChange){
            //编辑变动后
            t.editGraphicChange = (e)=>{
                let id = t.state.editId,
                    param = t.getGraphic(id),
                    obj = {
                        param,e,id,
                        geometry: param.geometry
                    };
                if(param.geometry.type == 'polygon'){
                    obj.area = BMapLib.GeoUtils.getPolygonArea(param.mapLayer);
                }
                if(param.geometry.type == 'polyline'){
                    obj.distance = t.calculateDistance(param.geometry.paths);
                }
                if(param.geometry.type == 'circle'){
                    obj.area = Math.pow(param.geometry.radius,2)*Math.PI;
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
            }
        }
        switch(gtp.geometryType){
            case 'point':
                graphic.enableDragging();
                graphic.addEventListener("dragend",t.editGraphicChange);
            break;
            case 'polyline':
            case 'polygon':
            case 'rectangle':
                graphic.enableEditing();
                graphic.addEventListener("lineupdate",t.editGraphicChange);
            break;
            case 'circle':
                graphic.enableEditing();
                graphic.addEventListener("lineupdate",t.editGraphicChange);
            break;
        }
        t.setState({editId:id});
    }
    //关闭编辑
    endEdit (){
        let t = this;
        //获取编辑点的图元和参数
        let graphic = t.GM.getGraphic(t.state.editId);
        let gtp = t.GM.getGraphicParam(t.state.editId);
        if(!graphic)return false;
        switch(gtp.geometryType){
            case 'point':
                graphic.disableDragging();
                graphic.removeEventListener("dragend",t.editGraphicChange);
            break;
            case 'polyline':
            case 'polygon':
            case 'rectangle':
                graphic.disableEditing();
                graphic.removeEventListener("lineupdate",t.editGraphicChange);
            break;
            case 'circle':
                graphic.disableEditing();
                graphic.removeEventListener("lineupdate",t.editGraphicChange);
            break;
        }
        let editGraphic = t.state.editGraphic;
        t.setState({
            editId: '',
            editGraphic: ''
        },()=>{
            if(editGraphic){
                t.props.editGraphicChange(editGraphic);
            }
        })
    }
    //绘制图元
    draw(obj){
        let t = this,drawParam = {};
        //先关闭(防止连点)
        t._drawmanager.close();
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
                param.offset = new BMap.Size((drawParam.parameter.markerContentX || -15) + (drawParam.parameter.width || 30)/2,
                                            (drawParam.parameter.markerContentY || -30) + (drawParam.parameter.height || 30)/2);
                let icon = new BMap.Icon(
                    drawParam.parameter.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                    new BMap.Size(drawParam.parameter.width || 30,drawParam.parameter.height || 30)
                );
                icon.setImageSize(new BMap.Size(drawParam.parameter.width || 30,drawParam.parameter.height || 30));
                param.icon = icon;
                param.extData = {
                    id: drawParam.data.id,
                    attributes: {
                        id: drawParam.data.id,
                        url: drawParam.parameter.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                        config: {
                            width: drawParam.parameter.width || 36,
                            height: drawParam.parameter.height || 36
                        }
                    },
                    type: 'point'
                };
                t._drawmanager.setDrawingMode('marker');
                t._drawmanager.open({markerOptions: param});
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
                t._drawmanager.open({polylineOptions: param,enableCalculate: true});
                t._drawmanager.setDrawingMode('polyline');
            break;
            case 'polygon':
                t._drawmanager.open({polygonOptions: paramgcr,enableCalculate: true});
                t._drawmanager.setDrawingMode('polygon');
            break;
            case 'circle':
                t._drawmanager.open({circleOptions: paramgcr,enableCalculate: true});
                t._drawmanager.setDrawingMode('circle');
            break;
            case 'rectangle':
                t._drawmanager.open({rectangleOptions: paramgcr,enableCalculate: true});
                t._drawmanager.setDrawingMode('rectangle');
            break;
        }
    }
    //关闭绘制图元
    closeDraw(){
        let t = this;
        t._drawmanager.close();
    }
    //清空地图图元
    clearAll(){
        let t = this;
        //清空聚合
        if (t._cluster) {
            t._cluster.clearMarkers();
        }
        //关闭测距
        if(t._rangingTool){
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
    cluster (arg) {
        let t = this;
        let ary = t.clusterToolFunction(arg);
        t._cluster.addMarkers(ary);
    }
    //删除点聚合效果
    removeCluster(arg){
        let t = this;
        let ary = t.clusterToolFunction(arg);
        if(ary.length > 0){
            t._cluster.removeMarkers(ary);
        }
    }
    //清空聚合效果
    clearClusters(){
        let t = this;
        t._cluster.clearMarkers();
    }
    //聚合功能公共方法(获取图元集合)
    clusterToolFunction(arg){
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
        //过滤moveTo的点位
        //缓存所有聚合的点位
        let allps = [];
        for(let i = 0 ; i < ary.length ; i++){
            allps.push(t.GM.getGraphic(ary[i]));
        }
        return allps;
    }
    //测距
    vtxRangingTool (callback) {
        let t = this;
        let cb = (e)=>{
            //关闭测距
            t._rangingTool.close();
            //注销事件(避免重复)
            t._rangingTool.removeEventListener('drawend',cb);
            if(typeof(callback) ==="function"){
                let obj = {
                    distance : e.distance
                };
                let objLngLats = new Array();
                for (let i = 0; i < e.points.length; i++) {
                    objLngLats.push([ e.points[i].lng, e.points[i].lat ]);
                }
                obj.lnglats = objLngLats;
                callback(obj);
            }
        }
        t._rangingTool.addEventListener('drawend',cb);
        t._rangingTool.open(this.state.gis);
    }
    //开启路况
    openTrafficInfo(){
        let t =this;
        t._trafficCtrl.showTraffic();
    }
    //关闭路况
    hideTrafficInfo(){
        let t =this;
        t._trafficCtrl.hideTraffic();
    }
    //展示比例尺
    showControl (){
        let t = this,location = BMAP_ANCHOR_TOP_LEFT,type = '';
        switch(t.props.showControl.location){
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
        switch(t.props.showControl.type){
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
        let control = new BMap.ScaleControl({anchor: location});
        t.state.gis.addControl(control);
        if(type !== 'null'){
            //右上角，仅包含平移和缩放按钮
            let navigation = new BMap.NavigationControl({anchor: location, type: type}); 
            t.state.gis.addControl(navigation);
        }
    }
    /*设置显示区域*/
    setAreaRestriction(sw_ne){
        let t = this;
        //修改了区域限制的js文件.
        let bounds = new BMap.Bounds(new BMap.Point(sw_ne[0][0],sw_ne[0][1]),new BMap.Point(sw_ne[1][0],sw_ne[1][1]));
        t._bmar.setBounds(this.state.gis,bounds);
    }
    /*取消显示区域*/
    clearAreaRestriction(){
        let t = this;
        t._bmar.clearBounds();
    }
    //渲染
    render(){
        let t = this;
        let _map = this.props;
        return(
            <div id={_map.mapId} style={{width:'100%',height:'100%'}}></div>
        );
    }
    /*公共方法*/
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
                let {id,rx,ry,waitTime,deleteTime} = nowMovePoints[i];
                let gc = t.GM.getGraphic(id);
                if(!gc){
                    clearInterval(t.moveToTimer);
                }else{
                    let gg = gc.getPosition();
                    let tx = gg.lng + rx,ty = gg.lat + ry;
                    gc.setPosition(new BMap.Point(tx,ty));
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
    moveTo(id,lnglat,delay,autoRotation,urlright,urlleft){
            delay = delay || 3;
        let t = this,timer = 10,
            gc = t.GM.getGraphic(id);
        delay = eval(delay)*1000;
        let count = delay/timer;
        let s = gc.getPosition(),e = new BMap.Point(lnglat[0],lnglat[1]);
        if(s.equals(e)){
            return false;
        }else{
            let url= null;
            //计算角度,旋转
            if(autoRotation){
                let ddeg = t.rotateDeg(gc.getPosition(),lnglat);
                if(urlleft && (ddeg < -90 && ddeg > -270)){
                    ddeg += 180;
                    url = urlleft;
                }else{
                    url = urlright;
                }
                let gcicon = gc.getIcon();
                gcicon.setImageUrl(url);
                gc.setIcon(gcicon);
                gc.setRotation(ddeg);
            }
            //拆分延迟移动定位
            let rx = (e.lng - s.lng)/count, ry = (e.lat - s.lat)/count;
            let isHave = false;
            for(let i = 0 ; i < t.movePoints.length ;i++){
                if(t.movePoints[i].id == id){
                    t.movePoints.splice(i,1,{
                        id,rx,ry,
                        waitTime: 0,
                        deleteTime: delay
                    });
                    isHave = true;
                }
            }
            if(!isHave){
                t.movePoints.push({
                    id,rx,ry,
                    waitTime: 0,
                    deleteTime: delay
                });
            }
        }
        
    }
    //点位角度旋转(以指向东(右)为0°)
    rotateDeg(sp,ep){
        let t = this;
        let s = t.state.gis.pointToPixel(sp),
        //获取当前点位的经纬度
            e = t.state.gis.pointToPixel(new BMap.Point(ep[0],ep[1])),
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
    //显示隐藏的图元
    showGraphicById (id){
        let t = this;
        if(t.GM.getGraphic(id)){
            t.GM.getGraphic(id).show();
        }
    }
    //隐藏图元
    hideGraphicById(id){
        let t = this;
        if(t.GM.getGraphic(id)){
            t.GM.getGraphic(id).hide();
        }
    }
    //获取地图当前的位置状态信息
    getMapExtent() {
        let t = this;
        let nowBounds = t.state.gis.getBounds();
        let obj = {};
        obj.southWest = {
            lng : nowBounds.getSouthWest().lng,
            lat : nowBounds.getSouthWest().lat
        };
        obj.northEast = {
            lng : nowBounds.getNorthEast().lng,
            lat : nowBounds.getNorthEast().lat
        };
        obj.nowCenter = t.state.gis.getCenter();
        obj.zoom = t.state.gis.getZoom();
        obj.mapSize = t.state.gis.getSize();
        obj.radius = t.calculatePointsDistance([obj.nowCenter.lng,obj.nowCenter.lat],
                                                [obj.northEast.lng,obj.northEast.lat]);
        return obj;
    }
    //计算2点间距离 单位m 精确到2位小数
    calculatePointsDistance(fp,ep){
        return Math.round(this.state.gis.getDistance(new BMap.Point(fp[0], fp[1]), 
                                                        new BMap.Point(ep[0], ep[1]))*100)/100;
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
    //计算图元面积(面,圆)
    calculateArea(id){
        var t = this;
        return t.state.gis.calculateArea(t.getGraphic(id));
    }
    //对比对象数据是否相等
    deepEqual(a,b){
        return Immutable.is(Immutable.fromJS(a),Immutable.fromJS(b));
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
    //百度搜索功能
    searchPoints(searchValue,pageSize=10,pageIndex=0){
        return new Promise((resolve)=>{
            let psc = new BMap.LocalSearch(this.state.gis,{
                onSearchComplete:(result)=>{
                    if(!result){
                        resolve([]);
                    }
                    else if(result.getPageIndex()!=pageIndex){
                        psc.gotoPage(pageIndex);
                    }
                    else{
                        let res_arr = [];
                        for(let i=0,len=result.getCurrentNumPois();i<len;i++){
                            res_arr.push(result.getPoi(i));
                        }
                        resolve(res_arr.map((r)=>({
                            id: r.uid,
                            longitude: r.point.lng,
                            latitude: r.point.lat,
                            canShowLabel: true,
                            config: {
                                labelContent: r.title,
                                labelPixelY: 27
                            },
                            other: 'search'
                        })));
                    }
                    // console.log(result,result.getNumPages(),result.getPageIndex());                    
                },
                pageCapacity:pageSize
            });
            psc.search(searchValue);  
        })
    }
    //初始化
    componentDidMount(){
        let t = this;
        t.loadMapComplete.then(()=>{
            t.init();
        })        
    }
    //重新渲染结束
    componentDidUpdate(prevProps, prevState) {}
    //已加载组件，收到新的参数时调用
    componentWillReceiveProps(nextProps) {
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
            mapPointCollection,isclearAllPointCollection,
            isSetAreaRestriction,areaRestriction,isClearAreaRestriction,
            isClearAll
        } = nextProps;
        let props = t.props;

        // 等待地图加载
        if(!t.state.mapCreated)return;
        
        /*添加海量点*/
        if(mapPointCollection instanceof Array && !t.deepEqual(mapPointCollection,props.mapPointCollection)){
            let {deletedDataIDs,addedData,updatedData} = t.dataMatch(props.mapPointCollection,mapPointCollection,'id');
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
            t.addLine(addedData);
            t.updateLine(updatedData);        
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
            圆数据处理
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
        //关闭图元编辑
        if((typeof(isEndEdit) == 'boolean' && isEndEdit) || (isEndEdit && isEndEdit !== t.props.isEndEdit)){
            t.endEdit();
        }
        //开启图元绘制
        if((typeof(isDraw) == 'boolean' && isDraw) || (isDraw && isDraw !== t.props.isDraw)){
            t.draw(mapDraw);
        }
        //关闭图元绘制
        if((typeof(isCloseDraw) == 'boolean' && isCloseDraw) || (isCloseDraw && isCloseDraw !== t.props.isCloseDraw)){
            t.closeDraw();
        }
        //设置中心点
        if((typeof(setCenter) == 'boolean' && setCenter) || (setCenter && setCenter !== t.props.setCenter)){
            t.setCenter(mapCenter);
        }
        //设置点聚合
        if((typeof(setCluster) == 'boolean' && setCluster) || (setCluster && setCluster !== t.props.setCluster)){
            t.cluster(mapCluster);
        }
        //设置比例尺
        if((typeof(setZoomLevel) == 'boolean' && setZoomLevel) || (setZoomLevel && setZoomLevel !== t.props.setZoomLevel)){
            t.setZoomLevel(mapZoomLevel);
        }
        //设置最优视野
        if((typeof(setVisiblePoints) == 'boolean' && setVisiblePoints) || (setVisiblePoints && setVisiblePoints !== t.props.setVisiblePoints)){
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
        //测距工具调用
        if((typeof(isRangingTool) == 'boolean' && isRangingTool) || (isRangingTool && isRangingTool !== t.props.isRangingTool)){
            t.vtxRangingTool(mapRangingTool);
        }
        //开关路况
        if(isOpenTrafficInfo){
            t.openTrafficInfo();
        }else{
            t.hideTrafficInfo();
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
        //清空地图
        if((typeof(isClearAll) == 'boolean' && isClearAll) || (isClearAll && isClearAll !== t.props.isClearAll)){
            t.clearAll();
        }
        //删除指定图元
        if((typeof(isRemove) == 'boolean' && isRemove) || (isRemove && isRemove !== t.props.isRemove)){
            mapRemove.map((item,index)=>{
                t.removeGraphic(item.id,item.type);
            });
        }
    }
    componentWillUnmount() {
        //关闭moveTo定时
        let t = this;
        if(t.state.gis){
            t.state.gis.clearOverlays();
        }
        t.state.gis = null;
        if(t.moveToTimer){
            clearInterval(t.moveToTimer);
        }
    }
}

export default BaiduMap;