import React from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import DatePicker from 'antd/lib/date-picker';
import 'antd/lib/date-picker/style/css';

import './common.less';

const cm_style = {
    error: 'vtx-ui-date-error'
}
function VtxDatePicker(props) {
    const {
        showTime,format,allowClear,disabled,open,showToday,
        value,placeholder,size,style,disabledDate,
        onChange,onOpenChange,disabledTime,onOk,required
    } = props;

    let DatePickerProps = {
        allowClear: allowClear || false,
        showTime: showTime || false,
        disabled: disabled || false,
        showToday: showToday || false,

        format: format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss'),
        value: value ? moment(value,(format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss'))):null,
        style: style || {},
        placeholder: placeholder || '请选择时间',
        size: size || 'default',

        onChange: onChange,
        onOpenChange: onOpenChange,
        disabledTime: disabledTime,
        onOk: onOk
    }
    if('open' in  props){
        DatePickerProps.open = open;
    }
    if('disabledDate' in props){
        if(typeof(disabledDate) === 'function'){
            DatePickerProps.disabledDate = disabledDate;
        }
        // DatePickerProps.disabledDate = disabledDateFun;
    }
    if(required && !value){
        return (
            <div className={cm_style.error} data-errorMsg="必填">
                <DatePicker {...DatePickerProps}/>
            </div>
        )
    }
    else{
        return ( <DatePicker {...DatePickerProps}/> )
    }
}

export default VtxDatePicker;
    //后期完善功能
    // function disabledDateFun(current) {
    //     let isTrue = false;
    //     if(!current) return isTrue;
    //     switch(disabledDate.type){
    //         case 'equ'://等于
    //             isTrue = disabledDate.date.indexOf(moment(current).format(DatePickerProps.format)) > -1;
    //         break;
    //         case 'lss'://小于
    //             isTrue = current.valueOf() < moment(disabledDate.date).valueOf();
    //         break;
    //         case 'les'://小于等于
    //             isTrue = current.valueOf() <= moment(disabledDate.date).valueOf();
    //         break;
    //         case 'gt'://大于
    //             isTrue = current.valueOf() > moment(disabledDate.date).valueOf();
    //         break;
    //         case 'geq'://大于等于
    //             isTrue = current.valueOf() >= moment(disabledDate.date).valueOf();
    //         break;
    //     }
    //     return isTrue;
    // }