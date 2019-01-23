import React from 'react';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';
import _debounce from 'lodash/debounce';
import './VtxZtree.css';
import Input from 'antd/lib/input';
import 'antd/lib/input/style/css';
import CONFIG from '../default';

const style = {
	treeComponent: 'vtx-ui-ztree-component',
	withSearchBox: 'vtx-ui-ztree-withsearchbox',
    searchBox:'vtx-ui-ztree-searchbox',
    ztree:'vtx-ui-ztree-tree-ct'
}

export default class VtxZtree extends React.Component{
    constructor(props){
        super();
        this.treeId = `tree-${new Date().getTime()}-${parseInt(Math.random()*10000)}`;
        this.zTreeObj = null;
        this.treeSetting = {};
        this.treeNodes = [];
        this.keyNameMapping = {};
        this.searchTimeOutId = null; 
        this.loadPromise = this.loadTreeResource();
        this.loadComplete = false;
        this.fuzzySearch = _debounce(this.fuzzySearch.bind(this),300);
        this.state={
            searchVal:''
        };
    }
    loadTreeResource(){
        if(!$.fn.zTree){
            const treeAll = new Promise((resolve)=>{
                $.getScript(`${CONFIG.ztreeServer}/js/jquery.ztree.all.min.js`, function(){
                    $.getScript(`${CONFIG.ztreeServer}/js/jquery.ztree.exhide.min.js`, function(){
                        resolve();
                    });
                });
            });
            $("<link>").attr({ rel: "stylesheet",type: "text/css",href: `${CONFIG.ztreeServer}/css/zTreeStyle/zTreeStyle.css`}).appendTo("head");
            return treeAll;
        }
        else{
            return new Promise((resolve)=>{resolve()});
        }
    }
    componentDidMount(){
        this.loadPromise.then(()=>{
            this.loadComplete = true;
            this.refreshTree(this.props);
        })
    }
    componentDidUpdate(prevProps){
        if(!this.loadComplete)return;
        if(!_isEqual(prevProps.refreshFlag,this.props.refreshFlag) || !_isEqual(prevProps.data,this.props.data)){
            this.refreshTree(this.props);
        }
    }
    componentWillUnmount(){
        this.zTreeObj && this.zTreeObj.destroy();
    }
    // 初始化树的配置
    initTreeSetting(props){
        const t = this;
        // 初始化树的配置
        this.treeSetting = {
            check: {
                enable: !!props.checkable,
            },
            view:{
                selectedMulti: !!props.multiple,
                showIcon: true,
                expandSpeed:'normal',
                fontCss:(treeId, treeNode)=>{
                    return treeNode.selectable?{}:{color:"#B9B9B9"}
                },
            },
            callback:{
                beforeClick(treeId, treeNode, clickFlag){
                    return treeNode.selectable;
                },
                onClick(e,treeId,treeNode,clickFlag){
                    // console.log('点击节点信息',treeNode)
                    if(typeof props.onClick =='function'){
                        const selectedNodes = t.getSelectedNodes();
                        props.onClick({
                            key:treeNode.key,
                            treeNode,
                            selectedNodes,
                            selectedKeys:selectedNodes.map(item=>item.key),
                            selectedNames:selectedNodes.map(item=>item.name)
                        });
                    }
                },
                onCheck(e,treeId,treeNode){
                    // console.log('勾选节点信息',treeNode)
                    if(typeof props.onCheck =='function'){
                        const checkedNodes = t.getCheckedNodes();
                        props.onCheck({
                            key:treeNode.key,
                            isChecked:treeNode.checked,
                            treeNode:t.zTreeObj.getChangeCheckedNodes(),
                            checkedNodes,
                            checkedKeys:checkedNodes.map(item=>item.key),
                            checkedNames:checkedNodes.map(item=>item.name)
                        });
                    }
                },
                onExpand(e,treeId,treeNode){
                    // console.log('展开节点信息',treeNode)
                    if(typeof props.onExpand =='function'){
                        props.onExpand({
                            key:treeNode.key,
                            isExpand:true,
                            treeNode,
                            expandedKeys:t.zTreeObj.getNodesByParam('open',true).map(item=>item.key)
                        });
                    }
                },
                onCollapse(e,treeId,treeNode){
                    // console.log('收起节点信息',treeNode)
                    if(typeof props.onExpand =='function'){
                        props.onExpand({
                            key:treeNode.key,
                            isExpand:false,
                            treeNode,
                            expandedKeys:t.zTreeObj.getNodesByParam('open',true).map(item=>item.key)
                        });
                    }
                },
                onRightClick(e,treeId,treeNode){
                    // console.log('右击节点信息',treeNode);
                    if(typeof props.onRightClick =='function'){
                        props.onRightClick({
                            event:e,
                            key:treeNode.key,
                            treeNode
                        });
                    }
                }
            }
        };
        // 继承外部配置
        if(typeof this.props.customCfg=='object'){
            _merge(this.treeSetting,this.props.customCfg)
        }
    }
    // 初始化树的数据，对expandedKeys，checkedKeys做处理
    initTreeNodes(props){
        const t = this;
        this.keyNameMapping = {};
        if(!Array.isArray(props.data)){
            this.treeNodes = [];
        }
        else{
            const checkedKeys = props.checkedKeys||[];
            const expandedKeys = props.expandedKeys || [];
            const chkDisabled = !!props.disableCheckboxAll;
            this.treeNodes = (function genNodes(nodes) {
                return nodes.map((item)=>{
                    let checked = checkedKeys.indexOf(item.key)!=-1;
                    const open = expandedKeys.indexOf(item.key)!=-1;
                    t.keyNameMapping[item.key] = item.name;
                    if(Array.isArray(item.children) && item.children.length>0){
                        return {
                            chkDisabled,
                            selectable:true,
                            ...item,
                            checked,
                            open,
                            children:genNodes(item.children)
                        }
                    }
                    else{
                        return {
                            chkDisabled,
                            selectable:true,
                            ...item,
                            checked,
                            open
                        }
                    }
                }).map(item=>{
                    if(Array.isArray(item.children) && item.children.length>0){
                        const newNode = {...item};
                        // 如果子节点全部被勾选，父节点自动勾选
                        if(item.children.every(item=>item.checked)){
                            newNode.checked = true;
                        }
                        // 如果配置了自动展开父节点，父节点自动展开
                        if(props.autoExpandParent && item.children.some(item=>item.open)){
                            newNode.open = true;
                        }
                        return newNode;
                    }
                    else{
                        return item;
                    }
                    
                })
            })(props.data);
        }
    }
    // 重新生成树
    refreshTree(newProps){
        this.zTreeObj && this.zTreeObj.destroy();
        this.initTreeSetting(newProps);
        this.initTreeNodes(newProps);
        this.zTreeObj = $.fn.zTree.init($(`#${this.treeId}`), this.treeSetting, this.treeNodes);
        // if(Array.isArray(newProps.checkedKeys))this.checkNodes(newProps.checkedKeys);
        // if(Array.isArray(newProps.expandedKeys)){
        //     this.expandNodes(newProps.expandedKeys);
        // }
        if(Array.isArray(newProps.selectedKeys))this.selectNodes(newProps.selectedKeys,newProps.multiple);

        // 初始化全展开判断
        if(newProps.defaultExpandAll && !newProps.expandedKeys){
            this.zTreeObj.expandAll(true);
        }
    }
    // 展开或折叠相关节点,expandFlag为true表示展开,false表示折叠
    expandNodes(expandedKeys,expandFlag=true){
        for(let i=0,len=expandedKeys.length;i<len;i++){
            const node = this.zTreeObj.getNodesByParam('key',expandedKeys[i]).pop();
            if(node){
                this.zTreeObj.expandNode(node,expandFlag,false,false);
            }
        }
    }
    // 勾选节点, checkedFlag为true表示勾选,false表示取消勾选
    checkNodes(checkedKeys,checkedFlag=true){
        for(let i=0,len=checkedKeys.length;i<len;i++){
            const node = this.zTreeObj.getNodesByParam('key',checkedKeys[i]).pop();
            if(node){
                // 隐藏节点的勾选状态也要改变
                node.checked = checkedFlag;
                this.zTreeObj.updateNode(node);
                // this.zTreeObj.checkNode(node,checkedFlag,false);
            }
        }
    }
    // 点击选择节点
    selectNodes(selectedKeys,multiple){
        for(let i=0,len=selectedKeys.length;i<len;i++){
            const node = this.zTreeObj.getNodesByParam('key',selectedKeys[i]).pop();
            if(node){
                this.zTreeObj.selectNode(node,multiple,true);
            }
        }
    }
    // 取消选择节点
    cancelSelectedNodes(selectedKeys){
        for(let i=0,len=selectedKeys.length;i<len;i++){
            const node = this.zTreeObj.getNodesByParam('key',selectedKeys[i]).pop();
            if(node){
                this.zTreeObj.cancelSelectedNode(node);
            }
        }
    }
    fuzzySearch(keyworld,isHighLight=true, isExpand=false){
        const t = this;
        var nameKey = this.zTreeObj.setting.data.key.name; //get the key of the node name
        // isHighLight = isHighLight===false?false:true;//default true, only use false to disable highlight
        // isExpand = isExpand?true:false; // not to expand in default
        this.zTreeObj.setting.view.nameIsHTML = isHighLight; //allow use html in node name for highlight use
        
        var metaChar = '[\\[\\]\\\\\^\\$\\.\\|\\?\\*\\+\\(\\)]'; //js meta characters
        var rexMeta = new RegExp(metaChar, 'gi');//regular expression to match meta characters
        
        // searchNodeLazy(keyworld);
        ztreeFilter(t.zTreeObj,keyworld);

        // -----------------------------内部函数----------------------------------
        // keywords filter function 
        function ztreeFilter(zTreeObj,_keywords,callBackFunc) {
            if(!_keywords){
                _keywords =''; //default blank for _keywords 
            }
            
            // function to find the matching node
            function filterFunc(node) {
                if(node && node.oldname && node.oldname.length>0){
                    node[nameKey] = node.oldname; //recover oldname of the node if exist
                }
                zTreeObj.updateNode(node); //update node to for modifications take effect
                if (_keywords.length == 0) {
                    //return true to show all nodes if the keyword is blank
                    zTreeObj.showNode(node);
                    zTreeObj.expandNode(node,isExpand);
                    return true;
                }
                //transform node name and keywords to lowercase
                if (node[nameKey] && node[nameKey].toLowerCase().indexOf(_keywords.toLowerCase())!=-1) {
                    if(isHighLight){ //highlight process
                        //a new variable 'newKeywords' created to store the keywords information 
                        //keep the parameter '_keywords' as initial and it will be used in next node
                        //process the meta characters in _keywords thus the RegExp can be correctly used in str.replace
                        var newKeywords = _keywords.replace(rexMeta,function(matchStr){
                            //add escape character before meta characters
                            return '\\' + matchStr;
                        });
                        node.oldname = node[nameKey]; //store the old name  
                        var rexGlobal = new RegExp(newKeywords, 'gi');//'g' for global,'i' for ignore case
                        //use replace(RegExp,replacement) since replace(/substr/g,replacement) cannot be used here
                        node[nameKey] = node.oldname.replace(rexGlobal, function(originalText){
                            //highlight the matching words in node name
                            var highLightText =
                                '<span style="color: whitesmoke;background-color:#f50;">'
                                + originalText
                                +'</span>';
                            return 	highLightText;					
                        });
                        zTreeObj.updateNode(node); //update node for modifications take effect
                    }
                    zTreeObj.showNode(node);//show node with matching keywords
                    return true; //return true and show this node
                }
                
                zTreeObj.hideNode(node); // hide node that not matched
                return false; //return false for node not matched
            }
            
            var nodesShow = zTreeObj.getNodesByFilter(filterFunc); //get all nodes that would be shown
            processShowNodes(zTreeObj,nodesShow, _keywords);//nodes should be reprocessed to show correctly
        }
        
        /**
         * reprocess of nodes before showing
         */
        function processShowNodes(zTreeObj,nodesShow,_keywords){
            if(nodesShow && nodesShow.length>0){
                //process the ancient nodes if _keywords is not blank
                if(_keywords.length>0){ 
                    $.each(nodesShow, function(n,obj){
                        var pathOfOne = obj.getPath();//get all the ancient nodes including current node
                        if(pathOfOne && pathOfOne.length>0){ 
                            //i < pathOfOne.length-1 process every node in path except self
                            for(var i=0;i<pathOfOne.length-1;i++){
                                zTreeObj.showNode(pathOfOne[i]); //show node 
                                zTreeObj.expandNode(pathOfOne[i],true); //expand node
                            }
                        }
                    });	
                }else{ //show all nodes when _keywords is blank and expand the root nodes
                    var rootNodes = zTreeObj.getNodesByParam('level','0');//get all root nodes
                    $.each(rootNodes,function(n,obj){
                        zTreeObj.expandNode(obj,true); //expand all root nodes
                    });
                }
            }
        }

        // function searchNodeLazy(_keywords) {
        //     if (t.searchTimeOutId) { 
        //         //clear pending task
        //         clearTimeout(t.searchTimeOutId);
        //     }
        //     t.searchTimeOutId = setTimeout(function() {
        //         ztreeFilter(t.zTreeObj,_keywords); //lazy load ztreeFilter function 
        //     }, 500);
        // }
    }
    // 清空搜索框数据（供外部调用）
    clearSearch(){
        if(this.state.searchVal.trim()=='')return;
        this.setState({
            searchVal:''
        });
        this.refreshTree(this.props);
    }
    // 获取所有已被勾选的节点
    getCheckedNodes(){
        return this.zTreeObj.getNodesByFilter((node)=>{
            // 节点被勾选（非半勾状态）
            return node.checked && node.check_Child_State!=1;
        }).map(item=>{
            return {
                ...item,
                name:item.oldname||item.name // 搜索树会改变节点的name
            }
        });
    }
    // 获取所有已被点击选中的节点
    getSelectedNodes(){
        return this.zTreeObj.getSelectedNodes().map(item=>{
            return {
                ...item,
                name:item.oldname||item.name
            }
        });
    }
    // 展开所有节点（供外部调用）
    expandAll(){
        this.zTreeObj.expandAll(true);
    }
    // 收起所有节点（供外部调用）
    collapseAll(){
        this.zTreeObj.expandAll(false);
    }
    render(){
        const t = this;
        return (
            <div className={this.props.isShowSearchInput?`${style.treeComponent} ${style.withSearchBox}`:style.treeComponent}>
                {
                    this.props.isShowSearchInput?<div className={style.searchBox}>
                        <Input 
                            value={t.state.searchVal} 
                            placeholder={t.props.placeholder||'请输入要查询的关键字'}
                            onChange={(e)=>{
                                t.setState({
                                    searchVal:e.target.value
                                })
                                t.fuzzySearch(e.target.value.trim());
                            }}
                        />
                    </div>:null
                }
                
                <div id={this.treeId} className={`ztree ${style.ztree}`} style={{height:'100%'}}></div>
            </div>
        )
    }
}