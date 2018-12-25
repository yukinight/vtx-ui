import React from 'react';
import { connect } from 'dva';
import styles from './modal.less';

import {VtxModal} from 'vtx-ui';
const {DraggableModal} = VtxModal;
import {Button,Input} from 'antd';

function IndexPage({dispatch,vtxModal}) {
    const {visible, visible2} = vtxModal;
    function updateState(obj) {
        dispatch({
            type: 'vtxModal/updateState',
            payload: obj
        })
    }
    return (
        <div className={styles.normal}>
            <Button className={styles.btn} onClick={()=>updateState({visible:true})}>弹窗</Button>
            <Button className={styles.btn} onClick={()=>updateState({visible2:true})}>弹窗2</Button>

            <VtxModal 
                title={'adfasfd'}
                visible={visible}
                wrapClassName={'adhfas'}
                onCancel={()=>updateState({visible:false})}
            >
                <Input 
                    onPressEnter={()=>{console.log(1111)}}
                />
            </VtxModal>

            <DraggableModal 
                key='movemd'
                title={'可拖动的弹框'}
                visible={visible2}
                wrapClassName={'adhfas'}
                onCancel={()=>updateState({visible2:false})}
            >
                <Input 
                    onPressEnter={()=>{console.log(1111)}}
                />
            </DraggableModal>
        </div>
    );
}

export default connect(
    ({vtxModal})=>({vtxModal})
)(IndexPage);
