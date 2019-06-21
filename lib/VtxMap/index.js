'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MapPlayer = exports.VtxZoomMap = exports.VtxOptMap = exports.VtxMap = undefined;

var _Map = require('./Map');

var _Map2 = _interopRequireDefault(_Map);

var _optimizingPointMap = require('./optimizingPointMap');

var _optimizingPointMap2 = _interopRequireDefault(_optimizingPointMap);

var _zoomMap = require('./zoomMap');

var _zoomMap2 = _interopRequireDefault(_zoomMap);

var _mapPlayer = require('./mapPlayer');

var _mapPlayer2 = _interopRequireDefault(_mapPlayer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_Map2.default.VtxOptMap = _optimizingPointMap2.default;
_Map2.default.VtxZoomMap = _zoomMap2.default;
_Map2.default.MapPlayer = _mapPlayer2.default;

exports.default = _Map2.default;
exports.VtxMap = _Map2.default;
exports.VtxOptMap = _optimizingPointMap2.default;
exports.VtxZoomMap = _zoomMap2.default;
exports.MapPlayer = _mapPlayer2.default;