let data = [];
for(let i=0;i<100;i++){
    data.push({
        key: i,
        name: 'John Brown'+i,
        age: parseInt(Math.random()*100),
        address: 'New York No. 1 Lake Park',
    })
}


export default {

    namespace: 'combogrid',

    state: {
        cmbVal:'',
        grid1:data,
    },

    subscriptions: {
        setup({ dispatch, history }) {
        },
    },

    effects: {
        *fetchRemote({ payload }, { call, put }) {
        },
    },

    reducers: {
        fetch(state, action) {
            return { ...state, ...action.payload };
        },
    },

}


