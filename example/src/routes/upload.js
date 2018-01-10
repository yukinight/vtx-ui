import React from 'react';
import { connect } from 'dva';
import styles from './upload.less';
import {VtxUpload,VtxUpload2,VtxUploadModal,VtxExport,VtxExport2,VtxImport} from 'vtx-ui';
import { message, Tag, Button } from 'antd';

function IndexPage(props) {
  const {fileList, dispatch, showUploadModal,fileListVersion} = props;
  console.log('当前文件列表为：',fileList);
  const vtxProps1 = {
        action: 'http://192.168.1.207:18084/cloudFile/common/uploadFile',
        downLoadURL:'http://192.168.1.207:18084/cloudFile/common/downloadFile?id=',
        fileList,   // 重要：保存在数据store的文件数组
        multiple:true,
        fileListVersion,
        // viewMode:true,
        onSuccess(file){
          message.info(`${file.name} 上传成功`);
          console.log('上传完毕返回结果：')
          console.log(file)
          dispatch({type:'upload/fetch',payload:{
            fileList:[
              ...fileList,
              {
                name:file.name,
                id:file.id
              }
            ]
          }})
        },
        onError(res){
           message.info(`${res.name} 上传失败.`);
        },
        onRemove(file){
          dispatch({type:'upload/removeFile',payload:{
            fileId:file.id
          }});
          dispatch({type:'upload/updateVersion'});
          return false;
        }
    };

    window.test=()=>{
      dispatch({type:'upload/fetch',payload:{
            fileListVersion:fileListVersion+1,
          }})
    }
    const vtxProps2 = {
        fileList,   // 重要：保存在数据store的文件数组
        listType:'picture-card',
        accept:"image/png, image/jpeg", // 接受上传的文件类型
        fileListVersion,//将外部的fileList数据同步到组件内部的控制开关
        // viewMode:true, // 浏览模式，不可上传和删除
        // mode:'single',
        onSuccess(file){
          message.info(`${file.name} 上传成功`);
          console.log('上传完毕返回结果：')
          console.log(file)
          dispatch({type:'upload/fetch',payload:{
            fileList:[
              ...fileList,
              file
            ]
          }})
        },
        onError(res){
           message.info(`${res.name} 上传失败.`);
        },
        onRemove(file){
          console.log(file)
          dispatch({type:'upload/removeFile',payload:{
            fileId:file.id
          }});
        }
    };
    const vtxProps3 = {
        fileList,   // 重要：保存在数据store的文件数组
        listType:'picture',
        mode:'single',
        // viewMode:true,
        onSuccess(file){
          message.info(`${file.name} 上传成功`);
          console.log('上传完毕返回结果：')
          console.log(file)
          dispatch({type:'upload/fetch',payload:{
            fileList:[
              {
                name:file.name,
                id:file.id
              }
            ]
          }})
        },
        onError(res){
           message.info(`${res.name} 上传失败`);
        },
        onRemove(file){
          dispatch({type:'upload/removeFile',payload:{
            fileId:file.id
          }});
        }
    };

    const vtxProps4 = {
        fileList,   // 重要：保存在数据store的文件数组
        multiple:true, //是否支持多选文件，ie10+ 支持。开启后按住 ctrl 可选择多个文件。
        showUploadList: false, //自定义文件列表
        customizedButton: <Button shape="circle" icon="plus" />, //自定义上传按钮 
        onSuccess(file){
          message.info(`${file.name} 上传成功`);
          console.log('上传完毕返回结果：')
          console.log(file)
          dispatch({type:'upload/fetch',payload:{
            fileList:[
              ...fileList,
              {
                name:file.name,
                id:file.id
              }
            ]
          }})
        },
        onError(res){
           message.info(`${res.name} 上传失败`);
        },
        onRemove(file){
          dispatch({type:'upload/removeFile',payload:{
            fileId:file.id
          }});
        }
    };

    const vtxModalProps = {
        modal:{
            visible: showUploadModal,
            /*setContent(files){
                return (
                    <div>
                        {files.map((item,index)=><Tag key={index} color={colorList[index%colorList.length]}>{item.name}</Tag>)}
                    </div>
                )
            },*/
            onOk(files){
                console.log(files);
                dispatch({type:'upload/fetch',payload:{
                    fileList:files
                }})
            },
            onCancel(){
                dispatch({type:'upload/fetch',payload:{
                    showUploadModal:false,
                    fileListVersion:fileListVersion+1
                }});
            },
        },
        upload:{
            fileList,   // 重要：保存在数据store的文件数组
            multiple:true,
            fileListVersion,
            onError(res){
                message.info(`${res.name} 上传失败`);
            },
        },
        template:'http://120.27.248.90:18088/cloud/jcss/device/downloadTemplate.smvc'
    };

    const exportProps = {
        downloadURL:'http://localhost:8002/',
        rowButton:false,
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

    let colorList = ["pink", "red", "orange", "green", "cyan", "blue","purple"];
    return (
      <div>
        <div className={styles.item}>
          <VtxUpload {...vtxProps1} />
        </div>
        
        <div className={styles.item}>
          <VtxUpload {...vtxProps2} />
        </div>

        <div className={styles.item}>
          <VtxUpload2 {...vtxProps2} />
        </div>
        
        <div className={styles.item}>
          <VtxUpload {...vtxProps3} />
        </div>
        
        <div className={styles.item}>
          <VtxUpload {...vtxProps4} />
          <br/>
          {
            fileList.map((item,index)=><Tag key={index} color={colorList[index%colorList.length]}>{item.name}</Tag>)
          }
        </div>

        <div className={styles.item}>
          <Button icon="upload" onClick={()=>{
            dispatch({type:'upload/fetch',payload:{
              showUploadModal:true
            }});
          }}>导入</Button>
        </div>

        <div className={styles.item}>
            <VtxExport {...exportProps}/>
            <VtxExport2 {...exportProps}/>
        </div>

        {/* <VtxUploadModal {...vtxModalProps}/> */}

        <VtxImport {...importProps}>
        
          <div>66666666666666</div>
        </VtxImport>
      </div>
    )
}


export default connect(({upload})=>upload)(IndexPage);
