### VtxModal文档

> 二次封装的弹框组件  
> DraggableModal为可拖动的弹框组件，配置项与VtxModal相同

| **参数**       | **说明**                                                 | **类型**                | **默认值**           |
|----------------|----------------------------------------------------------|-------------------------|----------------------|
| visible        | 对话框是否可见                                           | boolean                 | 无                   |
| confirmLoading | 确定按钮 loading                                         | boolean                 | 无                   |
| title          | 标题                                                     | string\|ReactNode       | 无                   |
| closable       | 是否显示右上角的关闭按钮                                 | boolean                 | true                 |
| onOk           | 点击确定回调                                             | function(e)             | 无                   |
| onCancel       | 点击遮罩层或右上角叉或取消按钮的回调                     | function(e)             | 无                   |
| width          | 宽度                                                     | string\|number          | 520                  |
| footer         | 底部内容，当不需要默认底部按钮时，可以设为 footer={null} | string\|ReactNode       | 确定取消按钮         |
| okText         | 确认按钮文字                                             | string                  | 确定                 |
| cancelText     | 取消按钮文字                                             | string                  | 取消                 |
| maskClosable   | 点击蒙层是否允许关闭                                     | boolean                 | true                 |
| style          | 可用于设置浮层的样式，调整浮层位置等                     | object                  | \-                   |
| wrapClassName  | 对话框外层容器的类名                                     | string                  | \-                   |
| afterClose     | Modal 完全关闭后的回调                                   | function                | 无                   |
| getContainer   | 指定 Modal 挂载的 HTML 节点                              | (instance): HTMLElement | () =\> document.body |
| isNotMoving   | 是否禁止拖拽功能                              | boolean | false |

---
> 以下为ant原生方法及配置参数

[Modal.method()](https://ant.design/components/modal-cn/#Modal.method())

> 包括：

>   Modal.info

>   Modal.success

>   Modal.error

>   Modal.warning

>   Modal.confirm

以上均为一个函数，参数为 object，具体属性如下：

| **参数**     | **说明**                                                         | **类型**          | **默认值**      |
|--------------|------------------------------------------------------------------|-------------------|-----------------|
| title        | 标题                                                             | string\|ReactNode | 无              |
| content      | 内容                                                             | string\|ReactNode | 无              |
| onOk         | 点击确定回调，参数为关闭函数，返回 promise 时 resolve 后自动关闭 | function          | 无              |
| onCancel     | 取消回调，参数为关闭函数，返回 promise 时 resolve 后自动关闭     | function          | 无              |
| width        | 宽度                                                             | string\|number    | 416             |
| iconType     | 图标 Icon 类型                                                   | string            | question-circle |
| okText       | 确认按钮文字                                                     | string            | 确定            |
| cancelText   | 取消按钮文字                                                     | string            | 取消            |
| maskClosable | 点击蒙层是否允许关闭                                             | Boolean           | false           |

以上函数调用后，会返回一个引用，可以通过该引用关闭弹窗。

const ref = Modal.info();

ref.destroy();
