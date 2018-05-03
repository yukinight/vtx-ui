import React from 'react';
import { DatePicker,TimePicker,Button } from 'antd';
import moment from 'moment';

export function TestDatePicker(props) {
    function onChange(){
        
    }
    return (
        <DatePicker  style={{ width: '100%' }} onChange={onChange} />
    );
}

export function TestDateTimePicker(props) {
    function onChange(){
        
    }
    return (
        <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" onChange={onChange} />
    );
}
export function TestTimePicker(props) {
    function onChange(){
        
    }
    return (
        <TimePicker 
            style={{ width: '100%' }}  onChange={onChange}
            addon={() => (
                <div style={{textAlign: 'right'}}>
                    <Button size="small" type="primary">
                        Ok
                    </Button>
                </div>
            )} 
        />
    );
}

