### MapPlayer文档

> 地图轨迹播放控件


| **参数**| **说明**| **类型**| **默认值**|
|-------------|--------------|-----------------|--------------|
| map     | 地图对象（通过getMapInstance获得）    | Object  ||
| path     | 点位轨迹        | Array|  [{name,id,longitude,latitude}]       |
| speed    |  点位实际移动速度（m/s），初始化后无法更改   | Number  | 12 |
| playRate  |  点位速度倍率，后续可以更改      | Number  | 1    |
| enableRotation    |  点位的旋转角度是否跟随位置移动而变动  | Boolean  | false   |
| mapMove    |  地图中心点是否跟随轨迹播放而移动  | Boolean  |  false  |
| pointSetting   |  播放点配置项（同地图点位配置）  | Object  |    |
| lineSetting    |  轨迹配置项（同地图的线段配置）  | Object  |  {lineWidth:3,color:'blue'}  |
| onChange | 轨迹播放触发此函数，参数为(point,index) | Function |  |
---

#### 组件内部函数，供外部调用

> 可通过VtxZtree的实例调用（通常通过ref获取实例）  
> 1. play()  
>   开始播放 
> 2. pause(onPlayPause)  
>   暂停播放
> 3. stop()  
>   停止播放，跳转到初始点位
> 4. destroy()  
>   删除轨迹
> 5. setPlayRate(newPlayRate)  
>   更改播放倍率
> 6. setCurrentIndex(pIndex)  
>   更改当前播放点位的序号
> 7. setPath(newPath)  
>   更改点位轨迹

**例**：
```
const mp = new MapPlayer({
    map:this.map,
    speed:80,
    playRate:10,
    path:[
        {longitude:117.468021,latitude:38.890092,id:'42342gd',url:'./resources/images/03.png'},
        {longitude:117.488021,latitude:38.950092,id:'4234fds2gd',url:'./resources/images/03.png'},
        {longitude:117.478021,latitude:38.860092,id:'42fsf342gd',url:'./resources/images/03.png'},
    ],
    // lineSetting:{lineWidth:5,color:'red'},
    // enableRotation:true,
    // mapMove:true,
    onChange:(p,index)=>{
        console.log(p,index)
    },
});

mp.play();
mp.stop();
mp.pause((p,index)=>console.log(p,index));
mp.setPlayRate(3); //设置播放倍率为3倍速
mp.setCurrentIndex(1); //当前轨迹跳转到第一个点
mp.setPath([
    {longitude:115.468021,latitude:36.890092,id:'fhdsas'},
    {longitude:115.488021,latitude:36.950092,id:'jyj5'},
    {longitude:115.478021,latitude:36.860092,id:'dfsfr'},
]);
mp.destroy()
```

