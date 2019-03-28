## vtx-ui

> 基于[ant-design](https://2x.ant.design/docs/react/introduce-cn)封装的UI工具

### 安装

```bash
# Install
$ npm install vtx-ui
#或者
$ yarn add vtx-ui
```

### 文档
- [VtxCombogrid](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxCombogrid.md)
- [VtxDatagrid](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxDatagrid.md)
- [VtxDate](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxDate.md)
- [VtxImport](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxImport.md)
- [VtxExport](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxExport.md)
- [VtxUpload](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxUpload.md)
- [VtxModal](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxModal.md)
- [VtxGrid](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxGrid.md)
- [VtxModalList](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxModalList.md)
- [VtxTree](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxTree.md)
- [VtxTreeSelect](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxTreeSelect.md)
- [VtxZtree](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxZtree.md)
- [VtxZtreeSelect](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxZtreeSelect.md)
- [VtxMap](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxMap.md)
- [VtxSearchMap](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxSearchMap.md)
- [VtxOptMap](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxOptMap.md)
- [VtxRpsFrame](https://github.com/yukinight/vtx-ui/blob/master/docs/VtxRpsFrame.md)

#### 全量导入引用方式（==不推荐==）：

```bash
# 下拉表格组件
$ import {VtxCombogrid} from 'vtx-ui';

# 表格组件
$ import {VtxDatagrid} from 'vtx-ui';

# 日期组件
$ import {VtxDatePicker,VtxMonthPicker,VtxYearPicker,VtxRangePicker,VtxTimePicker} from 'vtx-ui';

# 导出组件
$ import {VtxExport,VtxExport2} from 'vtx-ui';

# 导入组件
$ import {VtxImport} from 'vtx-ui';

# 上传组件
$ import {VtxUpload,VtxUploadModal,VtxUpload2} from 'vtx-ui';

# 页面头部查询组件
$ import {VtxGrid,VtxModeGrid} from 'vtx-ui';

# 地图组件(地图组件的ref函数现在改为getMapInstance)
$ import {VtxMap,VtxOptMap,VtxZoomMap} from 'vtx-ui';

# 表单组件
$ import {VtxInput,VtxSelect,Option,OptGroup} from 'vtx-ui';
$ import {VtxModalList} from 'vtx-ui';

# 弹出框组件
$ import {VtxModal,DraggableModal} from 'vtx-ui';

# 地图弹出框组件
$ import {VtxSearchMap} from 'vtx-ui';

# 树组件(VtxZtree主要用于大量节点的树，性能有所优化，api与VtxTree相比有部分改动，请仔细阅读文档)
$ import {VtxTree} from 'vtx-ui';
$ import {VtxZtree} from 'vtx-ui';

# 下拉树组件
$ import {VtxTreeSelect} from 'vtx-ui';
$ import {VtxZtreeSelect} from 'vtx-ui';

# 报表组件
$ import {VtxRpsFrame} from 'vtx-ui';
```

#### 使用babel-plugin-import动态加载引用方式(==推荐==)：

```bash
# 下拉表格组件
$ import {VtxCombogrid} from 'vtx-ui';

# 表格组件
$ import {VtxDatagrid} from 'vtx-ui';

# 日期组件
$ import {VtxDate} from 'vtx-ui';
$ const {VtxDatePicker,VtxMonthPicker,VtxYearPicker,VtxRangePicker,VtxTimePicker} = VtxDate;

# 导出组件
$ import {VtxExport} from 'vtx-ui';
$ const {VtxExport2} = VtxExport;

# 导入组件
$ import {VtxImport} from 'vtx-ui';

# 上传组件
$ import {VtxUpload} from 'vtx-ui';
$ const {VtxUploadModal,VtxUpload2} = VtxUpload;

# 页面头部查询组件
$ import {VtxGrid} from 'vtx-ui';
$ const {VtxModeGrid} = VtxGrid;

# 地图组件(地图组件的ref函数现在改为getMapInstance)
$ import {VtxMap} from 'vtx-ui';
$ const {VtxOptMap,VtxZoomMap} = VtxMap;

# 表单组件
$ import {VtxForm} from 'vtx-ui';
$ const {VtxInput,VtxSelect,Option,OptGroup} = VtxForm;
$ import {VtxModalList} from 'vtx-ui';

# 弹出框组件
$ import {VtxModal} from 'vtx-ui';
$ const {DraggableModal} = VtxModal;

# 地图弹出框组件
$ import {VtxSearchMap} from 'vtx-ui';

# 树组件(VtxZtree主要用于大量节点的树，性能有所优化，api与VtxTree相比有部分改动，请仔细阅读文档)
$ import {VtxTree} from 'vtx-ui';
$ import {VtxZtree} from 'vtx-ui';

# 下拉树组件
$ import {VtxTreeSelect} from 'vtx-ui';
$ import {VtxZtreeSelect} from 'vtx-ui';

# 报表组件
$ import {VtxRpsFrame} from 'vtx-ui';
```


## License

[MIT](https://tldrlegal.com/license/mit-license)
