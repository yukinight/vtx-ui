### VtxRpsFrame参考文档
>1.报表组件：封装了前端报表的iframe元素和相关调用方法 
>2.使用组件时需要提供确定大小的父容器（组件大小自动撑满父容器）  
>3.依赖jquery

---

|**参数**| **说明**| **类**|**默认值**| **必填**|
|------------------------------- |-------------------------------|-------------------------------|--------------------------------|-------------------------------
|report_code      |报表的code           | String ||是
|report_param     |以往的report_param参数，但是不再需要调接口（getByParamTypeCode）<br>来传递cityName等公共参数，只需要传递标题等定制参数|Object||是
|data_param       |同以往的data_param一样                                              |Object||是|
|tenantId         |租户Id用来调用获取公共参数的接口                                      |String||是|
|flag             |用来控制报表的刷新，只有当flag改变时才会更新报表                    |Num或者String||是|
|paramTypeCode    |获取公共参数接口所传的paramTypeCode参数，一般不需要传   |String|"param_report_constant"|否|

---
##### Nginx代理配置
该组件一共用到三个接口：

```
/cloud/management/rest/np/param/getByParamTypeCode
/cloud/rps/api/np/v101/report/getReportInfoByCode.smvc
/ReportServer
```
如果存在系统中未配置的情况，需要配置

```
# management公共服务
location  /cloud/management/ {
    proxy_pass   http://***;
    proxy_redirect off;
    proxy_set_header Host $host:$server_port;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

#rps服务
 location  /cloud/rps/ {
    proxy_pass   http://***;
    proxy_redirect off;
    proxy_set_header Host $host:$server_port;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
location /ReportServer{
    proxy_pass   http://***;
    proxy_redirect off;
    proxy_set_header Host $host:$server_port;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

