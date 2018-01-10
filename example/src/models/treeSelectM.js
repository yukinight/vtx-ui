import {query} from '../services/requestTest';
export default {

    namespace: 'treeSelect',

    state: {
        data: [{
            name: 'a',
            key: '0',
            icon:'icon-yonghu',
            children: [{
                name: 'a-0',
                key: '0-0',
                // img: '/images/test.png',
                icon: 'icon-yonghu',
                disableCheckbox: true,
                children: [{
                    name: 'a-0-0',
                    key: '0-0-0',
                    icon:'icon-sousuo',
                    isLeaf:true,
                },{
                    name: 'a-0-1',
                    key: '0-0-1',
                    icon:'icon-chakan',
                    img: '/images/test.png',
                    disableCheckbox: true,
                    isLeaf:true,
                }]
            },{
                name: 'a-1',
                key: '0-1',
                children: [{
                    name: 'a-1-0',
                    key: '0-1-0',
                    disabled: true,
                    children: [{
                        name: 'a-1-0-0',
                        key: '0-1-0-0',
                        isLeaf:true
                    }]
                }]
            }]
        }],
        dataLoad: [{
            name: 'a',
            key: '0',
            icon:'icon-yonghu'
        }],
        noMuilBoxValue: [],
        MuilnoBoxValue: [],
        BoxValue: [],
    },
    subscriptions: {
        setup({ dispatch, history }) {
        },
    },

    effects: {
        *onLoadData({payload},{select,put,call}){
            let {key,treeNode,resolve} = payload;
            let {dataLoad} = yield select(({treeSelect})=>treeSelect);
            const {data} = yield call(query,'');
            if(data.result){
                let daliy = (d)=>{
                    return d.map((item,index)=>{
                        if(item.key == key){
                            return {
                                ...item,
                                children: data.data
                            }
                        }else{
                            return {
                                ...item,
                                children: item.children?daliy(item.children):''
                            }
                        }
                    })
                }
                yield put({
                    type: 'updateState',
                    payload: {
                        dataLoad: daliy(dataLoad)
                    }
                })
                return resolve();
            }else{
                return resolve();
            }
        }
    },

    reducers: {
        updateState(state, action) {
            return { ...state, ...action.payload };
        },
    },

}
