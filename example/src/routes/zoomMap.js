import React from 'react';
import {connect} from 'dva';
import {VtxZoomMap} from 'vtx-ui';
import style from './zoomMap.less';

const Zoom = (props)=>{
    const {dispatch, zoomMap} = props;
    const mapProps = {
        ...zoomMap,
        clickGraphic(obj) {
            // console.log(obj.attributes.id);
            console.log('id:',obj.attributes.id);
        },
        zoomEnd(obj){
            console.log('zoom:',obj.zoom);
        }
    }
    return (
        <div style={{height:'100%'}}>
            <div className={style.btCT}>
                <button  onClick={()=>{
                    dispatch({type:'zoomMap/getNewPoints'})
                }}>刷新点数据</button>
                <button  onClick={()=>{
                   dispatch({type:'zoomMap/changeZoom'})
                }}>调整zoom为16</button>
                <button  onClick={()=>{
                   dispatch({type:'zoomMap/setFitView'})
                }}>设置fitview</button>
            </div>
            <VtxZoomMap {...mapProps}/>
        </div>
    )
        
    
}

export default connect(({zoomMap})=>({zoomMap}))(Zoom);