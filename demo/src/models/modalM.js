
export default {
    
        namespace: 'vtxModal',
    
        state: {
            visible: false        
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