import React from 'react';

import { Select } from 'antd';
const {Option} = Select;
function TestSelect(props) {
    function handleChange(){
        
    }
    return (
        <Select placeholder='必须加提示' style={{ width: '100%' }} onChange={handleChange}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="disabled" disabled>Disabled</Option>
            <Option value="Yiminghe">yiminghe</Option>
        </Select>
    );
}

export default TestSelect;

