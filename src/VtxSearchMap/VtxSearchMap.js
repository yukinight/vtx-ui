import React from 'react';
import './VtxSearchMap.css';
const styles = {
    searchModal: 'vtx-ui-searchmap-searchmodal',
    searchMap: 'vtx-ui-searchmap-searchmap',
    top: 'vtx-ui-searchmap-top',
    bottom: 'vtx-ui-searchmap-bottom',
    content: 'vtx-ui-searchmap-content',
    show: 'vtx-ui-searchmap-show',
    hidden: 'vtx-ui-searchmap-hidden',
    w_l: 'vtx-ui-searchmap-w_l',
    content_left: 'vtx-ui-searchmap-content_left',
    listTitle: 'vtx-ui-searchmap-listtitle',
    title: 'vtx-ui-searchmap-title',
    btn: 'vtx-ui-searchmap-btn',
    lists: 'vtx-ui-searchmap-lists',
    select: 'vtx-ui-searchmap-select',
    scrollauto: 'vtx-ui-searchmap-scrollauto',
    content_right: 'vtx-ui-searchmap-content_right',
    showLabel: 'vtx-ui-searchmap-showlabel',
    hiddenLabel: 'vtx-ui-searchmap-hiddenlabel',
    otherModal: 'vtx-ui-searchmap-othermodal'
}
import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';
import Input from 'antd/lib/input';
import 'antd/lib/input/style/css';
import message from 'antd/lib/message';
import 'antd/lib/message/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';
import Checkbox from 'antd/lib/checkbox';
import 'antd/lib/checkbox/style/css';
import {VtxModal} from '../VtxModal';
import {VtxMap} from '../VtxMap';
//公共地址配置
import configUrl from '../default';
// message.config({
//   top: document.getElementById('root').offsetHeight/3,
//   duration: 5,
// });
const warning = () => {
    message.warning('位置点查询失败,请缩小比例尺或切换关键字后再重新查询!');
};
function distinct(ary){
    let pts = [...ary];
    if((pts[0][0] == pts[pts.length - 1][0]) && (pts[0][1] == pts[pts.length - 1][1])){
        pts.pop();
        return distinct(pts);
    }else{
        return pts;
    }
}
class VtxSearchMap extends React.Component {
    constructor(props){
        super(props);
        this.map = null;//Map组件的ref对象
        this.mapLoaded = false;
        this.isDrawStatus = false;
        this.isClickMap = false;
        this.apid = [];//所有点id,除编辑点外
        this.loadExtent = null;
        this.mapId = `searchMap${new Date().getTime()}`;
        this.state={
            //列表和地图宽度切换的动画需要
            isShowList: false,
            //可拖动用于定位的点
            locationPoint: [],
            //搜索框文字
            searchValue: '',
            //搜索出来的列表点位
            listPoint: [],
            //列表数据
            listMess: [],
            // 返回点位/图形
            graphicType: props.graphicType ||'point',
            isDraw: props.graphicType!=='point',
            parameter: props.drawParameter || {},
            graphicValue: null,
            drawGraphID:'drawnGraph',
            /*地图Api参数*/
            mapCenter: props.mapCenter || '',
            maxZoom: props.maxZoom,
            minZoom: props.minZoom,
            wkid: props.wkid,
            mapType: props.mapType || 'bmap',
            mapServer: props.mapServer,
            setCenter: false,
            mapVisiblePoints: {
                fitView: [],
                type: 'all'
            },
            setVisiblePoints: false,
            isDoEdit: false,
            isEndEdit: false,
            editGraphicId: '',
            editGraphic: null,
            mapZoomLevel: props.mapZoomLevel || 11,
            setZoomLevel: false,
            /*modal参数*/
            modal1Visible: props.modal1Visible || false,
            isShowOther: props.isShowOther || false,
            otherText: props.otherText || '显示服务区域',
            isShowOtherGraph: props.isShowOther || false
        }
    }
    //经纬度回调
    callback(fun = 'callback'){
        if(fun in this.props && typeof(this.props[fun]) === 'function'){
            let {editGraphicId} = this.state;
            switch (this.state.graphicType){
                case 'point':
                    let {locationPoint} = this.state;
                    if(this.map.getGraphic('locationPoint')){
                        let p = this.map.getGraphic(locationPoint[0].id).geometry;
                        this.props[fun]([p.x,p.y]);
                    }else{
                        return [];
                    }
                    break;
                case 'circle':
                    this.props[fun](this.state.graphicValue?{
                        x:this.state.graphicValue.geometry.x,
                        y:this.state.graphicValue.geometry.y,
                        radius:this.state.graphicValue.geometry.radius,
                        area: this.state.graphicValue.area
                    }:null);
                    break;
                case 'polygon':
                    if(this.map.getGraphic(editGraphicId)){
                        let p = this.map.getGraphic(editGraphicId);
                        this.props[fun]({
                            rings: distinct(p.geometry.rings),
                            area: this.map.getPolygonArea(distinct(p.geometry.rings))
                        });
                    }else{
                        this.props[fun](this.state.graphicValue?{
                            rings: distinct(this.state.graphicValue.geometry.rings),
                            area: this.state.graphicValue.area
                        }:null);
                    }
                    break;
                case 'rectangle':
                    this.props[fun](this.state.graphicValue?{
                        rings: distinct(this.state.graphicValue.geometry.rings),
                        area: this.state.graphicValue.area
                    }:null);
                    break;
                case 'polyline':
                    if(this.map.getGraphic(editGraphicId)){
                        let p = this.map.getGraphic(editGraphicId);
                        this.props[fun]({
                            paths:p.geometry.paths,
                            length: this.map.calculateDistance(p.geometry.paths)
                        });
                    }else{
                        this.props[fun](this.state.graphicValue?{
                            paths:this.state.graphicValue.geometry.paths,
                            length: this.map.calculateDistance(this.state.graphicValue.geometry.paths)
                        }:null);
                    }
                    break;
            }
        }
        if(this.props.clearDrawnGraph){
            this.clearDrawnGraph();
        }
    }
    showOrhidden(bealoon){
        this.setState({
            isShowList: bealoon
        })
    }
    //绘制定位点(以当前的中心点位参照 => 同时开启点位编辑)
    drawLocationPoint(){
        let t = this;
        //判断arcgis,是: 判断中心点是否已经确定,确定,继续走逻辑.不确认.轮询等待
        if(this.props.mapType !== 'gmap' || (this.map.state.gis.extent && !!this.map.state.gis.extent.xmax)){
            let lglt = this.map.getMapExtent(),editGraphic = null,editGraphicId = 'locationPoint';
            if(this.props.editParam && (this.props.graphicType == 'polyline' || this.props.graphicType == 'polygon')){
                editGraphic = {...this.props.editParam,id: 'drawnGraph'};
                editGraphicId = 'drawnGraph';
            }
            this.isinit = false;
            this.setState({
                editGraphic,
                locationPoint: [{
                    id: 'locationPoint',
                    longitude: (t.props.mapCenter || [])[0] || lglt.nowCenter.lng,
                    latitude: (t.props.mapCenter || [])[1] || lglt.nowCenter.lat,
                    url: `${configUrl.mapServerURL}/images/defaultMarker.png`,
                    config: {
                        zIndex: 1000
                    }
                }],
            },()=>{
                t.setState({
                    isDoEdit: true,
                    editGraphicId
                },()=>{
                    setTimeout(()=>{
                        t.setState({
                            isDoEdit: false
                        })
                    },100)
                })
            })
        }else{
            t.loadExtent = setTimeout(()=>{
                t.drawLocationPoint()
            },50)
        }
    }
    //校正定位的点位位置到当前的中心点
    correction(){
        let t = this;
        //获取当前中心点经纬度
        let lglt = this.map.getMapExtent();
        let {locationPoint} = t.state;
        locationPoint = locationPoint.map((item,index)=>{
            return {
                ...item,
                longitude: lglt.nowCenter.lng,
                latitude: lglt.nowCenter.lat
            }
        });
        this.map.updatePoint(locationPoint);
    }
    //搜索关键字切换
    changeValue(e){
        this.setState({
            searchValue: e.target.value
        });
    }
    //根据关键字搜索数据
    searchList(){
        //因为antd组件问题,这边使用手动关键位,控制方法执行
        let t = this;
        let searchPoints = t.map.searchPoints(this.state.searchValue);
        searchPoints.then((results)=>{
            if(results.length > 0){
                let lsp = [],lsm = [];
                t.apid = [];
                for (let i = 0; i < results.length; i ++){
                    let r = results[i];
                    lsp.push({
                        ...results[i],
                        url: `${configUrl.mapServerURL}/images/defaultMarker_selected.png`,
                        labelClass: styles.hiddenLabel,
                    });
                    lsm.push({
                        id: r.id,
                        title: r.config.labelContent,
                        isSelect: false
                    });
                    t.apid.push(r.id);
                }
                t.setState({
                    listPoint: lsp,
                    listMess: lsm,
                    isShowList: true
                });
                t.setFitView();
            }else{
                warning();
            }
        })
    }
    //返回最佳位置(zoom,center)
    setFitView(){
        this.setState({
            mapVisiblePoints: {
                fitView: this.apid,
                type: 'all'
            },
            setVisiblePoints: true
        },()=>{
            this.setState({
                setVisiblePoints: false
            })
        })
    }
    //清空列表的所有数据(包括点位)
    clearList(){
        this.apid = [];
        this.setState({
            searchValue: '',
            listPoint: [],
            listMess: [],
            isShowList: false
        })
    }
    //列表选中地址
    chooseAddress(id){
        let {listPoint,listMess} = this.state;
        let mapCenter = [];
        listPoint = listPoint.map((item,index)=>{
            if(item.id === id){
                mapCenter = [item.longitude,item.latitude];
                return {
                    ...item,
                    labelClass: styles.showLabel
                }
            }else{
                return {
                    ...item,
                    labelClass: styles.hiddenLabel
                }
            }
        });
        listMess = listMess.map((item,index)=>{
            if(item.id === id){
                return {
                    ...item,
                    isSelect: true
                }
            }else{
                return {
                    ...item,
                    isSelect: false
                }
            }
        });
        this.setState({
            listPoint,
            listMess,
            mapCenter,
            setCenter: true
        },()=>{
            this.setState({
                setCenter: false
            })
        })
    }
    clickGraphic(obj){
        if (obj.type === 'point' && obj.attributes.other === 'search') {
            this.chooseAddress(obj.attributes.id);
        }
    }
    closeModal(e){
        if(this.isDrawStatus && this.isClickMap){
            message.warning('请双击结束图元编辑');
        }else{
            if('closeModal' in this.props){
                this.props.closeModal();
            }else{
                this.setState({
                    modal1Visible: false
                })
            }
            // if(this.props.clearDrawnGraph){
            this.clearDrawnGraph();
            // }
        }
    }
    clearDrawnGraph(){
        this.isDrawStatus = true;
        this.setState({
            isDraw:true,
            graphicValue:null,
            isEndEdit: this.state.graphicType !== 'point'
        },()=>{
            this.setState({isEndEdit: false})
        });
    }
    render() {
        let t = this;
        let {
            isShowList,
            searchValue,
            locationPoint,
            listPoint,listMess,
            /*地图参数*/
            mapZoomLevel,setZoomLevel,
            maxZoom,minZoom,
            wkid,mapServer,
            mapCenter,setCenter,mapType,
            mapVisiblePoints,setVisiblePoints,
            isDoEdit,editGraphicId,isEndEdit,
            /*modal参数*/
            modal1Visible,
            drawGraphID,
            isShowOther,otherText,isShowOtherGraph,
            editGraphic,graphicType
        } = this.state;
        const InputProps = {
            style: {'width': '200px'},
            placeholder: '输入关键字',
            value: searchValue, 
            onChange: this.changeValue.bind(this),
            onPressEnter: this.searchList.bind(this),
            onKeyDown: this.changeValue.bind(this)
        };
        let drawProps = this.state.graphicType=='point' || t.isinit?null:{
            isDraw:this.state.isDraw,
            drawEnd:(obj)=>{
                this.isDrawStatus = false;
                this.isClickMap = false;
                let objparam = {
                    graphicValue:obj,
                    isDraw:false
                };
                if(obj.geometryType == 'polyline' || obj.geometryType == 'polygon'){
                    objparam.editGraphicId = obj.id;
                    objparam.isDoEdit = true;
                }
                this.setState(objparam,()=>{
                    this.setState({
                        isDoEdit: false
                    })
                });
            },
            mapDraw:{
                geometryType: this.state.graphicType,
                parameter: this.state.parameter,
                data: {id: drawGraphID}
            }  
        }
        let mapPoints = [],mapLines=[],mapPolygons=[],mapCircles=[];
        if(graphicType == 'point'){
            mapPoints = [...locationPoint,...listPoint];
        }else{
            mapPoints = [...listPoint];
        }
        if(graphicType === 'polygon'){
            if(editGraphic){
                mapPolygons.push(editGraphic);
                drawProps = null;
            }
        }
        if(graphicType === 'polyline'){
            if(editGraphic){
                mapLines.push(editGraphic);
                drawProps = null;
            }
        }
        if(isShowOtherGraph){
            let {otherGraph} = this.props;
            if(otherGraph){
                mapPoints = [...mapPoints,...(otherGraph.point || [])];
                mapLines=[...mapLines,...(otherGraph.polyline || [])];
                mapPolygons=[...mapPolygons,...(otherGraph.polygon || [])];
                mapCircles=[...mapCircles,...(otherGraph.circle || [])];
            }
        }
        return (
            <VtxModal
              title={this.state.graphicType=='point'?"定位":"绘制"}
              style={{ top: 50 }}
              visible={modal1Visible}
              wrapClassName={styles.searchModal}
              bodyStyle={{height:`${window.innerHeight*0.7}px`}}
              maskClosable={false}
              onCancel={this.closeModal.bind(this)} 
              footer={null}
            >
                <div className={styles.searchMap}>
                    {/*地图操作分类*/}
                    <div className={styles.top}>
                        {/*搜索多点选择*/}
                        {
                            mapType == 'gmap'?'':
                            [
                                <Input key='1' {...InputProps}/>,
                                <Button key='2' type="primary" onClick={this.searchList.bind(this)} icon={'search'}>查询</Button>,
                                <Button key='3' onClick={this.clearList.bind(this)} icon={'close'}>清空</Button>
                            ]
                        }
                        {
                            this.state.graphicType=='point'?<Button  onClick={this.correction.bind(this)} icon={'environment-o'}>校正</Button>:null
                        }
                        {
                            this.state.graphicType!='point'?<Button disabled={this.isDrawStatus} onClick={()=>{
                                this.isDrawStatus = true;
                                this.setState({
                                    isDraw:true,
                                    graphicValue:null,
                                    editGraphic: null,
                                    isEndEdit: true
                                },()=>{
                                    t.map.removeGraphic('drawnGraph','draw')
                                    t.setState({
                                        isEndEdit: false
                                    })
                                });
                                this.callback('editDraw');
                            }} icon={'edit'}>重新绘制</Button>:null
                        }
                        {
                            mapType == 'gmap'?'':
                            <Button onClick={this.setFitView.bind(this)} icon={'sync'}>返回全局地图</Button>
                        }
                        {
                            isShowOther?
                                <div className={styles.otherModal}>
                                    <Checkbox checked={isShowOtherGraph} onChange={(e)=>{
                                        this.setState({isShowOtherGraph:e.target.checked})
                                    }}>{otherText}</Checkbox>
                                </div>
                            :''
                        }
                    </div>
                    <div className={styles.content} style={{paddingLeft:(mapType == 'gmap'?'0px':'25px')}}>
                        {/*左侧列表*/}
                        {
                            mapType == 'gmap'?'':
                            <div className={`${styles.content_left} ${isShowList?styles.w_l:''}`}>
                                <div className={`${isShowList?styles.show:styles.hidden}`}>
                                    <div className={styles.listTitle}>
                                        <div className={styles.title}>查询结果</div>
                                        <div onClick={()=>this.showOrhidden(false)} className={styles.btn}><Icon type="double-left" /></div>
                                    </div>
                                    <div className={styles.scrollauto}>
                                        {
                                            listMess.map((item,index)=>{
                                                return (
                                                    <div 
                                                        key={index} 
                                                        onClick={()=>this.chooseAddress(item.id)}
                                                        className={`${styles.lists} ${item.isSelect?styles.select:''}`}
                                                    >{item.title}</div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                                <div onClick={()=>this.showOrhidden(true)} className={`${styles.btn} ${!isShowList?styles.show:styles.hidden}`}>
                                    <Icon type="double-right" />
                                </div>
                            </div>
                        }
                        {/*右侧地图*/}
                        <div className={styles.content_right}>
                            <VtxMap 
                                getMapInstance={(map)=>{if(map)this.map = map}}
                                mapType={mapType}
                                mapServer={mapServer}
                                wkid={wkid}
                                mapId={t.mapId}
                                setCenter={setCenter}
                                mapCenter={mapCenter}
                                minZoom={minZoom}
                                maxZoom={maxZoom}
                                mapZoomLevel={mapZoomLevel}
                                setZoomLevel={setZoomLevel}
                                mapPoints={mapPoints}
                                mapLines={mapLines}
                                mapPolygons={mapPolygons}
                                mapCircles={mapCircles}
                                mapVisiblePoints={mapVisiblePoints}
                                setVisiblePoints={setVisiblePoints}
                                isDoEdit={isDoEdit}
                                isEndEdit={isEndEdit}
                                editGraphicId={editGraphicId}
                                editGraphicChange={()=>{}}
                                clickGraphic={this.clickGraphic.bind(this)}
                                clickMap={()=>{
                                    t.isClickMap = true;
                                }}
                                {...drawProps}
                            />
                        </div>
                    </div>
                    <div className={styles.bottom}>
                        {/*经纬度返回按钮*/}
                        <Button type="primary" onClick={()=>{this.callback()}} icon={'check'}>确定</Button>
                        <Button onClick={this.closeModal.bind(this)} icon={'close'}>关闭</Button>
                    </div>
                </div>
            </VtxModal>
        );
    }
    initSearchMap(){
        if (this.props.modal1Visible /*&& !this.state.locationPoint[0]*/) {
            if(this.map){
                this.map.loadMapComplete.then(()=>{
                    if(!this.mapLoaded){
                        this.mapLoaded = true;
                        this.drawLocationPoint();
                    }
                });
            }
        }
    }
    componentDidMount(){
        //绘制定位点(以当前的中心点位参照=>初始化好后才有ref可以获取中心点)
        this.initSearchMap();
    }
    componentDidUpdate(prevProps, prevState) {//重新渲染结束
        this.initSearchMap();
    }
    componentWillReceiveProps(nextProps){
        let t = this;
        if(t.state.graphicType !== nextProps.graphicType && !!this.map){
            this.map.clearAll();
            t.mapLoaded = false;
            t.isinit = true;
        }
        if(nextProps.editParam){
            t.mapLoaded = false;
        }
        t.isDrawStatus = nextProps.graphicType!=='point' && !nextProps.editParam;
        this.setState({
           modal1Visible: nextProps.modal1Visible,
           maxZoom: nextProps.maxZoom,
           minZoom: nextProps.minZoom,
           wkid: nextProps.wkid,
           mapCenter: nextProps.mapCenter || '',
           mapType: nextProps.mapType || 'bmap',
           mapServer: nextProps.mapServer,
           graphicType: nextProps.graphicType ||'point',
           isDraw: nextProps.graphicType!=='point' && !nextProps.editParam,
           editGraphicId: ''
        },()=>{
            t.initSearchMap();
        });
        setTimeout(()=>{
            //实现2+次进入时,清理数据
            if(nextProps.modal1Visible){
                this.clearList();
                this.setState({
                   setZoomLevel: true
                },()=>{
                    this.setState({
                        setZoomLevel: false
                })
            });
                if(!!this.map && !!this.state.locationPoint[0] && nextProps.mapCenter && !!nextProps.mapCenter[0]){
                    if(this.map.getGraphic('locationPoint')){
                        switch(nextProps.mapType){
                            case 'bmap':
                                this.map.getGraphic('locationPoint').mapLayer.setPosition(new BMap.Point(nextProps.mapCenter[0],nextProps.mapCenter[1]));
                            break;
                            case 'amap':
                                this.map.getGraphic('locationPoint').mapLayer.setPosition(new AMap.LngLat(nextProps.mapCenter[0],nextProps.mapCenter[1]));
                            break;
                            case 'tmap':
                                this.map.getGraphic('locationPoint').mapLayer.setLngLat(new T.LngLat(nextProps.mapCenter[0],nextProps.mapCenter[1]));
                            break;
                            case 'gmap':
                                this.map.getGraphic('locationPoint').mapLayer.geometry.setLatitude(nextProps.mapCenter[1]);
                                this.map.getGraphic('locationPoint').mapLayer.geometry.setLongitude(nextProps.mapCenter[0]);
                                this.map.state.gis.graphics.refresh();
                            break;
                        }
                    }
                    this.map.setCenter(nextProps.mapCenter);
                }
            }
        },100);
    }
    componentWillUnmount() {
        //关闭moveTo定时
        let t = this;
        if(t.loadExtent){
            clearInterval(t.loadExtent);
        }
    }
}

export default VtxSearchMap;