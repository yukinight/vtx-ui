import { hashHistory } from 'dva/router';

export default {

    namespace: 'bmap',

    state: {
        visible: false,
        mapPoints: [{
            id: 'car1',
            longitude:116.385827,
            latitude:39.913232,
            config: {
                isAnimation: true,
                autoRotation: true
            }
        },{
            id:'p00',
            longitude:116.468021,
            latitude:39.890092,
            markerContent: '<div>1111<div>',
            config: {
                isAnimation: true,
            }
        },{
            id:'p01',
            longitude:117.468021,
            latitude:39.890092,
            canShowLabel: true,
            url: './resources/images/03.png',
            config: {
                labelContent: '1dfasdf',
                isAnimation: true,
                zIndex: 1000,
                // BAnimationType: 0
            }
        }],
        mapLines: [{
            id: 'l1',
            paths: [[116.468021,39.890092],[117.468021,38.890092]],
            config: {
                // isHidden: true
            }
        },{
            id: 'l2',
            paths: [[118.468021,37.890092],[119.468021,38.890092]],
            config: {lineWidth:4,color:'#fff'}
        }],
        mapPolygons:[{
            id: 'm1',
            rings: [[115.468021,38.890092],[117.468021,37.890092],[118.468021,39.890092]]
        },{
            id: 'm2',
            rings: [[116.468021,38.890092],[117.468021,39.890092],[118.468021,37.890092]]
        }],
        mapCircles:[{
            id: 'c1',
            longitude:116.468021,
            latitude:39.890092,
            radius: 10000,
        },{
            id: 'c2',
            longitude:117.468021,
            latitude:38.890092,
            radius: 10000,
        },],
        heatmap: {
            data: [
                {"lng":121.173004,"lat":30.280188,"count":80},
                {"lng":120.473004,"lat":31.480188,"count":34},
                {"lng":122.373004,"lat":28.280188,"count":19},
                {"lng":123.173004,"lat":30.255088,"count":42},
                {"lng":119.173004,"lat":28.280188,"count":32},
                {"lng":117.173004,"lat":29.280188,"count":98},
                {"lng":120.223004,"lat":31.280188,"count":53},
                {"lng":120.453004,"lat":29.280188,"count":25},
                {"lng":118.173004,"lat":32.280188,"count":10}
            ],
            //lng 经度
            //lat 纬度
            //count 权重值
            config: {
                radius: 50,
                //热力图半径,默认20
                visible: true,
                //控制热力图显隐,默认true 
                max: 100,
                //最大权重值 默认100
                gradient: {
                    0:'rgb(102,255, 0)',
                    .5:'rgb(255,170,0)',
                    1:'rgb(255,51,255)'
                },
                //渐变区间 (ui没有定就不要设置该字段)
                opacity: 0.5,
                //透明度
            }
        },
        mapCenter: [116.404,39.915],
        setCenter: false,
        mapVisiblePoints:{fitView:'all',type:'all'},
        setVisiblePoints: false,
        mapCluster: [],
        setCluster: false,
        setZoomLevel: false,
        mapZoomLevel: '',
        isRangingTool: false,
        isOpenTrafficInfo: false,
        areaRestriction: [[115.377628,38.082111],[118.909909,39.50744]],
        isSetAreaRestriction: false,
        isClearAreaRestriction: false,
        isDoEdit: false,
        isEndEdit: false,
        editGraphicId: '',
        mapDraw: {},
        isDraw: false,
        isCloseDraw: false,
        boundaryName: [],
        isClearAll: false,
        mapRemove: [],
        isRemove: false,
        inputVal:'',
        mapPointCollection: [{
            id: 1,
            points: [
                {lng:121,lat:30.23,other: 131},
                {lng:122,lat:30.3,other: 132},
                {lng:122.1,lat:30.3,other: 133},
                {lng:122.4,lat:30.2,other: 134},
                {lng:121.,lat:30.1,other: 135},
            ]
        }],
        isclearAllPointCollection: false
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(({pathname}) => {
                // for (let i = 0 ; i < 1000;i++) {
                //     dispatch({type: 'addLine'});
                // }
            });
        },
    },

    effects: {
        //设置中心点
        *changeCenter({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    setCenter: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    setCenter: false
                }
            })
        },
        //设置最优视野
        *changeFitview({payload = {}},{select,put,call}){
            const {type} = payload;
            yield put({
                type: 'updateState',
                payload: {
                    mapVisiblePoints: type || {fitView:'all',type:'all'},
                    // mapVisiblePoints: type || {fitView:'point',type:'all'},
                    setVisiblePoints: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    setVisiblePoints: false
                }
            })
        },
        //添加点并设置最优视野
        *addPointAddFitview({payload},{select,put,call}){
            yield put({type: 'addPoint'});
            yield put({type: 'changeFitview',payload:{type:{fitView:'point',type:'all'}}});
        },
        //设置点位聚合
        *cluster({payload},{select,put,call}){
            let {mapPoints} = yield select(({bmap})=>bmap);
            yield put({
                type: 'updateState',
                payload: {
                    mapCluster: mapPoints.map((item,index)=>{
                        return item.id;
                    }),
                    setCluster: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    setCluster: false
                }
            })
        },
        //设置zoom等级
        *setZoomLevel({ payload }, { call, put , select}){
            let mapZoomLevel = Math.random() * 20;
            if(mapZoomLevel > 18){
                mapZoomLevel = 18;
            }else if(mapZoomLevel < 3){
                mapZoomLevel = 3;
            }
            yield put({
                type: 'updateState',
                payload: {
                    setZoomLevel: true,
                    mapZoomLevel: mapZoomLevel
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    setZoomLevel: false
                }
            })
        },
        //开启测距
        *editRangingTool({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isRangingTool: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isRangingTool: false
                }
            })
        },
        //开启(切换)区域限制
        *changeAreaRestriction({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    areaRestriction:[[120.377628,38.082111],[115.909909,37.50744]],
                    isSetAreaRestriction: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isSetAreaRestriction: false
                }
            })
        },
        //关闭区域限制
        *clearAreaRestriction({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isClearAreaRestriction: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isClearAreaRestriction: false
                }
            })
        },
        //开启编辑
        *editGraphic({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    editGraphicId: payload.type,
                    isDoEdit: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isDoEdit: false
                }
            });
        },
        //关闭编辑
        *endEditGraphic({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isEndEdit: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isEndEdit: false
                }
            });
        },
        //绘制点
        *drawPoint({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: true,
                    mapDraw: {
                        geometryType: 'point',
                        data: {
                            id: `draw${new Date().getTime()}`
                        },
                        parameter: {}
                    }
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: false
                }
            })
        },
        //绘制线
        *drawPolyline({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: true,
                    mapDraw: {
                        geometryType: 'polyline',
                        data: {
                            id: `draw${new Date().getTime()}`
                        },
                        parameter: {
                            color: '#ff000f',
                            pellucidity: 0.3,
                            lineWidth: 8,
                            lineType: 'dashed'
                        }
                    }
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: false
                }
            })
        },
        //绘制面
        *drawPolygon({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: true,
                    mapDraw: {
                        geometryType: 'polygon',
                        data: {
                            id: `draw${new Date().getTime()}`
                        },
                        parameter: {
                            color: '#fff',
                            lineColor: '#333',
                            lineOpacity: 0.5,
                            pellucidity: 0.7,
                            lineWidth: 10,
                            lineType: 'dashed'
                        }
                    }
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: false
                }
            })
        },
        //绘制圆
        *drawCircle({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: true,
                    mapDraw: {
                        geometryType: 'circle',
                        data: {
                            id: `draw${new Date().getTime()}`
                        },
                        parameter: {
                            color: '#fff',
                            lineColor: '#333',
                            lineOpacity: 0.5,
                            pellucidity: 0.7,
                            lineWidth: 10,
                            lineType: 'dashed'
                        }
                    }
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: false
                }
            })
        },
        //绘制矩形
        *drawRectangle({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: true,
                    mapDraw: {
                        geometryType: 'rectangle',
                        data: {
                            id: `drawrectangle`
                        },
                        parameter: {
                            color: '#fff',
                            lineColor: '#333',
                            lineOpacity: 0.5,
                            pellucidity: 0.7,
                            lineWidth: 10
                        }
                    }
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isDraw: false
                }
            })
        },
        //关闭绘制
        *closeDraw({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    isCloseDraw: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isCloseDraw: false
                }
            });
        },
        //清空图元
        *clearAll({payload},{select,put,call}){
            yield put({
                type:'updateState',
                payload:{
                    isClearAll: true,
                    mapPoints: [],
                    mapLines: [],
                    mapPolygons: [],
                    mapCircles: [],
                    boundaryName: [],
                }
            });
            yield call(delay,1);
             yield put({
                type:'updateState',
                payload:{
                    isClearAll: false,
                }
            });
        },
        //删除图元(绘制的图元)
        *removeDrawGraphic({payload},{select,put,call}){
            let mapRemove = [{
                type: 'draw',
                id: 'drawrectangle'
            }];
            yield put({
                type: 'updateState',
                payload: {
                    mapRemove,
                    isRemove: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isRemove: false
                }
            })
        },
        //删除图元(非绘制的图元)
        *removeGraphic({payload},{select,put,call}){
            let mapRemove = [{
                type: 'point',
                id: 'p00'
            }];
            yield put({
                type: 'updateState',
                payload: {
                    mapRemove,
                    isRemove: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isRemove: false
                }
            })
        },
        //清空海量点
        *clearMapPointCollection({payload},{select,put,call}){
            yield put({
                type: 'updateState',
                payload: {
                    mapPointCollection:[],//清空成空数组就行
                    isclearAllPointCollection: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'updateState',
                payload: {
                    isclearAllPointCollection: false
                }
            })
        }
    },

    reducers: {
        updateState(state, action) {
            return { ...state, ...action.payload };
        },
        /*点*/
        addPoint(state,action){
            let mps = [...state.mapPoints];
            mps.push({
                id:'p'+Math.random(),
                longitude:117+Math.random(),
                latitude:39+Math.random(),
                canShowLabel: true,
                config: {
                    labelContent: Math.floor(Math.random()*10000),
                    isAnimation: true,
                    zIndex: 1000
                    // BAnimationType: 0
                }
            });
            return {...state,mapPoints: mps};
        },
        updatePoint(state,action){
            let mps = [...state.mapPoints];
            mps = mps.map((item,index)=>{
                return {
                    ...item,
                    longitude:item.longitude + eval((Math.random()>0.5?'-':'+')+Math.random()*5),
                    latitude:item.latitude + eval((Math.random()>0.5?'-':'+')+Math.random()*5),
                    config: {
                        ...item.config,
                        labelContent: '1111'
                    }
                }
            })
            return {...state,mapPoints: mps};
        },
        deletePoint(state,action){
            let mps = [...state.mapPoints];
            mps.splice(0,1);
            return {...state,mapPoints: mps};
        },
        /*线*/
        addLine(state,action){
            let ms = [...state.mapLines];
            let len = Math.floor(Math.random() * 10) + 1;
            let paths = [];
            for (var i = 0; i <= len; i++) {
                paths.push([
                    Math.random()*50 + 90,
                    Math.random()*30 + 10
                ])
            }
            ms.push({
                id: `line1${new Date().getTime()+Math.random()}`,
                paths: paths,
            })
            return {...state,mapLines: ms};
        },
        updateLine(state,action){
            let {mapLines} = state;
            let ms = mapLines.map((item,index)=>{
                return {
                    ...item,
                    config:{
                        color: getColor(),
                        lineWidth: Math.random()*10,
                        pellucidity: Math.random(),
                        lineType: Math.random() > 0.5?'solid': 'dashed',
                        isHidden: Math.random() > 0.9
                    }
                }
            });
            return {...state,mapLines: ms};
        },
        deleteLine(state,action){
            let {mapLines} = state;
            let ms = [...mapLines];
            ms.splice(0,1);
            return {...state,mapLines: ms};
        },
        /*面*/
        addPolygon(state,action){
            let {mapPolygons} = state;
            let ms = [...mapPolygons];
            let len = Math.floor(Math.random() * 10) + 2;
            let rings = [];
            for (var i = 0; i <= len; i++) {
                rings.push([
                    Math.random()*50 + 80,
                    Math.random()*30 + 10
                ])
            }
            ms.push({
                id: `pg${new Date().getTime()}`,
                rings
            })
            return {...state,mapPolygons: ms};
        },
        updatePolygon(state,action){
            let {mapPolygons} = state;
            let ms = [...mapPolygons];
            ms = ms.map((item,index)=>{
                return {
                    ...item,
                    config: {
                        ...item.config,
                        color: getColor(),
                        lineColor: getColor(),
                        lineType: Math.random() > 0.5?'solid': 'dashed',
                        lineWidth: Math.random()*5,
                        lineOpacity: Math.random()*10,
                        pellucidity: Math.random()
                    }
                }
            });
            return {...state,mapPolygons: ms};
        },
        deletePolygon(state,action){
            let {mapPolygons} = state;
            let ms = [...mapPolygons];
            ms.splice(0,1);
            return {...state,mapPolygons: ms};
        },
        /*圆*/
        addCircle(state,action){
            let {mapCircles} = state;
            let cs = [...mapCircles];
            cs.push({
                id: `circle$${new Date().getTime()}`,
                longitude: Math.random()*50 + 80, 
                latitude: Math.random()*30 + 10,
                radius: 1000000 * Math.random()
            })
            return {...state,mapCircles: cs};
        },
        updateCircle(state,action){
            let {mapCircles} = state;
            let cs = [...mapCircles];
            cs = cs.map((item,index)=>{
                return {
                    ...item,
                    config: {
                        ...item.config,
                        color: getColor(),
                        lineColor: getColor(),
                        lineType: Math.random() > 0.5?'solid': 'dashed',
                        lineWidth: Math.random()*5,
                        lineOpacity: Math.random()*10,
                        pellucidity: Math.random()
                    }
                }
            });
            return {...state,mapCircles: cs};
        },
        deleteCircle(state,action){
            let {mapCircles} = state;
            let cs = [...mapCircles];
            cs.splice(0,1);
            return {...state,mapCircles: cs};
        },
        /*海量点*/
        addMapPointCollection(state,action){
            let mps = [...state.mapPointCollection];
            let lens = Math.floor(Math.random()*2000);
            let pts = [];
            for(let i = 0 ; i < lens; i++){
                pts.push({
                    lng: 117+Math.random(),
                    lat: 39+Math.random()
                });
            }
            let op = {
                id: `mps${new Date().getTime()+Math.random()}`,
                points: pts,
                shape: Math.random() > 0.5?'square':'rhombus'
            }
            mps.push(op);
            return {...state,mapPointCollection: mps};
        },
        updateMapPointCollection(state,action){
            let mps = [...state.mapPointCollection];
            mps = mps.map((item,index)=>{
                return {
                    ...item,
                    color: getColor(),
                    shape: Math.random() > 0.5?'square':'rhombus'
                }
            });
            return {...state,mapPointCollection: mps};
        },
        deleteMapPointCollection(state,action){
            let mps = [...state.mapPointCollection];
            mps.splice(0,1);
            return {...state,mapPointCollection: mps};
        },
        // clearMapPointCollection
        /*路况 开-关*/
        openTraffic(state,action){
            return{...state,isOpenTrafficInfo: true};
        },
        hideTraffic(state,action){
            return{...state,isOpenTrafficInfo: false};
        },
        /*编辑*/
        editPoint(state,action){
            let {mapPoints} =state;
            const {id,longitude,latitude} = action.payload;
            mapPoints = mapPoints.map((item)=>{
                if(item.id == id){
                    return {
                        ...item,
                        longitude,latitude
                    }
                }
                return item;
            });
            return {...state,mapPoints};
        },
        editPolygon(state,action){
            let {mapPolygons} =state;
            const {id,rings} = action.payload;
            mapPolygons = mapPolygons.map((item)=>{
                if(item.id == id){
                    return {
                        ...item,rings
                    }
                }
                return item;
            });
            return {...state,mapPolygons};
        },
        editLine(state,action){
            let {mapLines} =state;
            const {id,paths} = action.payload;
            mapLines = mapLines.map((item)=>{
                if(item.id == id){
                    return {
                        ...item,
                        paths
                    }
                }
                return item;
            });
            return {...state,mapLines};
        },
        editCircle(state,action){
            let {mapCircles} = state;
            const {id,longitude,latitude,radius} = action.payload;
            mapCircles = mapCircles.map((item,index)=>{
                if(item.id == id){
                    return {
                        ...item,
                        longitude,
                        latitude,
                        radius
                    }
                }
                return item;
            });
            return {...state,mapCircles};
        },
        //新增边界线(百度数据)
        addBoundary(state,action){
            let bn = [...state.boundaryName];
            let ctnms = ['无锡','苏州','北京','上海'];
            ctnms.map((item,index)=>{
                if(bn.indexOf(item) == -1){
                    bn.push(item);
                }
            })
            return {...state,boundaryName: bn};
        },
        //删除边界线(百度数据)
        removeBoundary(state,action){
            return {...state,boundaryName:[]};
        },
        //显示热力图
        showHeatMap(state,action){
            return {...state, heatmap: {
                ...state.heatmap,
                config: {
                    ...state.heatmap.config,
                    visible: true
                }
            }}
        },
        //隐藏热力图
        hideHeatMap(state,action){
            return {...state, heatmap: {
                ...state.heatmap,
                config: {
                    ...state.heatmap.config,
                    visible: false
                }
            }}
        }
    },
};
//生成随机颜色 16进制
function getColor() {
    let c = '#';
    for(let i = 0 ; i < 6; i++){
        let a = Math.floor(Math.random()*16);
        switch(a){
            case 10:
                c = c + 'a';
            break;
            case 11:
                c = c + 'b';
            break;
            case 12:
                c = c + 'c';
            break;
            case 13:
                c = c + 'd';
            break;
            case 14:
                c = c + 'e';
            break;
            case 15:
                c = c + 'f';
            break;
            default:
                c = c + a;
            break;
        }
    }
    return c;
};
//延迟
function delay(timeout){
  var pro = new Promise(function(resolve,reject){
    setTimeout(resolve, timeout);
  });
  return pro;
}