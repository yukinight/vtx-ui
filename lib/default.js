'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    httpOrhttps: (window.VtxPublicServiceAddress || {}).httpOrhttps || 'http',
    //地图服务地址ip
    mapServerURL: (window.VtxPublicServiceAddress || {}).mapServerURL || 'http://120.26.217.62:25048/mapplugin',
    //arcgis地图服务ip
    arcgisServerURL: (window.VtxPublicServiceAddress || {}).arcgisServerURL || 'http://120.26.217.62:25048/gis',
    // ztree文件地址
    ztreeServer: (window.VtxPublicServiceAddress || {}).ztreeServer || 'http://120.26.217.62:25048/ztree'
};
module.exports = exports['default'];