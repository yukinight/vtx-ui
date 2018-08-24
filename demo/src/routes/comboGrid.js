import React from 'react';
import { connect } from 'dva';
import {VtxCombogrid} from 'vtx-ui';

function IndexPage(props) {
    const {dispatch,grid1,comboVal} = props;
    // let tbProps2 = {
    //     columns,
    //     dataSource:grid2,
    //     // startIndex:(currentPage-1)*pageSize+1, //后端分页
    //     autoFit:true,
    //     size:'small',
    //     rowSelection:{
    //         type:'checkbox',
    //         selectedRowKeys:grid2SelectedRowKeys,
    //         onChange(keys){
    //             dispatch({type:'demo/fetch',payload:{
    //                 v2:keys.map((i)=>grid2[i].name),
    //                 grid2SelectedRowKeys:keys
    //             }})                
    //         }
    //     },
    //     pagination:{
    //         showQuickJumper: true,
    //         // current:currentPage,  //后端分页数据配置参数1
    //         // total:data.length, //后端分页数据配置参数2
    //         // pageSize, //后端分页数据配置参数3
    //         // 当前页码改变的回调
    //         // onChange(page, pageSize){
    //         // },
    //         // pageSize 变化的回调
    //         // onShowSizeChange(current, size){
    //         // },
    //         showTotal: total => `合计 ${grid2.length} 条`
    //     }
    // }
   
    // const cbProps2 = {
    //     tableProps:tbProps2,
    //     name:'多选',
    //     comboVal:v2,
    //     clearVal(){
    //         dispatch({type:'demo/fetch',payload:{
    //             v2:[],
    //             grid2SelectedRowKeys:[]
    //         }})
    //     },
    //     form:form2
    // }
    const cbProps3 = {
        search(form,pagination){
            console.log(form,pagination)
        },
        clear(){
            dispatch({type:'demo/fetch',payload:{
                comboVal:''
            }})
        },
        selectRow(rows){
            dispatch({type:'demo/fetch',payload:{
                comboVal:rows.name
            }})
            console.log(rows)
        },
        value:comboVal,
        name:'测试',
        tableCfg:{
            tableData:grid1,
            tableColumns:columns,
            total:1000
        },
        formCfg:[
            {name:'公厕名称',type:'input',key:'fds'},
            {name:'地址',type:'select',key:'ddd',options:[
                {name:'aaa',value:'kkk'},
                {name:'gha',value:'fd'}
            ]},
            {name:'公厕名称6',type:'input',key:'dss'},
        ],
    }
  
    return (
        <div>
            <VtxCombogrid {...cbProps3} />
        </div>
    );
}


export default connect(({combogrid})=>combogrid)(IndexPage);


const columns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: text => <a href="#">{text}</a>,
    // width:200,
}, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    // width:200,
}, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    // width:200,
    nowrap:true,
}];

