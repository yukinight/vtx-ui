import React from 'react';
import { Upload, Button, Icon,message,Modal } from 'antd';

// 默认上传文件接口
const defaultUploadURL = 'http://192.168.1.207:18084/cloudFile/common/uploadFile';
// 默认下载文件地址，与ID挂钩
const defaultDownloadURL = 'http://192.168.1.207:18084/cloudFile/common/downloadFile?id=';
// 默认nginx代理地址，兼容IE10以下的跨域情况
const proxyUploadURL = `http://${document.location.host}/uploadFilesProxy/`;

class VortexUpload extends React.Component{
    constructor(props){
        super(props); 
        let t = this;
        // 初始化上传下载的地址
        this.uploadURL = props.action || defaultUploadURL;
        this.downLoadURL = props.downLoadURL || defaultDownloadURL;
        // 可在外部配置的属性，具体文档参考AntUI
        this.configurableProperty = ['data','showUploadList','multiple','accept','listType',
        'disabled','withCredentials'];

        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: this.getSynFileList()
        };
    }

    getConfig(){
        let t = this;
        let props = this.props;
        // 重置上传下载的地址
        t.uploadURL = props.action || defaultUploadURL;
        t.downLoadURL = props.downLoadURL || defaultDownloadURL;
        let config = {
            action: t.uploadURL,
            fileList: t.state.fileList,
            onChange(info){
                // 此处根据后台返回的数据结构取得文件ID             
                let vtxId =  info.file.response ? info.file.response.data[0].id: undefined;
                let newFileList = info.fileList;
                let newFile = vtxId?{
                    ...info.file,
                    id: vtxId,
                    url: t.downLoadURL+ vtxId
                }:{
                    ...info.file,
                };
                
                if (info.file.status === 'done' && vtxId){
                    newFileList = info.fileList.map((item)=>{
                        if(item.uid==info.file.uid){
                            return {
                                ...item,
                                id: vtxId,
                                url: t.downLoadURL+ vtxId
                            }
                        }
                        return item
                    })
                }
                // 更新组件状态
                if(props.mode=='single' && info.file.status === 'done'){
                    t.setState({fileList: [newFile]});
                }
                else{
                    t.setState({fileList: newFileList});
                }
                // 触发外部方法
                if (info.file.status === 'done') {   
                    if(typeof(props.onSuccess) =='function'){
                        props.onSuccess(newFile);
                    }    
                } else if (info.file.status === 'error') {
                    if(typeof(props.onError)=="function"){
                        props.onError(info.file);
                    }
                }
                
            },
            onRemove(file){
                if(typeof(props.onRemove)=="function"){
                    return props.onRemove(file);
                }
            }
        }

        // 判断浏览器是否<IE10, IE10以下需用代理跨域上传文件，其他使用CORS进行跨域上传文件
        // let matchRes = navigator.userAgent.match(/MSIE (\d+)/);
        // if(matchRes && matchRes[1]<10){
        //判断是否IE
        if(!!window.ActiveXObject || "ActiveXObject" in window){
            config.action = proxyUploadURL;
        }
        
        // 继承相关配置
        for(let p of  t.configurableProperty){
            if(props[p]!==undefined){
                config[p] = props[p];
            }
        }
        // viewMode
        if(props.viewMode && props.showUploadList!==false){
            config.showUploadList = {showRemoveIcon: false};
        }
        if(props.listType =='picture-card'){
            config.onPreview = t.handlePreview.bind(t);
            // if(typeof(config.showUploadList)=='object'){
            //     config.showUploadList.showPreviewIcon = false;
            // }
            // else{
            //     config.showUploadList = { showPreviewIcon: false }
            // }
        }

        return config;
    }

    getSynFileList(props){
        let t =this;
        props = props||this.props;
        let processedFileList = props.fileList || [];
        // 单文件模式只取第一个
        if(props.mode=='single' && processedFileList.length>1){
            processedFileList = [processedFileList[0]];
        }
        processedFileList = processedFileList.map((item, index)=>{
            // 将外部传入的简易文件数组处理成为组件需要的数组结构
            if(item.name===undefined || item.id===undefined){
                console.error('文件列表的name和id属性不能为空');
            }
            let itemURL = item.url || t.downLoadURL+item.id;
            return {
                ...item,
                uid: -1-index,
                status: 'done',
                url:itemURL,
                thumbUrl: itemURL,
            }
        })
        return processedFileList;
    }

    componentWillReceiveProps(nextProps){
        if(this.props.fileListVersion!=nextProps.fileListVersion){
                this.setState({
                fileList: this.getSynFileList(nextProps)
            });
        }
    }
    handlePreview(file){
        this.setState({
          previewImage: file.url || file.thumbUrl,
          previewVisible: true,
        });
    }
    handleCancel(){
        this.setState({ previewVisible: false })
    }
    render(){
        return (
            <div>
            <Upload {...this.getConfig()}>
                {
                    this.props.viewMode ? null : 
                    (this.props.customizedButton ||
                        (this.props.listType =='picture-card' ? 
                            <div>
                                <Icon type="plus" style={{fontSize: '28px',color: '#999'}}/>
                                <div className="ant-upload-text">上传</div>
                            </div>
                            :
                            <Button>
                                <Icon type="upload" />上传
                            </Button>
                        )
                    )
                }
                
            </Upload>
            {
                this.props.listType =='picture-card'?
                <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel.bind(this)}>
                    <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>:
                null
            }
            
            </div>
        )
    }
}

export default VortexUpload;