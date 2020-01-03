
## VtxUeditor文档

> 使用百度ueditor 2次封装

```
几点注意事项:
1.使用富文本组件项目,发布时需要做nginx代理配置(最后又案例)
2.富文本渲染项目,也需要做nginx代理配置(图片渲染需要走代理)
```
> 配置参数

参数   | 说明                                      | 类型 | 默认值 
---    | ----------------------------------------  | ----   | ----
id     | 文本框父级id(避免多文本编辑id重复,可不传) | string | -
value  | 编辑回填文本(用于编辑功能使用)            | string(html) | -
config | ueditor参数配置,具体参数可参考[ueditor官网](http://fex.baidu.com/ueditor/#start-config)(无特殊要求,可省略) ==(UEDITOR_HOME_URL,serverUrl)2个参数不可改动==    | object | -
disabled| 是否关闭编辑编辑                         | bealoon| false
serverUrlprefix| 修改图片文件上传下载服务地址前缀(修改代理使用)  | string| 'editorURL'

> ref 函数调用方法

参数 | 说明 | 类型 | 默认值 
---  |---   |---   |---
getContent | 返回编辑器html字符串(含样式) | string | -

> #### nginx配置

```
// js服务获取地址 (含部分gif和文字信息)
// 改配置会和其他组件js服务代理相同,不用单独再设置,这边只是文档记录说明
"/ueditor": {
    "target": "http://10.10.10.173:8005",
    "changeOrigin": true,
},
//上传/下载/展示(可使用 serverUrlprefix 参数修改)
"/editorURL": {
    "target": "http://10.10.10.173:8080",
    "changeOrigin": true,
    "pathRewrite": { "^/editorURL" : "" }
}
//重要注意,在展示项目中的nginx里,也需要配置如上代理..不然图片,视频等无法展示

```


> #### 示例demo

```
<!--外部设置宽高-->
<div style={{width: 300,height: 400}}>
    <VtxUeditor 
        ref={(editor)=>this.editor = editor}
        config={{
            <!--设置编辑器最大字符数,图片附件算1-->
            maximumWords: 50000
        }}
    />
</div>
<!--获取html 字符串-->
this.editor.getContent();
```

