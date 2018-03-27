'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VtxUpload2 = exports.VtxUploadModal = exports.VtxUpload = undefined;

var _VortexUpload = require('./VortexUpload');

var _VortexUpload2 = _interopRequireDefault(_VortexUpload);

var _VortexUploadModal = require('./VortexUploadModal');

var _VortexUploadModal2 = _interopRequireDefault(_VortexUploadModal);

var _VortexUpload3 = require('./VortexUpload.v2');

var _VortexUpload4 = _interopRequireDefault(_VortexUpload3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_VortexUpload2.default.VtxUploadModal = _VortexUploadModal2.default;
_VortexUpload2.default.VtxUpload2 = _VortexUpload4.default;

exports.default = _VortexUpload2.default;
exports.VtxUpload = _VortexUpload2.default;
exports.VtxUploadModal = _VortexUploadModal2.default;
exports.VtxUpload2 = _VortexUpload4.default;