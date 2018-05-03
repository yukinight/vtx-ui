import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './date.less';
import moment from 'moment';
import {Button} from 'antd';
import {VtxDate} from 'vtx-ui';
const {VtxDatePicker,VtxMonthPicker,VtxYearPicker,VtxRangePicker,VtxTimePicker} = VtxDate;

function IndexPage({datepicker,dispatch}) {
    const {date1,date2,date3,dateM,dateY,openY,date6,date7,date8,dateT1,dateT2,dateT3,openT} = datepicker;
    function change1(date,dateString) {
        dispatch({type: 'datepicker/updateState',payload:{date1:dateString}})
    }
    function change2(date,dateString) {
        dispatch({type: 'datepicker/updateState',payload:{date2:dateString}})
    }
    function change3(date,dateString) {
        dispatch({type: 'datepicker/updateState',payload:{date3:dateString}})
    }
    function changeM(date,dateString) {
        dispatch({type: 'datepicker/updateState',payload:{dateM:dateString}})
    }
    function changeY(date,dateString) {
        dispatch({type: 'datepicker/updateState',payload:{dateY:dateString}})
    }
    function disabledDate4(current) {
        return current && current.valueOf() > moment(new Date()).valueOf();
    }
    function disabledDate5(current) {
        return current && current.valueOf() > new Date().getTime();
    }
    function change6(date,dateString) {
        dispatch({type: 'datepicker/updateState',payload:{date6:dateString}})
    }
    function change7(date,dateString) {
        dispatch({type: 'datepicker/updateState',payload:{date7:dateString}})
    }
    function change8(date,dateString) {
        dispatch({type: 'datepicker/updateState',payload:{date8:dateString}})
    }
    function changeT1(time,timeString) {
        dispatch({type: 'datepicker/updateState',payload:{dateT1:timeString}})
    }
    function changeT2(time,timeString) {
        dispatch({type: 'datepicker/updateState',payload:{dateT2:timeString}})
    }
    function changeT3(time,timeString) {
        dispatch({type: 'datepicker/updateState',payload:{dateT3:timeString}})
    }
    function range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }
    function disabledHours() {
        return range(3,23);
    }
    function disabledMinutes(h) {
        if(h == 18){
            return range(20,45);
        }
        if(h == 20){
            return range(15,20);
        }
    }
    function disabledSeconds(h,m) {
        if(h == 18){
            if(m == 40){
                return range(20,45);
            }
        }
    }
    function addon() {
        return(
          <Button size="small" type="primary" onClick={closeTime}>
            Ok
          </Button>
        );
    }
    function closeTime() {
        dispatch({type: 'datepicker/updateState',payload:{openT:false}});
    }
    function onOpenChange(status) {
        dispatch({type: 'datepicker/updateState',payload:{openT:status}});
    }
    return (
        <div className={styles.normal}>
            <div style={{'textAlign':'center','color':'#108EE9','fontSize':'36px'}}>VtxDate  Demo</div>
            <div style={{'textAlign':'center','color':'#108EE9','fontSize':'20px'}}>SVN地址：{'https://222.92.212.126:8443/svn/vtx-dt-product/trunk/web/components/VtxDate'}</div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>一.不含时分秒日期'(value,onChange)'</div>
                <div>
                    1.value日期显示的值(默认:"2017-05-24")<br/>
                    2.onChange日期改变时的回调
                    3.disabled禁止操作
                </div>
                <VtxDatePicker 
                    value={date1} 
                    onChange={change1}
                    allowClear={true}
                    disabled={true}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>二.含时分秒日期/Bealoon类型'(value,onChange,showTime)'</div>
                <div>
                    1.value日期显示的值(默认:"")<br/>
                    2.onChange日期改变时的回调<br/>
                    3.showTime(Bealoon类型)
                </div>
                <VtxDatePicker 
                    value={date2} 
                    onChange={change2}
                    showTime={true}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>三.含时分秒日期/object类型'(value,onChange,showTime,format)'</div>
                <div>
                    1.value日期显示的值<br/>
                    2.onChange日期改变时的回调<br/>
                    3.showTime(object类型)如:{'{'}format:mm:ss{'}'}<br/>
                    4.format 规定了最后显示的类型(这里是'YYYY-MM-DD mm:ss')
                </div>
                <VtxDatePicker 
                    value={date3} 
                    onChange={change3}
                    format={'YYYY-MM-DD mm:ss'}
                    showTime={{format:'mm:ss'}}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>四.不含日的月份'(value,onChange)'</div>
                <div>
                    1.value日期显示的值<br/>
                    2.onChange日期改变时的回调<br/>
                    3.disabledDate通过该方法控制禁选时间
                </div>
                <VtxMonthPicker 
                    value={dateM} 
                    onChange={changeM} 
                    disabledDate={disabledDate4}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>五.不含日月的年份'(value,onChange)'</div>
                <div>
                    1.value日期显示的值<br/>
                    2.onChange日期改变时的回调<br/>
                </div>
                <VtxYearPicker 
                    value={dateY} 
                    onChange={changeY}
                    // disabled={true}
                    disabledDate={disabledDate5}
                    // open={openY}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>六.不含时分秒日期区间'(value,onChange)'</div>
                <div>
                    1.value日期显示的值(默认:"")<br/>
                    2.onChange日期改变时的回调
                    3.disabled禁止操作
                </div>
                <VtxRangePicker 
                    value={date6} 
                    onChange={change6}
                    allowClear={true}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>七.含时分秒日期区间/Bealoon类型'(value,onChange,showTime)'</div>
                <div>
                    1.value日期显示的值(默认:["",""])<br/>
                    2.onChange日期改变时的回调<br/>
                    3.showTime(Bealoon类型)
                </div>
                <VtxRangePicker 
                    value={date7} 
                    onChange={change7}
                    showTime={true}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>八.含时分秒日期区间/object类型'(value,onChange,showTime,format)'</div>
                <div>
                    1.value日期显示的值<br/>
                    2.onChange日期改变时的回调<br/>
                    3.showTime(object类型)如:{'{'}format:mm:ss{'}'}<br/>
                    4.format 规定了最后显示的类型(这里是'YYYY-MM-DD mm:ss')
                </div>
                <VtxRangePicker 
                    value={date8} 
                    onChange={change8}
                    format={'YYYY-MM-DD mm:ss'}
                    showTime={{format:'mm:ss'}}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>九.时间/format'(value,onChange,format)'</div>
                <div>
                    1.value时间显示的值<br/>
                    2.onChange时间改变时的回调<br/>
                    4.format 规定了最后显示的类型(这里是'mm:ss')
                </div>
                <VtxTimePicker 
                    value={dateT1} 
                    onChange={changeT1}
                    format={'mm:ss'}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>九.时间/format'(value,onChange,format)'</div>
                <div>
                    1.value时间显示的值<br/>
                    2.onChange时间改变时的回调<br/>
                    4.format 规定了最后显示的类型(这里是'mm:ss')
                </div>
                <VtxTimePicker 
                    value={dateT1} 
                    onChange={changeT1}
                    format={'mm:ss'}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>十.时间禁选/并隐藏'(value,onChange,disabledHours,disabledMinutes,disabledSeconds,hideDisabledOptions)'</div>
                <div>
                    1.value 时间显示的值<br/>
                    2.onChange 时间改变时的回调<br/>
                    3.disabledHours 过滤小时的方法(返回需要过滤的时间集合如[1,2,3])<br/>
                    4.disabledMinutes 过滤分钟的方法<br/>
                    5.disabledSeconds 过滤秒的方法<br/>
                    6.hideDisabledOptions 隐藏被过滤的时间
                </div>
                <VtxTimePicker 
                    value={dateT2} 
                    onChange={changeT2}
                    hideDisabledOptions={true}
                    disabledHours={disabledHours}
                    disabledMinutes={disabledMinutes}
                    disabledSeconds={disabledSeconds}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>十一.手动控制弹窗'(addon,open,onOpenChange)</div>
                <div>
                    1.value 时间显示的值<br/>
                    2.onChange 时间改变时的回调<br/>
                </div>
                <VtxTimePicker 
                    value={dateT3} 
                    onChange={changeT3}
                    onOpenChange={onOpenChange}
                    addon={addon}
                    open={openT}
                    required={true}
                />
            </div>
        </div>
    );
}

IndexPage.propTypes = {
};

export default connect(
    ({datepicker})=>({datepicker})
)(IndexPage);
