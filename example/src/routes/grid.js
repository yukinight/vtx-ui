import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './grid.less';

import {Button,Icon} from 'antd';

import {VtxGrid,VtxModeGrid} from 'vtx-ui';
const {VtxRow,VtxCol} = VtxGrid;
import TestCheckedBox from '../components/TestComponents/TestCheckedBox';
import TestRadio from '../components/TestComponents/TestRadio';
import TestRangePicker from '../components/TestComponents/TestRangePicker';
import {TestDatePicker,TestDateTimePicker,TestTimePicker} from '../components/TestComponents/TestDatePicker';
import TestTreeSelect from '../components/TestComponents/TestTreeSelect';
import TestSelect from '../components/TestComponents/TestSelect';
import {TestInput,TestInputNumber} from '../components/TestComponents/TestInput';
import TestCascader from '../components/TestComponents/TestCascader';

function IndexPage() {
    //注 lg xl等响应式的宽度,是根据屏幕的宽度判断的(并非父元素宽度).
    function confirm(argument) {
        console.log('confirm',argument)
    }
    function clear(argument) {
        console.log('clear',argument)
    }
    return (
        <VtxGrid 
            titles={[
                '日期选择','日期时间选择','时间选择','下拉树选择','数字输入框',
                '下拉选择','输入框','级联选择','时间范围选择','多选','单选'
            ]}
            gridweight = {[1,1,1,1,1,1,1,1,2,4,4]}
            confirm={confirm}
            clear={clear}
            // showAll={true}
            // showMore={true}
            // hiddenMoreButtion={true}
            >
            <TestDatePicker />
            <TestDateTimePicker />
            <TestTimePicker />
            <TestTreeSelect />
            <TestInputNumber />
            <TestSelect />
            <TestInput />
            <TestCascader />
            <TestRangePicker />
            <TestCheckedBox />
            <TestRadio/>
        </VtxGrid>   
    );
}

export default connect()(IndexPage);