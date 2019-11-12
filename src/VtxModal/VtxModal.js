import React from 'react';
import './VtxModal.css';
const styles = {
    normal: 'vtx-ui-modal-normal',
    maxClass: 'vtx-ui-modal-maxClass',
    title: 'vtx-ui-modal-title',
    title_name: 'vtx-ui-modal-title_name',
    close: 'vtx-ui-modal-close',
    maximizeIcon: 'vtx-ui-modal-maximizeIcon',
}
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';

class VtxModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            maximizable: false,
            maximizeClass: ''
        }
    }
    componentWillUnmount(){
        if(this.timer){
            clearTimeout(this.timer)
        }
    }
    render(){
        const t = this;
        let {closable=true,maximize=false,wrapClassName='',title='',bodyStyle={},...ModalProps} = this.props;
        const {maximizable,maximizeClass} = this.state;
        wrapClassName = `${styles.normal} ${wrapClassName} ${maximizeClass}`;
        bodyStyle = {
            maxHeight:`${window.innerHeight*0.7}px`,
            ...bodyStyle,
        };
        title = (function renderTitle() {
            return (
                <div className={styles.title} style={{paddingRight: (closable?'32px':'0px')}}>
                    <div className={styles.title_name}>
                        {title}
                    </div>
                    {
                        maximize?
                        <div className={styles.maximizeIcon}>
                            <p 
                                onClick={()=>{
                                    let maximizeClass = '';
                                    if(!maximizable){
                                        maximizeClass = styles.maxClass
                                    }
                                    t.setState({
                                        maximizable: !maximizable,
                                        maximizeClass
                                    },()=>{
                                        {/* 为arcgis设计 */}
                                        if(t.timer){
                                            clearTimeout(t.timer)
                                        }
                                        t.timer = setTimeout(()=>{
                                            if(window.onModalResize && typeof(window.onModalResize) == 'function'){
                                                window.onModalResize();
                                            }
                                        },100)
                                    })
                                }}
                            >
                                {
                                    maximizable?
                                    <Icon type="shrink" />
                                    :
                                    <Icon type="arrows-alt" />
                                }
                            </p>
                        </div>
                        :null
                    }
                    {
                        closable?
                        <div className={styles.close}>
                            <p onClick={ModalProps.onCancel}>
                                <Icon type="close" />
                            </p>
                        </div>:''
                    }
                </div>
            );
        })();
        return (
            <Modal 
                width={700}
                maskClosable={false}
                closable={false}
                title={title}
                wrapClassName={wrapClassName}
                bodyStyle={bodyStyle}
                {...ModalProps}
            >
                {
                    ModalProps.children
                }
            </Modal>
        )
    }
}
VtxModal.info = Modal.info;
VtxModal.success = Modal.success;
VtxModal.error = Modal.error;
VtxModal.warning = Modal.warning;
VtxModal.confirm = Modal.confirm;

export default VtxModal;