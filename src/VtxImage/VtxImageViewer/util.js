import isEmpty from 'lodash/isEmpty';
export const isEmptyObject =  isEmpty;

export function isObject(x) {
	return Object.prototype.toString.call(x) === '[object Object]';
}

export function isFunction(fn) {
	return Object.prototype.toString.call(fn) === '[object Function]';
}

let _isArray;
if (Array.isArray) {
  	_isArray = Array.isArray;
} else {
  	_isArray = x => Object.prototype.toString.call(x) === '[object Array]';
}

export const isArray = _isArray;