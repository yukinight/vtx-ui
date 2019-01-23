import React from 'react';
import { connect } from 'dva';
import styles from './upload.less';
import {VtxExport} from 'vtx-ui';

const {VtxExport2} = VtxExport;

function IndexPage(props) {
    const exportProps = {
        downloadURL:'http://localhost:8002/',
        rowButton:false,
        afterExport(){
            console.log('finish')
        },
        getExportParams(exportType){
            const columnNames = "编号,名称,所属处置单位,监测类型,开始运行日期,排序号",
                columnFields = "code,name,factoryName,deviceTypeName,validStartTime,orderIndex",
                tenantId = '377ec8c660f74f95a13f059049877fcb',
                userId = 'b1a14052512e4648b015812eef2b50e9';
            switch (exportType){
                case 'rows':
                    return {
                        authParam:{
                            tenantId,
                            userId,
                        },
                        param:{
                            ...{aa:111,bb:222},
                            columnNames,
                            columnFields,
                            downloadAll: false,
                            downloadIds: [1,2,3,4,5]
                        },
                    };
                case 'page':
                    return {
                        authParam:{
                            tenantId,
                            userId,
                        },
                        param:{
                            ...{aa:111,bb:222},
                            columnNames,
                            columnFields,
                            downloadAll: false,
                            downloadIds: [1,2,3,4,5]
                        },
                    };
                case 'all':
                    return {
                        authParam:{
                            tenantId,
                            userId,
                        },
                        param:{
                            ...{aa:111,bb:222},
                            columnNames,
                            columnFields,
                            downloadAll: true,
                        },
                    };
            }
        }
    }

    return (
      <div>
        <div className={styles.item}>
            <VtxExport {...exportProps}/>
            <VtxExport2 {...exportProps}/>
        </div>
      </div>
    )
}


export default connect(({upload})=>upload)(IndexPage);
