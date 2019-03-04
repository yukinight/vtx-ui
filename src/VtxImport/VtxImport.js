import React from 'react';

import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/css';
import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';
import message from 'antd/lib/message';
import 'antd/lib/message/style/css';
// require('weakmap-polyfill');
// require('formdata-polyfill');

/*
    props:
        visible,选填
        templateURL,选填
        uploadURL,必填
        postData,选填
        fileKey,选填
        accept,选填
        close(),选填
        afterUpload(data),选填
 */
class VtxImport extends React.Component{
    constructor(props){
        super(props);
        this.form = null;
        this.fileInput = null;
        this.iframe = null;
        this.useFormData = window.FormData? true : false;
        this.fileKey = props.fileKey || 'file';
        this.accept = props.accept || 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';
        // console.log('useFormData',this.useFormData);
        // this.uploadURL = props.uploadURL;
        this.state = {
            visible:true,
            uploading:false,
        }
    }
    uploadSuccess(data){
        this.setState({
            uploading:false
        });
        if(typeof this.props.afterUpload ==='function'){
            this.props.afterUpload(data)
        }
    }
    closeModal(){
        this.fileInput.value = '';
        if(typeof this.props.close === 'function'){
            this.props.close();
        }
        else{
            this.setState({
                visible:!this.state.visible
            })
        }
    }
    getPostURL(){
        let postUrl = this.props.uploadURL;
        let postData = this.props.postData || {};
        let postArray = [];
        for(let k in postData){
            if(postData[k]!==undefined && postData[k]!==null && postData[k]!==''){
                postArray.push(`${k}=${encodeURIComponent(postData[k])}`)
            } 
        }
        return postArray.length>0?`${postUrl}?${postArray.join('&')}`:postUrl;
    }
    render(){
        const t = this;
        const postUrl = t.getPostURL();
        const modalProps = {
            bodyStyle:{
                backgroundColor:'#f8f8f8'
            },
            visible: t.props.visible===undefined? t.state.visible : t.props.visible,
            title:'导入',
            onCancel: t.closeModal.bind(t),
            maskClosable:false,
            footer:[
                t.props.templateURL ? <Button key={1} onClick={()=>{
                    window.open(t.props.templateURL);
                }}>下载模板</Button>:null,
                <Button key={2} type="primary" loading={t.state.uploading} onClick={()=>{
                    if(this.fileInput.value){
                        t.setState({
                            uploading:true
                        })
                        if(t.useFormData){
                            var request = new XMLHttpRequest();
                            request.open("POST", postUrl);
                            request.onreadystatechange = (e)=>{
                                if(e.target.readyState==4){
                                    t.uploadSuccess(e.target.response);
                                }
                            }
                            var fmd = new FormData();
                            fmd.append(this.fileKey, this.fileInput.files[0]);
                            request.send(fmd);
                        }
                        else{
                            this.form.submit();
                        }
                    }
                    else{
                        message.info('请选择需要上传的文件');
                    }
                }}>上传</Button>,
                <Button key={3} onClick={t.closeModal.bind(t)}>关闭</Button>
            ]
        }
        if(!this.useFormData && this.iframe){
            this.iframe.onload = ()=>{
                this.uploadSuccess(this.iframe.contentWindow.document.documentElement.innerHTML);
                // console.log(this.iframe.contentWindow.document.documentElement.innerHTML)
            }
        }

        return (
            <Modal {...modalProps}>
                <form encType="multipart/form-data" method="post" target="tmp" action={postUrl} ref={(dom)=>{if(dom)this.form = dom;}}>
                    <input type='file' name={this.fileKey} accept={this.accept} ref={(dom)=>{if(dom)this.fileInput = dom;}}/>
                </form>
                <iframe name='tmp' style={{display:'none'}} ref={(dom)=>{if(dom)this.iframe = dom;}}>
                </iframe>
                <div>
                    {this.props.children}
                </div>
            </Modal>
        )
    }
}

export default VtxImport;