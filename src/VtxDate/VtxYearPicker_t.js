import React from 'react';
import ReactDOM from 'react-dom';
import './VtxYearPicker.css'
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';

const styles = {
    normal: 'vtx-ui-date-normal',
    calendarpicker: 'vtx-ui-date-calendarpicker',
    clearDate: 'vtx-ui-date-cleardate',
    calendarpickerinput: 'vtx-ui-date-calendarpickerinput',
    calendaricon: 'vtx-ui-date-calendaricon',
    error: 'vtx-ui-date-error',
    years: 'vtx-ui-date-years',
    yearsTitle: 'vtx-ui-date-yearstitle',
    arrows: 'vtx-ui-date-arrows',
    lists: 'vtx-ui-date-lists',
    list: 'vtx-ui-date-list',
    selectlist: 'vtx-ui-date-selectlist',
    selectlist_disabled: 'vtx-ui-date-selectlist_disabled',
    noselect: 'vtx-ui-date-noselect',
    hidden: 'vtx-ui-date-hidden',
    show: 'vtx-ui-date-show'
}

class VtxYearPicker_t extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            time: props.time,
            selectedtime: props.time,
            cli: document.onclick,
            cn: props.style,
            top: props.top,
            left: props.left,
            bottom: props.bottom,
            signtype: props.signtype
        }       
    }
    clickItem(item,index,e) {
        let t = this;
        if(index == 0 || index == 11){
            e.nativeEvent.stopImmediatePropagation();
            t.setState({
                time: item
            });
        }else{
            t.chooseYear(item);
        }
    }
    attachEvent() {
        let t = this;
        document.onclick = (event)=>{
            t.setState({
                cn: styles.hidden
            },()=>{
                setTimeout(()=>{
                    t.setState({
                        time: '',
                    })
                },190)
            })
            document.onclick = t.state.cli;
        }
    }
    chooseYear(date) {
        let props = this.props;
        let d = date.toString()
        if('onChange' in props){
            props.onChange(moment(d),d);
        }
    }
    changeTime(item,e){
        e.nativeEvent.stopImmediatePropagation();
        this.setState({
            time: item,
        })
    }
    isDisabled(time){
        let t = this;
        if('disabledDate' in t.props && typeof(t.props.disabledDate) === 'function'){
            return t.props.disabledDate(moment(time,'YYYY'));
        }
        return false;
    }
    render(){
        let t = this;
        let props = t.props;
        let calendarAry=[],time,startTime,endTime;
        if(t.state.time == ''){
            calendarAry = []
        }else{
            time = parseInt(t.state.time,10);
            startTime = time-(time%10+1);
            endTime = time+(10-time%10);
            for(let i = startTime; i <= endTime ; i++){
                calendarAry.push(i);
            }
        }
        let sty = {
            position: 'absolute',
            left:t.state.left,
        }
        if(t.state.signtype == 't'){
            sty.top = t.state.top;
        }else{
            sty.bottom = -t.state.bottom;
        }
        return(
            <div className={t.state.cn} style={sty}>
                {
                    !t.state.time?
                    '':
                    <div className={styles.years}>
                        <div className={styles.yearsTitle}>
                            <Icon onClick={(e)=>{t.changeTime(calendarAry[0],e)}} type="double-left" className={styles.arrows} style={{left:'7px'}}/>
                            {calendarAry[1]}-{calendarAry[10]}
                            <Icon onClick={(e)=>{t.changeTime(calendarAry[11],e)}} type="double-right" className={styles.arrows} style={{right:'7px'}}/>
                        </div>
                        <div className={styles.lists}>
                            {
                                calendarAry.map((item,index)=>{
                                    let disabled = t.isDisabled(item);
                                    return(
                                        <div 
                                            key={index} 
                                            onClick={(e)=>{if(!disabled){t.clickItem(item,index,e)}else{e.nativeEvent.stopImmediatePropagation();}}}
                                            className={`${styles.list} ${styles.noselect}`}
                                            unselectable={"on"}
                                        >
                                            <span 
                                                className={
                                                    `${(item==t.state.selectedtime && index !== 0 && index !==11?styles.selectlist:'')} ${disabled?styles.selectlist_disabled:''}`
                                                }
                                            >
                                                {item}
                                            </span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                }
            </div>
        );
    }
    componentDidMount() {//插入真实DOM结束
        let t = this;
        if(!('open' in t.props)){
            t.attachEvent();
        }
    }
    componentWillReceiveProps(nextProps) {//已加载组件，收到新的参数时调用
        let t = this;
        if(!('open' in nextProps)){
            if(t.props.sign != nextProps.sign){
                t.attachEvent();
            }
        }
        let newParam = {
            selectedtime: nextProps.time,
            cn: nextProps.style,
            top: nextProps.top,
            left: nextProps.left,
            bottom: nextProps.bottom,
            signtype: nextProps.signtype
        }
        if('open' in nextProps){
            if(!nextProps.open){
                t.setState({
                    ...newParam
                },()=>{
                    setTimeout(()=>{
                        t.setState({
                            time: '',
                        })
                    },190)
                })
            }else{
                t.setState({
                    time: nextProps.time,
                    ...newParam
                })
            }
        }else{
            t.setState({
                time: nextProps.time,
                ...newParam
            })
        }
    }
}
//large 高度为 32px，small 为 22px，default是 28px
export default VtxYearPicker_t;
