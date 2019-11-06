import {
	isObject,
	isEmptyObject,
	isArray,
} from './util';

// 单张
const VIEWER = 'viewer';
// 多张
const GALLERY = 'gallery';

function checkMode(x) {
	let mode = '';
	if (isObject(x) && !isEmptyObject(x)) {
	 	mode = VIEWER;
	}
	if (isArray(x)) {
		let len = x.length;
		mode = len == 0 ? '' : (len == 1 ? VIEWER : GALLERY);
	}
	return mode;
}

export {
	VIEWER,
	GALLERY,
	checkMode,
}