import React from 'react';
import Popover from 'antd/lib/popover';
import 'antd/lib/popover/style/css';
import Input from 'antd/lib/input';
import 'antd/lib/input/style/css';
import Tag from 'antd/lib/tag';
import 'antd/lib/tag/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';
import Ztree from '../VtxZtree/VtxZtree';
import './ztreeSelect.css';
import _isEqual from 'lodash/isEqual';

export default class SelectZTree extends React.Component{
    constructor(props){
        super(props);
        this.input = null;
        this.tree = null;
        this.treeRefreshFlag = 1;
        this.state = {
            popoverVisible:false,
        }
        this.keyNodesMapping = {};
        this.getKeyNodesMapping();
    }
    componentWillReceiveProps(nextProps){
        if(!_isEqual(this.props.data,nextProps.data)){
            this.getKeyNodesMapping(nextProps.data);
        }
        if(!_isEqual(this.props.expandedKeys,nextProps.expandedKeys)){
            this.treeRefreshFlag++;
        }
    }
    getKeyNodesMapping(nodes){
        const t = this;
        t.keyNodesMapping = {};
        (function genNodes(nodes) {
            nodes.map((item)=>{
                const {children,...other} = item;
                t.keyNodesMapping[item.key] = other;
                if(Array.isArray(item.children) && item.children.length>0){
                    genNodes(item.children)
                }
            })
        })(nodes||this.props.data||[]);
    }
    clear(){
        if(this.tree){
            if(this.props.treeCheckable){
                this.tree.checkNodes(this.tree.getCheckedNodes().map(item=>item.key),false);
            }
            else{
                this.tree.cancelSelectedNodes(this.props.value);
            }
        }
        this.props.onChange && this.props.onChange({
            nodes:[],
            keys:[],
            leafKeys:[],
            names:[]
        });
    }
    clearKey(key){
        const keyIndex = this.props.value.indexOf(key);
        if(keyIndex!=-1){
            let keyList = [...this.props.value];
            keyList.splice(keyIndex,1);
            let nodes = keyList.map(key=>this.keyNodesMapping[key]);
            if(this.tree){
                if(this.props.treeCheckable){
                    this.tree.checkNodes([key],false);
                    // nodes = this.tree.getCheckedNodes();
                }
                else{
                    this.tree.cancelSelectedNodes([key]);
                    // nodes = this.tree.getSelectedNodes();
                }
            } 
            this.props.onChange && this.props.onChange({
                nodes,
                keys:keyList,
                leafKeys:nodes.filter(item=>item.isLeaf).map(item=>item.key),
                names:nodes.map(item=>item.name)
            });
        }
    }
    clearSearch(){
        this.tree && this.tree.clearSearch();
    }
    render(){
        const t = this;
        // 必填参数
        const {data,value} = t.props;
        // 可配参数
        const {
            treeCheckable=false, treeDefaultExpandAll=false, multiple=false,
            showSearch=false, dropdownStyle={}, style={}, disabled=false,
            refreshFlag=null, expandedKeys, customCfg, checkStrictly
        } = t.props;
        const value_arr = (function(val){
            if(Array.isArray(val)){
                return val;
            }
            else if(val){
                return [val];
            }
            else{
                return [];
            }
        })(value);
        const selectedNodes = value_arr.filter(k=>k in t.keyNodesMapping).map(item=>({
            id: item,
            name:t.keyNodesMapping[item].name
        }));
        // ztree配置
        const treeProps = {
            data,//树的数据
            isShowSearchInput:showSearch,
            multiple,
            checkable:treeCheckable,
            [treeCheckable?'checkedKeys':'selectedKeys']:value_arr,
            defaultExpandAll:treeDefaultExpandAll,
            expandedKeys,
            refreshFlag: refreshFlag || t.treeRefreshFlag,
            customCfg,
            checkStrictly,
            ref(instance){
                if(instance)t.tree = instance;
            },
            onClick({selectedNodes,selectedKeys,selectedNames }){
                // console.log(selectedNodes,selectedKeys,selectedNames)
                if(!treeCheckable){
                    t.props.onChange && t.props.onChange({
                        nodes:selectedNodes,
                        keys:selectedKeys,
                        leafKeys:selectedNodes.filter(item=>item.isLeaf).map(item=>item.key),
                        names:selectedNames
                    })
                    if(!multiple){
                        t.setState({
                            popoverVisible:false
                        })
                    }
                }
            },
            onCheck({checkedNodes,checkedKeys,checkedNames }){
                // console.log({checkedNodes,checkedKeys,checkedNames })
                if(treeCheckable){
                    t.props.onChange && t.props.onChange({
                        nodes:checkedNodes,
                        keys:checkedKeys,
                        leafKeys:checkedNodes.filter(item=>item.isLeaf).map(item=>item.key),
                        names:checkedNames
                    })
                }
            },
            beforeCheck(treeNode){
                return t.props.beforeCheck ? t.props.beforeCheck(treeNode):true;
            },
        };
        // popover配置
        const popoverProps = {
            ...this.props,
            hidePopover:()=>{t.setState({popoverVisible:false})}
        }
        
        
        // 多选组件
        const MultiSelect = <div className='ant-input vtx-ui-ztree-select-mselect' style={{height:'auto',minHeight:'28px',...style}}>
            {
                selectedNodes.length>0?[
                    selectedNodes.map((item,index)=><Tag key={item.id} closable={!disabled} 
                    onClick={(e)=>{e.stopPropagation();}}
                    afterClose={() => {
                        t.clearKey(item.id);
                    }}>
                        {item.name}
                    </Tag>),
                    
                    (disabled? null:<Icon key={'icon'} className='close-icon' type="close-circle" onClick={(e)=>{
                        e.stopPropagation();
                        t.clear();
                    }} style={{cursor:'pointer'}}/>)
                ]:
                <span className='vtx-ui-ztree-select-placehoder'>{t.props.placeholder}</span>||null
            }
        </div>

        // 单选组件
        const SingleSelect = <Input ref={(t)=>{ if(t)t.input = t;}} 
            value={selectedNodes.map(item=>item.name).join(', ')}
            style={style}
            readOnly={true}
            placeholder={t.props.placeholder}
            suffix={(disabled||selectedNodes.length==0)?
                null:<Icon type="close-circle" onClick={t.clear.bind(t)} style={{cursor:'pointer'}}/>
            }
        />


        return (    
            <div className={'vtx-ui-ztree-select'}>
            {
                disabled?(multiple || treeCheckable? MultiSelect:SingleSelect):
                <Popover placement="bottomLeft" 
                content={<div className={'vtx-ui-ztree-select-pop'} style={dropdownStyle}><Ztree {...treeProps}/></div>} 
                trigger="click" 
                onVisibleChange={(v)=>{t.setState({popoverVisible:v})}}
                visible={t.state.popoverVisible}
                >
                    {
                        multiple || treeCheckable? MultiSelect:SingleSelect
                    }
                </Popover>  
            }
                
            </div>
        );
    }
}


