
import React from 'react';
import Upload from 'antd/lib/upload';
import 'antd/lib/upload/style/css';
import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';
import 'viewerjs/dist/viewer.css';
import message from 'antd/lib/message';
import 'antd/lib/message/style/css';
import Viewer from 'viewerjs';
import './VortexUpload.css';

function getUrlParam(key) {
    let paramObj = {};
    let matchList = window.location.href.match(/([^\?&]+)=([^&]+)/g) || [];
    for (let i = 0, len = matchList.length; i < len; i++) {
        let r = matchList[i].match(/([^\?&]+)=([^&]+)/);
        paramObj[r[1]] = r[2];
    }
    if (key) {
        return paramObj[key];
    } else {
        return paramObj;
    }
}
const TOKEN = getUrlParam('token') || '';

const styles = {
    onlinepreview: 'vtx_ui_upload_onlinepreview',
    previewLine: 'vtx_ui_upload_previewLine',
    iconHint: 'vtx_ui_upload_iconHint',
    action_box: 'vtx_ui_upload_action_box',
    action_btn: 'vtx_ui_upload_action_btn'
}

const Dragger = Upload.Dragger;
class VortexUpload extends React.Component{
    constructor(props){
        super(props); 
        // 初始化上传下载的地址
        this.uploadURL = props.action||'';
        this.downLoadURL = props.downLoadURL||'';
        // 缩略图地址
        this.thumbnailURL = props.thumbnailURL||'';
        // 是否使用缩略图
        this.useThumbnail = props.thumbnailURL && (props.listType=='picture' || props.listType=='picture-card');
        // 在线预览地址
        this.onlinePreviewURL = props.onlinePreviewURL || '';

        // 可在外部配置的属性，具体文档参考AntUI
        this.configurableProperty = ['data','showUploadList','multiple','accept','listType',
        'disabled','withCredentials','beforeUpload'];

        this.imageCt = null;
        this.imageViewer = null;

        this.state = {
            fileList: this.getSynFileList()
        };
    }

    getConfig(){
        let t = this;
        let props = this.props;
        // 重置上传下载的地址
        t.uploadURL = props.action||'';
        t.downLoadURL = props.downLoadURL||'';
        t.thumbnailURL = props.thumbnailURL||'';
        t.useThumbnail = props.thumbnailURL && (props.listType=='picture' || props.listType=='picture-card');

        let config = {
            action: t.uploadURL,
            fileList: t.state.fileList,
            headers: {
                Authorization: TOKEN ? `Bearer ${TOKEN}` : '',
            },
            onChange(info){
                if(info.file.response && info.file.response.result === 1){
                    message.error(info.file.response.errMsg || '上传失败!');
                    let flt = [...t.state.fileList];
                    flt.pop();
                    t.setState({fileList: flt});
                    return;
                }
                // 此处根据后台返回的数据结构取得文件ID             
                let vtxId =  (info.file.response && Array.isArray(info.file.response.data) && info.file.response.data.length>0) ? info.file.response.data[0].id : undefined;
                let newFileList = info.fileList;
                let newFile = vtxId?{
                    ...info.file,
                    id: vtxId,
                    url: t.downLoadURL + vtxId,
                    thumbUrl: t.useThumbnail ? (t.thumbnailURL + vtxId): undefined,
                }:{
                    ...info.file,
                };
                
                if (info.file.status === 'done' && vtxId){
                    newFileList = info.fileList.map((item)=>{
                        if(item.uid==info.file.uid){
                            return {
                                ...item,
                                id: vtxId,
                                url: t.downLoadURL + vtxId,
                                thumbUrl: t.useThumbnail ? (t.thumbnailURL + vtxId): undefined
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
            return {
                ...item,
                uid: -1-index,
                status: 'done',
                url: item.url || (t.downLoadURL+ item.id),
                thumbUrl: t.useThumbnail ? (item.thumbUrl || (t.thumbnailURL+item.id)): undefined,
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
    componentDidMount(){
        this.imageViewer = new Viewer(this.imageCt,{})
    }
    componentWillUnmount(){
        this.imageViewer.destroy();
    }
    handlePreview(file){
        const imageIndex = this.props.fileList.map(item=>item.id).indexOf(file.id);
        if(imageIndex==-1)return;
        this.imageViewer.update();
        this.imageViewer.view(imageIndex);
    }
    render(){
        return (
            <div>
                {
                    this.props.isDragger?
                    <Dragger  {...this.getConfig()}>
                        {
                            (this.props.draggerConfig || {}).img?
                            <img src={this.props.draggerConfig.img} alt="" style={{maxWidth: 100,maxHeight: 100,marginTop: '3%',marginBottom: '5%'}}/>
                            :
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                        }
                        <p className="ant-upload-text">{(this.props.draggerConfig || {}).mainText || '点击或拖拽上传'}</p>
                        <p className="ant-upload-hint">{(this.props.draggerConfig || {}).subText || '支持上传word,excel,png...'}</p>
                    </Dragger>
                    :
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
                }
                {
                    !this.props.showUploadList && this.props.showOnLinePreviewList?
                    <OnlinePreview 
                        list={this.state.fileList} onlinePreviewURL={this.onlinePreviewURL}
                        onRemove={this.props.onRemove}
                        downLoadURL={this.downLoadURL}
                    />
                    :null
                }
                <div style={{display:'none'}}>
                    <ul ref={(ins)=>{if(ins)this.imageCt = ins}}>
                        {
                            this.props.fileList.map((item,index)=><li key={item.id}>
                                <img src={item.url||this.downLoadURL+item.id} alt={item.name||`picture-${index+1}`}/>
                            </li>)
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

export default VortexUpload;


class OnlinePreview extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div className={styles.onlinepreview}>
                {
                    (this.props.list || []).map((item,index)=>{
                        let vtxId =  (item.response && Array.isArray(item.response.data) && item.response.data.length>0) ? item.response.data[0].id : undefined;
                        let fileName =  (item.response && Array.isArray(item.response.data) && item.response.data.length>0) ? item.response.data[0].fileName : undefined;
                        return(
                            <div key={index} className={styles.previewLine}>
                                <Icon type="paper-clip" className={styles.iconHint}/>
                                <a href={`${this.props.downLoadURL}${vtxId}`} target="_blank" rel="noopener noreferrer">{item.name}</a>
                                <div className={styles.action_box}>
                                    <Icon type="eye-o" className={styles.action_btn} onClick={(e)=>{
                                        e.stopPropagation();
                                        if(vtxId && fileName){
                                            if(this.props.onlinePreviewURL){
                                                window.open(`${this.props.onlinePreviewURL}?id=${vtxId}&fileName=${fileName}`);
                                            }else{
                                                window.open(`/vortexOnlinePreview?id=${vtxId}&fileName=${fileName}`);
                                            }
                                        }
                                    }}/>
                                    <Icon type="close" className={styles.action_btn} onClick={(e)=>{
                                        e.stopPropagation();
                                        if(typeof(this.props.onRemove)=="function"){
                                            this.props.onRemove(item);
                                        }
                                    }}/>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}