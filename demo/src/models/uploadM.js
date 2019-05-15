
export default {
    
      namespace: 'upload',
    
      state: {
        fileList: [{
          name: 'dfa',
          id:'fghk',
          url: 'http://img15.3lian.com/2015/f2/136/d/63.jpg',
        },{
          name: 'testxxx.png',
          id:'1d0283efd9eb47dfa977b3d57d7de0ff',
          url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1557751283463&di=d08b17ff582aea347b989494f64753f2&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2Fb1cce6f996734bdbb9b3fb9ef7705deabc980e35493b-ysf8BZ_fw658',
        },{
          name: 'hahahah.png',
          id:'b1ba65305fa64dad821f25975ec5e92c',
          url:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1557751378748&di=fafb94eac6c67e68d3e7fa3fecd28b16&imgtype=0&src=http%3A%2F%2Fgss0.baidu.com%2F-fo3dSag_xI4khGko9WTAnF6hhy%2Fzhidao%2Fpic%2Fitem%2F63d9f2d3572c11dfff955ae3612762d0f603c2ae.jpg'
        },{
          name: 'dsgf.png',
          id:'343246',
          url:'http://pic.lvmama.com/uploads/pc/place2/2014-10-10/1412924437806.jpg'
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
    