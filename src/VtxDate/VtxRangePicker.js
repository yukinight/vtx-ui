import React from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import DatePicker from 'antd/lib/date-picker';
import 'antd/lib/date-picker/style/css';
import './common.css';

const cm_style = {
    error: 'vtx-ui-date-error'
}
const {RangePicker} = DatePicker;

function VtxRangePicker(props) {
    const {
        showTime,format,allowClear,disabled,open,
        value,placeholder,size,style,disabledDate,
        required,
        onChange,onOpenChange,disabledTime,onOk
    } = props;

    let DatePickerProps = {
        ...props,
        allowClear: allowClear || false,
        showTime: showTime || false,
        disabled: disabled || false,

        format: format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss'),
        // value: !value || value == []? [null,null]: [moment(value[0],(format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss'))),moment(value[1],(format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss')))],
        value: !value
            ?[null,null]
            :[
            value[0]
                ?moment(value[0],(format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss')))
                :null,
            value[1]
                ?moment(value[1],(format || (!showTime?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss')))
                :null
            ],
        style: style || {},
        placeholder: placeholder?[placeholder,placeholder] : ['请选择时间','请选择时间'],
        size: size || 'default',

        onChange: (date,dateString)=>{
            if(date[0] && date[1]){
                //防止,时间和日期之间切换选择后,前大后小的bug
                let d1=date[0],d2=date[1],ds1=dateString[0],ds2=dateString[1];
                let d = [],ds = [];
                if(d1.valueOf() <= d2.valueOf()){
                    d = [d1,d2];
                    ds = [ds1,ds2];
                }else{
                    d = [d2,d1];
                    ds = [ds2,ds1];
                }
                onChange(d,ds);
            }else{
                onChange(date,dateString);
            }
        },
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
    
    if(required && (!value || (!value[0] && !value[1]))){
        return (
            <div className={cm_style.error} data-errorMsg="必填">
                <RangePicker {...DatePickerProps}/>
            </div>
        )
    }
    else{
        return ( <RangePicker {...DatePickerProps}/> )
    }
}

export default VtxRangePicker;