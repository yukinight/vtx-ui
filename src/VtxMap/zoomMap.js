import React from 'react';
import Map from './Map';
import Immutable from 'immutable';

class zoomMap extends React.Component{
    constructor(props){
        super(props);
        this.map = null;
        this.state= {
            filterPoints:[],
        }
    }
    
    resetPoints(mapPoints=[],zoomLv){
        // console.log('当前zoom等级',this.state.zoomLv);
        console.log(this.map.getMapExtent())
        zoomLv = zoomLv || this.map.getZoomLevel();
        if(zoomLv){
            this.setState({
                filterPoints: mapPoints.filter(item=>typeof(item.zoomLevel)=='number'?item.zoomLevel<=zoomLv:true)
            },()=>{
                // console.log(`zoom等级(${this.state.zoomLv})过滤后还有${this.state.filterPoints.length}个点`);
            });
        }
    }
    componentDidMount(){
        // console.log(this.map.getMapExtent())        
        // 地图加载完成取得当前zoom值，初始化内部点数据
        this.resetPoints(this.props.mapPoints);
    }
    componentWillReceiveProps(nextProps){
        if(!this.deepEqual(this.props.mapPoints, nextProps.mapPoints)){
            // 外部点数据改变，更新内部点数据
            this.resetPoints(nextProps.mapPoints);
        }
    }
    deepEqual(a,b){
        return Immutable.is(Immutable.fromJS(a),Immutable.fromJS(b));
    }
    zoomEnd(obj){
        // console.log(obj)
        //zoom操作后，更新内部点数据
        this.resetPoints(this.props.mapPoints);
        
        if(typeof(this.props.zoomEnd) ==="function"){
            this.props.zoomEnd(obj);
        }
    }
    render(){        
        const newProps = {
            ...this.props,
            zoomEnd:this.zoomEnd.bind(this),
            mapPoints:this.state.filterPoints,
            ref:(p)=>{
                if(p){
                    this.map = p;
                }
            }
        }
        // 屏蔽地图默认的setFitView的调整zoom功能，只会重新设置center
        if(newProps.mapVisiblePoints){
            newProps.mapVisiblePoints = {
                ...newProps.mapVisiblePoints,
                type:'center'
            }
        }

        return (<Map {...newProps} />)
    }
}

export default zoomMap;