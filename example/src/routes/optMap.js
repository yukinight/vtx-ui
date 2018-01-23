import React from 'react';
import {connect} from 'dva';
import {VtxOptMap} from 'vtx-ui';
import style from './zoomMap.less';

const Map = (props)=>{
    const {dispatch, optMap} = props;
    console.log('初始化点数：'+optMap.mapPoints.length);
    const mapProps = {
        ...optMap,
        zoomEnd(obj){
            console.log('zoom:',obj.zoom);
        },
        clickGraphic(obj) {
            console.log('id:',obj.attributes.id);
        }
    }
    return (
        <div style={{height:'100%'}}>
            <div className={style.btCT}>
                
            </div>
            <VtxOptMap {...mapProps}/>
        </div>
    )
}

export default connect(({optMap})=>({optMap}))(Map);