import React from 'react';
import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';
import Menu from 'antd/lib/menu';
import 'antd/lib/menu/style/css';
import Dropdown from 'antd/lib/dropdown';
import 'antd/lib/dropdown/style/css';

class VtxExport extends React.Component{
    constructor(props){
        super(props);
        this.exportButtonClick = this.exportButtonClick.bind(this);
        this.iframeName = `export_iframe_${Math.random()}`;
        this.isExporting = false;
    }
    exportButtonClick(param){
        let pass_val = typeof(this.props.getExportParams)=='function'? this.props.getExportParams(param.key):null;
        if(!this.props.downloadURL){
            console.error('未配置下载地址');
            return;
        }
        if(!pass_val){
            console.error('未配置导出参数');
            return;
        }
        this.downLoadFile(this.props.downloadURL,this.props.mode=='simple'?pass_val:{parameters:JSON.stringify(pass_val)});
    }
    downLoadFile(reqURL,postData){
        var formDom = document.createElement('form');
        formDom.style.display='none';
        formDom.setAttribute('target',this.iframeName);
        formDom.setAttribute('method','post');
        formDom.setAttribute('action',reqURL);

        document.body.appendChild(formDom);

        for(let propoty in postData){
            var input = document.createElement('input');
            var p_value = typeof postData[propoty] == 'object'? JSON.stringify(postData[propoty]):postData[propoty];
            input.setAttribute('type','hidden');
            input.setAttribute('name',propoty);
            input.setAttribute('value',p_value);
            formDom.appendChild(input);
        }

        this.isExporting = true;
        formDom.submit();
        formDom.parentNode.removeChild(formDom);
    }
    render(){
        const exportMenu = <Menu onClick={this.exportButtonClick}>
            {this.props.rowButton===false?null:<Menu.Item key="rows">导出选中行</Menu.Item>}
            {this.props.pageButton===false?null:<Menu.Item key="page" >导出当前页</Menu.Item>}
            {this.props.allButton===false?null:<Menu.Item key="all">导出全部</Menu.Item>}
        </Menu>
        return (
            <span>
                <Dropdown overlay={exportMenu} trigger={["click"]}>
                    <Button icon="export">
                        导出 <Icon type="down" />
                    </Button>
                </Dropdown>  
                <iframe name={this.iframeName} style={{display:'none'}}
                onLoad={()=>{
                    if(typeof this.props.afterExport == 'function' && this.isExporting){
                        this.props.afterExport();
                    }
                    this.isExporting = false;
                }}></iframe>
            </span>
        )
    }
}

export default VtxExport;