'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OptGroup = exports.Option = exports.VtxSelect = exports.VtxInput = undefined;

var _stateInput = require('./stateInput');

var _stateInput2 = _interopRequireDefault(_stateInput);

var _stateSelect = require('./stateSelect');

var _stateSelect2 = _interopRequireDefault(_stateSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VtxForm = {
    VtxInput: _stateInput2.default,
    VtxSelect: _stateSelect2.default,
    Option: _stateSelect.Option,
    OptGroup: _stateSelect.OptGroup
};

exports.default = VtxForm;
exports.VtxInput = _stateInput2.default;
exports.VtxSelect = _stateSelect2.default;
exports.Option = _stateSelect.Option;
exports.OptGroup = _stateSelect.OptGroup;