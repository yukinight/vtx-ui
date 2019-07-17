### VtxModalList参考文档

> 1.组件使用范围  
> 用于CRUD的弹框快速布局,input的正则匹配,下拉和input的非空判断,验证提示等.
> 
> 2.注意事项  
> 新增和修改的保存功能,需要验证某些必填字段的是否为空和是否符合正则规范.在提交后台之前需要验证下.组件中有验证方法用于调用.  
> 所以使用该组件的时,需要使用class XXX extends
> React.Componet去创建.(需要使用refs来获取组件内对应的验证方法[submit,clear]) 
> 
> submit用于调用验证.  
> clear用于新增中清空按钮的清空验证.

---

#### ModalList参数

| 字段       | 说明                                                                                      | 类型    | 默认  |
|------------|-------------------------------------------------------------------------------------------|---------|-------|
| isRequired | true 初始不验证；false 初始验证； 只有初始化时有效   弹框展开后外部设置无效| Bealoon | false |
| visible    | VtxModal用于控制显示和隐藏的字段, 这边用来判断全局的正则判断控制                          | \--     | \--   |

> ModalList实例的方法(通过ref获取)
> 1. submit()  
> 调用组件验证功能,并返回是否验证通过(返回的是Promise对象),true通过,false不通过 接收时用then来接收
> 2. clear()  
> 用于新增中清空按钮的清空验证.

代码示例如下
```
<VtxModalList 
    ref={(lis)=>{this.lis = lis}}
    visible={visible}
    isRequired={true}
>
    <div data-modallist={{layout:{type: 'title',require: false,}}}>title</div>
    <div data-modallist={{layout:{type: 'text',require: true,}}}>dakjhd</div>
    <div data-modallist={{layout:{type: 'text',name: '测试',require: true,className: 'a',}}}>dakjhd</div>
    <div data-modallist={{layout:{type: 'title',require: false}}}>title2</div>
    <div data-modallist={{layout:{type: 'text',name: '测试',require: true}}}>dakjhd</div>
    <div data-modallist={{layout:{type: 'text',name: '测试'}}}>dakjhd</div>
    <Input 
        value={value1}
        onChange={(e)=>{
            dispatch({
                type: 'modalList/updateState',
                payload:{
                    value1: e.target.value
                }
            })
        }}
        data-modallist={{
            layout:{width: 60,name: '测试1',require: false,comType: 'input'},
            regexp:{
                value: value1,
                exp: /^\d*$/,
                errorMsg: '111',
                repete: {
                    url: '/apis/repete',
                    key: {name: value1}
                }
            }
        }}
    />
    <Button onClick={()=>{
        dispatch({
            type: 'modalList/updateState',
            payload: {
                lists: lists.length > 1?[2]:[1,2]
            }
        })
    }}>TTTT</Button>
    {
        isShow?
        <Input 
            value={value7}
            inherit
            style={{width: '100%'}}
            onChange={(e)=>{
                dispatch({
                    type: 'modalList/updateState',
                    payload:{
                        value7: e.target.value
                    }
                })
            }}
            data-modallist={{
                layout:{width: 50,name: '测试数字',require: true,maxNum: 50,comType: 'input'},
                regexp:{
                    value: value7,
                    exp: [function(){return true},/^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/],
                    errorMsg: ['必须是数字22222','必须是数字1']
                }
            }}
        />:null
    }
    <Input 
        value={value2}
        onChange={(e)=>{
            dispatch({
                type: 'modalList/updateState',
                payload:{
                    value2: e.target.value
                }
            })
        }}
        data-modallist={{
            layout:{width: 50,name: '测试1111',require: true},
            regexp:{
                value: value2,
                exp: /\S/
            }
        }}
    />
    <Input
        value={value3}
        onChange={(e)=>{
            dispatch({
                type: 'modalList/updateState',
                payload:{
                    value3: e.target.value
                }
            })
        }}
        data-modallist={{
            layout:{type: 'ctext',width: 100,name: '测试3333',require: true},
            regexp:{
                value: value3,
                exp: (val)=>{ if(/\S/.test(val)){return true}else{return false}}
            }
        }}
    />
    <Input 
        value={value4}
        onChange={(e)=>{
            dispatch({
                type: 'modalList/updateState',
                payload:{
                    value4: e.target.value
                }
            })
        }}
        data-modallist={{
            layout:{width: 50,name: '测试',require: true},
            regexp:{
                value: value4,
                exp: (val)=>{ if('123'.indexOf(val) > -1 ){return true}else{return false}}
            }
        }}
    />
    <Input
        inherit
        value={value5}
        onChange={(e)=>{
            dispatch({
                type: 'modalList/updateState',
                payload:{
                    value5: e.target.value
                }
            })
        }}
        data-modallist={{
            layout:{name: '测试nnnn',require: false,style: {width:'300px'}},
            regexp: {
                value: value5,
                exp: (val)=>{ if('111'.indexOf(val) > -1 ){return true}else{return false}}
            }
        }}
    />
    {aa}
    <Select
        value={select1}
        onChange={(val)=>{
            dispatch({
                type: 'modalList/updateState',
                payload: {
                    select1: val
                }
            })
        }}
        data-modallist={{
            layout:{width: 50,name: '测试',require: false,style: {width:'100%'}},
        }}
    >
        <Option value={'1'}>12</Option>
        <Option value={'2'}>2</Option>
        <Option value={'3'}>3</Option>
    </Select>

</VtxModalList>
```


#### 布局参数 data-modalList.layout

| 字段      | 说明                                                                                                                                  | 类型                                 | 默认      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|-----------|
| key       | 同层级dom的key不可以一样,不同层级可以相同.用于内部处理验证缓存使用.必传                                                               | String/num                           | \--       |
| require   | 在字段名称前加必填的 (\*) 设置require为true时,会主动验空                                                                              | boolean                              | false     |
| type      | 判断是什么类型的节点 <br/>'text':文本节点<br/> 'ctext':其他类型转成文本展示<br/> 'title':抬头提示节点(width定死100%)<br/> 'default':默认的新增,修改的节点 | String                               | 'default' |
| name      | 每个节点的节点名称(名称后面的冒号会自动添加[中文冒号]) 注:可以为空.为空时,require没有作用                                             | String 如:'编号'                     | null      |
| width     | 当前节点所占比整行的百分比                                                                                                            | number/100                           | 50        |
| style     | 整行的内连样式, width的样式属性会被width字段顶掉.                                                                                     | Object                               | \--       |
| maxNum    | 只有input和textarea时有用. 使用后会在后面有输入总数提示                                                                               | Number                               | \--       |
| className | 整行的className属性                                                                                                                   | \--                                  | \--       |
| isFullLine | 是否占整行                                                                                                                   | bealoon                                 | false       |
| comType   | 用于判断是否是input或textarea类型的输入框,用于配合maxNum                                                                              | String 只有一个类型 'input' 可以不填 |           |

#### 验证参数 data-modalList. regexp

> 说明:该参数只有在layout中type为default时有用.  
> 在require为true时,默认会验证是否为空.
> 
> 验证权重:  
> 是否为空(空) \> 是否符合规范  
> 是否为空(非空) \> 是否重复 \> 是否符合规范  
> 只有Input需要正则验证和重复验证,下拉和下拉树只验证是否为空.

| 字段     | 说明                                                                                                                                                                                                                           | 类型                                                              | 默认             |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|------------------|
| exp      | 正则匹配 <br/>可以是正在表达式, 也可以是验证的方法 支持数组形式,多次验证 注:验证方法规范<br/>接受1个参数(需验证值)<br/>     返回boolean| regexp/function/ array[regexp/function]                           | \--              |
| errorMsg | 正则匹配后的 错误提示 数组形式错误提示与exp的数组形式对应                                                                                                                                                                      | string/array[string]                                              | '数据不符合规范' |
| repete   | 验重 <br/>组件中会发送验重的请求,所以使用该功能,需要跟后台沟通, 验证参数自由商定<br/> 后台的返回格式如下: { //(自定义)警告的提示,默认是"字段重复" msg: '', //0接口成功,1接口失败 result: 0, //false重复,true 不重复 data: true }统一解析 | Object/ { key: '',//ajax参数(前后台自由商定) url:''//ajax的地址 } | \--              |
| value    | 需要验证的值, 用于验证下拉/下拉树,(因为下拉等组件取值方式不同) 必填 很重要,该属性没值,均以空验证                                                                                                                               | ''                                                                | \--              |
