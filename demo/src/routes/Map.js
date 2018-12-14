import React , { Component } from 'react';
import dva, { connect } from 'dva';
import { routerRedux } from 'dva/router';
import styles from './Map.less';
import {VtxMap} from 'vtx-ui';

class MapDemo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            mapType:'bmap'
        }
    }
    switchMap(mapType){
        this.setState({
            mapType:mapType||'bmap'
        })
    }
    render(){
        let t = this;
        let dispatch = t.props.dispatch;
        let {
            visible,
            mapPoints,mapLines,mapPolygons,mapCircles,heatmap,
            mapPointCollection,isclearAllPointCollection,
            mapCenter,setCenter,mapVisiblePoints,setVisiblePoints,
            mapCluster,setCluster,setZoomLevel,mapZoomLevel,
            isRangingTool,isOpenTrafficInfo,
            areaRestriction,isSetAreaRestriction,isClearAreaRestriction,
            editGraphicId,isDoEdit,isEndEdit,
            mapDraw,isDraw,isCloseDraw,
            boundaryName,isClearAll,mapRemove,isRemove,inputVal
        } = t.props.bmap;
        //测距回调
        function mapRangingTool(obj) {
            console.log(obj)
        }
        //点击地图事件
        function clickMap(obj){
            console.log('##点击地图##',obj)
        }
        //地图拖动之前事件
        function dragMapStart(obj){
            console.log('##拖动开始##',obj);
        }
        //地图拖动结束后事件
        function dragMapEnd(obj){
            console.log('##拖动结束##',obj);
        }
        //地图移动之前事件
        function moveStart(obj){
            console.log('##移动开始##',obj);
        }
        //地图移动结束后事件
        function moveEnd(obj){
            console.log('##移动结束##',obj);
        }
        //地图缩放开始前事件
        function zoomStart(obj){
            console.log('##缩放开始##',obj);
        }
        //地图缩放结束后事件
        function zoomEnd(obj){
            console.log('##缩放结束##',obj);
        }
        //点击图元事件
        function clickGraphic(obj){
            console.log('##点击图元##',obj);
        }
        //移入图元事件
        function mouseOverGraphic(obj){
            console.log('##移入图元##',obj);
        }
        //移出图元事件
        function mouseOutGraphic(obj){
            console.log('##移出图元##',obj);
        }
        //编辑返回
        function editGraphicChange(obj){
            console.log('##编辑返回##',obj);
        }
        //绘制结束
        function drawEnd(obj){
            console.log('##绘制结束##',obj);
        }
        //海量点点击事件
        function clickPointCollection(obj){
            console.log('#海量点#',obj);
        }
        return (
            <div className={styles.normal}>
                <button onClick={()=>{this.switchMap('bmap')}}>百度地图</button>
                <button onClick={()=>{this.switchMap('amap')}}>高德地图</button>
                <button onClick={()=>{this.switchMap('tmap')}}>天地图</button>
                <div className={styles.action}>
                    <div onClick={()=>{dispatch({type: 'bmap/updateState',payload: {visible: !visible}})}}>弹框测试</div>
                    <div onClick={()=>{dispatch({type: 'bmap/addPoint'})}}>添加点</div>
                    <div onClick={()=>{dispatch({type: 'bmap/updatePoint'})}}>更新点</div>
                    <div onClick={()=>{dispatch({type: 'bmap/deletePoint'})}}>删除点</div>
                    <div onClick={()=>{dispatch({type: 'bmap/addLine'})}}>添加线</div>
                    <div onClick={()=>{dispatch({type: 'bmap/updateLine'})}}>更新线</div>
                    <div onClick={()=>{dispatch({type: 'bmap/deleteLine'})}}>删除线</div>
                    <div onClick={()=>{dispatch({type: 'bmap/addPolygon'})}}>添加面</div>
                    <div onClick={()=>{dispatch({type: 'bmap/updatePolygon'})}}>更新面</div>
                    <div onClick={()=>{dispatch({type: 'bmap/deletePolygon'})}}>删除面</div>
                    <div onClick={()=>{dispatch({type: 'bmap/addCircle'})}}>添加圆</div>
                    <div onClick={()=>{dispatch({type: 'bmap/updateCircle'})}}>更新圆</div>
                    <div onClick={()=>{dispatch({type: 'bmap/deleteCircle'})}}>删除圆</div>
                    <br />
                    <div onClick={()=>{dispatch({type: 'bmap/changeFitview'})}}>最优视野(all)</div>
                    <div onClick={()=>{dispatch({type: 'bmap/addPointAddFitview'})}}>添加点-最优视野(point - all)</div>
                    <div onClick={()=>{dispatch({type: 'bmap/changeCenter'})}}>设置中心点</div>
                    <div onClick={()=>{dispatch({type: 'bmap/setZoomLevel'})}}>设置zoom等级</div>
                    <div onClick={()=>{dispatch({type: 'bmap/openTraffic'})}}>打开路况</div>
                    <div onClick={()=>{dispatch({type: 'bmap/hideTraffic'})}}>关闭路况</div>
                    <div onClick={()=>{dispatch({type: 'bmap/cluster'})}}>设置点聚合</div>
                    <div onClick={()=>{dispatch({type: 'bmap/editRangingTool'})}}>开启测距工具</div>
                    <br />
                    <div onClick={()=>{dispatch({type: 'bmap/editGraphic',payload:{type:'p00'}})}}>开启编辑(点)</div>
                    <div onClick={()=>{dispatch({type: 'bmap/editGraphic',payload:{type:'l1'}})}}>开启编辑(线)</div>
                    <div onClick={()=>{dispatch({type: 'bmap/editGraphic',payload:{type:'m1'}})}}>开启编辑(面)</div>
                    <div onClick={()=>{dispatch({type: 'bmap/editGraphic',payload:{type:'c1'}})}}>开启编辑(圆)</div>
                    <div onClick={()=>{dispatch({type: 'bmap/endEditGraphic',payload:{type:''}})}}>关闭编辑</div>
                    <br />
                    <div onClick={()=>{dispatch({type: 'bmap/drawPoint'})}}>绘制点</div>
                    <div onClick={()=>{dispatch({type: 'bmap/drawPolyline'})}}>绘制线</div>
                    <div onClick={()=>{dispatch({type: 'bmap/drawPolygon'})}}>绘制面</div>
                    <div onClick={()=>{dispatch({type: 'bmap/drawRectangle'})}}>绘制矩形</div>
                    <div onClick={()=>{dispatch({type: 'bmap/drawCircle'})}}>绘制圆</div>
                    <div onClick={()=>{dispatch({type: 'bmap/closeDraw'})}}>关闭绘制</div>
                    <div onClick={()=>{dispatch({type: 'bmap/addBoundary'})}}>新增边界线</div>
                    <div onClick={()=>{dispatch({type: 'bmap/removeBoundary'})}}>删除边界线</div>
                    <br />
                    <div onClick={()=>{dispatch({type: 'bmap/addMapPointCollection'})}}>新增海量点</div>
                    <div onClick={()=>{dispatch({type: 'bmap/updateMapPointCollection'})}}>更新海量点</div>
                    <div onClick={()=>{dispatch({type: 'bmap/deleteMapPointCollection'})}}>删除指定海量点</div>
                    <div onClick={()=>{dispatch({type: 'bmap/clearMapPointCollection'})}}>清空海量点</div>
                    <br />
                    <div onClick={()=>{dispatch({type: 'bmap/clearAll'})}}>清空地图</div>
                    <div onClick={()=>{dispatch({type: 'bmap/removeDrawGraphic'})}}>删除图元(绘制的图元)</div>
                    <div onClick={()=>{dispatch({type: 'bmap/removeGraphic'})}}>删除图元(正常图元[非绘制])</div>
                    <br />
                    <div onClick={()=>{dispatch({type: 'bmap/showHeatMap'})}}>显示热力图</div>
                    <div onClick={()=>{dispatch({type: 'bmap/hideHeatMap'})}}>隐藏热力图</div>
                    <div onClick={()=>{dispatch({type: 'bmap/changeAreaRestriction'})}}>开启(切换)区域限制</div>
                    <div onClick={()=>{dispatch({type: 'bmap/clearAreaRestriction'})}}>关闭区域限制</div>
                    <input value={inputVal} onChange={(e)=>{
                        dispatch({type:'bmap/updateState',payload:{
                            inputVal:e.target.value
                        }})
                    }}/>
                    <div onClick={()=>{
                        t.map.searchPoints(inputVal).then((data)=>{
                            console.log(data)
                            if(data.length==0){
                                console.warn('没有搜索结果');
                                return;
                            }
                            dispatch({type:'bmap/updateState',payload:{
                                mapPoints:data
                            }})
                            dispatch({type:'bmap/changeFitview',payload:{
                                type:{fitView:data.map((item)=>item.id),type:'all'}
                            }})
                            // t.map.setVisiblePoints(list.map((item)=>item.id));
                        })
                    }}>查询点位&nbsp;</div>
                </div>
                <div className={styles.map}>
                    <VtxMap 
                        getMapInstance={(map)=>{
                            if(map)t.map = map
                        }}
                        mapType={this.state.mapType}
                        mapId={'aaaa'}
                        mapPoints={mapPoints} //地图覆盖物 点
                        mapLines={mapLines} //地图覆盖物 线
                        mapPolygons={mapPolygons}//地图覆盖物 面
                        mapCircles={mapCircles}//地图覆盖物 圆
                        heatMapData={heatmap}//热力图
                        mapPointCollection={mapPointCollection}//海量点
                        isclearAllPointCollection={isclearAllPointCollection}
                        mapCenter={mapCenter}//设置中心点
                        setCenter={setCenter}//控制是否设置中心点
                        mapVisiblePoints={mapVisiblePoints}//设置展示的图元id
                        setVisiblePoints={setVisiblePoints}//控制是否设置展示的图元id
                        mapCluster={mapCluster}//设置聚合的点id
                        setCluster={setCluster}//控制是否设置聚合的点id
                        mapZoomLevel={mapZoomLevel}//设置比例尺
                        setZoomLevel={setZoomLevel}//控制是否设置比例尺
                        mapRangingTool={mapRangingTool}//测距工具回调函数
                        isRangingTool={isRangingTool}//控制是否调用测距工具
                        isOpenTrafficInfo={isOpenTrafficInfo}//控制路况展示
                        areaRestriction={areaRestriction}//区域限制
                        isSetAreaRestriction={isSetAreaRestriction}//控制是否开启区域限制
                        isClearAreaRestriction={isClearAreaRestriction}//控制是否关闭区域限制
                        showControl={{type:'small',location:'bl'}}//显示比例尺
                        editGraphicId={editGraphicId}//需要编辑的图元id
                        isDoEdit={isDoEdit}//是否开启编辑
                        isEndEdit={isEndEdit}//是否关闭编辑
                        editGraphicChange={editGraphicChange}//地图编辑图元后回调方法
                        mapDraw={mapDraw}//绘制图元所需的参数
                        isDraw={isDraw}//控制是否开始绘制图元
                        isCloseDraw={isCloseDraw}//控制是否手动控制关闭绘制图元
                        drawEnd={drawEnd}//绘制图元结束回调
                        boundaryName={boundaryName}//需要画边界线的关键字  如['苏州']等
                        isClearAll={isClearAll}//是否清空地图
                        mapRemove={mapRemove}//需要删除图元的数据
                        isRemove={isRemove}//是否删除指定图元
                        /*地图事件*/
                        clickMap={clickMap}//点击地图事件
                        dragMapStart={dragMapStart}//拖动地图开始前事件
                        dragMapEnd={dragMapEnd}//拖动地图结束后事件
                        moveStart={moveStart}//地图移动开始前事件
                        moveEnd={moveEnd}//地图移动结束后事件
                        zoomStart={zoomStart}//地图缩放开始前事件
                        zoomEnd={zoomEnd}//地图缩放结束后事件
                        /*图元事件*/
                        clickGraphic={clickGraphic}//点击图元事件
                        mouseOverGraphic={mouseOverGraphic}//移入图元事件
                        mouseOutGraphic={mouseOutGraphic}//移出图元事件
                        clickPointCollection={clickPointCollection}//海量点点击事件
                    />
                </div>                
            </div>
        )
    }
}


export default connect(({bmap})=>({bmap}))(MapDemo);