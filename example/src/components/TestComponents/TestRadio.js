import React from 'react';

import { Radio } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function TestCheckBox(props) {
    function onChange(){
        
    }
    return (
        <RadioGroup onChange={onChange} defaultValue="a">
            <RadioButton value="a">我是六个字啊</RadioButton>
            <RadioButton value="b">我是六个字啊</RadioButton>
            <RadioButton value="c">我是六个字啊</RadioButton>
            <RadioButton value="d">我是六个字啊</RadioButton>
            <RadioButton value="dc">我是六个字啊</RadioButton>
            <RadioButton value="dd">我是六个字啊</RadioButton>
        </RadioGroup>
    );
}

export default TestCheckBox;

