import React from 'react';

import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import DatePicker from 'antd/lib/date-picker';
import 'antd/lib/date-picker/style/css';
const {MonthPicker} = DatePicker;

import './common.less';
const cm_style = {
    error: 'vtx-ui-date-error'
}
function VtxMonthPicker(props) {
    const {
        allowClear,disabled,open,style,placeholder,size,
        value,required,
        onChange,onOpenChange,disabledDate
    } = props;

    let MonthPickerProps = {
        allowClear: allowClear || false,
        disabled: disabled || false,
        style: style || {},
        placeholder: placeholder || '请选择时间',
        size: size || 'default',
        value: value ? moment(value,'YYYY-MM'):null,

        onChange: onChange,
        onOpenChange: onOpenChange,
        disabledDate: disabledDate,
        format: 'YYYY-MM',
    }
    if('open' in  props){
        DatePickerProps.open = open;
    }
    
    if(required && !value){
        return (
            <div className={cm_style.error} data-errorMsg="必填">
                <MonthPicker {...MonthPickerProps}/>
            </div>
        )
    }
    else{
        return ( <MonthPicker {...MonthPickerProps}/> )
    }
}

export default VtxMonthPicker;
