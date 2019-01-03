### VtxCombogrid的Props配置

| **参数**    | **说明**   | **类型** | **默认值**  |
|-------------|------------------|----------|------------------------------------|
| search   | 下拉表格点击查询触发的函数，参数有form,pagination两个（表单和分页信息）  | Function   |    |
| clear     | 点击清空按钮执行的函数   | Function   |   |
| selectRow      | 选中行触发的事件，参数有rows一个（当前选中行数据） | Function   |   |
| value    | 下拉值   | *   |   |
| name     | 下拉框的title| String  |   |
| tableCfg | 下拉表格配置项| Object   |   |
| formCfg       | 下拉表单配置项| Object |   |

代码示例如下：

```
const cbProps = {
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
        tableData:data,
        tableColumns:[{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: text => <a href="#">{text}</a>,
        }, {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            nowrap:true,
        }],
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
```