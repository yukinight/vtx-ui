import React from 'react';
import {connect} from 'dva';
import styles from './searchMap.less';
import {VtxSearchMap} from 'vtx-ui';
import {Button} from 'antd';

function IndexPage({dispatch,searchMap}) {
    const {modal1Visible,mapCenter,modal2Visible} = searchMap;
    function callback(lglt) {
        console.log(JSON.stringify(lglt));
        dispatch({
            type: 'searchMap/updateState',
            payload: {
                modal1Visible: false,
                mapCenter: lglt
            }
        })
    }
    function tolocation() {
        dispatch({
            type: 'searchMap/updateState',
            payload: {
                modal1Visible: true
            }
        })
    }
    return (
        <div className={styles.normal}>
            <Button className={styles.test} type="primary" onClick={tolocation} icon={'search'}>定位</Button>
            <Button className={styles.test} type="primary" onClick={()=>{
                dispatch({
                    type: 'searchMap/updateState',
                    payload: {
                        modal2Visible: true
                    }
                })
            }} icon={'search'}>绘制</Button>
            <VtxSearchMap 
                graphicType="point" 
                closeModal={()=>{
                    dispatch({
                        type: 'searchMap/updateState',
                        payload: {
                            modal1Visible: false,
                        }
                    })
                }}
                callback={callback}
                mapCenter={mapCenter}
                modal1Visible={modal1Visible}
            />
            <VtxSearchMap 
                graphicType="polyline" 
                closeModal={()=>{
                    dispatch({
                        type: 'searchMap/updateState',
                        payload: {
                            modal2Visible: false,
                        }
                    })
                }}
                callback={(data)=>{
                    console.log(data)
                    dispatch({
                        type: 'searchMap/updateState',
                        payload: {
                            modal2Visible: false,
                        }
                    })
                }}
                mapCenter={mapCenter}
                modal1Visible={modal2Visible}
                clearDrawnGraph={false}
            />
        </div>
    )
}

export default connect(
    ({searchMap})=>({searchMap})
)(IndexPage);