import React from 'react';

import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';
import Input from 'antd/lib/input';
import 'antd/lib/input/style/css';

import './stateInput.less';
const styles = {
    error: 'vtx-ui-input-error',
    normal: 'vtx-ui-input-normal'
}
class stateInput extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        const {errorMsg=' ', validated=true, loading=false} = this.props;

        let inputProps = {
            style:{width:300},
            ...this.props
        };

        delete inputProps.errorMsg;
        delete inputProps.validated;
        delete inputProps.loading;
        delete inputProps.inherit;

        let actErrorMsg, actValidated;
        if(errorMsg instanceof(Array) && validated instanceof(Array)){
            let firstUnmatched = validated.indexOf(false);
            if(firstUnmatched==-1){
                actValidated = true;
                actErrorMsg = errorMsg[0];
            }
            else{
                actValidated = false;
                actErrorMsg = errorMsg[firstUnmatched] || '';
            }
        }
        else{
            actErrorMsg = errorMsg;
            actValidated = validated;
        }

        inputProps.suffix = loading? <Icon type="loading" /> : (actValidated ? null : <Icon type="close-circle" style={{color:'red'}}/>);
    
        return (
            <div 
                style={{width:this.props.inherit?'inherit':''}}
                className={actValidated? styles.normal: styles.error} data-errorMsg={actErrorMsg}>
                <Input {...inputProps}/>
            </div>
        )
    }
}

export default stateInput;