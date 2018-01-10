import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
/*
    时间util类
 */
export const VtxTime = {
    /*
        获取时间
        time: 指定时间,  可以是任何类型的时间 
            默认:当前时间
        format: YYYY/MM/DD/HH/mm/ss
            类型: String
            默认: YYYY-MM-DD
        return: 返回匹配的时间字符串
     */
    getFormatTime:({time = new Date(),format = 'YYYY-MM-DD'}={})=>{
        return moment(time).format(format);
    },
    /*
        时间加减
        time: 指定时间,  可以是任何类型的时间
            默认:当前时间
        format: YYYY/MM/DD/HH/mm/ss
            默认: YYYY-MM-DD
            类型: String
        type: 加/减   
            默认: add
            类型: String
            参数: add/subtract
        num: 正整数
            默认: 0
            类型: Number
        dateType: 加减的类型,如y代表加减几年, 参数: y/M/w/d/h/m/s/ms  默认d (String)
        return: 返回匹配的时间字符串
     */
    operationTime: ({time = new Date(),format = 'YYYY-MM-DD',type = 'add',num = 0,dateType= 'd'} = {})=>{
        num = VtxNum.replaceInt(num);
        return moment(time,format)[type](num,dateType).format(format);
    },
    /*
        获取毫秒时间
        time: 需要转换的时间
            默认: 0
        return: 返回对应类型的时间
     */
    getMsTime: (time) => {
        if(time){
            return new Date(time).getTime();
        }else{
            return new Date().getTime();
        }
    }
}
/*
    正则匹配
 */
export const VtxRegex = {
    /*
        验证是几位浮点数 数字
        num 需要验证的数字
        n 是数字几位 例如2
     */
    checkFloatNumber(num,n){
        let regex = new RegExp(`^-?(0|[1-9][0-9]*)(\.([0-9]?){${n}})?$`);
        return regex.test(num);
    },
    /*
        验证是否是数字
     */
    checkNumber(num){
        let regex = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        return regex.test(num);
    },
    /*
        验证是否是正数
     */
    checkPositiveNumber(num){
        let regex = /^(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        return regex.test(num);
    },
    /*
        验证是否是正整数
     */
    checkPositiveInteger(num){
        let regex = /^(0|[1-9][0-9]*)$/;
        return regex.test(num);
    },
    /*
        验证是否是正几位小数
     */
    checkIntegerFloatNumber(num,n){
        let regex = new RegExp(`^(0|[1-9][0-9]*)(\.([0-9]?){${n}})?$`);
        return regex.test(num);
    },
    /*
        验证是否是负数
     */
    checkNegativeNumber(num){
        let regex = /^-(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        return regex.test(num);
    },
    /*
        验证是否是负整数
     */
    checkNegativeInteger(num){
        let regex = /^-(0|[1-9][0-9]*)$/;
        return regex.test(num);
    },
    /*
        验证是否是负几位小数
     */
    checkNegativeIntegerFloatNumber(num,n){
        let regex = new RegExp(`^-(0|[1-9][0-9]*)(\.([0-9]?){${n}})?$`);
        return regex.test(num);
    },
    /*
        验证手机号码
        phone 需要验证的手机号码
     */
    checkCellphone(phone){
        let regex = /^1\d{10}$/;
        return regex.test(phone);
    },
    /*
        验证号码
        tel 需要验证的号码
     */
    checkTelphone(tel){
        let regex = /(^(\d{3,4}-)?\d*)$/;
        return regex.test(tel);
    },
    /*
        验证数组
        phone 需要验证的手机号码
     */
    checkArray(ary){
        return ary instanceof Array;
    }
}
export const VtxNum = {
    /*
        字符串转成 float类型的字符串
        str: 需要处理的字符串 (String)
        return: 返回一个float类型的字符串
     */
    replaceFloat: (str)=>{
        let b = str.toString().split('.');
        if(!b[1]){
            if(str.indexOf('.') > -1){
                return (b[0].replace(/[^0-9]/g,'') || 0) +'.';
            }else{
                return b[0].replace(/[^0-9]/g,'') || 0;
            }
        }else{
            if(!parseInt(b[1].replace(/[^0-9]/g,''))){
                if(parseInt(b[1].replace(/[^0-9]/g,'')) == 0){
                    return (b[0].replace(/[^0-9]/g,'') || 0) +'.' + b[1].replace(/[^0-9]/g,'');
                }else{
                    return b[0].replace(/[^0-9]/g,'') || 0;
                }
            }else{
                if(b[0].length > 1){
                    return (b[0].replace(/[^0-9]/g,'').replace(/^0*/g,'') || 0) + '.' +b[1].replace(/[^0-9]/g,'');
                }else{
                    return (b[0].replace(/[^0-9]/g,'') || 0) + '.' +b[1].replace(/[^0-9]/g,'');
                }
            }
        }
    },
    /*
        字符串转成 Int类型的字符串
        str: 需要处理的字符串  支持number类型
        return: 返回一个Int类型的字符串
     */
    replaceInt: (str)=>{
        return str.toString().split('.')[0].replace(/[^0-9]/g,'').replace(/^0*/g,'') || '0';
    },
    /*
        取小数后几位
        num: 需要处理的 数字  支持String类型
        count: 需要保留的位数 Number
        return: 返回对应的float类型字符串
     */
    decimals: (num,count)=>{
        let nary = VtxNum.replaceFloat(num).toString().split('.'),n='';
        count = parseInt(count);
        if(count > 0){
            if(!!nary[1]){
                n = nary[0] +'.'+ nary[1].substr(0,count);
                for (let i = 0; i < (count - nary[1].length); i++) {
                    n = n + '0';
                }
            }else{
                n = nary[0];
                for (let j = 0; j < count; j++) {
                    if(j == 0)n = n + '.0';
                    else n = n + '0';
                }
            }
        }else{
            n = nary[0];
        }
        return n;
    }
}
/*
    其他公共方法
 */
export const VtxUtil = {
    /*
        获取url中 参数的值
        key: 参数前面的key
        return: 对应key的value
     */
    getUrlParam(key) {
        let paramObj = {};
        let matchList = window.location.hash.match(/([^\?&]+)=([^&]+)/g) || [];
        for (let i = 0, len = matchList.length; i < len; i++) {
            let r = matchList[i].match(/([^\?&]+)=([^&]+)/);
            paramObj[r[1]] = r[2];
        }
        if (key) {
            return paramObj[key];
        } else {
            return paramObj;
        }
    },
    /*
        获取hash字符串
     */
    getHash(){
        let h = location.hash,
            xI = h.indexOf('/'),
            wI = h.indexOf('?');
        return h.substring(xI+1,wI);
    },
    /*
        延迟时间
        time是延迟的时间  单位ms
     */
    delay: (time)=>{
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                resolve();
            },time)
        })
    },
    /*
     设置抬头
     title 设置的title名
     */
    setTitle: (title)=>{
        document.title = title;
    },
    /*
        处理提交参数的前后空格
     */
    submitTrim(obj){
        if(typeof(obj)=='object'){
            let postData = {};
            for(let k in obj){
                postData[k] = typeof(obj[k])=="string" ? obj[k].trim() : obj[k];
            }
            return postData;
        }else{
            return obj;
        }
    },
    /*
        数组去除重复
        只限 数组中值是字符串或number的
     */
    ArraywipeOffRepetition(ary = []){
        let na = [];
        for(let i = 0 ; i < ary.length ; i++){
            if(na.indexOf(ary[i]) > -1){
                continue;
            }else{
                na.push(ary[i])
            }
        }
        return na;
    }
}