require.config({
    waitSeconds:0,
    urlArgs: function(id, url) {
        if (id=='app') {
            return (url.indexOf('?') === -1 ? '?' : '&') + S_VERSION||'ver';
        }
        else{
            return '';
        }
    },
    paths: {
        "jquery": "./jquery.min",
        "event": "./event",
        "gisMapConstant": "./gisMapConstant",
        "mapConstants":"./mapConstants",
        "MapUtil":"./MapUtil",
        // 百度地图
        "BaiDuMap":"http://api.map.baidu.com/getscript?v=2.0&ak=EVlFc6DZzAzU5avIjoxNcFgQ",
        // 地图相关插件: http://lbsyun.baidu.com/index.php?title=open/library
        "DistanceTool":"./mapPlugin/DistanceTool_min",
        "InfoBox":"./mapPlugin/InfoBox_min",
        "TextIconOverlay":"./mapPlugin/TextIconOverlay_min",
        "MarkerClusterer":"./mapPlugin/MarkerClusterer_min",
        "DrawingManager":"./mapPlugin/DrawingManager_min",
        "GeoUtils":"./mapPlugin/GeoUtils_min",
        "Heatmap":"./mapPlugin/Heatmap_min",
        "TrafficControl":"./mapPlugin/TrafficControl_min",
        "AreaRestriction":"./mapPlugin/AreaRestriction_min",
        // 封装的地图
        "vortexBMap":"./vortexBMap",
        // 主程序入口
        "app":"../../index"
    },
    shim: {
    　　'gisMapConstant':['jquery'],
        'mapConstants':['jquery'],
    　　'vortexBMap': ['jquery','event','MapUtil','gisMapConstant','mapConstants', 'BaiDuMap'],
        'DistanceTool':['BaiDuMap'],
        'InfoBox':['BaiDuMap'],
        'TextIconOverlay':['BaiDuMap'],
        'MarkerClusterer':['BaiDuMap'],
        'DrawingManager':['BaiDuMap'],
        'GeoUtils':['BaiDuMap'],
        'Heatmap':['BaiDuMap'],
        'TrafficControl':['BaiDuMap'],
        'AreaRestriction':['BaiDuMap'],
        'app':['vortexBMap','DistanceTool','InfoBox','TextIconOverlay','MarkerClusterer',
        'DrawingManager','GeoUtils','Heatmap','TrafficControl','AreaRestriction'],
    }
});

require(['app'], function () {
    
});