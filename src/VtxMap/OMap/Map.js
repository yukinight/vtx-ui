import React from 'react';
import './Map.css';
import {graphicManage,RotateIcon,getMaxMin} from '../MapToolFunction';
import Immutable from 'immutable';
const {Set} = Immutable;
//公共地址配置
import configUrl from '../../default';
class Map extends React.Component {
    constructor(props){
        super(props);
        this.GM = new graphicManage();//初始化 图元管理方法
        this.initPointIndex = 0;//初始化地图时记录点当前位置
        this._cluster = null;//点聚合对象
        this.clusterIdList = [];//点聚合id集合
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
        this.editEvent = {};//编辑监听的事件
        //是否绘制测距
        this.rangingTool = {
            isRanging: false,//是否开启状态
            line: {},//线
            points: [],//点
            distance: 0,//测距长度
            mapRangingTool: null,//测距回调
            eventList: {},
            isDbclick: false
        };
        this.rangingTools = {};//测距点线缓存
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
        this.cacheImgRecord = {};//缓存图片记录,避免多次加载缓存
        // 图片缓存dom位置
        let cacheImg = document.getElementById('vtxomapdefaultimg');
        if(!cacheImg){
            cacheImg = this.cacheImg = document.createElement('div');
            cacheImg.id = 'vtxomapcacheImg';
            cacheImg.style.display = 'none';
            document.body.appendChild(cacheImg);
        }
        this.cacheImg = cacheImg;
        //缓存默认点位地址
        if(!document.getElementById('vtxomapdefaultimg')){
            let defImg = new Image();
            defImg.src = `${configUrl.mapServerURL}/images/defaultMarker.png`;
            defImg.id = 'vtxomapdefaultimg';
            cacheImg.appendChild(defImg);
        }
        //加载地图
        this.loadMapJs();
    }
    loadMapJs(){
        let t = this;
        this.loadMapComplete = new Promise((resolve,reject)=>{
            if(window.google){
                resolve(t.omap = window.google.maps);
            }
            else{
                //&language=zh-CN
                //测试用地址,暂时只支持 10.10.11.227的ip
                $.getScript('http://ditu.google.cn/maps/api/js?key=AIzaSyAelEHQosKi09YLhXwmw3OR5ggScxOda2A&libraries=geometry,visualization,drawing',()=>{
                    let PointCollection = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/GPointCollection.js`,()=>{
                            resolve();
                        });
                    });
                    let OmapCluster = new Promise((resolve,reject)=>{
                        $.getScript(`${configUrl.mapServerURL}/omapCluster.js`,()=>{
                            resolve();
                        });
                    });
                    Promise.all([PointCollection,OmapCluster]).then(()=>{
                        resolve(t.omap = window.google.maps);
                    })
                });
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
        // //添加点
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
        // 画热力图
        if(heatMapData){
            t.heatMapOverlay(heatMapData);
        }
        if(mapPointCollection instanceof Array){
            t.addPointCollection(mapPointCollection);
        }
        /*设置指定图元展示*/
        if(mapVisiblePoints){
            t.setVisiblePoints(mapVisiblePoints);
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
        /*地图事件*/
        //初始化地图点击事件
        t.clickMap();
        //地图拖动之前事件
        t.dragMapStart();
        // //地图拖动结束后事件
        t.dragMapEnd();
        // //地图移动之前事件
        t.moveStart();
        // //地图缩放开始前事件
        t.zoomStart();
        // //地图移动结束后事件/地图缩放结束后事件
        t.moveEndAndZoomEnd();

        t.setState({
            mapCreated:true
        })
    }
    //创建地图
    createMap () {
        let t = this;
        const {mapCenter,mapId,mapZoomLevel,minZoom,maxZoom,showControl,areaRestriction} = t.props;
        let options ={
            zoom: mapZoomLevel || 10,
            center: mapCenter || [626.3002300508477,37.90942995363547],
            minZoom: minZoom || 0,
            maxZoom: maxZoom || 22
        };
        //缓存 zoom等级,用于事件判断
        t.oldZoomLevel = options.zoom;
        if(window.VtxMap){
            window.VtxMap[mapId]= null;
        }else{
            window.VtxMap = {};
        }
        // 地图控件处理
        let isShowControl = false,
            controlPosition = t.matchControlPosition();
        if(showControl){
            controlPosition = t.matchControlPosition(showControl.location);
            isShowControl = !!showControl;
        }
        let latLngBounds = [];
        if(areaRestriction && Array.isArray(areaRestriction) && Array.isArray(areaRestriction[0])){
            //处理 区域限制数据
            latLngBounds = [
                areaRestriction[0][0],
                areaRestriction[0][1],
                areaRestriction[1][0],
                areaRestriction[1][1]
            ];
            latLngBounds.sort((a,b)=>a-b);
        }
        //创建地图  缓存地图对象
        let map = window.VtxMap[mapId] = t.state.gis = new t.omap.Map(document.getElementById(mapId.toString()),{
            center: {lng: options.center[0],lat: options.center[1]},
            disableDoubleClickZoom: false,
            draggableCursor: 'url("http://maps.gstatic.cn/mapfiles/openhand_8_8.cur"), default', 
            zoom: options.zoom,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
            controlSize: 24,
            //全屏控件-禁用
            rotateControl: isShowControl,
            scaleControl: isShowControl,
            streetViewControl: isShowControl,
            fullscreenControl: isShowControl,
            mapTypeControl: isShowControl,
            zoomControl: isShowControl,
            rotateControlOptions: {position: controlPosition},
            streetViewControlOptions: {position: controlPosition},
            fullscreenControlOptions: {position: controlPosition},
            zoomControlOptions: {position: controlPosition},
            mapTypeControlOptions: {position: google.maps.ControlPosition.TOP_CENTER},
            //区域限制
            restriction: {
                latLngBounds: {
                    north: latLngBounds[1] || 90,
                    south: latLngBounds[0] || -90,
                    west: latLngBounds[2] || -180,
                    east: latLngBounds[3] || 180
                },
                strictBounds: false,
            }
        });
        /*=================================start========================================*/
        /*
            draw对象声明, 绘制返回方法实现
         */
        if(!t._drawmanager){
            t._drawmanager = new google.maps.drawing.DrawingManager({
                drawingControl: false
            });
            t._drawmanager.setMap(t.state.gis);
        }
        /*=================================start========================================*/
        //初始化点聚合对象
        if(!t._cluster){
            t._cluster = new OMapLib.MarkerClusterer(map,[],{maxZoom: options.maxZoom}); 
        }
        /*=================================start========================================*/
        /*
            声明OverlayView 类
            用于切换lnglat和 pixel
         */
        function CanvasProjectionOverlay() {}
        CanvasProjectionOverlay.prototype = new google.maps.OverlayView();
        CanvasProjectionOverlay.prototype.constructor = CanvasProjectionOverlay;
        CanvasProjectionOverlay.prototype.onAdd = function(){};
        CanvasProjectionOverlay.prototype.draw = function(){};
        CanvasProjectionOverlay.prototype.onRemove = function(){};
        this.canvasProjectionOverlay = new CanvasProjectionOverlay();
        this.canvasProjectionOverlay.setMap(map);
        /*=================================start========================================*/
        /*
            重写marker对象,支持html
            要使用google对象,所以在creatMap中声明
         */
        let MyLabel = t.MyLabel = function(map,options = {}){
            //编辑
            this.editable = options.editable || false;
            this.editParam = {
                sx: 0,
                sy: 0
            };
            //地图
            this.map = map;
            this.isLabel = options.isLabel;
            //基本参数
            this.labelClass = options.labelClass;
            this.labelContent = options.labelContent;
            this.labelOffset = options.labelOffset || {x:0,y:0};
            this.lnglat = options.lnglat;

            this._label = null;

            this.funs = {};
        }
        //继承OverlayView类
        MyLabel.prototype = new google.maps.OverlayView();
        //添加地图时被调用(setMap时被调用)
        MyLabel.prototype.onAdd = function(){
            //创建文字标签
            if(!this._label){
                this._label = document.createElement('div');
                this._label.innerHTML = this.labelContent;
                this._label.style.position = 'absolute';
                this._label.className = this.labelClass;
                //获取承载点位的框
                let panes = this.getPanes();
                if(this.isLabel){
                    panes.markerLayer.appendChild(this._label);
                }else{
                    panes.overlayMouseTarget.appendChild(this._label);
                }
            }else{
                this._label.innerHTML = this.labelContent;
                this._label.className = this.labelClass;
            }
            for(var i in this.funs){
                this.removeListener(i);
                this.addListener(i,this.funs[i])
            }
        }
        //计算位置, onAdd和缩放和平移之后调用
        MyLabel.prototype.draw = function(){
            //返回MapCanvasProjection对象,拥有计算pixel和lnglat的方法
            let overlayProjection = this.getProjection();
            //将地理坐标转换成屏幕坐标
            let position = overlayProjection.fromLatLngToDivPixel(this.lnglat);
            if(position){
                this._label.style.left = position.x + parseFloat(this.labelOffset.x) + 'px';
                this._label.style.top = position.y + parseFloat(this.labelOffset.y) + 'px';
            }
        }
        //更新点位信息
        MyLabel.prototype.setOptions = function(options){
            this.labelClass = options.labelClass;
            this.labelContent = options.labelContent;
            this.labelOffset = options.labelOffset || {x:0,y:0};
            this.lnglat = options.lnglat || this.lnglat;
            if(this._label){
                this.onAdd();
            }
        }
        //更新点位信息
        MyLabel.prototype.setPosition = function(lnglat){
            this.lnglat = lnglat;
            if(this._label){
                this.draw();
            }else{
                //触发onAdd draw
                this.setMap(map);
            }
        }
        //更新点位信息
        MyLabel.prototype.getPosition = function(){
            return this.lnglat;
        }
        //更新点位信息
        MyLabel.prototype.setZIndex = function(index){
            if(this._label){
                this._label.style.ZIndex = index;
            }
        }
        //用于updatePoint时 判断原来的点图元类型
        MyLabel.prototype.isMarkerContent = function(){
            return true;
        }
        //被删除时会调用
        MyLabel.prototype.onRemove = function(){
            this._label.parentNode.removeChild(this._label);  
            this._label = null;
        }
        MyLabel.prototype.addListener = function(key,fun){
            let tt = this;
            if(key == 'dragend'){
                //编辑返回函数
                this.dragendFun = fun;
                return false;
            }
            setTimeout(()=>{
                if(tt._label){
                    tt.funs[key] = function(event){
                        if(event.stopPropagation){
                            event.stopPropagation();
                        }
                        if(!tt.editable){
                            fun({
                                latLng: tt.lnglat,
                                va: event,
                                pixel: tt.getProjection().fromLatLngToDivPixel(tt.lnglat)
                            });
                        }
                    }
                    tt._label.addEventListener(key,tt.funs[key]);
                }else{
                    tt.addListener(key,fun);
                }
            },50)
        }
        MyLabel.prototype.removeListener = function(key){
            if(key == 'dragend'){
                this.dragendFun = ()=>{};
                return false;
            }
            if(this._label){
                this._label.removeEventListener(key,this.funs[key]);
            }
        }
        //设置是否可以编辑
        MyLabel.prototype.setDraggable = function(boolean){
            this.editable = boolean;
            if(boolean){
                this.edit();
            }else{
                this._label.removeEventListener('mousedown',this.mdown);
            }
        }
        //编辑时 事件和逻辑
        MyLabel.prototype.edit = function(){
            let tt = this;
            tt.mdown = function(event){
                event.stopPropagation();
                //禁止文本选中
                tt._label.className = 'noselect';
                // 记录原始位置
                tt.editParam.sx = event.clientX;
                tt.editParam.sy = event.clientY;

                let mmEvent = function(e){
                    e.stopPropagation();
                    //计算与上一次的差值  累加到label dom上
                    tt._label.style.left = parseFloat(tt._label.style.left.replace('px','')) + e.clientX - tt.editParam.sx + 'px';
                    tt._label.style.top = parseFloat(tt._label.style.top.replace('px','')) + e.clientY - tt.editParam.sy + 'px';
                    //更新原始位置
                    tt.editParam.sx = e.clientX;
                    tt.editParam.sy = e.clientY;
                }
                let mupEvent = function(e){
                    e.stopPropagation();
                    //计算与上一次的差值  累加到label dom上
                    let x = parseFloat(tt._label.style.left.replace('px','')) + e.clientX - tt.editParam.sx,
                        y = parseFloat(tt._label.style.top.replace('px','')) + e.clientY - tt.editParam.sy;
                    //计算经纬度,固定label的位置
                    tt._label.style.left = x + 'px';
                    tt._label.style.top = y + 'px';
                    let overlayProjection = tt.getProjection(),
                    latlng = overlayProjection.fromDivPixelToLatLng(new google.maps.Point(x,y));
                    tt.setPosition(latlng);
                    // 清空 文本禁选
                    tt._label.className = '';
                    tt.dragendFun(e);
                    //关闭全局监听
                    document.removeEventListener('mousemove',mmEvent);
                    document.removeEventListener('mouseup',mupEvent);
                }
                document.addEventListener('mousemove',mmEvent)
                document.addEventListener('mouseup',mupEvent)
            }
            tt._label.addEventListener('mousedown',tt.mdown);
        }
        /*=================================end========================================*/
    }
    //设置指定图元展示   google只有zoom和center全适应,单适应暂时无法实现
    setVisiblePoints(obj){
        let t = this;
        let ls = [];
        let {pointIds,lineIds,polygonIds,circleIds} = t.state;
        let getLngLats = (ids,type)=>{
            let alnglat = [],lngs = [],lats = [];
            if(!type){
                t.GM.getMoreGraphicParam(ids).map((item,index)=>{
                    //根据天地图 覆盖物类型获取lnglat
                    switch(item.geometryType){
                        case 'point':
                            alnglat.push([item.geometry.x,item.geometry.y]);
                        break;
                        case 'polyline':
                            alnglat.push(...item.geometry.paths);
                        break;
                        case 'polygon':
                            alnglat.push(...item.geometry.rings);
                        break;
                        case 'circle':
                            alnglat.push([item.geometry.x,item.geometry.y]);
                        break;
                    }
                });
            }else{
                alnglat = ids;
            }
            alnglat.forEach((item,index)=>{
                lngs.push(item[0]);
                lats.push(item[1]);
            });
            lngs.sort();lats.sort();
            return {
                sw: new google.maps.LatLng({lng:lngs[0],lat:lats[0]}),
                ne: new google.maps.LatLng({lng:lngs[lngs.length-1],lat:lats[lats.length-1]})
            };
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
                //支持传经纬度
                if(ids[0] instanceof Array){
                    ls = getLngLats(ids,'lnglat');
                }else{
                    ls = getLngLats(ids);
                }
            break;
        }
        t.state.gis.fitBounds(new google.maps.LatLngBounds(ls.sw,ls.ne));
    }
    //设置地图中心位置 lng/经度  lat/纬度
    setCenter (gt) {
        let t = this;
        let mgt = [626.3002300508477,37.90942995363547];
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
        t.state.gis.setCenter(new google.maps.LatLng({lng:mgt[0],lat:mgt[1]}));
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
    //清空地图所有图元
    clearAll (){
        let t = this;
        //清空热力图
        if(t.heatmap){
            t.heatmap.setMap(null);
        }
        t.heatmap = null;
        //先清除所有标记
        if(t.clusterIdList.length){
            t.clearClusters();
        }
        t.clearAllPointCollection();
        //清空点
        for(let i in t.GM.allGraphics){
            if(t.GM.allGraphics[i]){
                t.GM.allGraphics[i].setMap(null)
            }
        }
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
    //图元功能处理方法
    //新增点位
    addPoint(mapPoints,type){
        let t = this;
        let psids = [...t.state.pointIds];
        let apf = ()=>{
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
                let position = new t.omap.LatLng({lng:item.longitude,lat:item.latitude});
                let marker = null;
                if(item.markerContent){
                    /*自定义html加点
                     用Label来实现,无法再添加label(高德有判断,实现不同)*/
                     //覆盖物参数
                    marker = new t.MyLabel(t.state.gis,{
                        labelContent: item.markerContent,
                        labelOffset: {x: cg.markerContentX,y: cg.markerContentY},
                    });
                    marker.setPosition(position);
                }else{
                    /*添加非html点位*/
                    // //添加label
                    if(item.canShowLabel && cg.labelContent){
                        //label默认样式
                        let labelClass = 'label-content';
                        //接受label自定义样式
                        if(item.labelClass){
                            labelClass = item.labelClass.split(',').join(' ');
                        }
                        let label = new t.MyLabel(t.state.gis,{
                            isLabel: true,
                            labelClass,
                            labelContent: cg.labelContent,
                            /*
                                为和百度等地图相同的参数  加上g.markerContentY值
                                label是使用OverlayView手动实现,与marker没有关联的原因
                             */
                            labelOffset: {x: cg.labelPixelX,y: cg.labelPixelY+cg.markerContentY}
                        });
                        label.setPosition(position);
                        //缓存
                        t.GM.setGraphic(`${item.id}_vtxoMap_label`,label);
                    }
                    let iconUrl = '';
                    // 360deg 不需要旋转
                    if(parseFloat(cg.deg)%360 != 0){
                        iconUrl = new RotateIcon({
                            url:item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                            width: cg.width,
                            height: cg.height
                        });
                    }
                    let icon = {
                        anchor: {x: -cg.markerContentX,y: -cg.markerContentY},
                        size: new t.omap.Size(cg.width,cg.height),
                        scaledSize: new t.omap.Size(cg.width,cg.height),
                        url: parseFloat(cg.deg)%360 != 0 ?
                            iconUrl.setRotation(cg.deg).getUrl()
                            :item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                        labelOrigin: {x: cg.labelPixelX,y: cg.labelPixelY}
                    };
                    //添加点到地图
                    marker = new t.omap.Marker({
                        icon,
                        position,
                        map: t.state.gis
                    });
                    if(item.canShowLabel && cg.labelContent){
                        marker.ishaveLabel = true;
                    }
                }
                if(cg.zIndex || cg.zIndex === 0){
                    marker.setZIndex(cg.zIndex);
                }
                if(!item.markerContent && cg.BAnimationType == 0){
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }else if(!item.markerContent && cg.BAnimationType == 1){
                    marker.setAnimation(google.maps.Animation.DROP);
                }
                //点击事件
                let mClick = marker.addListener('click',(e)=>{
                    //避免鼠标在图元上 测距工具不起作用
                    if(t.rangingTool.isRanging){
                        t.rangingToolFun(e)
                    }else{
                        t.clickGraphic(item.id,e);
                    }
                });
                //鼠标移入事件
                let mMouseover = marker.addListener('mouseover',(e)=>{
                    t.mouseOverGraphic(item.id,e);
                });
                //鼠标移出事件
                let mMouseout = marker.addListener('mouseout',(e)=>{
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
                }).setGraphicParam(`${item.id}_omap_event`,{
                    click: mClick,
                    mouseover: mMouseover,
                    mouseout: mMouseout
                });
            });
            if(type !== 'defined'){
                //所有点缓存在state中
                t.setState({
                    pointIds: psids
                });
            }
        }
        //内部 不需要旋转图标的处理方式
        if(type == 'nodeg'){
            apf();
        }else{
            //缓存图片 旋转功能使用
            mapPoints.map((item,index)=>{
                //避免多次缓存
                if(item.url && !t.cacheImgRecord[item.url]){
                    let i = new Image();
                    i.src = item.url;
                    t.cacheImg.appendChild(i);
                    t.cacheImgRecord[item.url] = true;
                }
            });
            //定时等待 图片缓存,点位旋转功能需要
            t.addPsTimer = setTimeout(()=>{
                apf();
            },200)
        }
    }
    //更新点位
    updatePoint(mapPoints,type){
        let t = this;
        let upf = ()=>{
            mapPoints.map((item,index)=>{
                //判断图元是否存在.
                if (this.GM.isRepetition(item.id)) {
                    //点位数据不符合,直接跳过
                    if(!item.longitude || !item.latitude){
                        console.error(`点 经纬度 数据错误`);
                        return false;
                    }
                    //获取原有的图元 和 对应的label
                    let gc = t.GM.getGraphic(item.id),
                        gc_label = t.GM.getGraphic(`${item.id}_vtxoMap_label`);
                    //更新前删除聚合
                    if(t.clusterIdList.indexOf(item.id) > -1){
                        t._cluster.removeMarker(gc);
                        if(gc_label){
                            t._cluster.removeMarker(gc_label);
                        }
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
                    if(item.config){
                        cg = {...cg,...item.config};
                    }
                    //新旧经纬度  旧经纬度配合moveTo使用
                    let position = new t.omap.LatLng({lng:item.longitude,lat:item.latitude});
                    let oldPosition = gc.getPosition();
                    //前后点位类型都是markerContent
                    if(gc.isMarkerContent && gc.isMarkerContent() && item.markerContent){
                        /*
                          自定义html加点
                          用Label来实现,无法再添加label(高德有判断,实现不同)
                         */
                        //覆盖物参数
                        gc.setOptions({
                            labelContent: item.markerContent,
                            labelOffset: {x: cg.markerContentX,y: cg.markerContentY},
                            lnglat: oldPosition
                        })
                    }else if(gc.isMarkerContent && gc.isMarkerContent() && !item.markerContent){
                        //markerContent类型转 marker-url类型
                        //清除事件
                        gc.removeListener('click');
                        gc.removeListener('mouseover');
                        gc.removeListener('mouseout');
                        //删除原点位
                        gc.setMap(null);
                        let iconUrl = '';
                        // 360deg 不需要旋转
                        if(parseFloat(cg.deg)%360 != 0){
                            iconUrl = new RotateIcon({
                                url:item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                                width: cg.width,
                                height: cg.height
                            });
                        }
                        let icon = {
                            anchor: {x: -cg.markerContentX,y: -cg.markerContentY},
                            size: new t.omap.Size(cg.width,cg.height),
                            scaledSize: new t.omap.Size(cg.width,cg.height),
                            url: parseFloat(cg.deg)%360 != 0 ?
                                iconUrl.setRotation(cg.deg).getUrl()
                                :item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                            labelOrigin: {x: cg.labelPixelX,y: cg.labelPixelY}
                        };
                        //重新加载点位
                        gc = new t.omap.Marker({
                            icon,
                            position:oldPosition,
                            map: t.state.gis
                        });
                        //切换 图元对象缓存
                        t.GM.setGraphic(item.id,gc);
                        if(item.canShowLabel && cg.labelContent){
                            //label默认样式
                            let labelClass = 'label-content';
                            //接受label自定义样式
                            if(item.labelClass){
                                labelClass = item.labelClass.split(',').join(' ');
                            }
                            if(!gc_label){
                                gc_label = new t.MyLabel();
                                t.GM.setGraphic(`${item.id}_vtxoMap_label`,gc_label);
                            }
                            gc_label.setOptions({
                                labelClass,
                                labelContent: cg.labelContent,
                                /*
                                    为和百度等地图相同的参数  加上g.markerContentY值
                                    label是使用OverlayView手动实现,与marker没有关联的原因
                                 */
                                labelOffset: {x: cg.labelPixelX,y: cg.labelPixelY+cg.markerContentY}
                            })
                            gc.ishaveLabel = true;
                        }
                        //点击事件
                        let mClick = gc.addListener('click',(e)=>{
                            //避免鼠标在图元上 测距工具不起作用
                            if(t.rangingTool.isRanging){
                                t.rangingToolFun(e)
                            }else{
                                t.clickGraphic(item.id,e);
                            }
                        });
                        //鼠标移入事件
                        let mMouseover = gc.addListener('mouseover',(e)=>{
                            t.mouseOverGraphic(item.id,e);
                        });
                        //鼠标移出事件
                        let mMouseout = gc.addListener('mouseout',(e)=>{
                            t.mouseOutGraphic(item.id,e);
                        });
                        t.GM.setGraphicParam(`${item.id}_omap_event`,{
                            click: mClick,
                            mouseover: mMouseover,
                            mouseout: mMouseout
                        });
                    }else if(!gc.isMarkerContent && item.markerContent){
                        //marker-url类型转markerContent类型
                        //清除事件
                        if(t.GM.getGraphicParam(`${item.id}_omap_event`).click){
                            t.GM.getGraphicParam(`${item.id}_omap_event`).click.remove();
                        }
                        if(t.GM.getGraphicParam(`${item.id}_omap_event`).mouseover){
                            t.GM.getGraphicParam(`${item.id}_omap_event`).mouseover.remove();
                        }
                        if(t.GM.getGraphicParam(`${item.id}_omap_event`).mouseout){
                            t.GM.getGraphicParam(`${item.id}_omap_event`).mouseout.remove();
                        }
                        //删除原点位
                        gc.setMap(null);
                        //存在 label点位 直接删除
                        if(gc_label){
                            gc_label.setMap(null);
                            t.GM.removeGraphic(`${item.id}_vtxoMap_label`);
                        }
                        //重新加载点位 (原有位置加载,配合moveTo方法使用)
                        gc = new t.MyLabel(t.state.gis,{
                            labelContent: item.markerContent,
                            labelOffset: {x: cg.markerContentX,y: cg.markerContentY},
                        });
                        gc.setPosition(oldPosition);
                        //切换 图元对象缓存
                        t.GM.setGraphic(item.id,gc);
                        //点击事件
                        let mClick = gc.addListener('click',(e)=>{
                            //避免鼠标在图元上 测距工具不起作用
                            if(t.rangingTool.isRanging){
                                t.rangingToolFun(e)
                            }else{
                                t.clickGraphic(item.id,e);
                            }
                        });
                        //鼠标移入事件
                        let mMouseover = gc.addListener('mouseover',(e)=>{
                            t.mouseOverGraphic(item.id,e);
                        });
                        //鼠标移出事件
                        let mMouseout = gc.addListener('mouseout',(e)=>{
                            t.mouseOutGraphic(item.id,e);
                        });
                        t.GM.setGraphicParam(`${item.id}_omap_event`,{
                            click: mClick,
                            mouseover: mMouseover,
                            mouseout: mMouseout
                        })
                    }else{
                        let iconUrl = '';
                        // 360deg 不需要旋转
                        if(parseFloat(cg.deg)%360 != 0){
                            iconUrl = new RotateIcon({
                                url:item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                                width: cg.width,
                                height: cg.height
                            });
                        }
                        //前后点位类型都是marker-url
                        let icon = {
                            anchor: {x: -cg.markerContentX,y: -cg.markerContentY},
                            size: new t.omap.Size(cg.width,cg.height),
                            scaledSize: new t.omap.Size(cg.width,cg.height),
                            url: parseFloat(cg.deg)%360 != 0 ?
                                iconUrl.setRotation(cg.deg).getUrl()
                                :item.url || `${configUrl.mapServerURL}/images/defaultMarker.png`,
                            labelOrigin: {x: cg.labelPixelX,y: cg.labelPixelY}
                        };
                        gc.setIcon(icon);
                        if(item.canShowLabel && cg.labelContent){
                            //label默认样式
                            let labelClass = 'label-content';
                            //接受label自定义样式
                            if(item.labelClass){
                                labelClass = item.labelClass.split(',').join(' ');
                            }
                            if(!gc_label){
                                gc_label = new t.MyLabel();
                                t.GM.setGraphic(`${item.id}_vtxoMap_label`,gc_label);
                            }
                            gc_label.setOptions({
                                labelClass,
                                labelContent: cg.labelContent,
                                /*
                                    为和百度等地图相同的参数  加上g.markerContentY值
                                    label是使用OverlayView手动实现,与marker没有关联的原因
                                 */
                                labelOffset: {x: cg.labelPixelX,y: cg.labelPixelY+cg.markerContentY}
                            })
                            gc.ishaveLabel = true;
                        }
                    }
                    if(!item.markerContent && cg.BAnimationType == 0){
                        gc.setAnimation(google.maps.Animation.BOUNCE);
                    }else if(!item.markerContent && cg.BAnimationType == 1){
                        gc.setAnimation(google.maps.Animation.DROP);
                    }
                    /*moveTo*/
                    //动画效果会延迟执行经纬度的切换
                    if(cg.isAnimation){
                        t.moveTo(item.id,[item.longitude,item.latitude],cg.animationDelay,cg.autoRotation,item.url,item.urlleft);
                    }else{
                        if(gc_label){
                            gc_label.setPosition(position)
                        }
                        //修改经纬度
                        gc.setPosition(position);
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
        }
        //内部 不需要旋转图标的处理方式
        if(type == 'nodeg'){
            upf();
        }else{
            //缓存图片 旋转功能使用
            mapPoints.map((item,index)=>{
                //排除已经缓存的
                if(item.url && !t.cacheImgRecord[item.url]){
                    let i = new Image();
                    i.src = item.url;
                    t.cacheImg.appendChild(i);
                    t.cacheImgRecord[item.url] = true;
                }
                if(item.urlleft && !t.cacheImgRecord[item.urlleft]){
                    let i = new Image();
                    i.src = item.urlleft;
                    t.cacheImg.appendChild(i);
                    t.cacheImgRecord[item.urlleft] = true;
                }
            });
            // 定时等待 图片缓存,点位旋转功能需要
            t.upPsTimer = setTimeout(()=>{
                upf();
            },200)
        }
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
            // 线样式
            let icons = [];
            if(cg.lineType == 'dashed'){
                let lineSymbol = {
                    path: 'M 0,-1 0,1',
                    strokeOpacity: 1,
                    scale: cg.lineWidth > 5?5:cg.lineWidth <2.5?2.5:cg.lineWidth
                };
                icons = [{icon:lineSymbol,offset: '0',repeat: '20px'}]
            }
            //处理线的点数组
            let linePath = item.paths.map((item,index)=>{
                return new google.maps.LatLng({lng: item[0],lat: item[1]});
            }),
            //处理线的参数
            lineOption = {
                strokeColor : cg.color, // 线颜色
                strokeWeight : cg.lineWidth, // 线宽
                strokeOpacity : cg.lineType == 'dashed'?0:cg.pellucidity, // 线透明度
                icons
            };
            //创建线对象
            let line = new google.maps.Polyline({...lineOption,path:linePath});
            //判断线显示和隐藏
            if(cg.isHidden){
                line.setVisible(false);
            }else{
                line.setVisible(true);
            }
            lsids.push(item.id);
            //添加线至地图
            line.setMap(t.state.gis);
            //点击事件
            line.addListener('click',(e)=>{
                //避免鼠标在图元上 测距工具不起作用
                if(t.rangingTool.isRanging){
                    t.rangingToolFun(e)
                }else{
                    t.clickGraphic(item.id,e);
                }
            });
            //鼠标移入事件
            line.addListener('mouseover',(e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            //鼠标移出事件
            line.addListener('mouseout',(e)=>{
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
            // 线样式
            let icons = [];
            if(cg.lineType == 'dashed'){
                let lineSymbol = {
                    path: 'M 0,-1 0,1',
                    strokeOpacity: 1,
                    scale: cg.lineWidth > 5?5:cg.lineWidth <2.5?2.5:cg.lineWidth
                };
                icons = [{icon:lineSymbol,offset: '0',repeat: '20px'}]
            }
            //处理线的点数组
            let linePath = item.paths.map((item,index)=>{
                return new google.maps.LatLng({lng: item[0],lat: item[1]});
            }),
            //处理线的参数
            lineOption = {
                strokeColor : cg.color, // 线颜色
                strokeWeight : cg.lineWidth, // 线宽
                strokeOpacity : cg.lineType == 'dashed'?0:cg.pellucidity, // 线透明度
                icons
            };
            //修改线点位数据
            gc.setPath(linePath);
            //修改线配置
            gc.setOptions(lineOption);
            //判断线显示和隐藏
            if(cg.isHidden){
                gc.setVisible(false);
            }else{
                gc.setVisible(true);
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
                return new google.maps.LatLng({lng: item[0],lat: item[1]});
            });
            //创建面对象
            let polygon = new google.maps.Polygon({...polygonOption,paths: polygonPath});
            //添加面至地图
            polygon.setMap(t.state.gis);
            //点击事件
            polygon.addListener('click',(e)=>{
                //避免鼠标在图元上 测距工具不起作用
                if(t.rangingTool.isRanging){
                    t.rangingToolFun(e)
                }else{
                    t.clickGraphic(item.id,e);
                }
            });
            //鼠标移入事件
            polygon.addListener('mouseover',(e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            //鼠标移出事件
            polygon.addListener('mouseout',(e)=>{
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
                    return new google.maps.LatLng({lng: item[0],lat: item[1]});
                });
                //更新经纬度
                gc.setPath(polygonPath);
                //更新 多边形 参数
                gc.setOptions(polygonOption);
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
            centerPoint = new google.maps.LatLng({lng: item.longitude,lat: item.latitude});
            //创建圆图元实例
            let circle = new google.maps.Circle({
                ...circleOption,
                radius: item.radius,
                center: centerPoint
            });
            //添加圆至地图
            circle.setMap(t.state.gis);
            //点击事件
            circle.addListener('click',(e)=>{
                //避免鼠标在图元上 测距工具不起作用
                if(t.rangingTool.isRanging){
                    t.rangingToolFun(e)
                }else{
                    t.clickGraphic(item.id,e);
                }
            });
            //鼠标移入事件
            circle.addListener('mouseover',(e)=>{
                t.mouseOverGraphic(item.id,e);
            });
            //鼠标移出事件
            circle.addListener('mouseout',(e)=>{
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
                //初始化配置数据
                let circleOption = {
                    strokeColor: cg.lineColor,
                    strokeOpacity: cg.lineOpacity,
                    strokeWeight: cg.lineWidth,
                    strokeStyle: cg.lineType,
                    fillColor: cg.color,
                    fillOpacity: cg.pellucidity
                },
                centerPoint = new google.maps.LatLng({lng: item.longitude,lat: item.latitude});
                //修改中心点
                gc.setCenter(centerPoint);
                //修改半径
                gc.setRadius(item.radius);
                //修改圆 参数
                gc.setOptions(circleOption);
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
            t.heatmap = new google.maps.visualization.HeatmapLayer({
                map: t.state.gis
            });
        }
        let option = {
            radius: cg.radius,
            //百度是1-100,高德是0-1
            opacity: cg.visible?cg.opacity:0,
            // maxIntensity: cg.max
        }
        if(cg.gradient){
            option.gradient = ['rgba(102,255, 0,0)'];
            //将gradient排序,与其他地图的热力图数据一致
            let sortArray = [];
            for (let i in cg.gradient) {
                sortArray.push({key: i,value: cg.gradient[i]});
            }
            option.gradient = [
                ...option.gradient,
                ...sortArray.sort((a,b)=>{
                    return a.key > b.key;
                }).map((item)=>{
                    return item.value;
                })
            ]
        }
        t.heatmap.setOptions(option);
        t.heatmap.setData(
            (d.data || []).map((item,index)=>{
                return new google.maps.LatLng({lng: item.lng,lat: item.lat})
            })
        );
    }
    //添加海量点
    addPointCollection(data = []){
        let t = this;
        //处理海量点
        let panes = t.canvasProjectionOverlay.getPanes(),
            ftp = t.canvasProjectionOverlay.getProjection();
        if(panes){
            if(!t.pointCollectionId){
                t.pointCollectionId = `${t.props.mapId}_vtx_gmap_html_pointCollection`;
                let divpc = document.createElement('div');
                divpc.className = 'vtx_gmap_html_pointCollection_a';
                divpc.style.top = `-${t.state.gis.getDiv().offsetHeight/2}px`;
                divpc.style.left = `-${t.state.gis.getDiv().offsetWidth/2}px`;
                divpc.id = t.pointCollectionId;
                panes.markerLayer.appendChild(divpc);
            }
            data.map((item,index)=>{
                let d = item || {};
                let points = (d.points || []).map((d,i)=>{
                    let p = new google.maps.LatLng(d);
                        p = ftp.fromLatLngToContainerPixel(p);
                    return [p.x,p.y];
                });
                let options = {
                    size: d.size,
                    shape: d.shape,
                    color: d.color,
                    width: t.state.gis.getDiv().offsetWidth,
                    height: t.state.gis.getDiv().offsetHeight,
                    mapId: t.props.mapId
                };
                let VotexpointCollection = new GMapLib.PointCollection(points,options);
                t.morepoints.push({
                    id: d.id,
                    value: VotexpointCollection
                });
                VotexpointCollection.draw();
            })
        }else{
            if(t.addpointCollectionTimer){
                clearTimeout(t.addpointCollectionTimer);
            }
            t.addpointCollectionTimer = setTimeout(()=>{
                t.addPointCollection(data);
            },50);
        }
    }
    //更新海量点
    updatePointCollection(data = []){
        let t = this;
        let ftp = t.canvasProjectionOverlay.getProjection();
        if(ftp){
            data.map((ds,ind)=>{
                t.morepoints.map((item,index)=>{
                    if(item.id == ds.id){
                        let points = (ds.points || []).map((d,i)=>{
                            let p = new google.maps.LatLng(d);
                                p = ftp.fromLatLngToContainerPixel(p);
                            return [p.x,p.y];
                        });
                        let options = {
                            size: ds.size,
                            shape: ds.shape,
                            color: ds.color,
                            width: t.state.gis.getDiv().offsetWidth,
                            height: t.state.gis.getDiv().offsetHeight,
                        };
                        item.value.reDraw(points,options);
                    }
                })
            })
        }else{
            if(t.updatePointCollectionTimer){
                clearTimeout(t.updatePointCollectionTimer);
            }
            t.updatePointCollectionTimer = setTimeout(()=>{
                t.addPointCollection(data);
            },50);
        }
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
    //删除图元
    removeGraphic(id,type){
        let t = this;
        let graphic = t.GM.getGraphic(id),
            gc_label = t.GM.getGraphic(`${id}_vtxoMap_label`);
        //删除点聚合效果
        if(t.clusterIdList.indexOf(id) > -1){
            t.removeCluster(id);
        }
        if(graphic){
            //清除地图中图元
            graphic.setMap(null);
            //清除对应id的图元数据缓存
            t.GM.removeGraphic(id);
        }else{
            return false;
        }
        //删除点位label
        if(gc_label){
            gc_label.setMap(null);
            t.GM.removeGraphic(`${id}_vtxoMap_label`);
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
        let graphic = t.GM.getGraphic(id),
            gLabel = t.GM.getGraphic(`${id}_vtxoMap_label`),
            gtp = t.GM.getGraphicParam(id);
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
                    if(google.maps.geometry && google.maps.geometry.spherical){
                        obj.area = google.maps.geometry.spherical.computeArea(param.mapLayer.getPath().getArray());
                    }else{
                        obj.area = 0;
                    }
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
                graphic.setDraggable(true);
                t.editEvent['dragend'] = graphic.addListener("dragend",t.editGraphicChange);
                //判断是否是 markerContent  再判断是否有label
                if(!gtp.attributes.markerContent && gLabel){
                    //label事件对象  便于删除
                    t.editPointLabel = graphic.addListener("drag",(event)=>{
                        gLabel.setPosition(event.latLng);
                    });
                }
            break;
            case 'polyline':
            case 'polygon':
            case 'rectangle':
                graphic.setEditable(true);
                t.editEvent['mouseup'] = graphic.addListener("mouseup",t.editGraphicChange);
            break;
            case 'circle':
                graphic.setEditable(true);
                t.editEvent['center_changed'] = graphic.addListener("center_changed",t.editGraphicChange);
                t.editEvent['radius_changed'] = graphic.addListener("radius_changed",t.editGraphicChange);
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
                graphic.setDraggable(false);
                if(graphic.removeListener){
                    graphic.removeListener("dragend",t.editGraphicChange);
                }else{
                    for(let i in t.editEvent){
                        if(t.editEvent[i]){
                            t.editEvent[i].remove();
                        }
                    }
                    if(t.editPointLabel){
                        t.editPointLabel.remove();
                        t.editPointLabel = null;
                    }
                }
            break;
            case 'polyline':
            case 'polygon':
            case 'rectangle':
            case 'circle':
                graphic.setEditable(false);
                for(let i in t.editEvent){
                    if(t.editEvent[i]){
                        t.editEvent[i].remove();
                    }
                }
            break;
        }
        //事件缓存制空,避免异常
        t.editEvent = {};
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
    //绘制图元
    draw(obj){
        let t = this,drawParam = {};
        //先关闭(防止连点)
        t._drawmanager.setDrawingMode(null);
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
                let icon = {
                    anchor: {x: -drawParam.parameter.markerContentX || 15,y: -drawParam.parameter.markerContentY || 30},
                    size: new t.omap.Size(drawParam.parameter.width || 30,drawParam.parameter.height || 30),
                    scaledSize: new t.omap.Size(drawParam.parameter.width || 30,drawParam.parameter.height || 30),
                    url: drawParam.parameter.url || `${configUrl.mapServerURL}/images/defaultMarker.png`
                };
                t._drawmanager.setOptions({
                    drawingControl: false,
                    markerOptions: {
                        icon
                    }
                });
                t._drawmanager.setDrawingMode('marker');
                t._drawmanagerEvent = t._drawmanager.addListener('markercomplete',(e)=>{
                    //清楚事件监听
                    t._drawmanagerEvent.remove();
                    //关闭绘制功能
                    t._drawmanager.setDrawingMode(null);
                    t.GM.setGraphic(drawParam.data.id,e);
                    let backobj = {
                        id: drawParam.data.id,
                        attributes: {
                            id: drawParam.data.id,
                            url: icon.url,
                            config: {
                                width: icon.size.width,
                                height: icon.size.height
                            }
                        },
                        geometry: {
                            type: 'point',
                            x: e.getPosition().lng(),
                            y: e.getPosition().lat()
                        },
                        geometryType: 'point',
                        mapLayer: e
                    }
                    t.GM.setGraphicParam(drawParam.data.id,backobj);
                    if('drawEnd' in t.props){
                        t.props.drawEnd(backobj);
                    }
                })
            break;
            case 'polyline':
                param.strokeColor = drawParam.parameter.color;
                param.strokeOpacity = drawParam.parameter.pellucidity;
                param.strokeWeight = drawParam.parameter.lineWidth;
                t._drawmanager.setOptions({
                    drawingControl: false,
                    polylineOptions: param
                });
                t._drawmanager.setDrawingMode('polyline');
                t._drawmanagerEvent = t._drawmanager.addListener('polylinecomplete',(e)=>{
                    //清楚事件监听
                    t._drawmanagerEvent.remove();
                    //关闭绘制功能
                    t._drawmanager.setDrawingMode(null);
                    t.GM.setGraphic(drawParam.data.id,e);
                    let paths = [];
                    let lnglatAry = (e.getPath().getArray() || []).map((item,index)=>{
                        paths.push({lng: item.lng(),lat: item.lat()})
                        return {lngX: item.lng(),latX: item.lat()};
                    });
                    let backobj = {
                        geometryType: 'polyline',
                        distance: t.calculateGraphicDistance(e.getPath().getArray()),
                        id: drawParam.data.id,
                        attributes: {
                            id: drawParam.data.id,
                            config: {
                                color: param.strokeColor,
                                pellucidity: param.strokeOpacity,
                                lineWidth: param.strokeWeight
                            }
                        },
                        mapLayer: e,
                        geometry: {
                            type: 'polyline',
                            lnglatAry: lnglatAry,
                            paths: getMaxMin(paths).path
                        },
                        lnglatAry: lnglatAry 
                    }
                    t.GM.setGraphicParam(drawParam.data.id,backobj);
                    if('drawEnd' in t.props){
                        t.props.drawEnd(backobj);
                    }
                })
            break;
            case 'polygon':
                t._drawmanager.setOptions({
                    drawingControl: false,
                    polygonOptions: paramgcr
                });
                t._drawmanager.setDrawingMode('polygon');
                t._drawmanagerEvent = t._drawmanager.addListener('polygoncomplete',(e)=>{
                     //清楚事件监听
                    t._drawmanagerEvent.remove();
                    //关闭绘制功能
                    t._drawmanager.setDrawingMode(null);
                    t.GM.setGraphic(drawParam.data.id,e);
                    let paths = [],area = t.calculateArea(drawParam.data.id);
                    let lnglatAry = (e.getPath().getArray() || []).map((item,index)=>{
                        paths.push({lng: item.lng(),lat: item.lat()})
                        return {lngX: item.lng(),latX: item.lat()};
                    });
                    let backobj = {
                        geometryType: 'polygon',
                        id: drawParam.data.id,
                        attributes: {
                            id: drawParam.data.id,
                            config: {
                                color: paramgcr.fillColor,
                                lineColor: paramgcr.strokeColor,
                                lineOpacity: paramgcr.strokeOpacity,
                                pellucidity: paramgcr.fillOpacity,
                                lineWidth: paramgcr.strokeWeight
                            }
                        },
                        mapLayer: e,
                        geometry: {
                            type: 'polygon',
                            lnglatAry: lnglatAry,
                            rings: getMaxMin(paths).path,
                            _extent: getMaxMin(paths)._extent,
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
            case 'circle':
                t._drawmanager.setOptions({
                    drawingControl: false,
                    circleOptions: paramgcr
                });
                t._drawmanager.setDrawingMode('circle');
                t._drawmanagerEvent = t._drawmanager.addListener('circlecomplete',(e)=>{
                     //清楚事件监听
                    t._drawmanagerEvent.remove();
                    //关闭绘制功能
                    t._drawmanager.setDrawingMode(null);
                    t.GM.setGraphic(drawParam.data.id,e);
                    let area = Math.PI * Math.pow(e.getRadius(),2);
                    let backobj = {
                        geometryType: 'circle',
                        id: drawParam.data.id,
                        attributes: {
                            id: drawParam.data.id,
                            config: { 
                                color: paramgcr.fillColor,
                                lineColor: paramgcr.strokeColor,
                                lineOpacity: paramgcr.strokeOpacity,
                                pellucidity: paramgcr.fillOpacity,
                                lineWidth: paramgcr.strokeWeight
                            }
                        },
                        mapLayer: e,
                        geometry: {
                            type: 'circle',
                            x: e.getCenter().lng(),
                            y: e.getCenter().lat(),
                            radius: e.getRadius(),
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
                t._drawmanager.setOptions({
                    drawingControl: false,
                    rectangleOptions: paramgcr
                });
                t._drawmanager.setDrawingMode('rectangle');
                t._drawmanagerEvent = t._drawmanager.addListener('rectanglecomplete',(e)=>{
                     //清楚事件监听
                    t._drawmanagerEvent.remove();
                    //关闭绘制功能
                    t._drawmanager.setDrawingMode(null);
                    t.GM.setGraphic(drawParam.data.id,e);
                    let lnglatJson = e.getBounds().toJSON();
                    let paths = [{
                        lng: lnglatJson.west,
                        lat: lnglatJson.south
                    },{
                        lng: lnglatJson.east,
                        lat: lnglatJson.south
                    },{
                        lng: lnglatJson.east,
                        lat: lnglatJson.north
                    },{
                        lng: lnglatJson.west,
                        lat: lnglatJson.north
                    }];
                    let lnglatAry = (paths || []).map((item,index)=>{
                        return {lngX: item.lng,latX: item.lat};
                    });
                    let area = t.calculatePointsDistance([lnglatJson.west,lnglatJson.south],[lnglatJson.east,lnglatJson.south])*
                                t.calculatePointsDistance([lnglatJson.east,lnglatJson.south],[lnglatJson.east,lnglatJson.north]);

                    let backobj = {
                        geometryType: 'polygon',
                        id: drawParam.data.id,
                        attributes: {
                            id: drawParam.data.id,
                            config: {
                                color: paramgcr.fillColor,
                                lineColor: paramgcr.strokeColor,
                                lineOpacity: paramgcr.strokeOpacity,
                                pellucidity: paramgcr.fillOpacity,
                                lineWidth: paramgcr.strokeWeight
                            }
                        },
                        mapLayer: e,
                        geometry: {
                            type: 'polygon',
                            lnglatAry: lnglatAry,
                            rings: getMaxMin(paths).path,
                            _extent: getMaxMin(paths)._extent,
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
        let t = this;
        t._drawmanager.setDrawingMode(null);
    }
    /*
        事件处理
    */
    //点击图元事件
    clickGraphic (id,e) {
        let t = this;
        //判断是否点击的测距关闭点位
        if(id && id.indexOf('vtx_g_rang_end') > -1){
            let index = t.GM.getGraphicParam(id).attributes.index;
            let ls = t.rangingTools[index].line,
                ps = t.rangingTools[index].points;
            //删除测距线
            t.removeGraphic(ls.id,'line');
            //删除关闭点
            t.removeGraphic(id,'point');
            //删除中间点
            for(let i = 0 ; i < ps.length ; i++){
                t.removeGraphic(ps[i].id,'point');
            }
            //清除测距数据缓存
            delete t.rangingTools[index];
        }else{
            if(id.indexOf('vtx_g_rang_') > -1){
                return false;
            }
            //编辑中的图元关闭其他事件返回
            if(t.state.editId == id)return false;
            if(typeof(t.props.clickGraphic) ==="function"){
                let param = t.getGraphic(id);
                let obj = {
                    param,
                    type: param.geometry.type,//图元类型
                    attributes: {...param.attributes.other,...{config:param.attributes.config}},//添加时图元信息
                    top: e.va.y - t.mapTop,//当前点所在的位置(屏幕)
                    left: e.va.x - t.mapLeft,
                    e: e
                }
                t.props.clickGraphic(obj);
            }
        }
    }
    //图元鼠标悬浮事件
    mouseOverGraphic(id,e){
        let t = this;
        //编辑中的图元关闭其他事件返回
        if(t.state.editId == id)return false;
        if(typeof(t.props.mouseOverGraphic) === 'function'){
            if(id.indexOf('vtx_g_rang_') > -1){
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
        //编辑中的图元关闭其他事件返回
        if(t.state.editId == id)return false;
        if(typeof(t.props.mouseOutGraphic) ==="function"){
            if(id.indexOf('vtx_g_rang_') > -1){
                return false;
            }
            let obj = {
                e,id,
                param: t.getGraphic(id)
            }
            t.props.mouseOutGraphic(obj);
        }
    }
    /*
        地图服务功能
     */
    //开启路况
    openTrafficInfo(){
        let t =this;
        if(!t.trafficLayer){
            t.trafficLayer = new google.maps.TrafficLayer();
        }
        t.trafficLayer.setMap(t.state.gis);
    }
    //关闭路况
    hideTrafficInfo(){
        let t =this;
        if(t.trafficLayer){
            t.trafficLayer.setMap(null);
        }
    }
    //测距功能
    vtxRangingTool(mapRangingTool){
        let t =this;
        let {lineIds,polygonIds,circleIds} = t.state;
        let gids = [...lineIds,...polygonIds,...circleIds];
        t.state.gis.disableDoubleClickZoom = true;
        t.state.gis.draggableCursor = 'crosshair';
        //开启测距状态
        if(!t.rangingTool.isRanging){
            t.rangingTool.isRanging = true;
        }
        //初始测距回调
        if(!t.rangingTool.mapRangingTool){
            t.rangingTool.mapRangingTool = mapRangingTool;
        }
        if(!t.rangingToolFun){
            /*测距功能*/
            t.rangingToolFun = (e,status)=>{
                let fun = ()=>{
                    t.rangingTool.isDbclick = false;
                    if(t.rangingTool.isRanging){
                        //测距开始
                        //点击位置
                        let ftp = t.canvasProjectionOverlay.getProjection(),
                            lnglat = ftp.fromContainerPixelToLatLng(new google.maps.Point(e.va.x - t.mapLeft,e.va.y - t.mapTop)),
                            lnlt = [lnglat.lng(),lnglat.lat()];
                        //2个点以上 计算长度
                        if(t.rangingTool.points.length > 0){
                            t.rangingTool.distance += t.calculatePointsDistance(lnlt,
                                [t.rangingTool.points[t.rangingTool.points.length-1].longitude,
                                t.rangingTool.points[t.rangingTool.points.length-1].latitude]
                            );
                        }else{
                            t.rangingTool.line.paths = [];
                        }
                        t.rangingTool.line.paths.push([...lnlt]);
                        //处理距离展示
                        let distext = t.rangingTool.distance > 0
                            ?(t.rangingTool.distance > 1000
                                ?`总长:${Math.round(t.rangingTool.distance/10)/100}公里`:`总长:${t.rangingTool.distance}米`)
                            :'起点';
                        //加点
                        let point = {
                            id: t.rangingTool.points.length + 'vtx_g_rang_p'+Math.random(),
                            longitude: lnlt[0],
                            latitude: lnlt[1],
                            markerContent: `
                                <div style='z-index:1; height: 0px;'>
                                    <div class='vtx-g-rangingPoint'></div>
                                    <div class='vtx-g-rangingDistance'>${distext}</div>
                                </div>
                            `,
                            config: {
                                markerContentX: -5.5,
                                markerContentY: -12.5,
                            }
                        };
                        //用addpoint方法加点
                        t.addPoint([point]);
                        //缓存点信息
                        t.rangingTool.points.push(point);
                        if(t.rangingTool.line.paths.length == 2){
                            //加线
                            t.rangingTool.line = {
                                id: 'vtx_g_rang_line'+Math.random(),
                                paths: [...t.rangingTool.line.paths],
                                config:{
                                    color: '#108ee9',
                                    lineWidth: 2,
                                    lineType: 'solid'
                                }
                            }
                            t.addLine([t.rangingTool.line]);
                        }else if(t.rangingTool.line.paths.length > 2){
                            t.updateLine([{
                                ...t.rangingTool.line,
                                paths: [...t.rangingTool.line.paths]
                            }]);
                        }
                        //双击 测距结束
                        if(status == 'dbl'){
                            let rangkey = new Date().getTime()+Math.random();
                            //加结束点
                            let end = {
                                id: 'vtx_g_rang_end'+Math.random(),
                                longitude: lnlt[0],
                                latitude: lnlt[1],
                                markerContent: `
                                    <div>
                                        <div class='vtx-g-rang-exit'>x</div>
                                    </div>
                                `,
                                config: {
                                    width:13,
                                    height:13,
                                    markerContentX: -20,
                                    markerContentY: -20,
                                },
                                index: rangkey
                            };
                            //用addpoint方法加点
                            t.addPoint([end]);
                            //删除提示框  
                            t.removeGraphic('vtx_g_rang_showRangTool','point');
                            t.removeGraphic('vtx_g_rang_showRangTool_line','line');
                            //缓存当前这一条测距数据
                            t.rangingTools[rangkey] = {...t.rangingTool};
                            //回调测距参数
                            if(t.rangingTool.mapRangingTool){
                                t.rangingTool.mapRangingTool({
                                    distance: t.rangingTool.distance,
                                    lnglats: t.rangingTool.line.paths
                                })
                            }
                        }
                    }
                }
                if(status !== 'dbl'){
                    //100毫秒内点击2次 则结束
                    if(!t.rangingTool.isDbclick){
                        t.rangingTool.isDbclick = true;
                    }else{
                        if(t.rangingTool.dbclickTimer){
                            clearTimeout(t.rangingTool.dbclickTimer);
                        }
                        t.rangingTool.isDbclick = false;
                        t.rangingToolEndFun(e);
                    }
                    t.rangingTool.dbclickTimer = setTimeout(()=>{
                        fun();
                    },200)
                }else{
                    fun();
                }
            }
        }
        if(!t.rangingToolMoveFun){
            t.rangingToolMoveFun = (e)=>{
                //获取测距提示点位
                let rp = {...t.GM.getGraphicParam('vtx_g_rang_showRangTool').attributes};
                //删除多余数据,避免other层级太多
                delete rp.other;
                let rcontent = rp.markerContent;
                if(t.rangingTool.points.length > 0){
                    let distance = t.calculatePointsDistance(
                        [e.latLng.lng(),e.latLng.lat()],
                        [t.rangingTool.points[t.rangingTool.points.length-1].longitude,
                        t.rangingTool.points[t.rangingTool.points.length-1].latitude],
                        t.state.gis,
                        t.grwkid
                    );
                    // 实时计算距离
                    distance += t.rangingTool.distance;
                    let distext = distance > 1000
                        ?`总长:${Math.round(distance/10)/100}公里`:`总长:${distance}米`;
                    rcontent = `
                        <div class='vtx-g-rang-showRangTool'>
                            <div>${distext}</div>
                            <div>单击确定地点,双击结束</div>
                        </div>
                    `;
                    //测距移动的线
                    let sl = {
                        id: 'vtx_g_rang_showRangTool_line',
                        paths: [
                            [   t.rangingTool.points[t.rangingTool.points.length-1].longitude,
                                t.rangingTool.points[t.rangingTool.points.length-1].latitude
                            ],
                            [e.latLng.lng(),e.latLng.lat()]
                        ],
                        config: {
                            color: '#108ee9',
                            lineWidth: 2,
                            lineType: 'dashed',
                            pellucidity: 0.5
                        }
                    };
                    if(!t.GM.getGraphic('vtx_g_rang_showRangTool_line')){
                        t.addLine([sl]);
                        t.GM.getGraphic('vtx_g_rang_showRangTool_line').addListener('dblclick',(e)=>{
                            t.rangingToolEndFun(e)
                        })
                    }else{
                        t.updateLine([sl]);
                    }
                }
                rp = {
                    ...rp,
                    longitude: e.latLng.lng(),
                    latitude: e.latLng.lat(),
                    markerContent: rcontent
                }
                t.updatePoint([rp],'nodeg');
            }
        }
        if(!t.rangingToolEndFun){
            t.rangingToolEndFun = (e)=>{
                t.state.gis.disableDoubleClickZoom = false;
                //测距完结
                if(t.rangingTool.isRanging){
                    if(t.rangingTool.points.length > 0){
                        //处理点击和双击事件逻辑
                        t.rangingToolFun(e,'dbl');
                        //回调测距参数
                        if(t.rangingTool.mapRangingTool){
                            t.rangingTool.mapRangingTool({
                                distance: t.rangingTool.distance,
                                lnglats: t.rangingTool.line.paths
                            });
                        }
                    }else{
                        //删除提示框  
                        t.removeGraphic('vtx_g_rang_showRangTool','point');
                    }
                    //关闭监听事件
                    for(let i in  t.rangingTool.eventList){
                        if(t.rangingTool.eventList[i]){
                            t.rangingTool.eventList[i].remove();
                        }
                    }
                    t.rangingTool = {
                        ...t.rangingTool,
                        isRanging: false,//是否开启状态
                        line: {},//线缓存
                        points: [],//点
                        distance: 0,//测距长度
                        isDbclick: false,
                        dbclickTimer: null
                    }
                    t.rangingToolFun = null;
                    t.rangingToolMoveFun = null;
                    t.state.gis.draggableCursor = 'url("http://maps.gstatic.cn/mapfiles/openhand_8_8.cur"), default';
                }
            }
        }
        //避免鼠标在图元上 测距工具不起作用
        gids.forEach((item)=>{
            t.rangingTool.eventList[item] = t.GM.getGraphic(item).addListener('mousemove',(e)=>{
                if(t.rangingTool.isRanging && t.rangingToolMoveFun){
                    t.rangingToolMoveFun(e);
                }
            })
        })
        //地图鼠标移入事件
        t.rangingTool.eventList['mouseover'] = t.state.gis.addListener('mouseover',(e)=>{
            //鼠标移出地图时,删除测距显示点
            if(t.rangingTool.isRanging){
                let rp = {
                    id: 'vtx_g_rang_showRangTool',
                    longitude: e.latLng.lng(),
                    latitude: e.latLng.lat(),
                    markerContent: `
                        <div class='vtx-g-rang-showRangTool'>单击确定起点</div>
                    `,
                    config: {
                        markerContentX: 20,
                        markerContentY: 20
                    }
                }
                t.addPoint([rp],'nodeg');
            }
        });
        //地图鼠标移出事件
        t.rangingTool.eventList['mouseout'] = t.state.gis.addListener('mouseout',(e)=>{
            //鼠标移出地图时,删除测距显示点
            if(t.rangingTool.isRanging){
                t.removeGraphic('vtx_g_rang_showRangTool','point');
            }
        });
        //地图鼠标移动事件
        t.rangingTool.eventList['mousemove'] = t.state.gis.addListener('mousemove',(e)=>{
            //鼠标移动地图时,删除测距显示点
            if(t.rangingTool.isRanging && t.rangingToolMoveFun){
                t.rangingToolMoveFun(e);
            }
        });
        //双击事件
        t.rangingTool.eventList['dblclick'] = t.state.gis.addListener('dblclick',(e)=>{
            t.rangingToolEndFun(e);
        });
    }
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
            ary = pointIds.filter((item,index)=>{
                return item.indexOf(vtx_g_rang) == -1;
            });
        }else{
            if(Object.prototype.toString.apply(arg) === '[object Array]'){
                ary = arg;
            }else if(typeof arg === 'string'){
                ary = arg.split(',');
            }
        }
        t.clusterIdList = ary;
        //过滤moveTo的点位
        //缓存所有聚合的点位
        let allps = [];
        for(let i = 0 ; i < ary.length ; i++){
            let gc = t.GM.getGraphic(ary[i]);
            allps.push(gc);
            //加入label图元
            if(gc.ishaveLabel){
                allps.push(t.GM.getGraphic(`${ary[i]}_vtxoMap_label`));
            }
        }
        return allps;
    }
    /*地图事件处理*/
    //地图点击事件
    clickMap(){
        let t =this;
        if(typeof(t.props.clickMap) ==="function"){
            t.state.gis.addListener('click',(e)=>{
                //测距点击事件
                if(t.rangingTool.isRanging){
                    t.rangingToolFun(e);
                }else{
                    let obj = t.getMapExtent();
                    obj.e = e;
                    obj.clickLngLat = e.point;
                    obj.pixel = {
                        x: e.va.x - t.mapLeft,
                        y: e.va.y - t.mapTop
                    };
                    t.props.clickMap(obj);
                }
            });
        }
    }
    //地图拖动之前事件
    dragMapStart(){
        let t = this;
        if(typeof(t.props.dragMapStart) === 'function'){
            t.state.gis.addListener('dragstart',(e)=>{
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
            t.state.gis.addListener('dragend',(e)=>{
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
            t.state.gis.addListener('bounds_changed',(e)=>{
                if(t.pointCollectionId){
                    $(`#${t.pointCollectionId}`).css({visibility: 'hidden'});
                }
                //区别是否在移动状态
                if(!t.isZoomming && !t.isMoving){
                    if(t.oldZoomLevel == t.state.gis.getZoom()){
                        t.isMoving = true;
                        let obj = t.getMapExtent();
                        obj.e = e;
                        t.props.moveStart(obj);
                    }
                }
            })
        }
    }
    //google地图没有move事件和zoomEnd事件,通过模拟实现
    moveEndAndZoomEnd(){
        let t = this;
        if(typeof(t.props.moveEnd) === 'function' || 
            typeof(t.props.zoomEnd) === 'function' ||
            typeof(t.props.moveStart) === 'function'||
            typeof(t.props.zoomStart) === 'function'){
            t.state.gis.addListener('idle',(e)=>{
                if(t.pointCollectionId){
                    $(`#${t.pointCollectionId}`).css({visibility: 'inherit'});
                }
                let obj = t.getMapExtent();
                obj.e = e;
                //区别是否在移动状态-同时判断是moveEnd还是zoomEnd
                if(t.isMoving){
                    t.isMoving = false;
                }
                if(t.isZoomming){
                    t.isZoomming = false;
                }
                if(t.oldZoomLevel != t.state.gis.getZoom()){
                    t.oldZoomLevel = t.state.gis.getZoom();
                    if(typeof(t.props.zoomEnd) === 'function'){
                        t.props.zoomEnd(obj);
                    }
                }else{
                    if(typeof(t.props.moveEnd) === 'function'){
                        t.props.moveEnd(obj);
                    }
                }
                //更新海量点
                if(t.props.mapPointCollection){
                    t.updatePointCollection(t.props.mapPointCollection);
                }
            })
        }
    }
    //地图更改缩放级别开始时触发触发此事件
    zoomStart(){
        let t = this;
        if(typeof(t.props.zoomStart) === 'function'){
            t.state.gis.addListener('zoom_changed',(e)=>{
                if(t.pointCollectionId){
                    $(`#${t.pointCollectionId}`).css({visibility: 'hidden'});
                }
                if(!t.isZoomming){
                    t.isZoomming = true;
                    let obj = t.getMapExtent();
                    obj.e = e;
                    t.props.zoomStart(obj);
                }
            });
        }
    }
    //对外使用方法
    //显示隐藏的图元
    showGraphicById (id){
        let t = this;
        if(t.GM.getGraphic(id)){
            t.GM.getGraphic(id).setVisible(true);
        }
    }
    //隐藏图元
    hideGraphicById(id){
        let t = this;
        if(t.GM.getGraphic(id)){
            t.GM.getGraphic(id).hide(false);
        }
    }
    //内部公共方法区
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
                lng = gg.getPosition().lng();
                lat = gg.getPosition().lat();
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
                pts = gg.getPath().getArray().map((item,index)=>{
                    return [item.lng(),item.lat()]
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
                pts = gg.getPath().getArray().map((item,index)=>{
                    return [item.lng(),item.lat()]
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
                lng = gg.getCenter().lng();
                lat = gg.getCenter().lat();
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
    //获取地图当前的位置状态信息
    getMapExtent() {
        let t = this;
        let nowBounds = t.state.gis.getBounds();
        let obj = {};
        obj.southWest = {
            lng : nowBounds.getNorthEast().lng(),
            lat : nowBounds.getNorthEast().lat()
        };
        obj.northEast = {
            lng : nowBounds.getSouthWest().lng(),
            lat : nowBounds.getSouthWest().lat()
        };
        obj.nowCenter = t.state.gis.getCenter();
        obj.zoom = t.state.gis.getZoom();
        obj.mapSize = {
            width: t.state.gis.getDiv().offsetWidth,
            height: t.state.gis.getDiv().offsetHeight
        };
        obj.radius = t.calculatePointsDistance([obj.nowCenter.lng(),obj.nowCenter.lat()],
                                                [obj.northEast.lng,obj.northEast.lat]);
        return obj;
    }
    //获取当前比例尺
    getZoomLevel (){
        let t =this;
        return t.state.gis.getZoom();
    }
    //处理线和面的 经纬度数据
    dealData(ms){
        //区别点和圆的经纬度数据处理
        let lnglatAry = [],_extent = {xmax: 0,xmin: 0,ymax: 0,ymin: 0},path=[];
        if('getPath' in ms){
            path = ms.getPath().getArray();
            path = path.map((item,index)=>{
                let lng = item.lng(),lat = item.lat();
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
    //点位移动动画效果
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
                let gc = t.GM.getGraphic(id),
                    gc_label = t.GM.getGraphic(`${id}_vtxoMap_label`);
                if(!gc){
                    clearInterval(t.moveToTimer);
                }else{
                    if(gc.isAdded){
                        t._cluster.removeMarker(gc);
                    }
                    if(gc_label && gc_label.isAdded){
                        t._cluster.removeMarker(gc_label);
                    }
                    let gg = gc.getPosition();
                    let tx = gg.lng() + rx,ty = gg.lat() + ry;
                    gc.setPosition(new t.omap.LatLng({lng:tx,lat:ty}));
                    if(gc_label){
                        gc_label.setPosition(new t.omap.LatLng({lng:tx,lat:ty}));
                    }
                    t.movePoints[i].waitTime = 0;
                    if(deleteTime <= 0){
                        deleteIndex.push(i);
                    }
                }
            }
            deleteIndex.sort((a,b)=>{return b-a});
            for(let i = 0 ; i < deleteIndex.length ; i++){
                let {id,rx,ry,waitTime,deleteTime} = t.movePoints[deleteIndex[i]],
                    gc = t.GM.getGraphic(id),
                    gc_label = t.GM.getGraphic(`${id}_vtxoMap_label`);
                if(t.clusterIdList.indexOf(id) > -1){
                    t._cluster.addMarker(gc);
                    if(gc_label){
                        t._cluster.addMarker(gc_label);
                    }
                }
                t.movePoints.splice(deleteIndex[i],1);
            }
            if(nowMovePoints.length == 0){
                clearInterval(t.moveToTimer);
            }
        },10);
    }
    //点位移动逻辑
    moveTo(id,lnglat,delay,autoRotation,urlright,urlleft){
        let t = this,timer = 10,
            gc = t.GM.getGraphic(id);
            delay = eval(delay || 3)*1000;
        let count = delay/timer;
        let s = gc.getPosition(),e = new t.omap.LatLng({lng:lnglat[0],lat:lnglat[1]});
        if(s.equals(e)){
            return false;
        }else{
            let url= null;
            //计算角度,旋转
            if(autoRotation && !gc.isMarkerContent){
                let ddeg = t.rotateDeg(s,e);
                if(urlleft && (ddeg < -90 && ddeg > -270)){
                    ddeg += 180;
                    url = urlleft;
                }else{
                    url = urlright;
                }
                let icon = gc.getIcon(),iconUrl = '';
                // 360deg 不需要旋转
                if(ddeg%360 != 0){
                    iconUrl = new RotateIcon({
                        url: url,
                        width: icon.size.width,
                        height: icon.size.height
                    });
                }
                gc.setIcon({...icon,url: iconUrl.setRotation(ddeg).getUrl()})
            }
            //拆分延迟移动定位
            let rx = (e.lng() - s.lng())/count, ry = (e.lat() - s.lat())/count;
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
        let t = this,
            deg = 0,
            ftp = t.canvasProjectionOverlay.getProjection(),
            spLngLat = sp,epLngLat = ep;
        if(ftp){
            if(Array.isArray(sp)){
                spLngLat = new t.omap.LatLng({lng:sp[0],lat:sp[1]})
            }
            if(Array.isArray(ep)){
                spLngLat = new t.omap.LatLng({lng:ep[0],lat:ep[1]})
            }
            let s = ftp.fromLatLngToContainerPixel(spLngLat),
            //获取当前点位的经纬度
                e = ftp.fromLatLngToContainerPixel(epLngLat);
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
        }
        return deg;
    }
    /*
        匹配控件位置方法
        (谷歌地图有8个方位,为了统一,只使用左上,左下,右上,右下)
     */
    matchControlPosition(location){
        let position = google.maps.ControlPosition.RIGHT_BOTTOM;
        switch(location){
            case 'tl':
                position = google.maps.ControlPosition.LEFT_TOP;
            break;
            case 'bl':
                position = google.maps.ControlPosition.LEFT_BOTTOM
            break;
            case 'tr':
                position = google.maps.ControlPosition.RIGHT_TOP;
            break;
            case 'br':
                position = google.maps.ControlPosition.RIGHT_BOTTOM;
            break;
        }
        return position;
    }
    /*
        地图内部需要公共方法
     */
    calculatePointsDistance(fp,ep){
        if(google.maps.geometry && google.maps.geometry.spherical){
            return Math.round(google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng({lng:fp[0],lat:fp[1]})
                    ,
                    new google.maps.LatLng({lng:ep[0],lat:ep[1]})
                )*100)/100;
        }
        return 0;
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
        return google.maps.geometry.spherical.computeArea(t.GM.getGraphic(id).getPath().getArray());
    }
    //计算多个点的距离(常用于线计算)[入参是 google 经纬度对象数组]
    calculateGraphicDistance(ary){
        var t = this;
        return google.maps.geometry.spherical.computeLength(ary);
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
    //渲染
    render(){
        let t = this;
        let _map = this.props;
        return(
            <div id={_map.mapId}  style={{width:'100%',height:'100%'}}></div>
        );
    }
    //初始化
    componentDidMount(){
        let t = this;
        t.loadMapComplete.then(()=>{
            t.mapLeft = document.getElementById(t.props.mapId).offsetLeft;
            t.mapTop = document.getElementById(t.props.mapId).offsetTop;
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
        /*设置指定图元展示*/
        if((typeof(setVisiblePoints) == 'boolean' && setVisiblePoints) || (setVisiblePoints && setVisiblePoints !== t.props.setVisiblePoints)){
            t.setVisiblePoints(mapVisiblePoints);
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
        if(t.loadLabel){
            clearInterval(t.loadLabel);
        }
        if(t.upPsTimer){
            clearTimeout(t.upPsTimer);
        }
        if(t.addPsTimer){
            clearTimeout(t.addPsTimer);
        }
        if(t.state.gis){
            t.state.gis.clearOverlays();
        }
        t.state.gis = null;
        if(t.moveToTimer){
            clearInterval(t.moveToTimer);
        }
        window.VtxMap[t.state.mapId]= null;
    }
}

export default Map;