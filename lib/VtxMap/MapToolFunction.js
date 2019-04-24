"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.graphicManage = graphicManage;
exports.RotateIcon = RotateIcon;
exports.getMaxMin = getMaxMin;
exports.getPolygonArea = getPolygonArea;
exports.getPixelDistance = getPixelDistance;
exports.getDistance = getDistance;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function graphicManage() {
    this.allGraphics = {}; //所有图元对象
    this.allParam = {}; //所有添加图元的数据
}
graphicManage.prototype = {
    //存储图元对象
    setGraphic: function setGraphic(id, graphic) {
        this.allGraphics[id] = graphic;
        //链式调用
        return this;
    },

    //获取图元对象
    getGraphic: function getGraphic(id) {
        return this.allGraphics[id];
    },

    //批量获取图元对象
    getMoreGraphic: function getMoreGraphic(ids) {
        var _this = this;

        var rg = [];
        ids.map(function (item, index) {
            rg.push(_this.allGraphics[item]);
        });
        return rg;
    },

    //删除图元时,同时删除id
    removeGraphic: function removeGraphic(id) {
        delete this.allGraphics[id];
    },

    //判断id是否重复
    isRepetition: function isRepetition(id) {
        return !!this.allGraphics[id];
    },

    //设置图元数据
    setGraphicParam: function setGraphicParam(id, obj) {
        this.allParam[id] = obj;
        //链式调用
        return this;
    },

    //获取单个图元数据
    getGraphicParam: function getGraphicParam(id) {
        return this.allParam[id];
    },
    removeGraphicParam: function removeGraphicParam(id) {
        delete this.allParam[id];
    },

    //批量获取图元数据
    getMoreGraphicParam: function getMoreGraphicParam(ids) {
        var _this2 = this;

        var ap = [];
        ids.map(function (item, index) {
            ap.push(_this2.allParam[item]);
        });
        return ap;
    },

    //清空所有缓存数据
    clearAll: function clearAll() {
        this.allGraphics = {};
        this.allParam = {};
    }
};

//使用canvas 旋转图片,生成base64,达到旋转效果
function RotateIcon() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this.options = options;
    this.rImg = new Image();
    this.rImg.src = this.options.url || '';
    var canvas = document.createElement("canvas");
    canvas.width = this.options.width;
    canvas.height = this.options.height;
    this.context = canvas.getContext("2d");
    this.canvas = canvas;
};
RotateIcon.prototype.setRotation = function () {
    var deg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var t = this;
    var canvas = t.context,
        angle = deg * Math.PI / 180,
        centerX = t.options.width / 2,
        centerY = t.options.height / 2;
    canvas.clearRect(0, 0, t.options.width, t.options.height);
    canvas.save();
    canvas.translate(centerX, centerY);
    canvas.rotate(angle);
    canvas.translate(-centerX, -centerY);
    canvas.drawImage(t.rImg, -1, -1);
    canvas.restore();
    return t;
};
RotateIcon.prototype.getUrl = function () {
    return this.canvas.toDataURL('image/png');
};

function getMaxMin() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    //区别点和圆的经纬度数据处理
    var lnglatAry = [],
        _extent = { xmax: 0, xmin: 0, ymax: 0, ymin: 0 };
    var p = path.map(function (item, index) {
        var lng = item.lng,
            lat = item.lat;
        if (lng > _extent.xmax) {
            _extent.xmax = lng;
        }
        if (lng < _extent.xmin || _extent.xmin == 0) {
            _extent.xmin = lng;
        }
        if (lat > _extent.ymax) {
            _extent.ymax = lat;
        }
        if (lat < _extent.ymin || _extent.ymin == 0) {
            _extent.ymin = lat;
        }
        lnglatAry.push({
            lngX: lng,
            latX: lat
        });
        return [lng, lat];
    });
    return { path: p, _extent: _extent };
}
//计算面  面积
function getPolygonArea(polygon) {
    var pts = [].concat(_toConsumableArray(polygon));

    if (pts.length < 3) {
        //小于3个顶点，不能构建面
        return 0;
    }
    if (pts[0][0] == pts[pts.length - 1][0] && pts[0][1] == pts[pts.length - 1][1]) {
        pts.pop();
    }
    var totalArea = 0; //初始化总面积
    var LowX = 0.0;
    var LowY = 0.0;
    var MiddleX = 0.0;
    var MiddleY = 0.0;
    var HighX = 0.0;
    var HighY = 0.0;
    var AM = 0.0;
    var BM = 0.0;
    var CM = 0.0;
    var AL = 0.0;
    var BL = 0.0;
    var CL = 0.0;
    var AH = 0.0;
    var BH = 0.0;
    var CH = 0.0;
    var CoefficientL = 0.0;
    var CoefficientH = 0.0;
    var ALtangent = 0.0;
    var BLtangent = 0.0;
    var CLtangent = 0.0;
    var AHtangent = 0.0;
    var BHtangent = 0.0;
    var CHtangent = 0.0;
    var ANormalLine = 0.0;
    var BNormalLine = 0.0;
    var CNormalLine = 0.0;
    var OrientationValue = 0.0;
    var AngleCos = 0.0;
    var Sum1 = 0.0;
    var Sum2 = 0.0;
    var Count2 = 0;
    var Count1 = 0;
    var Sum = 0.0;
    var Radius = 6399593.0; //6378137.0,WGS84椭球半径   6399593,CGCS2000  椭球半径
    var Count = pts.length;
    for (var i = 0; i < Count; i++) {
        if (i == 0) {
            LowX = (pts[Count - 1].lng || pts[Count - 1][0]) * Math.PI / 180;
            LowY = (pts[Count - 1].lat || pts[Count - 1][1]) * Math.PI / 180;
            MiddleX = (pts[0].lng || pts[0][0]) * Math.PI / 180;
            MiddleY = (pts[0].lat || pts[0][1]) * Math.PI / 180;
            HighX = (pts[1].lng || pts[1][0]) * Math.PI / 180;
            HighY = (pts[1].lat || pts[1][1]) * Math.PI / 180;
        } else if (i == Count - 1) {
            LowX = (pts[Count - 2].lng || pts[Count - 2][0]) * Math.PI / 180;
            LowY = (pts[Count - 2].lat || pts[Count - 2][1]) * Math.PI / 180;
            MiddleX = (pts[Count - 1].lng || pts[Count - 1][0]) * Math.PI / 180;
            MiddleY = (pts[Count - 1].lat || pts[Count - 1][1]) * Math.PI / 180;
            HighX = (pts[0].lng || pts[0][0]) * Math.PI / 180;
            HighY = (pts[0].lat || pts[0][1]) * Math.PI / 180;
        } else {
            LowX = (pts[i - 1].lng || pts[i - 1][0]) * Math.PI / 180;
            LowY = (pts[i - 1].lat || pts[i - 1][1]) * Math.PI / 180;
            MiddleX = (pts[i].lng || pts[i][0]) * Math.PI / 180;
            MiddleY = (pts[i].lat || pts[i][1]) * Math.PI / 180;
            HighX = (pts[i + 1].lng || pts[i + 1][0]) * Math.PI / 180;
            HighY = (pts[i + 1].lat || pts[i + 1][1]) * Math.PI / 180;
        }
        AM = Math.cos(MiddleY) * Math.cos(MiddleX);
        BM = Math.cos(MiddleY) * Math.sin(MiddleX);
        CM = Math.sin(MiddleY);
        AL = Math.cos(LowY) * Math.cos(LowX);
        BL = Math.cos(LowY) * Math.sin(LowX);
        CL = Math.sin(LowY);
        AH = Math.cos(HighY) * Math.cos(HighX);
        BH = Math.cos(HighY) * Math.sin(HighX);
        CH = Math.sin(HighY);
        CoefficientL = (AM * AM + BM * BM + CM * CM) / (AM * AL + BM * BL + CM * CL);
        CoefficientH = (AM * AM + BM * BM + CM * CM) / (AM * AH + BM * BH + CM * CH);
        ALtangent = CoefficientL * AL - AM;
        BLtangent = CoefficientL * BL - BM;
        CLtangent = CoefficientL * CL - CM;
        AHtangent = CoefficientH * AH - AM;
        BHtangent = CoefficientH * BH - BM;
        CHtangent = CoefficientH * CH - CM;
        if (!(Math.sqrt(AHtangent * AHtangent + BHtangent * BHtangent + CHtangent * CHtangent) * Math.sqrt(ALtangent * ALtangent + BLtangent * BLtangent + CLtangent * CLtangent))) {
            AngleCos = 0;
        } else {
            AngleCos = (AHtangent * ALtangent + BHtangent * BLtangent + CHtangent * CLtangent) / (Math.sqrt(AHtangent * AHtangent + BHtangent * BHtangent + CHtangent * CHtangent) * Math.sqrt(ALtangent * ALtangent + BLtangent * BLtangent + CLtangent * CLtangent));
            AngleCos = Math.acos(AngleCos);
        }
        ANormalLine = BHtangent * CLtangent - CHtangent * BLtangent;
        BNormalLine = 0 - (AHtangent * CLtangent - CHtangent * ALtangent);
        CNormalLine = AHtangent * BLtangent - BHtangent * ALtangent;
        if (AM != 0) OrientationValue = ANormalLine / AM;else if (BM != 0) OrientationValue = BNormalLine / BM;else OrientationValue = CNormalLine / CM;
        if (OrientationValue > 0) {
            Sum1 += AngleCos;
            Count1++;
        } else {
            Sum2 += AngleCos;
            Count2++;
        }
    }
    var tempSum1, tempSum2;
    tempSum1 = Sum1 + (2 * Math.PI * Count2 - Sum2);
    tempSum2 = 2 * Math.PI * Count1 - Sum1 + Sum2;
    if (Sum1 > Sum2) {
        if (tempSum1 - (Count - 2) * Math.PI < 1) Sum = tempSum1;else Sum = tempSum2;
    } else {
        if (tempSum2 - (Count - 2) * Math.PI < 1) Sum = tempSum2;else Sum = tempSum1;
    }
    totalArea = (Sum - (Count - 2) * Math.PI) * Radius * Radius;
    return totalArea; //返回总面积
}
//计算2点间的距离 (单位:px)
function getPixelDistance(lt1, lt2) {
    var x = Math.abs(lt1.x - lt2.x);
    var y = Math.abs(lt1.y - lt2.y);
    var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    return d;
}
//计算2点间的距离 (单位m)
function getDistance(point1, point2, map, wkid) {
    var lt1 = map.toScreen(new esri.geometry.Point({
        longitude: point1[0],
        latitude: point1[1],
        spatialReference: { wkid: wkid || 4326 }
    }));
    var lt2 = map.toScreen(new esri.geometry.Point({
        longitude: point2[0],
        latitude: point2[1],
        spatialReference: { wkid: wkid || 4326 }
    }));
    var x = Math.abs(lt1.x - lt2.x);
    var y = Math.abs(lt1.y - lt2.y);
    var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * map.getScale() * 0.025399998 / 96;
    return Math.round(d * 100) / 100;
}
//arcgis default server  国家天地图矢量图
//1个像素是多少米： 1像素=0.0254/96
//第三方天地图 0.025399998   arcgis本身0.0254000508001016
//resolution = (0.025399998 *scale)/(96*111000)
//比例尺 resolution*111000  或 0.025399998/96*scale
var defaultWmtsMapLayers = exports.defaultWmtsMapLayers = {
    services: [{
        type: 'wmts',
        url: ['http://t1.tianditu.com/vec_c/wmts', 'http://t2.tianditu.com/cva_c/wmts'],
        tilematrixset: 'c',
        format: 'tiles',
        layer: ['vec', 'cva']
    }, {
        type: 'wmts',
        url: ['http://srv2.zjditu.cn/ZJEMAP_2D/wmts', 'http://srv2.zjditu.cn/ZJEMAPANNO_2D/wmts'],
        tilematrixset: 'default028mm',
        format: 'image/jpgpng',
        layer: ['TDT_ZJEMAPANNO', 'TDT_ZJEMAPANNO']
    }],
    origin: { x: -180, y: 90 },
    wkid: 4326,
    fullExtent: { xmin: -180.0, ymin: -90.0, xmax: 180.0, ymax: 90.0 },
    // initialExtent: {xmin : 119.96,ymin : 30.2,xmax : 120.3,ymax : 30.54},
    initialExtent: {
        xmin: 120.741407641, ymin: 30.7612148640001,
        xmax: 121.033872803, ymax: 31.0324190470001
    },
    defaultType: "2D", //暂时没用到,抄上就行
    switchTypeArrays: ["2D", "Satellite"], //暂时没用到,抄上就行
    lods: [{
        "level": 0,
        "resolution": 1.40625,
        "scale": 591658721.28
    }, {
        "level": 1,
        "resolution": 0.703125,
        "scale": 295829360.64
    }, {
        "level": 2,
        "resolution": 0.3515625,
        "scale": 147914680.32
    }, {
        "level": 3,
        "resolution": 0.17578125,
        "scale": 73957340.16
    }, {
        "level": 4,
        "resolution": 0.087890625,
        "scale": 36978670.08
    }, {
        "level": 5,
        "resolution": 0.0439453125,
        "scale": 18489335.04
    }, {
        "level": 6,
        "resolution": 0.02197265625,
        "scale": 9244667.52
    }, {
        "level": 7,
        "resolution": 0.010986328125,
        "scale": 4622333.76
    }, {
        "level": 8,
        "resolution": 0.0054931640625,
        "scale": 2311166.88
    }, {
        "level": 9,
        "resolution": 0.00274658203125,
        "scale": 1155583.44
    }, {
        "level": 10,
        "resolution": 0.001373291015625,
        "scale": 577791.72
    }, {
        "level": 11,
        "resolution": 0.0006866455078125,
        "scale": 288895.86
    }, {
        "level": 12,
        "resolution": 0.00034332275390625,
        "scale": 144447.93
    }, {
        "level": 13,
        "resolution": 0.000171661376953125,
        "scale": 72223.96
    }, {
        "level": 14,
        "resolution": 0.0000858306884765625,
        "scale": 36111.98
    }, {
        "level": 15,
        "resolution": 0.00004291534423828125,
        "scale": 18035.742100270663377549137718
    }, {
        "level": 16,
        "resolution": 0.000021457672119140625,
        "scale": 9017.871050135331688774568859
    }, {
        "level": 17,
        "resolution": 0.0000107288360595703125,
        "scale": 4508.9355250676658443872844296
    }, {
        "level": 18,
        "resolution": 0.000005364418029785156,
        "scale": 2254.46776253383
    }, {
        "level": 19,
        "resolution": 0.000002682209014892578,
        "scale": 1127.23388126692
    }, {
        "level": 20,
        "resolution": 0.000001341104507446289,
        "scale": 563.616940633458
    }]
};