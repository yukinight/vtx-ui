import React from 'react';
import {VtxZtree,VtxZtreeSelect} from 'vtx-ui';

const maxlayer1=10;
const maxlayer2=50;

function getRandomNodes(){
    let nodes = [];
    const layer1 = parseInt(Math.random()*maxlayer1)||1;
    for(let i=0;i<layer1;i++){
        const layer2 = maxlayer2//parseInt(Math.random()*maxlayer2||1);
        let subnodes = [];
        for(let j=0;j<layer2;j++){
            subnodes.push({
                id:`id${i}-${j}`,
                key:`k${i}-${j}`,
                name:`n${i}-${j}`,
                isLeaf:true,
                icon:'./resources/images/yc.png',
            });
        }
        nodes.push({
            name:"p"+i, 
            key:"k"+i,
            id:"id"+i,
            icon:'./resources/images/zc.png',
            children:subnodes,
            attr:{ff:'22',sd:'sdg'}
        })
    }
    return nodes;
}


export default class Test extends React.Component{
    constructor(props){
        super();
        this.state={
            treeNodes:[],
            selectedKeys:[2],
            expandedKeys:['k1'],
            checkedKeys:[1],

            selectVal:["0-1"],
            refreshFlag:1
        }
    }
    render(){
        const t = this;
        const treeProps = {
            ref(d){
                if(d)t.tree=d;
            },
            data:t.state.treeNodes,//树的数据
            // defaultExpandAll:true,//默认是否全展开，配置expandedKeys后此参数失效
            multiple:true,//是否可以点选多个节点
            refreshFlag:t.state.refreshFlag,
            isShowSearchInput:true,
            // disableCheckboxAll:true,
            selectedKeys:t.state.selectedKeys,//已选中节点的key集合
            expandedKeys:t.state.expandedKeys,//展开节点的key集合
            checkable:true,//是否可以勾选
            checkedKeys:t.state.checkedKeys,//勾选的节点key集合
            onClick({key,treeNode, selectedKeys }){
                console.log({key,treeNode, selectedKeys })
                t.setState({
                    selectedKeys
                })
            },
            onCheck({key,isChecked, checkedKeys, treeNode }){
                console.log({key,isChecked, checkedKeys, treeNode })
                console.log(isChecked)
                t.setState({
                    checkedKeys
                })
            },
            onExpand({key, isExpand, treeNode, expandedKeys }){
                console.log({expandedKeys })
                t.setState({
                    expandedKeys
                })
            },
            onRightClick({event, key,treeNode }){
                console.log(event)
            }
        };

        const selectTreeProps = {
            data:t.state.treeNodes,
            showSearch:true,
            multiple:false,
            treeCheckable:false,
            expandedKeys:t.state.expandedKeys,
            style:{width:'200px'},
            dropdownStyle:{
                height:'300px'
            },
            placeholder:'请选择',
            disabled:false,
            // treeDefaultExpandAll:true,

            onChange({nodes,keys,leafKeys,names}){
                console.log(nodes,keys,leafKeys,names)
                t.setState({selectVal:leafKeys})
            },
            value:t.state.selectVal
        }

        return (
            <div>
                
                <div style={{position:'fixed',right:'10px',top:'10px',zIndex:'2'}}>
                    <button  onClick={()=>{
                        this.setState({
                            treeNodes:getRandomNodes(),
                            refreshFlag:t.state.refreshFlag+1
                        })
                    }}>random Nodes</button>
                    <button onClick={()=>{
                        t.tree.clearSearch();
                    }}>clear</button>
                    <button onClick={()=>{
                        t.tree.expandAll();
                    }}>expandAll</button>
                    <button onClick={()=>{
                        t.tree.collapseAll();
                    }}>collapseAll</button>
                </div>
                <div style={{height:'500px'}}>
                    <VtxZtree {...treeProps}/>
                </div>
                <VtxZtreeSelect {...selectTreeProps}/>
                
            </div>
        )
    }
}