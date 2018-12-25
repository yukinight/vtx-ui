import React from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import TimePicker from 'antd/lib/time-picker';
import 'antd/lib/time-picker/style/css';
import './common.css';

const cm_style = {
    error: 'vtx-ui-date-error'
}

function VtxTimePicker(props) {
    const {
        value,className,popupClassName,
        open,format,disabled,hideDisabledOptions,placeholder,required,
        onOpenChange,onChange,disabledHours,disabledMinutes,disabledSeconds,addon
    } = props;

    let TimePickerProps = {
        value: value?moment(value,(format ||'HH:mm:ss')):null,

        className: className,
        popupClassName: popupClassName,
        disabled: disabled || false,
        hideDisabledOptions: hideDisabledOptions || false,
        format: format || 'HH:mm:ss',
        placeholder: placeholder || '请选择时间',

        onChange: onChange,
        onOpenChange: onOpenChange,
        disabledHours: disabledHours,
        disabledMinutes: disabledMinutes,
        disabledSeconds: disabledSeconds,
        addon: addon,
        style: props.style
    }
    if('open' in  props){
        TimePickerProps.open = open;
    }
    if(required && !value){
        return (
            <div className={cm_style.error} data-errorMsg="必填">
                <TimePicker {...TimePickerProps}/>
            </div>
        )
    }
    else{
        return ( <TimePicker {...TimePickerProps}/> )
    }
}

export default VtxTimePicker;