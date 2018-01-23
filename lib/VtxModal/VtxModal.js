'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./VtxModal.less');

var _modal = require('antd/lib/modal');

var _modal2 = _interopRequireDefault(_modal);

require('antd/lib/modal/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

require('antd/lib/icon/style/css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    normal: 'vtx-ui-modal-normal',
    title: 'vtx-ui-modal-title',
    title_name: 'vtx-ui-modal-title_name',
    close: 'vtx-ui-modal-close'
};


function VtxModal(props) {
    var ModalProps = _extends({}, props);
    var closable = true;
    if ('closable' in props) {
        closable = props.closable;
    }
    function renderTitle() {
        return _react2.default.createElement(
            'div',
            { className: styles.title, style: { paddingRight: closable ? '32px' : '0px' } },
            _react2.default.createElement(
                'div',
                { className: styles.title_name },
                ModalProps.title
            ),
            closable ? _react2.default.createElement(
                'div',
                { className: styles.close },
                _react2.default.createElement(
                    'p',
                    { onClick: ModalProps.onCancel },
                    _react2.default.createElement(_icon2.default, { type: 'close' })
                )
            ) : ''
        );
    }
    var wrapClassName = styles.normal + ' ' + ModalProps.wrapClassName;

    delete ModalProps.closable;
    delete ModalProps.wrapClassName;
    return _react2.default.createElement(
        _modal2.default,
        _extends({
            width: 700,
            maskClosable: false,
            closable: false,
            title: renderTitle(),
            wrapClassName: wrapClassName
        }, ModalProps),
        ModalProps.children
    );
}
VtxModal.info = _modal2.default.info;
VtxModal.success = _modal2.default.success;
VtxModal.error = _modal2.default.error;
VtxModal.warning = _modal2.default.warning;
VtxModal.confirm = _modal2.default.confirm;

exports.default = VtxModal;
module.exports = exports['default'];