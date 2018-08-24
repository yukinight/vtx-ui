let lvs = [11,12,13,14,15,16,17,18];

function genPointList(){
    let points = [];
    for(let i=0,len=lvs.length;i<len;i++){
        for(let j=0,len2=5000;j<len2;j++){
            points.push({
                id:`${lvs[i]}-${j}`,
                longitude:117.468021+Math.random()/10,
                latitude:38.890092+Math.random()/10,
                zoomLevel:lvs[i],
                canShowLabel:false
            })
        }
    }
    return points;
}

function delay(timeout){
    return new Promise(function(resolve,reject){
        setTimeout(resolve, timeout);
    });
}

export default {
    namespace:'optMap',
    state:{
        mapId:'optmap',
        mapPoints:genPointList(),
        mapCenter: [117.468021,38.890092],
        gridSpacing:50,
        reservedPoints:[
            {
                id:`fsfsd`,
                longitude:117.468021,
                latitude:38.890092,
            }
        ],
        setCenter: false,
    },
    subscriptions:{

    },
    effects:{
        
    },
    reducers:{
        fetch(state,action){
            return {
                ...state,
                ...action.payload
            }
        },
    }
}