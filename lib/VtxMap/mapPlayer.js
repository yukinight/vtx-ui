'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* 
地图实例：@map
需要播放的点位数组：@path --- [{longitude,latitude,name,id}]

播放速度：@speed  ---  Number
播放倍率：@playRate,
点位设置：@pointSetting,
线设置：@lineSetting,
是否开启图标自动旋转：@enableRotation,
点位变化事件：@onChange
setSpeed
setCurrentIndex
play
pause
stop
destroy
*/
var MapPlayer = function () {
    function MapPlayer(_ref) {
        var _this = this;

        var map = _ref.map,
            path = _ref.path,
            speed = _ref.speed,
            playRate = _ref.playRate,
            pointSetting = _ref.pointSetting,
            lineSetting = _ref.lineSetting,
            enableRotation = _ref.enableRotation,
            mapMove = _ref.mapMove,
            onChange = _ref.onChange;

        _classCallCheck(this, MapPlayer);

        this.map = map; //地图实例
        this.path = path || []; //点位数组
        this.speed = speed || 12; //点位移动速度，m/s
        this.playFrame = 24; //播放帧率
        this.playRate = playRate || 1; //播放速率
        this.enableRotation = enableRotation || false; //是否开启图标自动旋转
        this.mapMove = mapMove || false; //地图是否跟随播放点位移动
        this.pointSetting = pointSetting || {
            config: {
                width: 30,
                height: 30,
                markerContentX: -15,
                markerContentY: -15
            }
        };
        this.lineSetting = lineSetting || { lineWidth: 3, color: 'blue' }; //线的样式配置
        this.onChange = onChange;

        var uniqueID = new Date().valueOf() + '_' + parseInt(Math.random() * 100000000);
        this._pointId = 'point_' + uniqueID;
        this._lineId = 'line_' + uniqueID;
        this._currentIndex = 0; //当前播放的点位序号
        this._supplementPoints = []; //补点列表
        this._currentSupplementIndex = 0; //当前补点序号
        this._timer = null; //播放定时器
        this.map.loadMapComplete.then(function () {
            _this._redraw();
        });
    }
    // 根据当前数据重新渲染点和线的图形


    _createClass(MapPlayer, [{
        key: '_redraw',
        value: function _redraw() {
            if (this.path.length == 0) {
                this.map.GM.isRepetition(this._pointId) && this.map.removeGraphic(this._pointId);
                this.map.GM.isRepetition(this._lineId) && this.map.removeGraphic(this._lineId);
                return;
            }
            if (this._currentIndex < this.path.length) {
                // 画点
                var currentPoint = void 0;
                if (this._currentIndex == this.path.length - 1 || this._supplementPoints.length == 0) {
                    currentPoint = this.path[this._currentIndex];
                } else {
                    currentPoint = this._supplementPoints[this._currentSupplementIndex];
                }
                var pointObj = _extends({}, currentPoint, {
                    id: this._pointId,
                    latitude: currentPoint.latitude,
                    longitude: currentPoint.longitude
                }, this.pointSetting, {
                    config: _extends({}, this.pointSetting.config || {}, {
                        labelContent: currentPoint.name || ''
                    })
                });
                if (this.enableRotation) {
                    var deg = this._currentIndex + 1 < this.path.length ? this._getIconAngle({
                        x: this.path[this._currentIndex].longitude,
                        y: this.path[this._currentIndex].latitude
                    }, {
                        x: this.path[this._currentIndex + 1].longitude,
                        y: this.path[this._currentIndex + 1].latitude
                    }) : 0;
                    pointObj.config.deg = deg;
                }

                if (this.map.GM.isRepetition(this._pointId)) {
                    this.map.updatePoint([pointObj]);
                    this.mapMove && this.map.setCenter([pointObj.longitude, pointObj.latitude]);
                } else {
                    this.map.addPoint([pointObj], 'defined');
                }
                // 画线
                var paths = [];
                for (var i = 0; i <= this._currentIndex; i++) {
                    paths.push([this.path[i].longitude, this.path[i].latitude]);
                }

                if (this._supplementPoints.length > 0) {
                    for (var _i = 0; _i <= this._currentSupplementIndex; _i++) {
                        paths.push([this._supplementPoints[_i].longitude, this._supplementPoints[_i].latitude]);
                    }
                }
                if (paths.length > 1) {
                    var lineObj = {
                        id: this._lineId,
                        paths: paths,
                        config: this.lineSetting
                    };
                    if (this.map.GM.isRepetition(this._lineId)) {
                        this.map.updateLine([lineObj]);
                    } else {
                        this.map.addLine([lineObj], 'defined');
                    }
                } else {
                    if (this.map.GM.isRepetition(this._lineId)) {
                        this.map.removeGraphic(this._lineId);
                    }
                }
            }
        }
    }, {
        key: '_clearTimer',
        value: function _clearTimer() {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
        }
        // 计算图标转动角度（仅适用于当前车辆图标，仅适用于中国区域）

    }, {
        key: '_getIconAngle',
        value: function _getIconAngle(start, end) {
            var diff_x = end.x - start.x,
                diff_y = end.y - start.y;
            // 1,4象限夹脚计算
            var ag = 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
            // 地图夹角偏转计算
            if (diff_x == 0) {
                if (diff_y > 0) {
                    return -90;
                } else if (diff_y < 0) {
                    return 90;
                } else {
                    return 0;
                }
            }
            // 坐标系1,4象限
            else if (diff_x > 0) {
                    return -ag;
                }
                // 坐标系2,3象限
                else {
                        return 180 - ag;
                    }
        }
        // 根据两点生成补点列表

    }, {
        key: '_generateSupplyPoints',
        value: function _generateSupplyPoints(p1, p2) {
            var currentLng = p1.longitude,
                currentLat = p1.latitude;
            var nextLng = p2.longitude,
                nextLat = p2.latitude;

            var runTime = this.map.calculateDistance([[currentLng, currentLat], [nextLng, nextLat]]) / (this.speed * this.playRate);
            //不需要补点    
            if (runTime <= 1 / this.playFrame) {
                return [];
            }
            // 需要补点
            else {
                    var supplementNum = Math.ceil(runTime / (1 / this.playFrame)) - 1;
                    var lng_spacing = (nextLng - currentLng) / (supplementNum + 1);
                    var lat_spacing = (nextLat - currentLat) / (supplementNum + 1);
                    var supplementPoints = [];
                    for (var i = 1; i <= supplementNum; i++) {
                        supplementPoints.push(_extends({}, this.path[this._currentIndex], {
                            longitude: currentLng + lng_spacing * i,
                            latitude: currentLat + lat_spacing * i
                        }));
                    }
                    return supplementPoints;
                }
        }
        // 开始播放

    }, {
        key: 'play',
        value: function play() {
            var _this2 = this;

            this._clearTimer();
            if (this.path.length == 0 || this._currentIndex == this.path.length - 1) {
                return;
            };
            // 当前处于补点播放
            if (this._supplementPoints.length > 0) {
                this._timer = setTimeout(function () {
                    if (_this2._currentSupplementIndex < _this2._supplementPoints.length - 1) {
                        _this2._currentSupplementIndex = _this2._currentSupplementIndex + 1;
                    } else {
                        _this2._currentSupplementIndex = 0;
                        _this2._supplementPoints = [];
                        _this2._currentIndex = _this2._currentIndex + 1;
                        typeof _this2.onChange == 'function' && _this2.onChange(_this2.path[_this2._currentIndex], _this2._currentIndex);
                    }
                    _this2._redraw();
                    _this2.play();
                }, 1000 / this.playFrame);
            }
            // 当前处于非补点播放
            else {
                    var spPoints = this._generateSupplyPoints(this.path[this._currentIndex], this.path[this._currentIndex + 1]);
                    //不需要补点    
                    if (spPoints.length == 0) {
                        this._timer = setTimeout(function () {
                            _this2._currentIndex = _this2._currentIndex + 1;
                            typeof _this2.onChange == 'function' && _this2.onChange(_this2.path[_this2._currentIndex], _this2._currentIndex);
                            _this2._redraw();
                            _this2.play();
                        }, 1000 / this.playFrame);
                    }
                    // 需要补点
                    else {
                            this._timer = setTimeout(function () {
                                _this2._currentSupplementIndex = 0;
                                _this2._supplementPoints = spPoints;
                                _this2._redraw();
                                _this2.play();
                            }, 1000 / this.playFrame);
                        }
                }
        }
        // 暂停播放

    }, {
        key: 'pause',
        value: function pause(onPlayPause) {
            this._clearTimer();
            typeof onPlayPause == "function" && onPlayPause(this.path[this._currentIndex], this._currentIndex);
        }
        // 停止播放（回到初始点位）

    }, {
        key: 'stop',
        value: function stop() {
            this._clearTimer();
            this._currentIndex = 0;
            this._supplementPoints = [];
            this._currentSupplementIndex = 0;
            this._redraw();
            // typeof this.onChange == "function" && this.onChange(this.path[0],0);
        }
        // 销毁（删除所有添加的图层）

    }, {
        key: 'destroy',
        value: function destroy() {
            this._clearTimer();
            this.map.removeGraphic(this._pointId);
            this.map.removeGraphic(this._lineId);
            this._currentIndex = 0;
            this._supplementPoints = [];
            this._currentSupplementIndex = 0;
        }
        // 设置速度

    }, {
        key: 'setPlayRate',
        value: function setPlayRate(newPlayRate) {
            this.playRate = newPlayRate;
            //如果当前处于补点状态，重新生成新的补点
            if (this._supplementPoints.length > 0) {
                var newSpPoints = this._generateSupplyPoints(this._supplementPoints[this._currentSupplementIndex], this.path[this._currentIndex + 1]);
                this._supplementPoints = [].concat(_toConsumableArray(this._supplementPoints.slice(0, this._currentSupplementIndex + 1)), _toConsumableArray(newSpPoints));
            }
        }
        // 设置当前播放点位的位置

    }, {
        key: 'setCurrentIndex',
        value: function setCurrentIndex(pIndex) {
            if (pIndex >= this.path.length) return;

            this._currentIndex = pIndex;
            this._supplementPoints = [];
            this._currentSupplementIndex = 0;
            // typeof this.onChange == "function" && this.onChange(this.path[pIndex],pIndex);
            this._redraw();
            if (this._timer) {
                this._clearTimer();
                this.play();
            }
        }
        // 重新设置播放路线

    }, {
        key: 'setPath',
        value: function setPath(newPath) {
            this.path = newPath;
            this._currentIndex = 0;
            this._supplementPoints = [];
            this._currentSupplementIndex = 0;
            this._redraw();
            if (this._timer) {
                this._clearTimer();
                this.play();
            }
        }
    }]);

    return MapPlayer;
}();

exports.default = MapPlayer;
module.exports = exports['default'];