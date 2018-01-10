let data = [];
for(let i=0;i<100;i++){
  data.push({
    key: i,
    name: 'John Brown',
    age: parseInt(Math.random()*100),
    address: 'New York No. 1 Lake Park',
    editMode:false,
  })
}

export default {

  namespace: 'datagrid',

  state: {
    tableData:data,
    currentPage:1,
    pageSize:20,
    totalItems:199,
    selectedRowKeys:[]
  },

  subscriptions: {
    setup({ dispatch, history }) {
    },
  },

  effects: {
    *fetchRemote({ payload }, { call, put, select }) {
    },
    *getTableData({ payload }, { call, put, select }) {
      const {currentPage,pageSize} = payload;
      yield put({type:'fetch',payload:{
            currentPage,
            pageSize,
            tableData:genData(pageSize)
      }});

    },
  },

  reducers: {
    fetch(state, action) {
      return { ...state, ...action.payload };
    },
    editRow(state, action){
      const {key} = action.payload;
      let pos = state.tableData.map(item=>item.key).indexOf(key);
      let newTableData = [...state.tableData];
      if(pos!=-1){
        newTableData[pos] = {
          ...newTableData[pos],
          ...action.payload
        }
      }
      
      return {
        ...state,
        tableData: newTableData
      }
    },
  },

}


function genData(total){
  let data = [];
  for(let i=0;i<total;i++){
    data.push({
      key: i,
      name: 'John Brown',
      age: parseInt(Math.random()*100),
      address: 'New York No. 1 Lake Park',
      editMode:false,
    })
  }
  return data;
}