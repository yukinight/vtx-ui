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
        this.classId = new Date().getTime() + Math.random();
        this.isInit = false;
        this.isCreate = props.visible;
        this.state = {
            maximizable: false,
            maximizeClass: '',

            init_x: 0,
            init_y: 0,
            x_move: 0,
            y_move: 0,
            documentMouseMove: null,
            documentMouseUp:null,
        }
        this.startDrag = this.startDrag.bind(this);
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.visible && !this.isCreate){
            this.isCreate = true;
        }
    }
    componentDidUpdate(){
        if(!this.props.isNotMoving){
            if(this.isCreate && !this.isInit){
                this.isInit = true;
                try {
                    let modalHead = document.getElementsByClassName(this.classId)[0].getElementsByClassName('ant-modal-header')[0];
                    modalHead.style.cursor = 'move';
                    modalHead.onmousedown = this.startDrag;
                } catch (error) {
                    console.error('VtxModal拖动功能异常,未获取到头部dom对象!')
                }
            }
        }
    }
    startDrag(e){  
        e.preventDefault();
        this.setState({
            documentMouseUp: document.onmouseup,
            documentMouseMove: document.onmousemove,
            init_x: e.clientX - this.state.x_move,
            init_y: e.clientY - this.state.y_move,
        });
        document.onmousemove = (e)=>{
            this.setState({
                x_move: e.clientX - this.state.init_x ,
                y_move: e.clientY - this.state.init_y ,
            })   
        }
        document.onmouseup = (e)=>{
            document.onmousemove = this.state.documentMouseMove;
            document.onmouseup = this.state.documentMouseUp;
        }
    }
    componentWillUnmount(){
        if(this.timer){
            clearTimeout(this.timer)
        }
    }
    render(){
        const t = this;
        let {closable=true,maximize=true,wrapClassName='',title=''} = this.props;
        const {maximizable,maximizeClass} = this.state;
        wrapClassName = `${styles.normal} ${wrapClassName} ${maximizeClass} ${this.classId}`;
        const transformStyle = {
            transform: `translate(${this.state.x_move}px,${this.state.y_move}px)`,        
        }
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
                            <p onClick={t.props.onCancel}>
                                <Icon type="close" />
                            </p>
                        </div>:''
                    }
                </div>
            );
        })();
        const props = {
            closable,
            maskClosable:false,
            width: 700,
            ...this.props,
            closable: false,
            title: title,
            wrapClassName: wrapClassName,
            bodyStyle: {
                maxHeight:`${window.innerHeight*0.7}px`,
                ...this.props.bodyStyle,
            },
            style: {
                ...this.props.style,
                ...transformStyle
            }
        }
        return (
            <Modal {...props}>
                {
                    this.props.children
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