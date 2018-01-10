
export default {
    
      namespace: 'upload',
    
      state: {
        fileList: [{
          name: 'testxxx.png',
          id:'1d0283efd9eb47dfa977b3d57d7de0ff',
          url: 'http://192.168.1.207:18084/cloudFile/common/downloadFile?id=1d0283efd9eb47dfa977b3d57d7de0ff',
        },{
          name: 'hahahah.png',
          id:'b1ba65305fa64dad821f25975ec5e92c',
        },],
        fileListVersion:1,
        showUploadModal: false
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
        removeFile(state, action){
          const {fileId} = action.payload;
          return {
            ...state, 
            fileList: state.fileList.filter((item)=>item.id!=fileId),
          }
        },
        updateVersion(state, action){
          return { ...state, fileListVersion:state.fileListVersion+1 };
        }
      },
    
    }
    