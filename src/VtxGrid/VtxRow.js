import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import Row from 'antd/lib/row';
import 'antd/lib/row/style/css';
function VtxRow(props) {
    const {
        children,
        gutter=0,type,align,justify
    } = props;
    const RowProps = {gutter,type,align,justify};
    return (
        <Row {...RowProps}>
            {
                children
            }
        </Row>
    );
}

VtxRow.propTypes = {
};

export default VtxRow;
