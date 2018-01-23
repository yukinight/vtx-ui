import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './modal.less';

import {VtxModal} from 'vtx-ui';

import {Button,Input} from 'antd';

function IndexPage({dispatch,vtxModal}) {
    const {visible} = vtxModal;
    function showModal(boolean) {
        dispatch({
            type: 'vtxModal/updateState',
            payload: {
                visible: boolean
            }
        })
    }
    return (
        <div className={styles.normal}>
            <Button className={styles.btn} onClick={()=>showModal(true)}>弹窗</Button>
            <VtxModal 
                title={'adfasfd'}
                visible={visible}
                wrapClassName={'adhfas'}
                onCancel={()=>showModal(false)}
            >
                <Input 
                    onPressEnter={()=>{console.log(1111)}}
                />
            </VtxModal>
        </div>
    );
}

export default connect(
    ({vtxModal})=>({vtxModal})
)(IndexPage);
