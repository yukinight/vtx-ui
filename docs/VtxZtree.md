### VtxZTree 文档

> 优化性能的树，节点超过800建议用VtxZtree取代VtxTree


| **参数**           | **说明**  | **类型**  | **默认值** |
|--------------------|--------------------|------------------------|------------|
| data               | VtxTree展示的具体数据                                                                                                                                                                                                          | Array/[{},{}]                                                                                                                                                                                                                                            | \*         |
| multiple           | 支持点选多个节点（节点本身）                                                                                                                                                                                                   | Bool                                                                                                                                                                                                                                                     | false      |
| selectedKeys       | (受控)选中指定的树节点<br/> multiple为false时不能多选,所以 selectedKeys只有数组最后一个参数会生效<br/> **单向绑定，只有初始化时此数据会关联树，后续改动不会影响树，如初始化后需同步到树，请参考refreshFlag字段**                         | String[]                                                                                                                                                                                                                                                 | \--        |
| defaultExpandAll   | 默认是否展开所有树节点<br/> expandedKey存在时此配置失效                                                                                                                                                                             | Bool                                                                                                                                                                                                                                                     |            |
| expandedKeys       | (受控)展开指定的树节点<br/> 存在expandedKeys时,树的展开与收起效果就由expandedKeys决定<br/> **单向绑定，只有初始化时此数据会关联树，后续改动不会影响树，如初始化后需同步到树，请参考refreshFlag字段**                                     | String []                                                                                                                                                                                                                                                | \--        |
| autoExpandParent       | 是否自动展开父节点(expandedKeys内所有节点的父节点也自动展开)     | Bool  | false        |
| checkable          | 开启复选功能(true/false)                                                                                                                                                                                                       | Bool                                                                                                                                                                                                                                                     | false      |
| checkedKeys        | 改参数在checkable参数为true时使用,（受控）选中复选框的树节点 存在checkedKeys时,树的选中与反选效果就由checkedKeys决定<br/> **单向绑定，只有初始化时此数据会关联树，后续改动不会影响树，如初始化后需同步到树，请参考refreshFlag字段** | String[]                                                                                                                                                                                                                                                 | \--        |
| onClick            | 节点点击事件                                                                                                                                                                                                                   | Funciton({key,treeNode,selectedKeys, selectedNodes })<br/> Key:当前点击节点的key, <br/>treeNode:当前点击节点的原数据, <br/>selectedKeys:返回所有选中的key类型为数组,<br/> selectedNodes：所有选中节点的数据                                                                  | \--        |
| onCheck            | 改参数在checkable参数为true时使用, 节点复选事件                                                                                                                                                                                | Funciton({key,isChecked,checkedKeys, treeNode, checkedNodes })<br/> isChecked:true/false,true表示该节点被选中,false反之<br/> checkedKeys:返回的所有选中的节点key,用于在namespace中处理数据 <br/>treeNode:当前被改变选中状态的所有节点数据 <br/> checkedNodes:所有选中的节点数据                                                                                                                                     | \--        |
| onExpand           | 展开/收起事件                                                                                                                                                                                                                  | Funciton({key, isExpand, treeNode, expandedKeys })<br/> isExpand:bool/true(表示展开操作).false(表示收起操作) <br/>expandedKeys:array/所有展开的节点的key数组                                                                                                       | \--        |
| onRightClick       | 节点右击事件                                                                                                                                                                                                                   | Funciton({event, key,treeNode })                                                                                                                                                                                                                         | \--        |
| isShowSearchInput  | 显示和隐藏搜索框                                                                                                                                                                                                               | Bool                                                                                                                                                                                                                                                  | false      |
| placeholder  | 搜索框提示文字    | String     |  '请输入要查询的关键字'      |
| disableCheckboxAll | 禁掉所有节点checked响应                                                                                                                                                                                                        | Bool                                                                                                                                                                                                                                                  | 默认false  |
| customCfg          | 自定义配置项，参考[ztree的setting配置](http://www.treejs.cn/v3/api.php )  | Object  |            |
| refreshFlag        | 同步标志位，如需要同步数据到当前树，改变此标志位，eg: 1, 2, 3...                                                                                                                                                               | Number                                                                                                                                                                                                                                                   |            |

#### VtxZTree data 参数说明

| **参数** | **说明**                                                                                                                                     | **类型**        | **默认值** |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------|-----------------|------------|
| name     | 节点的名称                                                                                                                                   | String          | \*         |
| key      | 节点的id(整个树范围内的所有节点的 key 值不能重复,否则报错)                                                                                   | String          | \*         |
| children | 当前节点下的子节点数据(数据类型与 VtxTree data相同)<br/> **注意：节点有children属性会被当作父节点（即使children是空数组），没有此属性则为子节点** | Array/[{},{}]   | 默认[]     |
| chkDisabled      | 禁掉 checkbox                                                                                   | Bool          |         |
| selectable      | 设置节点是否可被点击选中                                                                                   | Bool          |    true     |
| icon     | 节点名称前的图片地址                                                                                                                         | String/http地址 | 默认 --    |
| iconSkin | 定义icon图标的样式<br/> **注意：如果iconSkin设为”test”, 在样式文件中实际的样式名应为”test_ico_docu”**                                             | String          |            |

#### 组件内部函数，供外部调用

> 可通过VtxZtree的实例调用（通常通过ref获取实例）  
> 1. clearSearch()  
>   清空查询框内的搜索内容  
> 2. expandAll()  
>   展开全部节点
> 3. collapseAll()  
>   收起全部节点
