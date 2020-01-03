import React from 'react';
import './index.less';
const styles = {
    ['vtx-ui-uedit']: 'vtx-ui-uedit'
}
import _deepEqual from 'lodash/isEqual';
import configUrl from '../default';

export default class VtxUeditor extends React.Component{
    constructor(props){
        super(props);
        this.id = props.id || `vtx-ui-uedit${new Date().getTime() + Math.random()}`
        this.state = {};
        this.ue = null;
        this.loadMapJs();
    }
    loadMapJs(){
        const t = this;
        window.UEDITOR_HOME_URL = configUrl.ueditorServer;
        this.loadUEComplete = new Promise((resolve,reject)=>{
            if(window.UE){
                resolve(window.UE);
            }
            else{
                let Config = new Promise((resolve,reject)=>{
                    $.getScript(`${configUrl.ueditorServer}ueditor.config.js`,()=>{
                        /* 
                            maximumWords 总字符数 10000
                            zIndex: 900
                        */
                        window.UEDITOR_CONFIG = {
                            ...window.UEDITOR_CONFIG,
                            maxUndoCount: 50,
                            maxInputCount: 20,
                            serverUrl: `/${t.props.serverUrlprefix || 'editorURL'}/jsp/controller.jsp`,
                            ...t.props.config
                        }
                        resolve();
                    });
                });
                let Ueditor = new Promise((resolve,reject)=>{
                    $.getScript(`${configUrl.ueditorServer}ueditor.all.js`,()=>{
                        // resolve();
                        $.getScript(`${configUrl.ueditorServer}ueditor.parse.js`,()=>{
                            resolve();
                        });
                    });
                });
                Promise.all([Ueditor,Config]).then(()=>{
                    resolve(window.UE);
                });
            }
        });
    }
    componentDidMount(){
        const t = this;
        t.loadUEComplete.then(()=>{
            t.init();
        })  
    }
    shouldComponentUpdate(nextProps){
        if(_deepEqual(t.props,nextProps)){
            return false;
        }
        return true;
    }
    componentWillReceiveProps(nextProps){
        this.setParam(nextProps);
    }
    // 初始化
    init(){
        this.ue = window.UE.getEditor(this.id);
        this.setParam(this.props);
    }
    // 设置参数
    setParam(option){
        const t = this;
        if(this.ue){
            this.ue.ready(function() {
                // 初始化数据
                t.ue.setContent(option.value || '');
                if(option.disabled){
                    t.ue.setDisabled();
                }else{
                    t.ue.setEnabled();
                }
            })
        }
    }
    // 获取html文本
    getContent(){
        return this.ue.getContent();
    }
    render(){
        const t = this;
        return (
            <div className={styles['vtx-ui-uedit']} id={this.id}></div>
        )
    }
}