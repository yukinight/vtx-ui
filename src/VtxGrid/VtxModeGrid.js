import React from 'react';

import VtxRow from './VtxRow.js';
import VtxCol from './VtxCol.js';

import './VtxGrid.less';
const styles = {
    Lists: 'vtx-ui-grid-lists',
    colon: 'vtx-ui-grid-colon',
    list: 'vtx-ui-grid-list',
    normal: 'vtx-ui-grid-normal'
}
import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';
import Select from 'antd/lib/select';
import 'antd/lib/select/style/css';
const Option = Select.Option;

class VtxModeGrid extends React.Component{
    constructor(props){
        super(props);
        this.isResize = null;//resize定时
        this.weightiness = 0;
        props.gridweight.map((item,index)=>{
            this.weightiness += item;
        })
        let height = 48,style={borderBottom: '1px solid #e1e1e1'};
        if(props.showAll || props.showMore){
            style = this.weightiness>4?{boxShadow: '0 1px 10px -3px #999'}:{borderBottom: '1px solid #e1e1e1'};
            height = this.weightiness>4?this.getHeight(this.weightiness):48;
        }
        this.state = {
            height: height,
            style: style,
            hiddenMoreButtion: props.hiddenMoreButtion || true,
            hiddenconfrimButtion: props.hiddenconfrimButtion || false,
            hiddenclearButtion: props.hiddenclearButtion || false,
            width: window.innerWidth,

            mode:false,//false:普通模式，true:高级模式
            searchItemTitle:props.titles[0],
        }
    }
    getHeight(w){
        return Math.ceil(w/4)*38 + 10;
    }
    isShowMore(weightiness){
        let t = this;
        let h = t.state.height;
        // if(this.isFrist && (t.props.showAll || t.props.showMore)){
        //     this.isFrist = 0;
        //     t.setState({
        //         height: t.getHeight(weightiness),
        //         style: {
        //             boxShadow: '0 1px 10px -3px #999'
        //         }
        //     })
        //     return false;
        // }
        if(h > 48){
            t.setState({
                height: 48,
                style: {
                    borderBottom: '1px solid #e1e1e1'
                }
            })
        }else{
            t.setState({
                height: t.getHeight(weightiness),
                style: {
                    boxShadow: '0 1px 10px -3px #999'
                }
            })
        }
    }
    resetWidth(){
        let t = this;
        if(this.isResize){
            clearTimeout(this.isResize);
        }
        this.isResize = setTimeout(()=>{
            t.setState({
                width: window.innerWidth
            })
        },50);
    }
    modeChange(){
        if(this.state.mode){
            this.isShowMore(4);
        }
        else{
            
            this.isShowMore(this.weightiness);
        }
        this.setState({
            mode:!this.state.mode,
            hiddenMoreButtion: this.state.mode
        })
        
    }
    searchItemChange(title){
        this.setState({
            searchItemTitle:title
        })
    }
    render(){
        let t = this;
        let props = t.props;
        let w = t.state.width>1000?t.state.width:1000,ar = Math.ceil(260 / w * 24),al = 24 - ar;
        let render = (d,i)=>{
            // let b = 4, c = 20,gwt = props.gridweight[i];
            let xs = Math.ceil(62 / (w*al/24/24/4)),
            b = xs % 4 === 0?xs:xs - (xs % 4) + 4, c = 24 - b,gwt = props.gridweight[i];
            if(gwt === 2){
                // b = 2;
                b = b/2;
                c = 24 - b;
            }
            if(gwt === 4){
                // b = 1;
                b = b/4;
                c = 24 - b;
            }
            return (
                <VtxCol key={i} span={6*gwt}>
                    <VtxRow gutter={2} attr='row'>
                        <VtxCol span={b}><fieldName>{props.titles[i]}</fieldName></VtxCol>
                        <VtxCol span={c}><colon>：{d}</colon></VtxCol>
                    </VtxRow>
                </VtxCol>
            );
        }
        let analyzeChildern = (data)=>{
            if(!data)return '';
            if(!data.length){
                return render(data,0);
            }else{
                return data.map((item,index)=>{
                    return render(item,index);
                })
            }
        }
        const currentItemIndex = this.props.titles.indexOf(this.state.searchItemTitle);
        return(
            <div className={`${styles.normal} ${t.props.className}`} style={{height: `${t.state.height}px`,...t.state.style}}>
                <VtxRow gutter={10}  attr='row'>
                    <VtxCol span={al} xl={{span:20}}>
                    {
                        !this.state.mode ?
                        <div>
                            <div style={{display:'inline-block'}}>
                                <Select value={this.state.searchItemTitle} style={{ width: 120 }} 
                                onChange={(val)=>{
                                    this.searchItemChange(val);
                                }}>
                                    {
                                        this.props.titles.map((item,index)=><Option key={item}>{item}</Option>)
                                    }
                                </Select>
                            </div>
                            <div style={{display:'inline-block',minWidth:'300px'}}>
                                {
                                    this.props.children[currentItemIndex]
                                }
                            </div>
                        </div>:
                        <VtxRow gutter={10}  attr='row'>
                            {
                                analyzeChildern(props.children)
                            }
                        </VtxRow>
                    } 
                    </VtxCol>
                    <VtxCol span={ar} xl={{span:4}}>
                        <VtxRow gutter={10}  attr='row'>
                            {
                                t.state.hiddenconfrimButtion?"":
                                <VtxCol span={7}>
                                    <bt>
                                        <Button style={{width:'100%'}} type="primary" onClick={()=>{
                                            if(typeof props.confirm==='function'){
                                                props.confirm(this.state.mode?null:this.state.searchItemTitle);
                                            }
                                        }}>{props.confirmText || '查询'}</Button>
                                    </bt>
                                </VtxCol>
                            }
                            {
                                t.state.hiddenclearButtion?"":
                                <VtxCol span={7}>
                                    <bt>
                                        <Button style={{width:'100%'}} onClick={()=>{
                                            if(typeof props.clear==='function'){
                                                props.clear(this.state.mode?null:this.state.searchItemTitle);
                                            }
                                        }}>{props.clearText || '清空'}</Button>
                                    </bt>
                                </VtxCol>
                            }
                            <VtxCol span={4}>
                                {
                                    this.weightiness > 4 && !t.state.hiddenMoreButtion?
                                    <bt>
                                        <Button type="primary" shape="circle" icon="ellipsis" onClick={()=>t.isShowMore(this.weightiness)}/>
                                    </bt>:
                                    ''
                                }
                            </VtxCol>
                            <VtxCol span={6}>
                                <div className={styles.modeButton} 
                                onClick={this.modeChange.bind(this)} style={{lineHeight:'40px',cursor:'pointer',fontWeight:'bold'}}>
                                    {
                                        this.state.mode?'普通模式':'高级模式'
                                    }
                                </div>
                            </VtxCol>
                        </VtxRow>
                    </VtxCol>
                </VtxRow>
            </div>
        );
    }
    componentDidMount(){
        let t = this;
        // 自适应宽度
        window.addEventListener('resize',t.resetWidth.bind(t),false);
    }
    componentWillUnmount(){
        let t = this;
        window.removeEventListener('resize',t.resetWidth.bind(t),false);
    }
    componentWillReceiveProps(nextProps) {
        let t = this;
        // if(this.weightiness > 4 && (t.props.showAll || t.props.showMore)){
        //     t.isShowMore(this.weightiness);
        // }
        // t.setState({
        //     hiddenMoreButtion: nextProps.hiddenMoreButtion || false,
        //     hiddenconfrimButtion: nextProps.hiddenconfrimButtion || false,
        //     hiddenclearButtion: nextProps.hiddenclearButtion || false,
        // })
    }
}

VtxModeGrid.VtxRow = VtxRow;
VtxModeGrid.VtxCol = VtxCol;


export default VtxModeGrid;