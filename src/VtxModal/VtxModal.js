import React from 'react';
import './VtxModal.less';
const styles = {
    normal: 'vtx-ui-modal-normal',
    title: 'vtx-ui-modal-title',
    title_name: 'vtx-ui-modal-title_name',
    close: 'vtx-ui-modal-close',
}
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';

function VtxModal(props) {
    let ModalProps = {...props};
    let closable = true;
    if('closable' in props){
        closable = props.closable;
    }
    function renderTitle() {
        return (
            <div className={styles.title} style={{paddingRight: (closable?'32px':'0px')}}>
                <div className={styles.title_name}>
                    {ModalProps.title}
                </div>
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
    }
    let wrapClassName = `${styles.normal} ${ModalProps.wrapClassName}`;
    
    delete ModalProps.closable;
    delete ModalProps.wrapClassName;
    return (
        <Modal 
            {...ModalProps}
            closable={false}
            title={renderTitle()}
            wrapClassName={wrapClassName}
        >
            {
                ModalProps.children
            }
        </Modal>
    );
}
VtxModal.info = Modal.info;
VtxModal.success = Modal.success;
VtxModal.error = Modal.error;
VtxModal.warning = Modal.warning;
VtxModal.confirm = Modal.confirm;

export default VtxModal;