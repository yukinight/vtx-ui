
export default {
    
        namespace: 'vtxModal',
    
        state: {
            visible: false,
            visible2:false,   
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
            updateState(state, action) {
                return { ...state, ...action.payload };
            },
        },
    
    }