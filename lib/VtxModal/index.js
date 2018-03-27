'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DraggableModal = exports.VtxModal = undefined;

var _VtxModal = require('./VtxModal');

var _VtxModal2 = _interopRequireDefault(_VtxModal);

var _draggableModal = require('./draggableModal');

var _draggableModal2 = _interopRequireDefault(_draggableModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_VtxModal2.default.DraggableModal = _draggableModal2.default;

exports.default = _VtxModal2.default;
exports.VtxModal = _VtxModal2.default;
exports.DraggableModal = _draggableModal2.default;