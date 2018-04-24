"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.graphicManage = graphicManage;
exports.getMaxMin = getMaxMin;
exports.getPolygonArea = getPolygonArea;
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
    var pts = polygon;

    if (pts.length < 3) {
        //小于3个顶点，不能构建面
        return 0;
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
            LowX = pts[Count - 1].lng * Math.PI / 180;
            LowY = pts[Count - 1].lat * Math.PI / 180;
            MiddleX = pts[0].lng * Math.PI / 180;
            MiddleY = pts[0].lat * Math.PI / 180;
            HighX = pts[1].lng * Math.PI / 180;
            HighY = pts[1].lat * Math.PI / 180;
        } else if (i == Count - 1) {
            LowX = pts[Count - 2].lng * Math.PI / 180;
            LowY = pts[Count - 2].lat * Math.PI / 180;
            MiddleX = pts[Count - 1].lng * Math.PI / 180;
            MiddleY = pts[Count - 1].lat * Math.PI / 180;
            HighX = pts[0].lng * Math.PI / 180;
            HighY = pts[0].lat * Math.PI / 180;
        } else {
            LowX = pts[i - 1].lng * Math.PI / 180;
            LowY = pts[i - 1].lat * Math.PI / 180;
            MiddleX = pts[i].lng * Math.PI / 180;
            MiddleY = pts[i].lat * Math.PI / 180;
            HighX = pts[i + 1].lng * Math.PI / 180;
            HighY = pts[i + 1].lat * Math.PI / 180;
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
        AngleCos = (AHtangent * ALtangent + BHtangent * BLtangent + CHtangent * CLtangent) / (Math.sqrt(AHtangent * AHtangent + BHtangent * BHtangent + CHtangent * CHtangent) * Math.sqrt(ALtangent * ALtangent + BLtangent * BLtangent + CLtangent * CLtangent));
        AngleCos = Math.acos(AngleCos);
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