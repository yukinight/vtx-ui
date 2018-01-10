import React from 'react';
import { Cascader } from 'antd';
import moment from 'moment';

function TestCascader(props) {
    const options = [{
        value: 'zhejiang',
        label: 'Zhejiang',
        children: [{
            value: 'hangzhou',
            label: 'Hangzhou',
            children: [{
                value: 'xihu',
                label: 'West Lake',
            }],
        }],
    }, {
        value: 'jiangsu',
        label: 'Jiangsu',
        children: [{
            value: 'nanjing',
            label: 'Nanjing',
            children: [{
                value: 'zhonghuamen',
                label: 'Zhong Hua Men',
            }],
        }],
    }];
    function onChange(){
        
    }
    return (
        <Cascader style={{ width: '100%' }} options={options} onChange={onChange} placeholder="必须填提示" />
    );
}

export default TestCascader;
