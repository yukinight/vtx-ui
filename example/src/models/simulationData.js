import {query} from '../services/requestTest.js';
export default {

    namespace: 'simulationData',

    state: {
        tree: [{
            name: 'a',
            key: '0',
            icon:'icon-yonghu',
            children: [{
                name: 'a-0',
                key: '0-0',
                img: '/images/test.png',
                disabled: true,
                children: [{
                    name: 'a-0-0',
                    key: '0-0-0',
                    icon:'icon-sousuo',
                    isLeaf:true
                },{
                    name: 'a-0-1',
                    key: '0-0-1',
                    icon:'icon-chakan',
                    img: '/images/test.png',
                    isLeaf:true,
                    children: []
                }]
            },{
                name: 'a-1',
                key: '0-1',
                children: [{
                    name: 'a-1-0',
                    key: '0-1-0',
                    children: [{
                        name: 'a-1-0-0',
                        key: '0-1-0-0',
                        isLeaf:true
                    }]
                }]
            },{
                name: 'a-2',
                key: '0-2',
                img: '/images/test.png',
                disableCheckbox: true,
                children: [{
                    name: 'a-2-0',
                    key: '0-2-0',
                    icon:'icon-sousuo',
                    isLeaf:true
                },{
                    name: 'a-2-1',
                    key: '0-2-1',
                    icon:'icon-chakan',
                    img: '/images/test.png',
                    isLeaf:true
                },{
                    name: 'a-2-2',
                    key: '0-2-2',
                    icon:'icon-chakan',
                    img: '/images/test.png',
                    isLeaf:false,
                    children: [{
                        name: 'a-2-2-1',
                        key: '0-2-2-1',
                        img: '/images/test.png',
                        children: [{
                            name: 'a-2-2-1-0',
                            key: '0-2-2-1-0',
                            icon:'icon-sousuo',
                            isLeaf:true
                        },{
                            name: 'a-2-2-1-1',
                            key: '0-2-2-1-1',
                            icon:'icon-chakan',
                            img: '/images/test.png',
                            isLeaf:true
                        }]
                    }]
                }]
            }]
        }],
        treeLoad: [{
            name: 'a',
            key: '0',
            icon:'icon-yonghu'
        }],
        isExpandAll_frist:'closeAll',
        isExpandAll_onExpand: 'other',
        isExpandAll_input: 'other',
        checkable: true,
        expandedKeys:[],
        expandedKeys_input: [],
        checkedKeys:[],
        selectedKeys:[],
        autoExpandParent_onExpand: false,
        autoExpandParent_input: false,
        isonload: true,
        isGangedChecked: true,
        multiple: true,
        isDefault: true,
    },
    subscriptions: {
        setup({ dispatch, history }) {
        },
    },

    effects: {
        *requestTest({payload},{select,put,call}){
            const {resolve,key} = payload;
            let {treeLoad} = yield select(({simulationData})=>simulationData);
            //测试请求数据,onLoadData的加载动画
            const {data} = yield call(query,'');
            if(data.result){
                let t = [...treeLoad];
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
                        treeLoad: daliy(t)
                    }
                })
                return resolve();
            }else{
                return resolve();
            }
        },
    },

    reducers: {
        updateState(state, action) {
            return { ...state, ...action.payload };
        },
    },

}
