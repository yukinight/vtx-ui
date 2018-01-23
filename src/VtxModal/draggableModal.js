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
            documentMouseMove: null,
            documentMouseUp:null,
        }
        this.startDrag = this.startDrag.bind(this);        
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
        let modalHead = ReactDOM.findDOMNode(this.drag).parentNode.previousSibling;
        if(modalHead.className.indexOf('ant-modal-header')!==-1){
            modalHead.style.cursor = 'move';
            modalHead.onmousedown = this.startDrag;
        }
    }  
}


export default DraggableModal;