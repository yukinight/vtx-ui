import React from 'react';
import AMap from './AMap/AMap';
import BMap from './BMap/Map';
import TMap from './TMap/TMap';
import GMap from './GMap/Map';
import './Map.less';

class VtxMap extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        const t = this;
        let {mapType,getMapInstance,...newProps} = t.props;
        if(typeof(getMapInstance)=='function'){
            newProps.ref=(map)=>{
                if(map){
                    getMapInstance(map);
                }
            }
        }
        switch(mapType){
            case 'amap':
                return (<AMap {...newProps}></AMap>);
            case 'tmap':
                return (<TMap {...newProps}></TMap>);
            case 'gmap':
                return (<GMap {...newProps}></GMap>);
            default:
                return (<BMap {...newProps}></BMap>);
        }
    }
}

export default VtxMap;