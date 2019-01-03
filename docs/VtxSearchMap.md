## VtxSearchMap组件使用文档
#### 1.VtxSearchMap

说明:

1.该组件使用地图,所有与Map组件关联,在该组件中,已经引入了Map组件.

在使用时,需要跟Map组件一样,将resource等文件引入.  
2.因为Antd组件Modal在IE中的问题,

该组件还使用了VtxModal组件(解决IE问题).所以,在组件中同时存在了Map和VtxModal的组件.被当前组件内部引用.

| **参数**        | **说明**                                                                                       | **类型**                                                                                                                                           | **默认值**     |
|-----------------|------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| mapCenter       | 展示modal时,地图上的中心点                                                                     | Array[]                                                                                                                                            | ''             |
| mapType         | 展示modal时,地图的类型 <br/>bmap百度地图 (默认) <br/>tmap 天地图 <br/>amap 高德地图 <br/>gmap arcgis地图(后面会加) | string                                                                                                                                             | bmap           |
| mapServer       | 使用gmap arcgis地图时需要, 其他地图类型无用. 用来确认arcgis地图的图层.                         | 参数类型同Map中的参数                                                                                                                              | 浙江天地图wmts |
| modal1Visible   | modal是否展示                                                                                  | Boolean                                                                                                                                            | false          |
| callback        | 确定后的回调方法                                                                               | Function(lglt) 返回经纬度的数组                                                                                                                    | \--            |
| closeModal      | 关闭的回调方法                                                                                 | Function()                                                                                                                                         | \--            |
| graphicType     | point:点定位 <br/>rectangle：绘制矩形 <br/>circle：绘制圆 <br/>polygon：绘制多边形 <br/>polyline: 绘制多折线       | String                                                                                                                                             | point          |
| clearDrawnGraph | 关闭modal是否清空绘制的图形                                                                    | Boolean                                                                                                                                            | False          |
| isShowOther     | 控制是否显示如下图的功能                                                                       | Boolean                                                                                                                                            | false          |
| otherText       | 中文显示的字(可以自定义)                                                                       | String                                                                                                                                             | '显示服务区域' |
| otherGraph      | isShowOther该功能主要用于显示自定义的图元,所以该字段需要接收图元的数据                                                     | Object <br/>**详见otherGraph示例** |                --| editDraw        | 重新绘制按钮方法回调                                                                           | function                                                                                                                                           | --            |
| drawParameter   | 绘制图元的样式，同map中draw的parameter的参数                                                   | object                                                                                                                                             | {}             |
| editParam       | 编辑时传的参数，格式和点线面圆一样，不需要id                                                   | object                                                                                                                                             | --            |
>**otherGraph示例**

```
{ 
    point: ,//地图点的数据格式,Array 
    polyline: ,//地图线的数据格式, Array 
    polygon: ,//地图面(矩形)的数据格式, Array 
    circle: ,//地图圆的数据格式, Array 
}
```
