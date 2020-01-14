### VtxUpload 配置

> 二次封装的上传组件  
> VtxUpload 统一交互：点击图片附件，放大预览（为了兼容老版本暂保留VtxUpload和VtxUpload2两种引用方式，后续开发建议直接使用VtxUpload）  
> ~~VtxUpload2与VtxUpload配置项完全相同，唯一区别：~~  
> ~~VtxUpload点击图片附件，下载此图片~~；  
> ~~VtxUpload2点击图片附件，放大预览~~；

| **参数**         | **说明**   | **类型** | **默认值**  |
|-------|-----|--------|-------|
| action  | 后台上传文件的接口地址 (建议配置代理，否则IE9跨域上传会出现问题: /fileServer/uploadFile)  | string    |   |
| isDragger  | 是否使用拖拽上传方式(兼容IE10+)  | bealoon    | false  |
| draggerConfig  | 拖拽上传文本和图片控制(见如下draggerConfig示例)  | object    | -  |
| downLoadURL      | 后台文件下载的接口地址 后面带参数?id=用来接收文件id （建议配置代理:/fileServer/downloadFile?id=） | string ||
| thumbnailURL      | 缩略图服务的接口地址 后面带参数?id=用来接收文件id （建议配置代理）<br> 需要在图片列表显示缩略图的必须配此参数 | string ||
| mode             | 分为单文件模式(single):每次上传文件覆盖之前的文件, 多文件模式(multiple)：每次上传文件新增到文件列表里  | string   | ‘multiple’ |
| data             | 上传所需参数或返回上传参数的方法| object\|function(file)                                             | 无                                                             |
| showUploadList   | 是否展示 uploadList, 可设为一个对象，用于单独设定 showPreviewIcon 和 showRemoveIcon 设为false可配合fileList自定义文件列表 | Boolean or { showPreviewIcon?: boolean, showRemoveIcon?: boolean } | true|
| customizedButton | 自定义按钮组件及其样式| React组件 or DOM字符串| 无 |
| fileList         | 已经上传的文件列表（受控） 例：对象中必须带name, id两个属性，用来显示文件名，文件id， url为非必填属性，表示文件下载路径，如果没有此属性默认用downLoadURL+id拼接| object[]| []|
|| [{name: 'testxxx.png', id:'1d0283efd9eb47dfa977b3d57d7de0ff', url: http://192.168.1.207:18084/cloudFile/common/downloadFile?id=1d0283efd9eb47dfa977b3d57d7de0ff', }]|
||
| fileListVersion  | 用来同步外部的fileList数据到组件内部。目前组件只有初始化时加载fileList，初始化以后fileList变动不会影响组件内部状态及数据。当手动修改fileList后需要组件同步展示时可修改此参数，建议初始值为1，每次变动+1。| Number| 无|
| multiple         | 是否支持多选文件，ie10+ 支持。开启后按住 **ctrl** 可选择多个文件。| boolean| false|
| accept           | 接受上传的文件类型, 详见*input accept Attribute,* [标准 MIME 类型的完整列表](http://www.iana.org/assignments/media-types/)| string| 无 |
| listType         | 上传列表的内建样式，支持三种基本样式 text，picture，picture-card| string                                                             | 'text'|
| onSuccess        | 上传文件成功时的回调 可在此处修改state中的fileList| Function(file)                                                     | 无 |
| onError          | 上传文件出错时的回调| Function(file)                                                     | 无 |
| onRemove         | 点击移除文件时的回调 可在此处修改state中的fileList| Function(file)                                                     | 无 |
| viewMode         | 设为true时，组件不可上传文件同时不可删除文件，处于浏览模式| boolean                                                            | 无 |
| disabled         | 是否禁用| boolean                                                            | false|
| withCredentials  | 上传请求时是否携带 cookie| boolean| false|


> draggerConfig示例
```
draggerConfig: {
    img: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    mainText: '支持点击拖拽上传',
    subText: '文件格式支持word,excel,png...'
}
```

---

#### VtxUploadModal的配置

> 带有上传组件的弹窗

| **参数**  | **说明** | **类型** | **默认值** |
|----------|----------|------------|-----------|
| modal    | 见下方说明 | object   | 无         |
| upload   | 见下方说明 | object   | 无         |
| template | 下载模板的链接地址| String   | 无        |

---
- [x] modal：弹出的模态框的Props配置（必填）

> modal对象内的属性参考 AntUI的 *Modal组件* 
>
> 其中新增属性 **setContent**: function(files){} 
> 用来在模态框内生成自定义的文件列表样式，可配合下面的upload属性内的showUploadList设为false，即可自定义文件列表样式 
>
> 修改属性**onOk**: function(files){}， 
> antUI 原生模态框的onOk函数不带参数，此处传入文件列表作为参数，以便将模态框内的上传文件列表保存到redux的state里，例： 

```

modal: { 
    title:’上传’, 
    visible: showUploadModal, 
    setContent(files){ 
        return ( <div> 
            {files.map((item,index)=><span>{item.name}</span>)} 
            </div>) 
    }, 
    onOk(files){ 
        console.log(files); 
        dispatch({type:'example/fetch',payload:{ fileList:files }}) 
    }, 
    onCancel(){ 
        dispatch({type:'example/fetch',payload:{ showUploadModal:false }}); 
    },
}
```
---
- [x] upload  模态框内的上传组件的Props配置（必填）

> 参数具体含义参照上面的VortexUpload 的Props配置

> 注意：此处可以不填onSuccess和onRemove两个配置项函数，处理文件列表变动的操作写在模态框的onOk和onCancel两个函数里，例：

```
upload: { 
    fileList: [], 
    multiple:true, 
    onError(res){ 
        message.info(`${res.name} file upload failed.`); 
    }, 
}
```


---

##### Nginx部署代理配置

为了兼容IE浏览器跨域上传文件，需要额外配置nginx
代理添加上传文件的代理（其他浏览器不需要配置）

```
上传服务器代理配置

location /fileServer {

proxy_pass http://192.168.1.207:18084/cloudFile/common/uploadFile;

proxy_redirect off;

proxy_set_header Host $host:$server_port;

proxy_set_header X-Real-IP $remote_addr;

proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

client_max_body_size 0;

}
```
