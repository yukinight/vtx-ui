### VtxTree 文档


| **参数**  | **说明**    | **类型**    | **默认值** |
|--------------------|---------------------------|------------------------|------------|
| data    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;        | VtxTree展示的具体数据   | Array/[{},{}]    | \*         |
| multiple           | 支持点选多个节点（节点本身）  | Bealoon   | false      |
| selectedKeys       | (受控)选中指定的树节点 <br/>multiple为false时不能多选,所以 selectedKeys只有数组第一个参数会生效<br/> 存在selectedKeys时,树的选中/不选中效果就由selectedKeys决定 | String[] | \--        |
| isExpandAll        | 展开/收起所有树节点('openAll'/'closeAll'/'other')<br/> isExpandAll参数为('openAll'/'closeAll')时expandedKeys失效,所以主动控制expandedKeys时需要将isExpandAll改为('other')     | String     | 'other'    |
| expandedKeys       | (受控)展开指定的树节点 <br/>存在expandedKeys时,树的展开与收起效果就由expandedKeys决定  | String []  | \--        |
| autoExpandParent   | 是否自动展开父节点<br/> 1.控制expandedKeys来控制树的展开和收起时,需要将autoExpandParent改为false.<br/> 2.在isShowSearchInput为true时,自己控制的onChange和 onSubmit方法中需要将autoExpandParent改为true.  | Bealoon | true       |
| checkable          | 开启复选功能(true/false)   | Bealoon   | false      |
| checkedKeys        | 改参数在checkable参数为true时使用,（受控）选中复选框的树节点<br/> 存在checkedKeys时,树的选中与反选效果就由checkedKeys决定  | String[]  | \--        |
| isGangedChecked    | 改参数在checkable参数为true时使用, 关联节点点击事件onClick和点击复选框事件onCheck,(在isGangedChecked为true时,即关联时,onSelect参数将失效,点击节点后会执行onCheck的事件)   | Bealoon   | false      |
| onClick            | 节点点击事件, isGangedChecked生效时,该事件无效,执行的是onCheck事件  | Funciton({key,treeNode, selectedKeys }) selectedKeys:在multiple为false时,返回的值与key相同, 当multiple为true时,返回所有选中的key类型为数组 | \--        |
| onCheck            | 改参数在checkable参数为true时使用, 节点复选事件   | Funciton({key,isChecked, checkedKeys, treeNode, leafNode }) <br/>isChecked:true/false,true表示该节点被选中,false反之<br/> checkedKeys:返回的所有选中的节点key,用于在namespace中处理数据 treeNode:当前点击的节点数据<br/>leafNode:所有选中的叶子节点数据 |
| onLoadData         | 异步加载数据(跟onExpand事件冲突,含有onloadData事件时,onExpand事件失效)<br/> 回调方法示例: function onLoadData({key,treeNode,isExpand,resolve }) { <br/>return dispatch({ type:'xxx', payload: { <br/>resolve: resolve//带入到effects中, 等异步数据返回成功后返回 如:return resolve(); } <br/>}) }<br/> 按如上方式调用,点击展开时,还有加载动画,否则没有.<br/> Resolve:可以在网上参照Promise <br/>通过操作expandedKeys来改变树的展开状态,所以要将isExpandAll改为'other'  | Funciton({key,treeNode,isExpand,resolve })<br/> key:操作的对应节点key<br/>  treeNode: 操作的对应节数据 resolve: Promise方法的返回使用方式如说明  | \--        |
| onExpand           | 展开/收起事件 <br/>通过操作expandedKeys来改变树的展开状态,所以要将isExpandAll改为'other'  | Funciton({key, isExpand, treeNode, expandedKeys })<br/> isExpand:bealoon/true(表示展开操作).false(表示收起操作)<br/> expandedKeys:array/所有展开的节点的key数组  | \--        |
| onRightClick       | 节点右击事件  | Funciton({event, key,treeNode })  | \--        |
| onLoad             | VtxTree树加载完后执行   <br/>   (在onLoad回调方法中执行dispatch方法,会因为循环调用而死循环,所以在想在onload方法中使用dispatch,就要在传onload方法时做终止判断,如下示例:)     <br/>  onload={(true/false?onload:'')}  | Function({leafNode,leafKeys})<br/>   leafNode:所有叶子节点的数据对象 <br/>   leafKeys:所有叶子节点的key  | \--        |
| isShowSearchInput  | 显示和隐藏搜索框  | Bealoon  | false      |
| searchInput        | 搜索框参数详见1.3  | Object  | \--        |
| disabledAll        | 禁掉所有节点响应  | Bealoon  | 默认false  |
| disableCheckboxAll | 禁掉所有节点checked响应  | Bealoon  | 默认false  |
| width              | 设置没个节点的最大宽度   <br/>  超过宽度,以...省略处理   | number 例:100   | 100        |

#### VtxTree data 参数说明

| **参数**        | **说明**                                                                   | **类型**        | **必要性** |
|-----------------|----------------------------------------------------------------------------|-----------------|------------|
| name            | 节点的名称                                                                 | String          | \*         |
| key             | 节点的id(整个树范围内的所有节点的 key 值不能重复,否则报错)                 | String          | \*         |
| children        | 当前节点下的子节点数据(数据类型与 VtxTree data相同)                        | Array/[{},{}]   | 默认[]     |
| isLeaf          | 设定当前节点为叶子节点,叶子节点将没有展开按钮                              | Bealoon         | 默认false  |
| icon            | 节点名称前面的iconfont                                                     | String          | 默认 --    |
| antdIcon        | 节点名称前面的iconfont (可以使用 antd的icon),无需引iconfont的样式表        | String          | 默认--     |
| iconClassName   | Icon自定义样式                                                             | Css             | \--        |
| img             | 节点名称前的 图片(跟icon/antdIcon冲突,在icon/antdIcon存在时,img无效不渲染) | String/http地址 | 默认 --    |
| disabled        | 禁掉节点响应                                                               | Bealoon         | 默认false  |
| disableCheckbox | 禁掉节点checked响应                                                        | Bealoon         | 默认false  |

#### VtxTree searchInput参数说明

| **参数** | **说明**                                                                                                                                                           | **类型**                                      | **必要性** |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|------------|
| render   | 自定义搜索框样式 <br/> render: (onChange,onSubmit)=\>{<br/> return( \<div\> <br/>\<input type="text" onChange={onChange} /\> <br/>\<div onClick={onSubmit}\>搜索\</div\> <br/>\</div\> ); }, | Function( onChange,onSubmit)<br/>return(ReactNode)                  | \--        |
| onChange | 自定义输入框的onChange事件                                                                                                                                         | Function({ val,keys })                        | \--        |
| onSubmit | 自定义输入框的 onSubmit事件                                                                                                                                        | Function({ val,keys })                        | \--        |
| color    | 自定义搜索高亮字体颜色                                                                                                                                             | String/例:'\#000'                             | 默认\#f50  |
