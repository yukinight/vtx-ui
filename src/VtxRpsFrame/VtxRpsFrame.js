import React from 'react';
import './VtxRpsFrame.css';

const styles = {
    iframeParent: 'vtx-ui-frame-ct',
}

class VtxRpsFrame extends React.Component{
    constructor(){
        super();
        this.iframeName = Math.random()+new Date().getTime();
    }
    shouldComponentUpdate(nextProps){
        if(this.props.flag!==nextProps.flag){
            return true;
        }else{
            return false;
        }
    }
    componentDidUpdate(){
        this.getReportInfoByCode()
    }
    componentDidMount(){
        this.getReportInfoByCode()
    }
    getReportInfoByCode(){
        const t = this;
        const { report_code, report_param, data_param, paramTypeCode, tenantId } = this.props;
        let param = {
            report_code,
            timestamp: new Date().valueOf(),
            reqMethod: 0
        }
        let paramCode = paramTypeCode ||"param_report_constant"
        //获取公共参数
        let commonParamPromise = new Promise((resolve,reject)=>{
            $.ajax({
                type:'get',
                url: `/cloud/management/rest/np/param/getByParamTypeCode?parameters={"paramTypeCode": "${paramCode}","tenantId":"${tenantId}"}`,
                // data: postData,
                dataType: 'json',
                'content-type': "application/x-www-form-urlencoded",
                cache: false,
                success: function (data) {
                    resolve(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    reject(textStatus);
                }
            });
        })
        //获取报表code
        let getReportInfoByCodePromise = new Promise((resolve,reject)=>{
            $.ajax({
                type: 'get',
                url: `/cloud/rps/api/np/v101/report/getReportInfoByCode.smvc`,
                data: { parameters: JSON.stringify(param) },
                dataType: 'json',
                async: true,
                success: function (data) {
                    resolve(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    reject(textStatus);
                }
            });
        })
        Promise.all([commonParamPromise, getReportInfoByCodePromise]).then(data=>{
            const commonParamResult = data[0]
            const reportInfoByCodeResult = data[1]
            if(!commonParamResult.result&&!reportInfoByCodeResult.result){
                //报表公共参数
                let commonParamData = commonParamResult.data;
                let obj = {};
                commonParamData.forEach(d => {
                    obj[d.parmCode] = d.parmName;
                });

                
                const reportInfoByCodeData = reportInfoByCodeResult.data;
                let param = {
                    data_url: reportInfoByCodeData.data_url,
                    data_param: JSON.stringify(data_param),
                    ...report_param,
                    ...obj,
                    reqMethod: 0
                }
                createForm(`/ReportServer?report_code=${report_code}&reportlet=${reportInfoByCodeData.reportlet}&fr_locale=zh_CN&timestamp=${new Date().valueOf()}`, param, `${t.iframeName}`);

            }
            
        }).catch(err=>console.log(err))
    }
    render(){
        return(
                <div className={styles.iframeParent}>
                    <iframe className={'wrapper'} width="100%" height="100%" name={`${this.iframeName}`}></iframe>
                </div>
        )
    }
}
export default VtxRpsFrame;

const createForm = function(reqURL, param, iframeName) {       
    var formDom = $("<form>");//定义一个form表单  
    formDom.attr("style", "display:none");
    formDom.attr("target", iframeName);
    formDom.attr("method", "post");
    formDom.attr("action", reqURL);
    var inputArray = [];
    for (var k in param) {
        var input1 = $("<input>");
        input1.attr("type", "hidden");
        input1.attr("name", k);
        input1.attr("value", param[k]);
        inputArray.push(input1);
    }
    $("body").append(formDom);//将表单放置在web中  
    for (var i = 0, len = inputArray.length; i < len; i++) {
        formDom.append(inputArray[i]);
    }
    formDom.submit();//表单提交 
    formDom.remove();
}