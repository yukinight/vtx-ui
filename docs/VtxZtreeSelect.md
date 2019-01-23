### VtxZtreeSelect文档

> 性能优化的下拉树


| **参数**             | **说明**                                   | **类型**                                                                                                                                                   | **默认值**         |
|----------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| data                 | VtxZtreeSelect展示的具体数据               | Array/[{},{}]                                                                                                                                              | \*                 |
| disabled             | 控制下拉树是否可以使用                     | Boolean                                                                                                                                                    | False              |
| treeCheckable        | 是否有复选框(有复选框自动开启多选)         | Boolean                                                                                                                                                    | False              |
| multiple             | 是否可以复选                               | Boolean                                                                                                                                                    | False              |
| treeDefaultExpandAll | 默认下拉树全部展开                         | Boolean                                                                                                                                                    | False              |
| expandedKeys | 展开指定的树节点                        | Array     |               |
| value                | onChange函数返回的value,用于展示选择的选项 | Array[String] <br/>   例:[' value', value]| \--                |
| style                | 下拉树,选择框的样式                        | Object <br/>例:{width: ’200px’}                                                                                                                                 |                    |
| dropdownStyle        | 下拉树,下拉框的样式                        | Object <br/>例:{height: ’300px’}                                                                                                                                | { height:’300px’ } |
| showSearch           | 显示下拉树搜索框                           | Boolean                                                                                                                                                    | False              |
| placeholder          | 选择框默认文字                             | String                                                                                                                                                     | \--                |
| onChange             | 下拉树选中回调方法（单选和多选使用一样方法）| Function({nodes,keys,leafKeys,names })<br/> nodes:返回所有选中节点信息,<br/> keys:返回所有选中节点key,<br/> leafKeys:返回所有选中叶子节点key,<br/> Names:返回所有选中节点name, | \--                |

#### VtxZtreeSelect 树子节点参数配置

| **参数** | **说明**                                                   | **类型**        | **必要性** |
|----------|------------------------------------------------------------|-----------------|------------|
| name     | 节点的名称                                                 | String          | \*         |
| key      | 节点的id(整个树范围内的所有节点的 key 值不能重复,否则报错) | String          | \*         |
| children | 当前节点下的子节点数据(数据类型与 VtxTree data相同)<br/> **注意：节点有children属性会被当作父节点（即使children是空数组），没有此属性则为子节点** | Array/[{},{}]   | 默认[]     |
| chkDisabled      | 禁掉 checkbox                                                                                   | Bool          |         |
| selectable      | 设置节点是否可被点击选中                                                                                   | Bool          |    true     |
| icon     | 节点名称前的图片地址                                       | String/http地址 | 默认 --    |
| iconSkin | 定义icon图标的样式<br/> **注意：如果iconSkin设为”test”, 在样式文件中实际的样式名应为”test_ico_docu”**                                             | String          |            |


---

**VtxZtreeSelect内部方法**(通过ref获取实例调用)：

> 1.  clearSearch()  
> 清空当前树的搜索结果
