export default {

    namespace: 'modalList',

    state: {
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: '',
        value7: '',
        select1: '',
        isShow: true,
        visible: false,
        lists: [1,2],
        a1: '',
        a2: ''
    },

    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(({pathname})=>{

            })
        },
    },

    effects: {
    },

    reducers: {
        updateState(state, action) {
            return { ...state, ...action.payload };
        },
    },
}
