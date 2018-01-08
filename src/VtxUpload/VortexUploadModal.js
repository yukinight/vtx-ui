import React from 'react';

import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/css';
import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';
import VortexUpload from './VortexUpload';

class VortexUploadModal extends React.Component{
    constructor(props){
        super(props)
        this.state={
            fileList: this.props.upload.fileList || [],
        };
    }

    componentWillReceiveProps(nextProps){
        if(this.props.upload.fileListVersion!=nextProps.upload.fileListVersion){
            this.setState({
                fileList: nextProps.upload.fileList
            });
        }
    }

    render(){
        let t = this;
        let ulProps = {
            ...t.props.upload,
            onSuccess(file){
                if(t.props.upload.mode=='single'){
                    t.setState({
                        fileList:[file]
                    });
                }
                else{
                    t.setState({
                        fileList:[...t.state.fileList, file]
                    });
                }
                if(typeof(t.props.upload.onSuccess) =='function'){
                    t.props.upload.onSuccess(file);
                }
            },
            onError(res){
                if(typeof(t.props.upload.onError) =='function'){
                    t.props.upload.onError(res);
                }
            },
            onRemove(file){
                t.setState({
                    fileList: t.state.fileList.filter((item)=>item.id!=file.id)
                });
                if(typeof(t.props.upload.onRemove) =='function'){
                    return t.props.upload.onRemove(file);
                }
            }

        }

        let title = <span>上传文件
                {
                    this.props.template ? 
                    <Button size="small" shape="circle" icon="file-text" title="下载模板" type="dashed"
                    onClick={()=>{
                        window.open(this.props.template);
                    }}></Button>
                    : null
                }
            </span>
        let mdProps = {
            title,
            okText: "确定",
            cancelText: "取消",
            ...t.props.modal,
            onOk(){
                if(typeof(t.props.modal.onOk)=='function'){
                    t.props.modal.onOk(t.state.fileList);
                }
            },
        }
        return (
            <Modal {...mdProps}>
                <VortexUpload {...ulProps}/>                
                {
                    typeof(t.props.modal.setContent) =='function'? 
                    t.props.modal.setContent(t.state.fileList)
                    : null
                }
            </Modal>
        )
    }
}

export default VortexUploadModal;