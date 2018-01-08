import React from 'react';

import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';
import Popover from 'antd/lib/popover';
import 'antd/lib/popover/style/css';
import Input from 'antd/lib/input';
import 'antd/lib/input/style/css';
import Select from 'antd/lib/select';
import 'antd/lib/select/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';

import VtxDatagrid from '../VtxDatagrid';
import './VtxComboGrid.less';

const styles = {
    cbBox: 'vtx-ui-combogrid-cbbox',
    formGrid: 'vtx-ui-combogrid-formgrid',
    gridTitle: 'vtx-ui-combogrid-gridtitle',
    gridContent: 'vtx-ui-combogrid-gridcontent',
    buttonGrid: 'vtx-ui-combogrid-buttongrid',
    form_ct: 'vtx-ui-combogrid-form_ct',
    grid_ct: 'vtx-ui-combogrid-grid_ct',
}

const Option = Select.Option;

/*------------组件props-----------
search(form,pagination),查询函数
clear(),
selectRow(rows)，选中行事件
value,
name,
tableCfg:{tableData,tableColumns,total},
formCfg:[{name,type,key}],
*/

class ComboGrid extends React.Component{
    constructor(props){
        super(props);
        this.input = null;
        this.state = {
            popoverVisible:false
        }
    }

    render(){
        const popoverProps = {
            ...this.props,
            hidePopover:()=>{this.setState({popoverVisible:false})}
        }
        return (    
            <div className={styles.cbBox}>
                <Popover placement="bottomLeft" 
                content={<PopupCT {...popoverProps}/>} 
                trigger="click" 
                onVisibleChange={(v)=>{this.setState({popoverVisible:v})}}
                visible={this.state.popoverVisible}
                >
                    <Input ref={(t)=>{ if(t)this.input = t;}} 
                    value={this.props.value}
                    style={{width:'100%'}}
                    suffix={(this.props.value===''||this.props.value===null||this.props.value===undefined)?
                    null:
                    <Icon type="close-circle" onClick={this.props.clear} style={{cursor:'pointer'}}/>
                    }
                    />
                    {/* <Button type="primary" shape="circle" icon="plus"></Button> */}
                </Popover>
            </div>
        );
    }
}


class PopupCT extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            query:{},
            form:this.getInitForm(),
            currentPage:1,
            pageSize:10,
        }
        this.panel = null;
    }
    componentDidMount(){
        this.query();
    }
    getInitForm(){
        let new_form = {};
        const formCfg = this.props.formCfg || [];
        for(let i=0,len=formCfg.length;i<len;i++){
            new_form[formCfg[i].key] = '';
        }
        return new_form;
    }
    query(){
        this.setState({
            query:{
                ...this.state.form
            },
            currentPage:1
        });
        this.props.search(this.state.form,{
            currentPage:1,
            pageSize:this.state.pageSize,
        });
    }
    empty(){
        this.setState({
            query:this.getInitForm(),
            form:this.getInitForm(),
            currentPage:1
        });
        this.props.search(this.getInitForm(),{
            currentPage:1,
            pageSize:this.state.pageSize,
        });
    }
    getTableProps(){
        const t = this;
        const tbcfg = t.props.tableCfg;
        return {
            columns:tbcfg.tableColumns,
            dataSource:tbcfg.tableData,
            startIndex:(t.state.currentPage-1)*t.state.pageSize+1, //后端分页
            indexColumn:true,
            autoFit:true,
            size:'small',
            onChange(pagination, filters, sorter){
                t.props.search(t.state.query,{
                    pageSize:pagination.pageSize,
                    currentPage:pagination.current
                })
                t.setState({
                    currentPage:pagination.current
                })
            },
            onRowClick(record, index, event){
                t.props.hidePopover();
                if(typeof t.props.selectRow === 'function'){
                    t.props.selectRow(record);
                } 
                
            },
            pagination:{
                showQuickJumper: true,
                current:t.state.currentPage, 
                total:tbcfg.total, 
                pageSize:t.state.pageSize,
                showTotal: total => `合计 ${tbcfg.total} 条`
            }
        }
    }
    formGenerator(formCfg){
        const t = this;
        return (
            <div>
            {
                formCfg.map((item,index)=>{
                    switch(item.type){
                        case 'input':
                            return (<div key={index} className={styles.formGrid}>
                                <div className={styles.gridTitle}>
                                    {item.name}
                                </div>
                                <div className={styles.gridContent}>
                                    <Input value={t.state.form[item.key]} 
                                    style={{width:'100%'}}
                                    onChange={(e)=>{
                                        t.setState({
                                            form:{
                                                ...t.state.form,
                                                [item.key]:e.target.value
                                            }
                                        })
                                    }}/>
                                </div>
                                
                            </div>)
                        case 'select':
                            return (<div key={index} className={styles.formGrid}>
                                <div className={styles.gridTitle}>
                                    {item.name}
                                </div>
                                <div className={styles.gridContent}>
                                    <Select getPopupContainer={()=>t.panel} 
                                    value={t.state.form[item.key]} 
                                    style={{width:'100%'}}
                                    onChange={(val)=>{
                                        t.setState({
                                            form:{
                                                ...t.state.form,
                                                [item.key]:val
                                            }
                                        })
                                    }}>
                                        {item.options.map((op)=><Option key={op.value}>{op.name}</Option>)}
                                    </Select>
                                </div>
                            </div>)
                        default:
                            return null;
                    }
                })
            }
            <div className={styles.buttonGrid}>
                <Button type="primary" size='small' onClick={()=>{
                    if(typeof this.props.search ==='function'){
                        this.query();
                    }
                }}>查询</Button>
                <Button size='small' onClick={()=>{
                    this.empty();
                }}>清空</Button>
            </div>
            </div>
        )
    }
    render(){
        return (
            <div ref={(t)=>{if(t)this.panel=t;}}>
                <div  className={styles.form_ct}>
                    {
                        this.formGenerator(this.props.formCfg)
                    }  
                </div>
                <div className={styles.grid_ct}>
                    <VtxDatagrid {...this.getTableProps()}/>
                </div>
            </div>
        )
    }
    
}

export default ComboGrid;

