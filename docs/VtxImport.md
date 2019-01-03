### VtxImport的Props配置

| **参数**    | **说明**  | **类型** | **默认值**  |
|-------------|----------------------|----------|--------------------------------|
| uploadURL   | 导入文件的后台接口地址（必填）                                                            | String   |                                                                                                        |
| fileKey     | 传输文件的key值，后台接收文件所用                                                         | String   | ‘file’                                                                                                 |
| accept      | 允许接收的文件类型，默认为excel或csv （如需其他格式可自行配置，如无限制类型可配置为‘\*’） | String   | ‘application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv ’ |
| postData    | 额外传给后台的参数                                                                        | Object   |                                                                                                        |
| visible     | 控制导入弹框是否可见                                                                      | Boolean  |                                                                                                        |
| templateURL | 导入模板文件的下载地址                                                                    | String   |                                                                                                        |
| close       | 关闭导入窗口时触发的函数                                                                  | Function |                                                                                                        |
| afterUpload | 上传文件完毕后触发的函数，自带一个参数为后台返回的数据                                    | Function |                                                                                                        |


```
let importProps = {
  templateURL:'http://localhost:8989/',
  uploadURL:'http://localhost:8989/',
  postData:{tenantId:'haha'},
  visible:showUploadModal,
  close(){
    dispatch({type:'upload/fetch',payload:{
      showUploadModal:false
    }});
  },
  afterUpload(data){
    console.log(data)
  }
}

<VtxImport {...importProps}>
  <div>导入弹框内需要显示的内容</div>
</VtxImport>
```
