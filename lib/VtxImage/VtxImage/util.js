'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function getComponentProps(prop) {
    if (prop && (typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'object') {
        return prop;
    }
    return {};
}

exports.getComponentProps = getComponentProps;