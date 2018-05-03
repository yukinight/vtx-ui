import React , { Component } from 'react';
import dva, { connect } from 'dva';
import { routerRedux } from 'dva/router';
import styles from './Map.less';
import {VtxMap} from 'vtx-ui';

class MapTest extends React.Component{
    constructor(props){
        super(props);
        this.map = null;
        this.state = {

        }
    }
    //测距
    mapRangingTool(obj) {
        console.log('测距回调',obj);
    }
    //编辑图元后的回调
    editGraphicChange(obj){
        console.log(obj);
        switch(obj.geometry.type){
            case 'point':
                this.props.dispatch({
                    type: 'map/editPoint',
                    payload: {
                        id: obj.id,
                        longitude: obj.geometry.x,
                        latitude: obj.geometry.y,
                    }
                });
            break;
            case 'polyline':
                this.props.dispatch({
                    type: 'map/editLine',
                    payload: {
                        id: obj.id,
                        paths: obj.geometry.paths[0]
                    }
                });
            break;
            case 'polygon':
                this.props.dispatch({
                    type: 'map/editPolygon',
                    payload: {
                        id: obj.id,
                        rings: obj.geometry.rings[0]
                    }
                });
            break;
            case 'circle':
                this.props.dispatch({
                    type: 'map/editCircle',
                    payload: {
                        id: obj.id,
                        longitude: obj.geometry.x,
                        latitude: obj.geometry.y,
                        radius: obj.geometry.radius
                    }
                })
            break;
        }
    }
    //点击地图事件
    clickGraphic(obj) {
        console.log('点击事件',obj);
    }
    //开始拖拽地图事件
    dragMapStart(obj) {
        console.log('拖拽开始',obj);
    }
    //拖拽地图结束事件
    dragMapEnd(obj) {
        console.log('拖拽结束',obj);
    }
    //地图更改缩放级别开始时触发触发此事件
    zoomStart(obj) {
        console.log('zoom开始',obj);
    }
    //地图更改缩放级别结束时触发触发此事件
    zoomEnd(obj) {
        console.log('zoom结束',obj);
    }
    drawEnd(obj) {
        console.log('绘制结束',obj);
    }
    mouseOverGraphic(obj) {
        console.log('移入事件',obj);
    }
    mouseOutGraphic(obj) {
        console.log('移出事件',obj);
    }
    clickMap(obj) {
        console.log('##########')
        console.log('点击地图',obj);
        console.log(obj.e.point.lng);
        console.log(obj.e.point.lat);
    }
    render(){
        const {
            mapPoints,
            mapLines,
            mapPolygons,
            mapCircles,
            mapCenter,setCenter,
            mapVisiblePoints,setVisiblePoints,
            mapCluster,setCluster,
            mapZoomLevel,setZoomLevel,
            isRangingTool,
            editGraphicId,isDoEdit,isEndEdit,
            boundaryName,
            mapDraw,isDraw,isCloseDraw,
            isClearAll,
            mapRemove,
            isRemove,
            isSetAreaRestriction,areaRestriction,isClearAreaRestriction,
            inputVal
        } = this.props.map;
        return (
            <div className={styles.map}>
                <span onClick={()=>{this.props.dispatch({type:'map/addPoint'})}}>添加点&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/updatePoint'})}}>更新点&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/deletePoint'})}}>删除点&nbsp;</span>
     
                <span onClick={()=>{this.props.dispatch({type:'map/addLine'})}}>添加线&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/updateLine'})}}>更新线&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/deleteLine'})}}>删除线&nbsp;</span>

                <span onClick={()=>{this.props.dispatch({type:'map/addPolygon'})}}>添加面&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/updatePolygon'})}}>更新面&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/deletePolygon'})}}>删除面&nbsp;</span>

                <span onClick={()=>{this.props.dispatch({type:'map/addCircle'})}}>添加圆&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/updateCircle'})}}>更新圆&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/deleteCircle'})}}>删除圆&nbsp;</span>
                <br />
                <span onClick={()=>{this.props.dispatch({type:'map/changeCenter'})}}>改变中心点&nbsp;</span>

                <span onClick={()=>{this.props.dispatch({type:'map/changeFitview',payload:{}})}}>改变展示点&nbsp;</span>

                <span onClick={()=>{this.props.dispatch({type:'map/addPointAddFitview'})}}>添加点并展示&nbsp;</span>

                <span onClick={()=>{this.props.dispatch({type:'map/cluster'})}}>点聚合&nbsp;</span>

                <span onClick={()=>{this.props.dispatch({type:'map/changeZoom'})}}>设置比例尺&nbsp;</span>

                <span onClick={()=>{this.props.dispatch({type:'map/editRangingTool'})}}>开启测距工具&nbsp;</span>
                <br />
                <span onClick={()=>{this.props.dispatch({type:'map/editGraphic',payload:{type:'p01'}})}}>开启编辑(点)&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/editGraphic',payload:{type:'l1'}})}}>开启编辑(线)&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/editGraphic',payload:{type:'m1'}})}}>开启编辑(面)&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/editGraphic',payload:{type:'c1'}})}}>开启编辑(圆)&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/endEditGraphic',payload:{type:''}})}}>关闭编辑&nbsp;</span>
                <br />
                <span onClick={()=>{this.props.dispatch({type:'map/drawPoint'})}}>绘制点&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/drawPolyline'})}}>绘制线&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/drawPolygon'})}}>绘制面&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/drawCircle'})}}>绘制圆&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/drawRectangle'})}}>绘制矩形&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/closeDraw'})}}>关闭图元绘制&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/addBoundary'})}}>新增边界线&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/removeBoundary'})}}>删除边界线&nbsp;</span>
                <br />
                <span onClick={()=>{this.props.dispatch({type:'map/clearAll'})}}>清空地图&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/removeGraphic'})}}>删除图元(绘制的图元)&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/removeGraphic'})}}>删除图元(正常图元[非绘制])&nbsp;</span>
                <br />
                <span onClick={()=>{this.props.dispatch({type:'map/changeAreaRestriction'})}}>切换限制显示区域&nbsp;</span>
                <span onClick={()=>{this.props.dispatch({type:'map/clearAreaRestriction'})}}>关闭限制显示区域&nbsp;</span>
                <br />
                <input value={inputVal} onChange={(e)=>{
                    this.props.dispatch({type:'map/updateState',payload:{
                        inputVal:e.target.value
                    }})
                }}/>
                <span onClick={()=>{
                    this.map.searchPoints(inputVal).then((data)=>{
                        console.log(data)
                        if(data.length==0){
                            console.warn('没有搜索结果');
                            return;
                        }
                        this.props.dispatch({type:'map/updateState',payload:{
                            mapPoints:data
                        }})
                        this.props.dispatch({type:'map/changeFitview',payload:{
                            type:{fitView:data.map((item)=>item.id),type:'all'}
                        }})
                        // t.map.setVisiblePoints(list.map((item)=>item.id));
                    })
                }}>查询点位&nbsp;</span>
                <VtxMap 
                    getMapInstance={(map)=>{if(map)this.map = map}}
                    mapId={'map1'} 
                    mapPoints={mapPoints} //地图覆盖物 点
                    mapLines={mapLines} //地图覆盖物 线
                    mapPolygons={mapPolygons}//地图覆盖物 面
                    mapCircles={mapCircles}//地图覆盖物 圆
                    mapCenter={mapCenter}//设置中心点
                    setCenter={setCenter}//控制是否设置中心点
                    mapVisiblePoints={mapVisiblePoints}//设置展示的图元id
                    setVisiblePoints={setVisiblePoints}//控制是否设置展示的图元id
                    mapCluster={mapCluster}//设置聚合的点id
                    setCluster={setCluster}//控制是否设置聚合的点id
                    mapZoomLevel={mapZoomLevel}//设置比例尺
                    setZoomLevel={setZoomLevel}//控制是否设置比例尺
                    mapRangingTool={this.mapRangingTool}//测距工具回调函数
                    isRangingTool={isRangingTool}//控制是否调用测距工具
                    editGraphicId={editGraphicId}//需要编辑的图元id
                    isDoEdit={isDoEdit}
                    isEndEdit={isEndEdit}
                    editGraphicChange={this.editGraphicChange}//地图编辑图元后回调方法
                    clickGraphic={this.clickGraphic}//图元点击事件
                    dragMapStart={this.dragMapStart}//开始拖拽地图事件
                    dragMapEnd={this.dragMapEnd}//拖拽地图结束事件
                    boundaryName={boundaryName}//需要画边界线的关键字  如['苏州']等
                    zoomStart={this.zoomStart}//地图更改缩放级别开始时触发触发此事件
                    zoomEnd={this.zoomEnd}//地图更改缩放级别结束时触发触发此事件
                    mapDraw={mapDraw}//绘制图元所需的参数
                    isDraw={isDraw}//控制是否开始绘制图元
                    isCloseDraw={isCloseDraw}//控制是否手动控制关闭绘制图元
                    drawEnd={this.drawEnd}//绘制图元结束回调
                    isClearAll={isClearAll}//是否清空地图
                    mouseOverGraphic={this.mouseOverGraphic}
                    mouseOutGraphic={this.mouseOutGraphic}
                    showControl={{type:'small',location:'br'}}//显示比例尺
                    maxZoom={15}
                    minZoom={8}
                    mapRemove={mapRemove}
                    isRemove={isRemove}
                    clickMap={this.clickMap.bind(this)}
                    //areaRestriction={areaRestriction}
                    isSetAreaRestriction={isSetAreaRestriction}
                    isClearAreaRestriction={isClearAreaRestriction}
                />
            </div>
        )
    }
}
export default connect(({map})=>({map}))(MapTest);