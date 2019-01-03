### VtxExport&VtxExport2的Props配置

| **参数**        | **说明**   | **类型** | **默认值** |
|-----------------|----------------|----------|------------|
| downloadURL     | 导出文件服务的后台接口地址（必填）                                                                                                                            | string   |            |
| allButton       | 是否显示“导出全部”按钮                                                                                                                                        | Boolean  | true       |
| pageButton      | 是否显示“导出当前页”按钮                                                                                                                                      | Boolean  | true       |
| rowButton       | 是否显示“导出选中行”按钮                                                                                                                                      | Boolean  | true       |
| getExportParams | 返回导出参数的函数（必填），具体返回值可参照各项目组后端的要求（必须有返回值） <br/>函数参数exportType： <br/>'rows'表示导出行,<br/> 'page'表示导出当前页,<br/> 'all'表示导出全部 | Function |            |

> **VtxExport**会将getExportParams函数的返回值包在对象里( { parameters: Your object } )传给后台服务，因此返回值可以是复杂的对象   
> **VtxExport2**将getExportParams函数的返回值直接传给后台服务，返回值只能是一层的简单对象  

代码示例如下

```
//VtxExport Props
const exportProps = {
    downloadURL:'http://localhost:8002/',
    rowButton:false,
    getExportParams(exportType){
        const columnNames = "编号,名称,所属处置单位,监测类型,开始运行日期,排序号",
            columnFields = "code,name,factoryName,deviceTypeName,validStartTime,orderIndex",
            tenantId = '377ec8c660f74f95a13f059049877fcb',
            userId = 'b1a14052512e4648b015812eef2b50e9';
        switch (exportType){
            case 'rows':
                return {
                    authParam:{
                        tenantId,
                        userId,
                    },
                    param:{
                        ...{aa:111,bb:222},
                        columnNames,
                        columnFields,
                        downloadAll: false,
                        downloadIds: [1,2,3,4,5]
                    },
                };
            case 'page':
                return {
                    authParam:{
                        tenantId,
                        userId,
                    },
                    param:{
                        ...{aa:111,bb:222},
                        columnNames,
                        columnFields,
                        downloadAll: false,
                        downloadIds: [1,2,3,4,5]
                    },
                };
            case 'all':
                return {
                    authParam:{
                        tenantId,
                        userId,
                    },
                    param:{
                        ...{aa:111,bb:222},
                        columnNames,
                        columnFields,
                        downloadAll: true,
                    },
                };
        }
    }
}

//VtxExport2 Props
const exportProps2 = {
    downloadURL:'http://localhost:8002/',
    rowButton:false,
    getExportParams(exportType){
        const columnNames = "编号,名称,所属处置单位,监测类型,开始运行日期,排序号",
            columnFields = "code,name,factoryName,deviceTypeName,validStartTime,orderIndex",
            tenantId = '377ec8c660f74f95a13f059049877fcb',
            userId = 'b1a14052512e4648b015812eef2b50e9';
        switch (exportType){
            case 'rows':
                return {
                    tenantId,
                    userId,
                    ...{aa:111,bb:222},
                    columnNames,
                    columnFields,
                    downloadAll: false,
                    downloadIds: [1,2,3,4,5]
                };
            case 'page':
                return {
                    tenantId,
                    userId,
                    ...{aa:111,bb:222},
                    columnNames,
                    columnFields,
                    downloadAll: false,
                    downloadIds: [1,2,3,4,5]
                };
            case 'all':
                return {
                    tenantId,
                    userId,
                    ...{aa:111,bb:222},
                    columnNames,
                    columnFields,
                    downloadAll: true,
                };
        }
    }
}
```


