export default {
    httpOrhttps: (window.VtxPublicServiceAddress || {}).httpOrhttps || 'http',
    //地图服务地址ip
    mapServerURL: (window.VtxPublicServiceAddress || {}).mapServerURL ?
        (window.VtxPublicServiceAddress || {}).mapServerURL:
            (window.VtxPublicServiceAddress || {}).httpOrhttps == 'https'?
                'https://vortexplugin.cloudhw.cn/mapplugin' : 'http://120.26.217.62:25048/mapplugin',
    //arcgis地图服务ip
    arcgisServerURL:  (window.VtxPublicServiceAddress || {}).arcgisServerURL ?
        (window.VtxPublicServiceAddress || {}).arcgisServerURL:
            (window.VtxPublicServiceAddress || {}).httpOrhttps == 'https'?
                'https://vortexplugin.cloudhw.cn/gis' : 'http://120.26.217.62:25048/gis',
    // ztree文件地址
    ztreeServer: (window.VtxPublicServiceAddress || {}).ztreeServer ?
        (window.VtxPublicServiceAddress || {}).ztreeServer:
            (window.VtxPublicServiceAddress || {}).httpOrhttps == 'https'?
            'https://vortexplugin.cloudhw.cn/ztree' : 'http://120.26.217.62:25048/ztree',
}