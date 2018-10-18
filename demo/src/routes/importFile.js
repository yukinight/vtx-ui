import React from 'react';
import { connect } from 'dva';
import {VtxImport} from 'vtx-ui';
import {Button } from 'antd';
import styles from './upload.less';

function IndexPage(props) {
  const {dispatch, showUploadModal} = props;
    let importProps = {
      templateURL:'http://localhost:8989/',
      uploadURL:'http://localhost:8989/',
      postData:{tenantId:'haha'},
      visible:showUploadModal,
      close(){
        dispatch({type:'upload/fetch',payload:{
          showUploadModal:false
        }});
      },
      afterUpload(data){
        console.log(data)
      }
    }

    return (
      <div>
        <div className={styles.item}>
          <Button icon="upload" onClick={()=>{
            dispatch({type:'upload/fetch',payload:{
              showUploadModal:true
            }});
          }}>导入</Button>
        </div>
        <VtxImport {...importProps}>
          <div>66666666666666</div>
        </VtxImport>
      </div>
    )
}


export default connect(({upload})=>upload)(IndexPage);
