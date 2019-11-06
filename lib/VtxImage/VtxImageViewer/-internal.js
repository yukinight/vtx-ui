'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.checkMode = exports.GALLERY = exports.VIEWER = undefined;

var _util = require('./util');

// 单张
var VIEWER = 'viewer';
// 多张
var GALLERY = 'gallery';

function checkMode(x) {
	var mode = '';
	if ((0, _util.isObject)(x) && !(0, _util.isEmptyObject)(x)) {
		mode = VIEWER;
	}
	if ((0, _util.isArray)(x)) {
		var len = x.length;
		mode = len == 0 ? '' : len == 1 ? VIEWER : GALLERY;
	}
	return mode;
}

exports.VIEWER = VIEWER;
exports.GALLERY = GALLERY;
exports.checkMode = checkMode;