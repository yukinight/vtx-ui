import { hashHistory } from 'dva/router';

export default {
    namespace: 'map',
    state: {
        text: '111111',
        mapPoints: [{
            id:'p00',
            longitude:116.468021,
            latitude:39.890092,
            markerContent: '<div>1111<div>'
        },{
            id:'p01',
            longitude:117.468021,
            latitude:39.890092,
            canShowLabel: true,
            config: {
                labelContent: '1dfasdf',
                isAnimation: true,
                // BAnimationType: 0
            }
        },{
            id: 'car1',
            longitude:116.385827,
            latitude:39.913232
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
        mapCenter: [117.468021,38.890092],
        setCenter: false,
        mapVisiblePoints:{fitView:'all',type:'all'},
        setVisiblePoints: false,
        mapCluster: [],
        setCluster: false,
        mapZoomLevel: 10,
        setZoomLevel: false,
        isRangingTool: false,
        editGraphicId: '',
        isDoEdit: false,
        isEndEdit: false,
        boundaryName: ['苏州'],
        customizedBoundary:[],
        mapDraw: {},
        isDraw: false,
        isClearAll: false,
        mapRemove: [],
        isRemove: false,
        isCloseDraw: false,
        isSetAreaRestriction: false,
        areaRestriction: [[115.377628,38.082111],[118.909909,39.50744]],
        isClearAreaRestriction: false,
        inputVal:''
    },
    subscriptions:{
        setup({ dispatch, history }) {
            history.listen(location => {
            })
        }
    },
    effects:{
        *changeCenter({payload},{select,put,call}){
            yield put({
                type: 'isshowCenter',
                payload: {
                    setCenter: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isshowCenter',
                payload: {
                    setCenter: false
                }
            })
        },
        *changeFitview({payload},{select,put,call}){
            const {type} = payload;
            yield put({
                type: 'isshowFitview',
                payload: {
                    mapVisiblePoints: type || {fitView:'circle',type:'all'},
                    setVisiblePoints: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isshowFitview',
                payload: {
                    setVisiblePoints: false
                }
            })
        },
        *cluster({payload},{select,put,call}){
            let {mapPoints} = yield select(({map})=>map);
            yield put({
                type: 'isSetCluster',
                payload: {
                    mapCluster: mapPoints.map((item,index)=>{
                        return item.id;
                    }),
                    setCluster: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isSetCluster',
                payload: {
                    setCluster: false
                }
            })
        },
        *addPointAddFitview({payload},{select,put,call}){
            yield put({type: 'addPoint'});
            yield put({type: 'changeFitview',payload:{type:{fitView:'point',type:'center'}}});
        },
        *changeZoom({payload},{select,put,call}){
            let {mapZoomLevel} = yield select(({map})=>map);
            yield put({
                type: 'issetZoomLevel',
                payload: {
                    mapZoomLevel: mapZoomLevel>9?mapZoomLevel-1:mapZoomLevel+1,
                    setZoomLevel: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'issetZoomLevel',
                payload: {
                    setZoomLevel: false
                }
            })
        },
        *editRangingTool({payload},{select,put,call}){
            yield put({
                type: 'isRangingTool',
                payload: {
                    isRangingTool: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isRangingTool',
                payload: {
                    isRangingTool: false
                }
            })
        },
        *editGraphic({payload},{select,put,call}){
            yield put({
                type: 'iseditGraphic',
                payload: {
                    editGraphicId: payload.type,
                    isDoEdit: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'iseditGraphic',
                payload: {
                    isDoEdit: false
                }
            });
        },
        *endEditGraphic({payload},{select,put,call}){
            yield put({
                type: 'iseditGraphic',
                payload: {
                    isEndEdit: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'iseditGraphic',
                payload: {
                    isEndEdit: false
                }
            });
        },
        *drawPoint({payload},{select,put,call}){
            let mapDraw = {
                geometryType: 'point',
                parameter: {},
                data: {id: 'point' + new Date().getTime()}
            };
            yield put({
                type: 'isDrawing',
                payload: {
                    mapDraw,
                    isDraw: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isDrawing',
                payload: {
                    isDraw: false
                }
            })
        },
        *drawPolyline({payload},{select,put,call}){
            let mapDraw = {
                geometryType: 'polyline',
                parameter: {},
                data: {id: 'polyline-test'}
            };
            yield put({
                type: 'isDrawing',
                payload: {
                    mapDraw,
                    isDraw: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isDrawing',
                payload: {
                    isDraw: false
                }
            })
        }, 
        *drawPolygon({payload},{select,put,call}){
            let mapDraw = {
                geometryType: 'polygon',
                parameter: {},
                data: {id: 'polygon' + new Date().getTime()}
            };
            yield put({
                type: 'isDrawing',
                payload: {
                    mapDraw,
                    isDraw: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isDrawing',
                payload: {
                    isDraw: false
                }
            })
        }, 
        *drawCircle({payload},{select,put,call}){
            let mapDraw = {
                geometryType: 'circle',
                parameter: {},
                data: {id: 'circle' + new Date().getTime()}
            };
            yield put({
                type: 'isDrawing',
                payload: {
                    mapDraw,
                    isDraw: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isDrawing',
                payload: {
                    isDraw: false
                }
            })
        },
        *drawRectangle({payload},{select,put,call}){
            let mapDraw = {
                geometryType: 'rectangle',
                parameter: {},
                data: {id: 'rectangle'}
            };
            yield put({
                type: 'isDrawing',
                payload: {
                    mapDraw,
                    isDraw: true
                }
            });
            yield call(delay,1);
            yield put({
                type: 'isDrawing',
                payload: {
                    isDraw: false
                }
            })
        },
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
            })
        },
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
        *removeGraphic({payload},{select,put,call}){
            let mapRemove = [{
                id: 'rectangle',
                type: 'draw'      
            },{
                id: 'p00',
                type: 'point'
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
        }
    },
    reducers:{
        updateState(state,action){
            return {...state,...action.payload};
        },
        /*点*/
        addPoint(state,action){
            let {mapPoints} = state;
            mapPoints = [...mapPoints,{
                id:'10',
                longitude:116.468021,
                latitude:38.890092,
            },{
                id:'11',
                longitude:117.468021,
                latitude:37.890092,
                config: {width:50,height:12}
            }];
            return {...state,mapPoints};
        },
        updatePoint(state,action){
            let {mapPoints} = state;
            mapPoints = mapPoints.map((item,index)=>{
                let obj = {
                    ...item,
                    longitude: item.longitude +1,
                    latitude: item.latitude +1,
                }
                return obj;
            })
            return {...state,mapPoints};
        },
        deletePoint(state,action){
            let {mapPoints} = state;
            let dp = [...mapPoints];
            dp.splice(0,1);
            return {...state,mapPoints:dp};
        },
        /*线*/
        addLine(state,action){
            let {mapLines} = state;
            mapLines = mapLines.concat([{
                id:'l3',
                paths: [[118.468021,37.890092],[119.468021,39.890092]],
                config: {lineWidth:4,color:'blue'}
            },{
                id:'l4',
                paths: [[117.468021,38.890092],[119.468021,36.890092]],
                config: {lineWidth:4,color:'yellow'}
            }]);
            return {...state,mapLines};
        },
        updateLine(state,action){
            let {mapLines} = state;
            mapLines = mapLines.map((item,index)=>{
                if(index === 0){
                    return  {
                        ...item,
                        config:{
                            ...item.config,
                            lineWidth:4,
                            color:'red'
                        }
                    }
                }
                return item;
            });
            return {...state,mapLines};
        },
        deleteLine(state,action){
            let {mapLines} = state;
            let ml = [...mapLines];
            ml.splice(0,2);
            return {...state,mapLines:ml};
        },
        /*面*/
        addPolygon(state,action){
            let {mapPolygons} = state;
            mapPolygons = mapPolygons.concat([{
                id: 'm3',
                rings: [[117.468021,37.890092],[116.468021,37.890092],[120.468021,39.890092]]
            },{
                id: 'm4',
                rings: [[119.468021,38.890092],[116.468021,39.890092],[114.468021,37.890092]]
            }]);
            return {...state,mapPolygons};
        },
        updatePolygon(state,action){
            let {mapPolygons} = state;
            mapPolygons = mapPolygons.map((item,index)=>{
                if(index == 0){
                    return{
                        ...item,
                        config:{
                            ...item.config,
                            color: 'blue'
                        }
                    }
                }
                return item;
            });
            return {...state,mapPolygons};
        },
        deletePolygon(state,action){
            let {mapPolygons} = state;
            let mp = [...mapPolygons];
            mp.splice(0,1);
            return {...state,mapPolygons:mp};
        },
        /*圆*/
        addCircle(state,action){
            let {mapCircles} = state;
            mapCircles = mapCircles.concat([{
                id: 'c3',
                longitude:118.468021,
                latitude:38.890092,
                radius: 10000,
            },{
                id: 'c4',
                longitude:119.468021,
                latitude:39.890092,
                radius: 10000,
            }]);
            return {...state,mapCircles};
        },
        updateCircle(state,action){
            let {mapCircles} = state;
            mapCircles = mapCircles.map((item,index)=>{
                if(index == 0){
                    return{
                        ...item,
                        config:{
                            ...item.config,
                            color: 'blue'
                        }
                    }
                }
                return item;
            })
            return {...state,mapCircles};
        },
        deleteCircle(state,action){
            let {mapCircles} = state;
            let mc = [...mapCircles];
            mc.splice(0,1);
            return {...state,mapCircles:mc};
        },
        isshowCenter(state,action){
            return {...state,...action.payload};
        },
        isshowFitview(state,action){
            return {...state,...action.payload};
        },
        isSetCluster(state,action){
            return {...state,...action.payload};
        },
        issetZoomLevel(state,action){
            return {...state,...action.payload};
        },
        isRangingTool(state,action){
            return {...state,...action.payload};
        },
        iseditGraphic(state,action){
            return {...state,...action.payload};
        },
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
        addBoundary(state,action){
            let {boundaryName} =state;
            boundaryName = [...boundaryName,'无锡'];
            return {...state,boundaryName};
        },
        removeBoundary(state,action){
            // let {boundaryName} =state;
            // let bN = [...boundaryName];
            // bN.splice(0,1);
            return {...state,boundaryName:[]};
        },
        isDrawing(state,action){
            return {...state,...action.payload};
        }
    }
}

//延迟
function delay(timeout){
  var pro = new Promise(function(resolve,reject){
    setTimeout(resolve, timeout);
  });
  return pro;
}