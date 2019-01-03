### VtxDate文档

#### 1.VtxDate (公用参数[不含VtxTimePicker])

> 说明:
> 一般用于含时分秒 的日期条件中.  
> 在报表和CURD中使用比较频繁  
> 注: 单独选择月或时间或年的时候,可以使用MonthPicker...等组件.

| **参数**     | **说明**                                  | **类型**                                                                                      | **默认值**   |
|--------------|-------------------------------------------|-----------------------------------------------------------------------------------------------|--------------|
| allowClear   | 是否显示清除按钮                          | Boolean                                                                                       | false        |
| disable      | 是否禁用                                  | Boolean                                                                                       | false        |
| style        | 自定义输入框样式                          | Object                                                                                        | {}           |
| size         | 输入框大小                                | string <br/>例: large/ default/ small <br/>默认default,其他特殊要求再改                             | default      |
| open         | 控制弹窗是否展开                          | Boolean                                                                                       | false        |
| onOpenChange | 控制弹窗的回调 <br/>注：VtxYearPicker组件不含该方法                           | Function(status) status:Boolean                                                               | \--          |
| placeholder  | 输入框提示文字                            | string<br/> VtxRangePicker组件使用时类型是Array[String,String]， 默认值是['请选择时间', '请选择时间']                                                      | '请选择时间' |
| required     | 是否开启非空校验                          | Boolean                                                                                       |              |
| disabledDate | 不可选中的日期                            | Function(value)<br/> value是moment时间类型 返回true禁止, 返回false不禁止| \--          |

#### 2.VtxDatePicker(日期选择)

> 说明: 最常用的组件,可以同时选择时间和日期.也可以只选择日期.  
> 注: 单独选择月或时间或年的时候,可以使用MonthPicker...等组件.

| **参数**  | **说明**           | **类型**                                                                                                                   | **默认值** |
|-----------|--------------------|----------------------------------------------------------------------------------------------------------------------------|------------|
| value     | 日期               | String<br/> 'YYYY-MM-DD HH:mm:ss'类型的字符串 例 <br/>1.'2017-05-12 12:36:35'<br/> 2.'2017-05-12 12:36:'<br/> 3.'2017-05-12'<br/> 特例: "" 空字符串 | \--        |
| showTime  | 是否显示选择时分秒 | Boolean/Object<br/> Object:类型参考antd TimePicker的参数(方式一样)                                                              | false      |
| onOk      | 点击确认的回调     | function<br/> 在showTime参数存在时,onOk的按钮才存在                                                                             | \--        |
| onChange  | 时间发生变化的回调 | function(date: moment, dateString)<br/> data: moment类型，dateString: string类型                                                                  | \--        |
| format    | 展示的日期格式     | string <br/>showTime为true时: 默认为"YYYY-MM-DD HH:mm:ss", 其他时候默认为:"YYYY-MM-DD"                                          | \--        |
| showToday | 是否展示“今天”按钮 | Boolean<br/> 注:通过disabledDate对日期做个禁止时,最好不使用该功能.避免逻辑错误                                                  | false      |

#### 3.VtxMonthPicker(月选择)

> 说明: 只适用于需要单独选择月份的条件中  
> 注:该组件的format被固定为'YYYY-MM',不可更改

| **参数** | **说明**           | **类型**                                                                  | **默认值** |
|----------|--------------------|---------------------------------------------------------------------------|------------|
| value    | 日期               | String，'YYYY-MM'类型的字符串<br/> 例 1.'2017-05' 特例: "" 空字符串             | \--        |
| onChange | 时间发生变化的回调 | function(date: moment, dateString)<br/> data: moment类型，dateString: string类型                        | \--        |

#### 4.VtxYearPicker(年选择)

> 说明: 只适用于需要单独选择月份的条件中  
> 注:该组件的format被固定为'YYYY ',不可更改

| **参数** | **说明**           | **类型**                                                                  | **默认值** |
|----------|--------------------|---------------------------------------------------------------------------|------------|
| value    | 日期               | String，'YYYY'类型的字符串 <br/> 例 1.'2017' 特例: "" 空字符串                   | \--        |
| onChange | 时间发生变化的回调 | function(date: moment, dateString)<br/> data: moment类型， dateString: string类型                       | \--        |

#### 5. VtxRangePicker (日期区间选择)

> 说明:用于选择日期区间的时候  
> 注:建议在区间时间含时分秒的时候,使用2个VtxDatePicker来代替.

| **参数** | **说明**           | **类型**                                                                                                                                | **默认值** |
|----------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------|------------|
| value    | 日期               | String[], 'YYYY-MM-DD HH:mm:ss'类型的字符串<br/> 例 1.['2017-05-12 12:36','2017-05-12 12:36'] <br/>2.['2017-05-12','2017-05-12'] <br/>特例: "" 空字符串 | \--        |
| showTime | 是否显示选择时分秒 | Boolean/Object<br/> Object:类型参考antd TimePicker的参数(方式一样)                                                                           | false      |
| onOk     | 点击确认的回调     | function <br/>在showTime参数存在时,onOk的按钮才存在                                                                                          | \--        |
| onChange | 时间发生变化的回调 | function(date: moment, dateString) <br/>data: moment类型, dateString: string类型                                                                                    | \--        |
| format   | 展示的日期格式     | string <br/>showTime为true时: 默认为"YYYY-MM-DD HH:mm:ss", 其他时候默认为:"YYYY-MM-DD"                                                       | \--        |

#### 6. VtxTimePicker (时间选择)

> 说明:
> 一般用于时分秒条件中.  
> 在报表和CURD中使用比较频繁

| **参数**            | **说明**                   | **类型**                                                                   | **默认值**   |
|---------------------|----------------------------|----------------------------------------------------------------------------|--------------|
| value               | 当前时间                   | String ' HH:mm:ss'类型的字符串 <br/> 例 1.'12:36' 2.'18:16:35' 特例: "" 空字符串 | \--          |
| className           | 输入框样式类               | String                                                                     | \--          |
| popupClassName      | 弹出框样式类               | String                                                                     | \--          |
| open                | 控制弹窗是否展开           | Boolean                                                                    | false        |
| format              | 展示的时间格式             | String                                                                     | 'HH:mm:ss'   |
| disabled            | 是否禁用                   | Boolean                                                                    | false        |
| required            | 是否开启非空校验           | Boolean                                                                    |              |
| hideDisabledOptions | 是否隐藏禁用的选项         | Boolean                                                                    | false        |
| placeholder         | 输入框提示文字             | String                                                                     | '请选择时间' |
| onOpenChange        | 显示隐藏弹出框时触发       | Function(status)                                                           | \--          |
| onChange            | 选择时间改变时触发         | Function(time,timeString)<br/> time:moment类型, timeString:String类型                                  | \--          |
| disabledHours       | 禁止选择部分小时选项       | function()                                                                 | \--          |
| disabledMinutes     | 禁止选择部分分钟选项       | function(selectedHour)                                                     | \--          |
| disabledSeconds     | 禁止选择部分秒选项         | function(selectedHour, selectedMinute)                                     | \--          |
| addon               | 选择框底部显示自定义的内容 | function                                                                   | 无           |
