import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/css';

class DraggableModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            init_x: 0,
            init_y: 0,
            x_move: 0,
            y_move: 0,
        }
        this.initSucceed = false; //是否已完成初始化拖拽事件
        this.startDrag = this.startDrag.bind(this);
        this.initEvent = this.initEvent.bind(this);
    }
    // 初始化弹框的拖拽事件
    initEvent(){
        if(!this.drag)return;
        let modalHead = ReactDOM.findDOMNode(this.drag).parentNode.previousSibling;
        if(modalHead.className.indexOf('ant-modal-header')!==-1){
            modalHead.style.cursor = 'move';
            modalHead.onmousedown = this.startDrag;
            this.initSucceed = true;
        }
    }
    // 开始拖拽：绑定事件
    startDrag(e){  
        e.preventDefault();
        this.setState({
            init_x: e.clientX - this.state.x_move,
            init_y: e.clientY - this.state.y_move,
        });
        const mousemove = (e)=>{
            this.setState({
                x_move: e.clientX - this.state.init_x ,
                y_move: e.clientY - this.state.init_y ,
            })   
        }
        const mouseup = (e)=>{
            document.removeEventListener('mousemove',mousemove);
            document.removeEventListener('mouseup',mouseup);
        }

        document.addEventListener('mousemove',mousemove);
        document.addEventListener('mouseup',mouseup);
    }
   
    render(){
        const transformStyle = {
            transform: `translate(${this.state.x_move}px,${this.state.y_move}px)`,        
        }
        const props = {
            ...this.props,
            style: {
                ...this.props.style,
                ...transformStyle
            }
        }
       
        return (
            <Modal {...props} >
                {this.props.children}
                <div ref={(elem)=>{this.drag = elem}}></div>
            </Modal>
        )
    }
    componentDidMount(){        
        this.initEvent();
    }
    componentDidUpdate(){
        if(!this.initSucceed){
            this.initEvent();
        }
    }
    componentWillReceiveProps(nextProps){
        if(!this.props.visible && nextProps.visible && !nextProps.remainPosition){
            this.setState({
                init_x: 0,
                init_y: 0,
                x_move: 0,
                y_move: 0,
            })
        }
    }
}


export default DraggableModal;