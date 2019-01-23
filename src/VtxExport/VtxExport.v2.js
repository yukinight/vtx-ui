import React from 'react';
import VtxExport from './VtxExport';

function VtxExport2(props){
    const newProps = {
        ...props,
        mode:'simple'
    }
    return <VtxExport {...newProps}/>
}

export default VtxExport2;