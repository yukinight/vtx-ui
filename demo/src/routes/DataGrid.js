import React from 'react';
import { connect } from 'dva';
import { Table, Icon, Popconfirm, Input,message, Tooltip } from 'antd';
import styles from './DataGrid.less';
import {VtxDatagrid} from 'vtx-ui';

function IndexPage(props) {
  const {dispatch, tableData,defaultVisibleCols,test,currentPage,pageSize,totalItems,selectedRowKeys} = props;

  const columns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: text => <a href="#">{text}</a>,
    width:200,
  }, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width:200,
    sorter:function(a,b){
      if (a.age<b.age) {
        return -1;
      }
      else if (a.age>b.age) {
        return 1;
      }
      // a must be equal to b
      return 0;
    },
  }, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    width:200,
    nowrap:true,
    render:(text, record)=>(record.editMode? <Input value={record.address} onChange={(e)=>{
      dispatch({type:'datagrid/editRow',payload:{
        key:record.key,
        address: e.target.value
      }});
    }}/>: text)
  }, {
    title: '自定义Button',
    key: 'action',
    // width:200,
    render: (text, record) => (
      <span>
        <a onClick={()=>{}}>查看</a>
        <span className="ant-divider" />
        {
          record.editMode ? 
          <a onClick={()=>{
            dispatch({type:'datagrid/editRow',payload:{
              key: record.key,
              editMode:false
            }})
          }}>保存</a>
          :
          <a onClick={()=>{
            dispatch({type:'datagrid/editRow',payload:{
              key: record.key,
              editMode:true
            }})
          }}>修改</a>
        }
        <span className="ant-divider" />
        <Popconfirm title="确定删除吗？" okText="确定" cancelText="取消" onConfirm={()=>{
          message.info('删除')
        }} >
          <a>删除</a>
        </Popconfirm>
      </span>
    ),
  },, {
    title: '封装Button',
    key: 'autoaction',
    // width:200,
    renderButtons:[
      {
        name:'查看',
        onClick(rowData){
          message.info('查看'+rowData.key,5);
        }
      },{
        name:'删除',
        onClick(rowData){
          message.info('删除'+rowData.key,5);
        }
      },{
        name:'编辑',
        onClick(rowData){
          message.info('编辑'+rowData.key,5);
        }
      },{
        name:'hehei',
        onClick(rowData){
          let t= Math.random();
          message.info(t)
        }
      },{
        name:'test',
        onClick(rowData){
          message.info('dfsf');
        }
      }
    ],
  }];

  let vProps = {
    columns,
    dataSource:tableData,
    defaultVisibleCols,
    indexColumn:true, //用了这个属性column里的width不能用百分比
    indexTitle:'#序号#',
    startIndex:(currentPage-1)*pageSize+1, //后端分页
    autoFit:true,
    hideColumn:true,
    scroll:{
      x:1000,
    },
    rowSelection:{
      type:'checkbox',
      selectedRowKeys,
      onChange(keys){
        dispatch({type:'datagrid/fetch',payload:{
            selectedRowKeys:keys,
        }})
      }
    },
    // 分页切换
    onChange(pagination, filters, sorter){
      // 获取下一页数据
      dispatch({type:'datagrid/getTableData',payload:{
        currentPage:pagination.current,
        pageSize: pagination.pageSize
      }})

      // 清空勾选行
      dispatch({type:'datagrid/fetch',payload:{
          selectedRowKeys:[]
      }})
    },
    pagination:{
        showSizeChanger: true,
        // pageSizeOptions: ['10', '20', '30', '40','50'],
        showQuickJumper: true,
        current:currentPage,  //后端分页数据配置参数1
        total:totalItems, //后端分页数据配置参数2
        pageSize, //后端分页数据配置参数3
        showTotal: total => `合计 ${total} 条`
    }
  }
  return (
    <VtxDatagrid {...vProps}/>
  )
}

IndexPage.propTypes = {
};

export default connect(({datagrid})=>datagrid)(IndexPage);
