import React from 'react';
import './VtxSearchMap.less';
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

// message.config({
//   top: document.getElementById('root').offsetHeight/3,
//   duration: 5,
// });
const warning = () => {
    message.warning('位置点查询失败,请缩小比例尺或切换关键字后再重新查询!');
};
class VtxSearchMap extends React.Component {
    constructor(props){
        super(props);
        this.map = null;//Map组件的ref对象
        this.mapLoaded = false;
        this.apid = [];//所有点id,除编辑点外
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
            graphicValue: null,
            drawGraphID:'drawnGraph',
            /*地图Api参数*/
            mapCenter: props.mapCenter || '',
            setCenter: false,
            mapVisiblePoints: {
                fitView: [],
                type: 'all'
            },
            setVisiblePoints: false,
            isDoEdit: false,
            editGraphicId: '',
            mapZoomLevel: 11,
            setZoomLevel: false,
            /*modal参数*/
            modal1Visible: props.modal1Visible || false,
            isShowOther: props.isShowOther || false,
            otherText: props.otherText || '显示服务区域',
            isShowOtherGraph: false
        }
    }
    //经纬度回调
    callback(){
        if('callback' in this.props && typeof(this.props.callback) === 'function'){
            switch (this.state.graphicType){
                case 'point':
                    let {locationPoint} = this.state;
                    this.props.callback([locationPoint[0].longitude,locationPoint[0].latitude]);
                    break;
                case 'circle':
                    this.props.callback(this.state.graphicValue?{
                        x:this.state.graphicValue.geometry.x,
                        y:this.state.graphicValue.geometry.y,
                        radius:this.state.graphicValue.geometry.radius,
                        area: this.state.graphicValue.area
                    }:null);
                    break;
                case 'polygon':
                    this.props.callback(this.state.graphicValue?{
                        rings:this.state.graphicValue.geometry.rings[0],
                        area: this.state.graphicValue.area
                    }:null);
                    break;
                case 'rectangle':
                    this.props.callback(this.state.graphicValue?{
                        rings:this.state.graphicValue.geometry.rings[0],
                        area: this.state.graphicValue.area
                    }:null);
                    break;
                case 'polyline':
                    this.props.callback(this.state.graphicValue?{
                        paths:this.state.graphicValue.geometry.paths[0],
                        length: this.map.state.gis.calculateDistance(this.state.graphicValue.geometry.paths[0])
                    }:null);
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
        let lglt = this.map.getMapExtent();
        this.setState({
            locationPoint: [{
                id: 'locationPoint',
                longitude: lglt.nowCenter.lng,
                latitude: lglt.nowCenter.lat,
                url: '/resources/images/defaultMarker.png',
                config: {
                    zIndex: 101
                }
            }],
        },()=>{
            this.setState({
                isDoEdit: true,
                editGraphicId: 'locationPoint'
            },()=>{
                this.setState({
                    isDoEdit: false
                })
            })
        })
    }
    //点位点拖动后的回调
    editGraphicChange(obj){
        //拖动后,保存当前拖动后定位点的位置信息,用于callback回调返回
        let {locationPoint} = this.state;
        locationPoint = locationPoint.map((item,index)=>{
            return {
                ...item,
                longitude: obj.geometry.x,
                latitude: obj.geometry.y
            }
        });
        this.setState({
            locationPoint: locationPoint
        });
    }
    //校正定位的点位位置到当前的中心点
    correction(){
        //获取当前中心点经纬度
        let lglt = this.map.getMapExtent();
        //map组件问题,手动操作图元
        if(this.map.getGraphic('locationPoint')){
            this.map.getGraphic('locationPoint').mapLayer.setPosition(new BMap.Point(lglt.nowCenter.lng,lglt.nowCenter.lat));
        }
        //将数据存入state,callback返回
        let {locationPoint} = this.state;
        locationPoint = locationPoint.map((item,index)=>{
            return {
                ...item,
                longitude: lglt.nowCenter.lng,
                latitude: lglt.nowCenter.lat
            }
        });
        this.setState({
            locationPoint: locationPoint
        });
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
        var local = new BMap.LocalSearch(this.map.state.gis, {
            onSearchComplete(results){
                if(local.getStatus() === 0){
                    let lsp = [],lsm = [];
                    t.apid = [];
                    for (let i = 0; i < results.getCurrentNumPois(); i ++){
                        let r = results.getPoi(i);
                        lsp.push({
                            id: r.uid,
                            longitude: r.point.lng,
                            latitude: r.point.lat,
                            url: '/resources/images/defaultMarker_selected.png',
                            canShowLabel: true,
                            labelClass: styles.hiddenLabel,
                            config: {
                                labelContent: r.title,
                                labelPixelY: 27
                            },
                            other: 'search'
                        });
                        lsm.push({
                            id: r.uid,
                            title: r.title,
                            isSelect: false
                        });
                        t.apid.push(r.uid);
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
            }
        });
        local.search(this.state.searchValue);
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
        if('closeModal' in this.props){
            this.props.closeModal();
        }else{
            this.setState({
                modal1Visible: false
            })
        }
        if(this.props.clearDrawnGraph){
            this.clearDrawnGraph();
        }
    }
    clearDrawnGraph(){
        this.setState({
            isDraw:true,
            graphicValue:null
        });
    }
    render() {
        let {
            isShowList,
            searchValue,
            locationPoint,
            listPoint,listMess,
            /*地图参数*/
            mapZoomLevel,setZoomLevel,
            mapCenter,setCenter,
            mapVisiblePoints,setVisiblePoints,
            isDoEdit,editGraphicId,
            /*modal参数*/
            modal1Visible,
            drawGraphID,
            isShowOther,otherText,isShowOtherGraph
        } = this.state;
        let mapPoints = [],mapLines=[],mapPolygons=[],mapCircles=[];
        if(this.state.graphicType == 'point'){
            mapPoints = [...locationPoint,...listPoint];
        }else{
            mapPoints = [...listPoint];
        }
        if(isShowOtherGraph){
            let {otherGraph} = this.props;
            if(otherGraph){
                mapPoints = [...mapPoints,...(otherGraph.point || [])];
                mapLines=[...(otherGraph.polyline || [])];
                mapPolygons=[...(otherGraph.polygon || [])];
                mapCircles=[...(otherGraph.circle || [])];
            }
        }
        const InputProps = {
            style: {'width': '200px'},
            placeholder: '输入关键字',
            value: searchValue, 
            onChange: this.changeValue.bind(this),
            onPressEnter: this.searchList.bind(this),
            onKeyDown: this.changeValue.bind(this)
        };
        const drawProps = this.state.graphicType=='point'?null:{
            isDraw:this.state.isDraw,
            drawEnd:(obj)=>{
                this.setState({
                    graphicValue:obj,
                    isDraw:false
                });
            },
            mapDraw:{
                geometryType: this.state.graphicType,
                parameter: {},
                data: {id: drawGraphID}
            }  
        }
        return (
            <VtxModal
              title={this.state.graphicType=='point'?"定位":"绘制"}
              style={{ top: 50 }}
              visible={modal1Visible}
              wrapClassName={styles.searchModal}
              maskClosable={false}
              onCancel={this.closeModal.bind(this)} 
              footer={null}
              // closable={false}
            >
                <div className={styles.searchMap}>
                    {/*地图操作分类*/}
                    <div className={styles.top}>
                        {/*搜索多点选择*/}
                        <Input {...InputProps}/>
                        <Button type="primary" onClick={this.searchList.bind(this)} icon={'search'}>查询</Button>
                        <Button onClick={this.clearList.bind(this)} icon={'close'}>清空</Button>
                        {
                            this.state.graphicType=='point'?<Button  onClick={this.correction.bind(this)} icon={'environment-o'}>校正</Button>:null
                        }
                        {
                            this.state.graphicType!='point'?<Button onClick={()=>{
                                this.setState({
                                    isDraw:true,
                                    graphicValue:null
                                });
                                if('editDraw' in this.props && typeof(this.props.editDraw) == 'function'){
                                    this.props.editDraw();
                                }
                            }} icon={'edit'}>重新绘制</Button>:null
                        }
                        <Button onClick={this.setFitView.bind(this)} icon={'sync'}>返回全局地图</Button>
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
                    <div className={styles.content}>
                        {/*左侧列表*/}
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
                        {/*右侧地图*/}
                        <div className={styles.content_right}>
                            <VtxMap 
                                getMapInstance={(map)=>{if(map)this.map = map}}
                                mapId={`searchMap${new Date().getTime()}`}
                                setCenter={setCenter}
                                mapCenter={mapCenter}
                                mapZoomLevel={mapZoomLevel}
                                setZoomLevel={setZoomLevel}
                                mapPoints={mapPoints}
                                mapLines={mapLines}
                                mapPolygons={mapPolygons}
                                mapCircles={mapCircles}
                                mapVisiblePoints={mapVisiblePoints}
                                setVisiblePoints={setVisiblePoints}
                                isDoEdit={isDoEdit}
                                editGraphicId={editGraphicId}
                                editGraphicChange={this.editGraphicChange.bind(this)}
                                clickGraphic={this.clickGraphic.bind(this)}
                                {...drawProps}
                            />
                        </div>
                    </div>
                    <div className={styles.bottom}>
                        {/*经纬度返回按钮*/}
                        <Button type="primary" onClick={this.callback.bind(this)} icon={'check'}>确定</Button>
                        <Button onClick={this.closeModal.bind(this)} icon={'close'}>关闭</Button>
                    </div>
                </div>
            </VtxModal>
        );
    }
    componentDidMount(){
        //绘制定位点(以当前的中心点位参照=>初始化好后才有ref可以获取中心点)
        if (this.props.modal1Visible) {
            if(this.map){
                this.map.loadMapComplete.then(()=>{
                    this.drawLocationPoint();
                    this.mapLoaded = true;
                });
            }
        }
    }
    componentDidUpdate(prevProps, prevState) {//重新渲染结束
        if (this.props.modal1Visible && !this.state.locationPoint[0]) {
            if(this.map && this.mapLoaded){
                this.drawLocationPoint();   
            }
        }
    }
    componentWillReceiveProps(nextProps){
        if(this.mapLoaded)return;
        this.setState({
           modal1Visible: nextProps.modal1Visible,
           mapCenter: nextProps.mapCenter,
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
                        this.map.getGraphic('locationPoint').mapLayer.setPosition(new AMap.LngLat(nextProps.mapCenter[0],nextProps.mapCenter[1]));
                    }
                    this.map.setCenter(nextProps.mapCenter);
                }
            }
        },100);
    }
}

export default VtxSearchMap;