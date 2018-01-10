import React from 'react';

import { Checkbox } from 'antd';

function TestCheckBox(props) {
    function onChange(){
        
    }
    return (
        <Checkbox.Group onChange={onChange}>
            <Checkbox value="A">我是六个字啊</Checkbox>
            <Checkbox value="b">我是六个字啊</Checkbox>
            <Checkbox value="className">我是六个字啊</Checkbox>
            <Checkbox value="Ad">我是六个字啊</Checkbox>
            <Checkbox value="Ade">我是六个字啊</Checkbox>
            <Checkbox value="Adc">我是六个字啊</Checkbox>
        </Checkbox.Group>
    );
}
export default TestCheckBox;
