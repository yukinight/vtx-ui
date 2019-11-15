# 图片
## 需求
### 组件
- 图片组件 - VtxImage
- 图片放大组件 - VtxImageViewer

### VtxImage
> 图片组件

##### 功能
- [x] 图片展示
- [x] 无图片时友好提示，可支持传入图片，用于无图片场景下显示
- [x] 图片出错时友好提示，可支持传入图片，用于图片出错场景下显示
- [x] 支持自定义 className 和 style 
- [x] 两种展示模式。
    - 原始模式，图片路径正常时，组件本身只返回一个 img标签，布局样式由外部提供（即调用该组件的
    - 缩略图模式，用于列表展示场景，组件本身会对 ++img标签++ 进行包裹布局，图片宽高等比例自适应容器，两边空余地区设置底色。
- [x] 事件（点击事件等）
- [x] 支持配置是否允许点击放大




### VtxImageViewer
> 图片放大组件，基于 [viewerjs](https://github.com/fengyuanchen/viewerjs) 

##### 功能
- [x] 图片放大功能基本功能
- [x] 支持单张图片放大
- [x] 支持多张图片放大
- [x] 多张图片支持传入下标
- [x] options配置项，用于viewerjs实例 - 可控制画廊工具的显隐，[API参考](https://github.com/fengyuanchen/viewerjs#options)
- [ ] 支持图片下载

## 设计

### VtxImage
图片

```
依赖
lodash@latest - 一致性、模块化、高性能的 JavaScript 实用工具库（推荐）
classnames@latest - 动态判断是否为组件添加class（推荐）
```

#### 原理
通过image.onError事件监听图片资源加载出错替换src路径的思路

#### 相关知识点
水平垂直居中方式之一 - 通过 css3 transform 平移来实现  
```
#container {
	position: relative;
	height: 100%;
	width: 100%;
}
#container img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	-ms-transform: translate(-50%, -50%); /* IE 9 */
	-moz-transform: translate(-50%, -50%);
	-webkit-transform: translate(-50%, -50%);
	-o-transform: translate(-50%, -50%);
}
```


#### API
参数 | 说明 | 类型 | 默认值
---|---|---|---
src | 规定显示图像的 URL | string |
emptyImageSrc | 占位符，默认显示图像的 URL | string |
emptyText | emptyImageSrc为空，默认提示的文本 | string | 暂无封面
errorImageSrc | 图片出错显示图像的 URL | string |
errorText | errorImageSrc为空，出错提示的文本 | string | 图片出错
thumb | 缩略图模式 | bollean \| ThumbProps | false
onClick | 点击事件 | function | 
alt | 规定图像的替代文本。(建议必填) | string | 

##### ThumbProps
参数 | 说明 | 类型 | 默认值
---|---|---|---
backgroundColor | 背景色 | string | rgba(0,0,0,.8)
allowView | 是否支持点击查看 | bollean | false
viewer | 放大器配置 | Object | 参考VtxImageViewer

还提供了一个全局配置方法，在调用前提前配置，全局一次生效。  

- VtxImage.config(options)

```
VtxImage.config({
    emptyImageSrc: 'empty.jpg',
    errorImageSrc: 'error.jpg',
    emptyText: '默认',
    errorText: '出错',
})
```


### VtxImageViewer
画廊

```
依赖
lodash@latest
viewerjs@latest
```

| 参数        | 说明           | 类型  | 默认值 |
| ------------- |-------------| -----|-----|
| visible     | 是否显隐 | Bollean  | false |
| onClose     | 画廊关闭回调 | Function  | - |
| photo     | 图片（{id: './demo.png', name: 'demo'} \| [{id: '', name: ''}, {id: '', name: ''}]） | Object \| Array  | - |
| index | 图片下标，多张图片时使用 | Number整形 | 0 |
| onIndexChange | 画廊切换图片时的回调 | function(index) {} | - |
| options | 配置项(参考 viewejs options，若在options中重写 hidden和view 会覆盖onClose和onIndexChange) | Object | https://github.com/fengyuanchen/viewerjs |

options(常用配置项)

| 参数        | 说明           | 类型  | 默认值 |
| ------------- |-------------| -----|-----|
| button     | 显示右上角关闭按钮 | Bollean  | true |
| navbar     | 显示缩略图导航 | Bollean  | false |
| title     | 显示当前图片的标题（现实 alt 属性及图片尺寸） | Bollean  | true |
| toolbar     | 是否显示工具栏 | Bollean  | true |
| tooltip     | 显示缩放百分比 | Bollean  | true |
| movable     | 图片是否可移动 | Bollean  | true |
| zoomable     | 图片是否可缩放 | Bollean  | true |
| rotatable     | 图片是否可旋转 | Bollean  | true |
| scalable     | 图片是否可翻转 | Bollean  | true |
| transition     | 使用 CSS3 过度 | Bollean  | true |
