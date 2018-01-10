export default {

    namespace: 'datepicker',

    state: {
        date1: '2017-05-24',
        date2: '',
        date3: '',
        date6: '',
        date7: ['',''],
        date8: '',
        dateM: '',
        dateY: '',
        openY: false,
        dateT1: '',
        dateT2: '',
        dateT3: '12:36:59',
        openT: false,
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
