import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';

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

class VtxGrid extends React.Component{
    constructor(props){
        super(props);
        this.isResize = null;//resize定时
        this.weightiness = 0;
        this.resetWidth = this.resetWidth.bind(this);
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
            // hiddenMoreButtion: props.hiddenMoreButtion || false,
            // hiddenconfrimButtion: props.hiddenconfrimButtion || false,
            // hiddenclearButtion: props.hiddenclearButtion || false,
            width: window.innerWidth
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
    render(){
        let t = this;
        let props = t.props;
        let w = t.state.width>1000?t.state.width:1000,ar = Math.ceil(210 / w * 24),al = 24 - ar;
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
        return(
            <div className={`${styles.normal} ${t.props.className}`} style={{height: `${t.state.height}px`,...t.state.style}}>
                <VtxRow gutter={10}  attr='row'>
                    <VtxCol span={al} xl={{span:21}}>
                        <VtxRow gutter={10}  attr='row'>
                            {
                                analyzeChildern(props.children)
                            }
                        </VtxRow>
                    </VtxCol>
                    <VtxCol span={ar} xl={{span:3}}>
                        <VtxRow gutter={10}  attr='row'>
                            {
                                // t.state.hiddenconfrimButtion?"":
                                t.props.hiddenconfrimButtion?"":
                                <VtxCol span={10}>
                                    <bt>
                                        <Button style={{width:'100%'}} type="primary" onClick={props.confirm}>{props.confirmText || '查询'}</Button>
                                    </bt>
                                </VtxCol>
                            }
                            {
                                // t.state.hiddenclearButtion?"":
                                t.props.hiddenclearButtion?"":
                                <VtxCol span={10}>
                                    <bt>
                                        <Button style={{width:'100%'}} onClick={props.clear}>{props.clearText || '清空'}</Button>
                                    </bt>
                                </VtxCol>
                            }
                            <VtxCol span={4}>
                                {
                                    // this.weightiness > 4 && !t.state.hiddenMoreButtion?
                                    this.weightiness > 4 && !t.props.hiddenMoreButtion?
                                    <bt>
                                        <Button type="primary" shape="circle" icon="ellipsis" onClick={()=>t.isShowMore(this.weightiness)}/>
                                    </bt>:
                                    ''
                                }
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
        window.addEventListener('resize',t.resetWidth,false);
    }
    componentWillUnmount(){
        let t = this;
        window.removeEventListener('resize',t.resetWidth,false);
    }
    componentWillReceiveProps(nextProps) {
        let t = this;
        this.weightiness = 0;
        nextProps.gridweight.map((item,index)=>{
            this.weightiness += item;
        })
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

VtxGrid.VtxRow = VtxRow;
VtxGrid.VtxCol = VtxCol;

export default VtxGrid;