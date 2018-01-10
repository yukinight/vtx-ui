import React from 'react';

import { DatePicker } from 'antd';
import moment from 'moment';
const RangePicker = DatePicker.RangePicker;

function TestRangePicker(props) {
    function onChange(){
        
    }
    return (
        <RangePicker
            style={{ width: '100%' }}
            ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
            showTime format="YYYY-MM-DD HH:mm:ss" onChange={onChange}
        />
    );
}

export default TestRangePicker;
