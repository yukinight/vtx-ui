import React from 'react';

import Select from 'antd/lib/select';
import 'antd/lib/select/style/css';

import './stateSelect.less';
const styles = {
    error: 'vtx-ui-select-error',
    normal: 'vtx-ui-select-normal'
}
class StateSelect extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        const {errorMsg=' ', validated=true} = this.props;
        const selectProps = {
            style:{width:300},
            ...this.props,
        };
        delete selectProps.errorMsg;
        delete selectProps.validated;
        delete selectProps.inherit;
        return (
            <div 
                style={{width:this.props.inherit?'inherit':''}}
                className={validated? styles.normal: styles.error} data-errormsg={errorMsg}>
                <Select {...selectProps}/>
            </div>
        )
    }
}

export const Option = Select.Option;
export const OptGroup =  Select.OptGroup;
export default StateSelect;