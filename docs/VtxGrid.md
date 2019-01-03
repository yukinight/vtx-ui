### VtxGrid文档

#### 1.VtxGrid(CRUD简单布局)

> 说明:一个根据配置,自动渲染出CRUD排版样式的组件
> 
> 注:写CRUD搜索条件部分,checkedBox/Radio,这2种类型的条件时,
> 
> 由于最小宽度为1000px,所以建议每个选择条件的字数在6个字符以内,并且选择条件的个数也在6个以内,如果条件多余6个,建议使用select去排版.

| **参数**             | **说明**    | **类型**    | **默认值** |
|----------------------|----------------------------------------|------------------------------|------------|
| titles               | 搜索条件之前的中文<br/>注:数组中 中文的顺序跟搜索条件放入的顺序要一致| Array[String] <br/> 例: ['日期时间选择','时间选择','下拉树选择''下拉选择','输入框','级联选择','时间范围选择','多选','单选'] | \--        |
| gridweight           | 搜索条件占位权重<br/>( 注:权重等级只有1,2,4. <br/>1:占位1/4行<br/> 2:占位1/2行<br/> 4:占位整行 ;<br/> 权重顺序跟搜索条件放入的顺序要一致; <br/> 强制要求,权重高的放在后面,不然自动渲染出来的排版错乱)                                                                                                                                    | Array[number] 例[1,1,2,4]                                                                                             | \--        |
| confirm              | 点击确认的回调函数                                                                                                                                             | Function                                                                                                              | \--        |
| clear                | 点击清空的回调函数                                                                                                                                             | Function                                                                                                              | \--        |
| confirmText          | 确认按钮文字                                                                                                                                                   | String                                                                                                                | 查询       |
| clearText            | 清空按钮文字                                                                                                                                                   | String                                                                                                                | 清空       |
| showMore/showAll     | 是否展示所有列                                                                                                                                                 | Bealoon                                                                                                               | false      |
| hiddenMoreButtion    | 是否隐藏展示更多的按钮<br/> 权重大于4时使用,小余4的时候本身就不纯在                                                                                                 | Bealoon                                                                                                               | false      |
| hiddenconfrimButtion | 是否隐藏确认更多的按钮                                                                                                                                         | Bealoon                                                                                                               | false      |
| hiddenclearButtion   | 是否隐藏清空更多的按钮                                                                                                                                         | Bealoon                                                                                                               | false      |
| className            | 自定义样式                                                                                                                                                     | \--                                                                                                                   | \--        |


---

#### 2. VtxGrid. VtxRow VtxGrid. VtxCol (栅格布局)

> 说明:栅格布局大致跟bootstrap的栅格性质一样.  
> 如果上面VtxGrid的自动布局方式不能满足要求,可以用VtxRow/VtxCol的栅格布局方式自己排版  

fieldName/colon
> 
> fieldName作为自定义标签,包裹搜索的字段.


```
例: <FieldName>时间范围选择</FieldName>  
colon作为自定义标签,包裹冒号

例: <Colon\>：</Colon>
```


注:这2个自定义标签的首字母必须小写,避免与react的组件命名方式冲突

#### 2.1 VtxRow props

| **参数** | **说明**                                                                                                | **类型** | **默认值** |
|----------|---------------------------------------------------------------------------------------------------------|----------|------------|
| gutter   | 栅格间隔                                                                                                | Number   | 0          |
| type     | 布局模式，可选 flex,( flex有浏览器兼容问题,不建议使用)                                                  | String   | \--        |
| glign    | flex 布局下的垂直对齐方式：top middle bottom(flex有浏览器兼容问题,不建议使用)                           | String   | top        |
| justify  | flex 布局下的水平排列方式：start end center space-around space-between(flex有浏览器兼容问题,不建议使用) | String   | start      |

2.2 VtxCol data 参数说明

| **参数** | **说明**                                                   | **类型**       | **必要性** |
|----------|------------------------------------------------------------|----------------|------------|
| span     | 栅格占位格数,为0相当于display:none,(一行分为24格)          | Number         | \--        |
| order    | 栅格的顺序.flex布局下有效(flex有浏览器兼容问题,不建议使用) | Number         | 0          |
| offset   | 栅格左侧间隔数,间隔内不可以有栅格                          | Number         | 0          |
| push     | 栅格向右移动格数                                           | Number         | 0          |
| pull     | 栅格向左移动格数                                           | Number         | 0          |
| xs       | \<768px 响应式栅格，可为栅格数或一个包含其他属性的对象     | Number\|Object | \--        |
| sm       | ≥768px 响应式栅格，可为栅格数或一个包含其他属性的对象      | Number\|Object | \--        |
| md       | ≥992px 响应式栅格，可为栅格数或一个包含其他属性的对象      | Number\|Object | \--        |
| lg       | ≥1200px 响应式栅格，可为栅格数或一个包含其他属性的对象     | Number\|Object | \--        |
| xl       | ≥1600px 响应式栅格，可为栅格数或一个包含其他属性的对象     | Number\|Object | \--        |

注 lg xl等响应式的宽度,是根据屏幕的宽度判断的(并非父元素宽度).
