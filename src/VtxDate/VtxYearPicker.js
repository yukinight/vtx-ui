import React from 'react';
import ReactDOM from 'react-dom';
import './VtxYearPicker.less';
import VtxYearPicker_t from './VtxYearPicker_t';
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

class VtxYearPicker extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            sizeStyle: {
                small: {padding: '1px 7px',height:'22px'},
                default: {padding: '4px 7px',height:'28px'},
                large: {padding: '6px 7px',height:'32px'}
            },
            nowTime: props.value?moment(props.value,'YYYY').format('YYYY'):moment().format('YYYY'),
            dom: null,
            sign: 0,
            open: props.open
        }       
    }
    getLocation(e){
        let t = this;
        let bodyTop = 0,bodyLeft = 0,allHeight=0,inputHeight=0,bottom=0,signtype='t';
        //获取滚动距离
        if(document.documentElement&&document.documentElement.scrollTop){
            bodyTop=document.documentElement.scrollTop;
            bodyLeft=document.documentElement.scrollLeft;
        }else if(document.body){
            bodyTop=document.body.scrollTop;
            bodyLeft=document.body.scrollLeft;
        }
        //可视区域高度
        if(document.documentElement){
            allHeight=document.documentElement.clientHeight;
        }
        //计算top和left值
        let left = e.getBoundingClientRect().left + bodyLeft -2;
        let top = e.getBoundingClientRect().top + bodyTop;
        //判断在上还是在下
        if(allHeight - top + bodyTop< 270){
            switch(t.props.size){
                case 'small':
                    inputHeight= 22;
                break;
                case 'default':
                    inputHeight= 28;
                break;
                case 'large':
                    inputHeight= 32;
                break;
                default:
                    inputHeight= 28;
                break;
            }
            signtype='b';
            top = top - 250 + inputHeight;
            bottom = top + 254;
        }
        top = top - 4;
        return {top,left,bottom,signtype};
    }
    renderDOM(time,e) {
        let t = this;
        if(!t.props.disabled){
            e.nativeEvent.stopImmediatePropagation();
            //input失去焦点
            e.target.parentNode.childNodes[0].blur();
            let tm = time || t.state.nowTime;
            //如不存dom的时候就添加一个,如果已经存在就跳过
            if(!t.state.dom){
                let d = document.createElement('div');
                d.style.position = 'absolute';
                d.style.top = '0px';
                d.style.left = '0px';
                d.style.width = '100%';
                t.state.dom = document.body.appendChild(d);
            }
            const {top,left,bottom,signtype} = t.getLocation(e.target.parentNode.childNodes[0]);
            if(moment.isMoment(tm)){
                tm = moment(tm).format('YYYY');
            }
            let param = {
                style: styles.show,
                time: tm
            };
            if('open' in t.props){
                param.open = t.props.open;
                if(t.props.open){
                    param.style = styles.show;
                    param.time = tm;
                }else{
                    param.style = styles.hidden;
                }
            }
            ReactDOM.render(
                <VtxYearPicker_t 
                    sign={t.state.sign++} 
                    top={top} left={left} bottom={bottom} signtype={signtype}
                    onChange={t.props.onChange}
                    disabledDate={t.props.disabledDate}
                    {...param}
                />
                ,
                t.state.dom
            );
        }
    }
    clearTime(e){
        e.nativeEvent.stopImmediatePropagation();
        let t = this;
        if('onChange' in t.props){
            t.props.onChange('','');
        }
    }
    render(){
        let t = this;
        let props = t.props;
        return(
            <div data-errorMsg='必填'
            className={props.required && !props.value ? `${styles.normal} ${styles.error}` : styles.normal}
            style={{...props.style,width:props.inherit?'inherit':''}}>
                <div className={styles.calendarpicker} style={props.style}>
                    <input 
                        ref={'input'}
                        readOnly
                        type="text"
                        disabled={props.disabled}
                        placeholder={props.placeholder || '请选择时间'} 
                        className={styles.calendarpickerinput}
                        style={t.state.sizeStyle[props.size || 'default']} 
                        value={props.value?moment(props.value,'YYYY').format('YYYY'):''}
                        onClick={(e)=>t.renderDOM('',e)}
                    />
                    <Icon type="calendar" className={styles.calendaricon} onClick={(e)=>t.renderDOM('',e)}/>
                    {
                        props.allowClear?
                        <Icon type="close-circle" className={styles.clearDate} onClick={(e)=>{t.clearTime(e)}}/>
                        :''
                    }
                </div>
            </div>
        );
    }
    componentDidMount() {//插入真实DOM结束
        let t = this;
        if('open' in t.props && t.props.open){
            t.refs.input.click();
        }
    }
    componentWillReceiveProps(nextProps) {//已加载组件，收到新的参数时调用
        let t = this;
        t.setState({
            nowTime: nextProps.value || moment().format('YYYY'),
        })
    }
    componentDidUpdate(prevProps, prevState) {//重新渲染结束
        let t = this;
        if('open' in t.props){
            t.refs.input.click();
        }
    }
}
//large 高度为 32px，small 为 22px，default是 28px
export default VtxYearPicker;
