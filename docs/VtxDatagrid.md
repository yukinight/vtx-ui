### VtxDatagrid配置项

**注：此处列出的API为Ant Design常用的属性
+封装新增或修改的，详细的关于**[Table](https://ant.design/components/table-cn/)**,**
[pagination](https://ant.design/components/pagination-cn/)**的配置请参考Ant
Design官方文档**

---

| **参数**   | **说明**  | **类型**   | **默认值**  |
|-------------------------------|-----------------------------|----------------------------|--------------------------|
| autoFit                             | ==封装新增==，设为true时表格自适应于外部高度（需要外部容器设有高度），同时分页组件位于容器右下角                 | boolean                               | \-                                                                                                                                                   |
| indexColumn                         | ==封装新增==，设为true时显示行的序列号                                  | boolean                               | \-                                                                                                                                                   |
| indexTitle                          | ==封装新增==，设置index列的标题                                                                                  | String                                | ‘ ’                                                                                                                                                  |
| startIndex                          | ==封装新增==，与上面的indexColumn配合使用，表示序列号的初始值，后台分页加载数据时使用                            | Number                                | 1                                                                                                                                                    |
| hideColumn                          | ==封装新增==，设为true时可以手动选择需要隐藏的列         | boolean                               |      |
| defaultVisibleCols                  | ==封装新增==，默认需要显示的列(配合hideColumn参数)| Array[‘需要显示列的key值’]            |          |
| colsVisibilityChange                  | ==封装新增==，当切换隐藏显示列时将会触发此函数| function(colsStatus)              |        |
| headFootHeight                      | ==封装新增==，自适应表格配合autoFit使用，表示表格除了表体以外的高度。自定义表头或表尾高度以后需自行调整          | Number                                | 115                                                                                                                                                  |
| [rowSelection](#_rowSelection)      | 列表项是否可选择，配置项                                                                                     | object                                | null                                                                                                                                                 |
| [pagination](#分页配置项pagination) | 分页器，配置项参考 [pagination](https://ant.design/components/pagination-cn/)，设为 false 时不展示和进行分页 | object                                |                                                                                                                                                      |
| size                                | 正常或迷你类型，default or small                                                                              | string                                | default                                                                                                                                              |
| dataSource                          | 数据数组                                                                                                     | any[]                                 |                                                                                                                                                      |
| [columns](#表格列配置项columns)     | 表格列的配置描述，具体项见下表                                                                               | [ColumnProps](https://git.io/vMMXC)[] | \-                                                                                                                                                   |
| rowKey                              | 表格行 key 的取值，可以是字符串或一个函数                                                                    | string\|Function(record):string       | 'key'                                                                                                                                                |
| rowClassName                        | 表格行的类名                                                                                                 | Function(record, index):string        | \-                                                                                                                                                   |
| loading                             | 页面是否加载中                                                                                               | boolean                               | false                                                                                                                                                |
| onChange                            | 分页、排序、筛选变化时触发                                                                                   | Function(pagination, filters, sorter) |                                                                                                                                                      |
| onRowClick                          | 处理行点击事件                                                                                               | Function(record, index)               | \-                                                                                                                                                   |
| bordered                            | 是否展示外边框和列边框                                                                                       | boolean                               | false                                                                                                                                                |
| showHeader                          | 是否显示表头                                                                                                 | boolean                               | true                                                                                                                                                 |
| footer                              | 表格尾部                                                                                                     | Function(currentPageData)             |                                                                                                                                                      |
| title                               | 表格标题                                                                                                     | Function(currentPageData)             |                                                                                                                                                      |
| scroll                              | 横向或纵向支持滚动，也可用于指定滚动区域的宽高度：{{ x: true, y: 300 }}                                      | object                                | \-                                                                                                                                                   |

---

#### 分页配置项pagination

| **参数**         | **说明**                                     | **类型**                 | **默认值**               |
|------------------|----------------------------------------------|--------------------------|--------------------------|
| current          | 当前页数 （后台分页加载需使用）              | number                   | \-                       |
| defaultCurrent   | 默认的当前页数                               | number                   | 1                        |
| total            | 数据总数 （后台分页加载需使用）              | number                   | 0                        |
| defaultPageSize  | 默认的每页条数                               | number                   | 10                       |
| pageSize         | 每页条数 （后台分页加载需使用）              | number                   | \-                       |
| onChange         | 页码改变的回调，参数是改变后的页码及每页条数 | Function(page, pageSize) | noop                     |
| showSizeChanger  | 是否可以改变 pageSize                        | boolean                  | false                    |
| pageSizeOptions  | 指定每页可以显示多少条                       | string[]                 | ['10', '20', '30', '40'] |
| onShowSizeChange | pageSize 变化的回调                          | Function(current, size)  | noop                     |
| showQuickJumper  | 是否可以快速跳转至某页                       | boolean                  | false                    |
| size             | 当为「small」时，是小尺寸分页                | string                   | ""                       |
| simple           | 当添加该属性时，显示为简单分页               | boolean                  | \-                       |
| showTotal        | 用于显示数据总量和当前数据顺序               | Function(total, range)   | \-                       |


---

#### 表格列配置项Columns

列描述数据对象，是 columns 中的一项，Column 使用相同的 API。

| **参数**      | **说明**                                                                                                                                                                                                                                                                                                                                | **类型**                         | **默认值** |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|------------|
| title         | 列头显示文字                                                                                                                                                                                                                                                                                                                            | string\|ReactNode                | \-         |
| key           | React 需要的 key，建议设置                                                                                                                                                                                                                                                                                                              | string                           | \-         |
| dataIndex     | 列数据在数据项中对应的 key，支持a.b.c 的嵌套写法                                                                                                                                                                                                                                                                                        | string                           | \-         |
| render        | 生成复杂数据的渲染函数，参数分别为当前行的值，当前行数据，行索引，\@return里面可以设置表格*行/列合并*                                                                                                                                                                                                                                   | Function(text, record, index) {} | \-         |
| renderButtons | ==封装新增==，不与上面render同时使用。用来生成==按钮列==的配置项，详细使用见下方  | Array                            |            |
| nowrap        | ==封装新增==，此列内容不可换行，如果显示不全，出现省略号，鼠标移至文字上方，会出现全称                                                                                                                                                                                                                                                      | boolean                          |            |
| sorter        | 排序函数，本地排序使用一个函数(参考*Array.sort* 的 compareFunction)，需要服务端排序可设为 true                                                                                                                                                                                                                                          | Function\|boolean                | \-         |
| colSpan       | 表头列合并,设置为 0 时，不渲染                                                                                                                                                                                                                                                                                                          | number                           |            |
| width         | 列宽度                                                                                                                                                                                                                                                                                                                                  | string\|number                   | \-         |
| className     | 列的 className                                                                                                                                                                                                                                                                                                                          | string                           | \-         |
| fixed         | 列是否固定，可选 true(等效于 left)'left' 'right'                                                                                                                                                                                                                                                                                        | boolean\|string                  | false      |
| sortOrder     | 排序的受控属性，外界可用此控制列的排序，可设置为 'ascend' 'descend'false                                                                                                                                                                                                                                                                | boolean\|string                  | \-         |
| onCellClick   | 单元格点击回调                                                                                                                                                                                                                                                                                                                          | Function(record, event)          | \-         |

> renderButtons 代码示例

```
[
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
      },
]
//2018/04/27 更新 增加函数配置方式
renderButtons: (text, record, index) => {   
    return [
        {name: '修改', onClick(rowData) {  
            console.log("修改"); 
        }},
        index%2 === 1 ? 
        {name: '偶数列',onClick(rowData) {
            console.log("偶数列");}}:
        {name: '奇数列', onClick(rowData) {
            console.log("奇数列");
        }}
    ]
}
```


---

#### 行选择配置项rowSelection

选择功能的配置。

| **参数**                 | **说明**                                                                                            | **类型**                                     | **默认值** |
|--------------------------|-----------------------------------------------------------------------------------------------------|----------------------------------------------|------------|
| type                     | 多选/单选，checkbox or radio                                                                        | string                                       | checkbox   |
| selectedRowKeys          | 指定选中项的 key 数组，需要和 onChange 进行配合                                                     | string[]                                     | []         |
| onChange                 | 选中项发生变化的时的回调                                                                            | Function(selectedRowKeys, selectedRows)      | \-         |
| getCheckboxProps         | 选择框的默认属性配置                                                                                | Function(record)                             | \-         |
| onSelect                 | 用户手动选择/取消选择某列的回调                                                                     | Function(record, selected, selectedRows)     | \-         |
| onSelectAll              | 用户手动选择/取消选择所有列的回调                                                                   | Function(selected, selectedRows, changeRows) | \-         |
| onSelectInvert           | 用户手动选择反选的回调                                                                              | Function(selectedRows)                       | \-         |
| [selections](#selection) | 自定义选择项[配置项](https://ant.design/components/table-cn/#selection), 设为true时显示默认选择项 | object[]                                     | true       |

### selection

| **参数** | **说明**                   | **类型**                    | **默认值** |
|----------|----------------------------|-----------------------------|------------|
| key      | React 需要的 key，建议设置 | string                      | \-         |
| text     | 选择项显示的文字           | string\|React.ReactNode     | \-         |
| onSelect | 选择项点击回调             | Function(changeableRowKeys) | \-         |
