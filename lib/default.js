'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var globalCfg = window.VtxPublicServiceAddress || {};

exports.default = {
    httpOrhttps: globalCfg.httpOrhttps || 'http',
    //地图服务地址ip
    mapServerURL: globalCfg.mapServerURL ? globalCfg.mapServerURL : globalCfg.httpOrhttps == 'https' ? 'https://vortexplugin.cloudhw.cn/mapplugin' : 'http://120.26.217.62:25048/mapplugin',
    //arcgis地图服务ip
    arcgisServerURL: globalCfg.arcgisServerURL ? globalCfg.arcgisServerURL : globalCfg.httpOrhttps == 'https' ? 'https://vortexplugin.cloudhw.cn/gis' : 'http://120.26.217.62:25048/gis',
    // ztree文件地址
    ztreeServer: globalCfg.ztreeServer ? globalCfg.ztreeServer : globalCfg.httpOrhttps == 'https' ? 'https://vortexplugin.cloudhw.cn/ztree' : 'http://120.26.217.62:25048/ztree'
};
module.exports = exports['default'];