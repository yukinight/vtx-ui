import React from 'react';
import Map from './Map';
import Immutable from 'immutable';

class OptimizingPointMap extends React.Component{
    constructor(props){
        super(props);
        this.map = null;
        this.mapLoaded = false;
        this.MPP = new mapPointsProcessor(props.gridSpacing || 40);
        this.state= {
            filterPoints:[]
        }
    }
    
    resetPoints(props, eType){
        let mcfg = this.map.getMapExtent();

        const param = {
            mapHeight:mcfg.mapSize.height,
            mapWidth:mcfg.mapSize.width,
            minLat:mcfg.southWest.lat,
            maxLat:mcfg.northEast.lat,
            minLng:mcfg.southWest.lng,
            maxLng:mcfg.northEast.lng,
            eType,
            allPoints:props.mapPoints,
            reservedPoints:props.reservedPoints
        }

        this.setState({
            filterPoints:this.MPP.pointFilter(param)
        })
        
    }
    componentDidMount(){
        this.map.loadMapComplete.then(()=>{
            this.resetPoints(this.props);
            this.mapLoaded = true;
        })
    }
    componentWillReceiveProps(nextProps){
        if(this.mapLoaded && !this.deepEqual(this.props.reservedPoints, nextProps.reservedPoints) || !this.deepEqual(this.props.mapPoints, nextProps.mapPoints)){
            // 外部点数据改变，更新内部点数据
            this.resetPoints(nextProps);
        }
    }
    deepEqual(a,b){
        return Immutable.is(Immutable.fromJS(a),Immutable.fromJS(b));
    }
    zoomEnd(obj){
        this.resetPoints(this.props,'zoom');
        if(typeof(this.props.zoomEnd) ==="function"){
            this.props.zoomEnd(obj);
        }
    }
    moveEnd(obj){
        this.resetPoints(this.props,'move');
        if(typeof(this.props.moveEnd) ==="function"){
            this.props.moveEnd(obj);
        }
    }
    render(){      
        // console.log('优化后剩余点数：'+this.state.filterPoints.length)  
        const newProps = {
            ...this.props,
            zoomEnd:this.zoomEnd.bind(this),
            moveEnd:this.moveEnd.bind(this),
            mapPoints:this.state.filterPoints,
            getMapInstance:(p)=>{
                if(p){
                    this.map = p;
                }
                if(typeof(this.props.getMapInstance) ==="function"){
                    this.props.getMapInstance(p);
                }
            }
        }
        delete newProps.gridSpacing;
        delete newProps.reservedPoints;

        return (<Map {...newProps} />)
    }
}


class mapPointsProcessor{
    constructor(gridSpacing){
        this.GRIDSPACING = gridSpacing || 40;
        this.mapHeight = null; //地图高度
        this.mapWidth = null; //地图宽度
        // 若地图大小不变，zoom不变，网格的经纬度间隔应该保持不变以保证前后两次网格位置保持一致
        this.lngInterval = null; //划分的网格经度间隔
        this.latInterval = null; //划分的网格纬度间隔
        this.maxLat = null,
        this.minLat = null,
        this.maxLng = null,
        this.minLng = null
    }
    resetMapConfig(param){
        // 若没传地图相关参数默认使用上次的地图参数
        const {mapHeight,mapWidth,maxLat,minLat,maxLng,minLng,eType} = param;
        this.maxLat = maxLat || this.maxLat;
        this.minLat = minLat || this.minLat;
        this.maxLng = maxLng || this.maxLng;
        this.minLng = minLng || this.minLng;
        // 当操作为zoom（改变最大最小经纬度）或地图宽高改变则重新计算网格
        if(eType=='zoom' || (mapHeight && mapHeight != this.mapHeight) || (mapWidth && mapWidth != this.mapWidth)){
            this.mapHeight = mapHeight || this.mapHeight;
            this.mapWidth = mapWidth || this.mapWidth;
            this.calGridInterval();
        }
    }
    calGridInterval(){
        const x_num = Math.ceil(this.mapWidth/this.GRIDSPACING);
        const y_num = Math.ceil(this.mapHeight/this.GRIDSPACING);
        this.lngInterval = parseFloat(((this.maxLng - this.minLng)/x_num).toFixed(6));
        this.latInterval = parseFloat(((this.maxLat - this.minLat)/y_num).toFixed(6));
    }
    pointFilter(param){
        // allPoints为必填参数
        const {allPoints, reservedPoints=[]} = param;
        this.resetMapConfig(param);

        let hashPoints = {};
        for(let i=0,len=allPoints.length;i<len;i++){
            let p_lng = allPoints[i].longitude;
            let p_lat = allPoints[i].latitude;
            if(p_lng>this.maxLng || p_lng<this.minLng || p_lat>this.maxLat || p_lat<this.minLat){
                continue;
            }
            let x_index = parseInt(p_lng/this.lngInterval);
            let y_index = parseInt(p_lat/this.latInterval);
            let hashIndex = x_index + '-' + y_index;
            if(!hashPoints[hashIndex]){
                hashPoints[hashIndex] = allPoints[i];
            }
        }

        let filteredPoints = [...reservedPoints];
        let reservedIds = reservedPoints.map((item)=>item.id);
        for(let k in hashPoints){
            let the_point = hashPoints[k];
            if(reservedIds.indexOf(the_point.id)==-1){
                filteredPoints.push(the_point);
            }
        }
     
        return filteredPoints;
    }
}


export default OptimizingPointMap;