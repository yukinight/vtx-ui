import React from 'react';
import './VtxModal.css';
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
    let {closable=true,wrapClassName='',title='',bodyStyle={},...ModalProps} = props;
    
    wrapClassName = `${styles.normal} ${wrapClassName}`;
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
    );
}
VtxModal.info = Modal.info;
VtxModal.success = Modal.success;
VtxModal.error = Modal.error;
VtxModal.warning = Modal.warning;
VtxModal.confirm = Modal.confirm;

export default VtxModal;