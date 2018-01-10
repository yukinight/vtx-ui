export default {
    namespace: 'searchMap',
    state: {
        modal1Visible: false,
        modal2Visible:false,
        mapCenter: [117.129971,38.763075]
    },
    subscriptions: {
        setup({dispatch,history}){
            history.listen(({pathname})=>{

            })
        }
    },
    effects: {

    },
    reducers: {
        updateState(state,action){
            return {...state,...action.payload};
        }
    }
}