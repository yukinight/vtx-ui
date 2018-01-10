import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './Tree.less';
import {VtxTree} from 'vtx-ui';
import {Icon,Spin} from 'antd';

function Tree({dispatch,location,simulationData}) {
	const {tree,checkable,checkedKeys,isExpandAll_frist,
			isExpandAll_onExpand,autoExpandParent_onExpand,expandedKeys,
			isGangedChecked,
			multiple,selectedKeys,
			autoExpandParent_input,expandedKeys_input,isExpandAll_input,isDefault,
            treeLoad
    } = simulationData;
	//复选框事件
	function onCheck(e) {
		let {key,isChecked,checkedKeys, treeNode, leafNode} = e;
		console.log(key);
		console.log(isChecked);
		console.log(checkedKeys);
		console.log(treeNode);
		console.log(leafNode);
		dispatch({
			type: 'simulationData/updateState',
			payload: {
				checkedKeys: checkedKeys
			}
		})
	}
	//展开全部
	function openAll() {
		dispatch({
			type: 'simulationData/updateState',
			payload: {
				isExpandAll_frist: 'openAll'
			}
		})
	}
	//收起全部
	function closeAll() {
		dispatch({
			type: 'simulationData/updateState',
			payload: {
				isExpandAll_frist: 'closeAll'
			}
		})
	}
	//展开收起事件
	function onExpand(e) {
		let {key, isExpand, treeNode, expandedKeys} = e;
		console.log(key);
		console.log(isExpand);
		console.log(expandedKeys);
		console.log(treeNode);
		dispatch({
			type: 'simulationData/updateState',
			payload: {
				expandedKeys: expandedKeys
			}
		})
	}
	//关联点击
	function gangedChecked(judge) {
		dispatch({
			type: 'simulationData/updateState',
			payload: {
				isGangedChecked: judge
			}
		})
	}
	//点击事件
	function onClick(e) {
		let {selectedKeys , key,treeNode} = e
		console.log(key);
		console.log(treeNode);
		console.log(selectedKeys);
	}
	//切换多选和单选
	function changeMultiple(judge) {
		dispatch({
			type: 'simulationData/updateState',
			payload: {
				multiple: judge,
				selectedKeys: []
			}
		})
	}
	//右击事件
	function onRightClick(e) {
		let {event, key,treeNode} = e
		console.log(event);
		console.log(key);
		console.log(treeNode);
		alert(`右击了${treeNode.name}`);
	}
	//自定义搜索框
	const searchInput = {
		color: '#108EE9',
		render: (onChange,onSubmit)=>{
		  	return(
		    	<div>
		      		<input type="text" onChange={onChange} />
		      		<div onClick={onSubmit}>搜索</div>
		    	</div>
		  	);
		},
		onChange: (e)=>{
			let {val,keys} = e;
			console.log(val);
			console.log(keys);
			dispatch({
				type: 'simulationData/updateState',
				payload: {
					autoExpandParent_input: true,
					expandedKeys_input: keys,
					isExpandAll_input: 'other',
				}
			})
		},
		onSubmit: (e)=>{
			let {val,keys} = e;
			console.log(val);
			console.log(keys);
			dispatch({
				type: 'simulationData/updateState',
				payload: {
					autoExpandParent_input: true,
					expandedKeys_input: keys,
					isExpandAll_input: 'other',
				}
			})
		}
	}
	//切换搜索框默认或自定义
	function _isDefault(judge) {
		dispatch({
			type: 'simulationData/updateState',
			payload: {
				isDefault: judge,
			}
		})
	}
	//树的异步加载
	function onLoadData(e) {
		let {key,treeNode,resolve} = e;
		dispatch({
			type: 'simulationData/requestTest',
			payload: {key,resolve}
		})
	}
    return (
        <div className={styles.normal}>
        	<div style={{'textAlign':'center','color':'#108EE9','fontSize':'36px'}}>Tree  Demo</div>
            <div style={{'textAlign':'center','color':'#108EE9','fontSize':'20px'}}>SVN地址：{'https://222.92.212.126:8443/svn/vtx-dt-product/trunk/web/components/VtxTree'}</div>
        	<div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
        		<div style={{'color':'#f50'}}>一.基本渲染(icon > img)</div>
	            <VtxTree 
	            	data={tree}
	           	/>
        	</div>
        	<div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
        		<div style={{'color':'#f50'}}>二.全部展开/收起</div>
	            <VtxTree 
	            	data={tree}
	            	isExpandAll={isExpandAll_frist}
	           	/>
        		<div>
        			<span 
        				style={{'margin':'10px 10px','cursor': 'pointer','color':'#108EE9'}}
        				onClick={openAll}
        			>
        				openAll
    				</span>
        			<span 
        				style={{'margin':'10px 10px','cursor': 'pointer','color':'#108EE9'}}
        				onClick={closeAll}
        			>
        				closeAll
    				</span>
        		</div>
        	</div>
        	<div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
        		<div style={{'color':'#f50'}}>三.手动控制展开'(isExpandAll,expandedKeys,autoExpandParent,onExpand)'</div>
        		<div>
        			1.isExpandAll为other时手动控制展开<br/>
        			2.onExpand展开/收起事件 Funciton({'{'}key, isExpand, treeNode, expandedKeys{'}'})
    				<p>&nbsp;&nbsp;&nbsp;isExpand:bealoon/true(表示展开操作).false(表示收起操作)</p>
					<p>&nbsp;&nbsp;&nbsp;expandedKeys:array/所有展开的节点的key数组</p>
        			3.expandedKeys手动控制展开(expandedKeys存在时,树的展开与收起效果就由expandedKeys决定)<br/>
        			4.autoExpandParent(控制expandedKeys来控制树的展开和收起时,需要将autoExpandParent改为false)
        		</div>
	            <VtxTree 
	            	data={tree}
	            	isExpandAll={isExpandAll_onExpand}
	            	expandedKeys={expandedKeys}
	            	onExpand={onExpand}
	            	autoExpandParent={autoExpandParent_onExpand}
	           	/>
        	</div>
        	<div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
        		<div style={{'color':'#f50'}}>四.复选框'(checkable,checkedKeys,onCheck,isGangedChecked)'</div>
        		<div>
        			1.checkable为true时开启复选框<br/>
        			2.oncheck复选框点正反选事件 Funciton({'{'}key,isChecked,checkedKeys,treeNode,leafNode{'}'})
    				<p>&nbsp;&nbsp;&nbsp;isChecked:true/false,true表示该节点被选中,false反之</p>
					<p>&nbsp;&nbsp;&nbsp;checkedKeys:返回的所有选中的节点key,用于在namespace中处理数据</p>
					<p>&nbsp;&nbsp;&nbsp;treeNode:当前点击的节点数据</p>
					<p>&nbsp;&nbsp;&nbsp;leafNode:所有选中的叶子节点数据</p>
        			3.checkedKeys手动控制复选框选中项(checkedKeys存在时,树的选中与反选效果就由checkedKeys决定)
        			4.isGangedChecked为true时,点击事件与复选关联,所以onClick事先失效
        		</div>
	            <VtxTree 
	            	data={tree}
	            	checkable={checkable}
	            	checkedKeys={checkedKeys}
	            	onCheck={onCheck}
	            	isGangedChecked={isGangedChecked}
	           	/>
        		<span 
    				style={{'margin':'10px 10px','cursor': 'pointer','color':'#108EE9'}}
    				onClick={()=>gangedChecked(true)}
    			>
    				关联点击
				</span>
    			<span 
    				style={{'margin':'10px 10px','cursor': 'pointer','color':'#108EE9'}}
    				onClick={()=>gangedChecked(false)}
    			>
    				取消关联
				</span>
        	</div>
        	<div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
        		<div style={{'color':'#f50'}}>五.点击节点事件'(onClick,multiple,selectedKeys,isGangedChecked)'</div>
        		<div>
        			1.onClick节点点击事件 Funciton({'{'}key,treeNode, selectedKeys{'}'})
    				<p>&nbsp;&nbsp;&nbsp;key:当前点击的节点数据</p>
					<p>&nbsp;&nbsp;&nbsp;treeNode:当前点击的节点数据</p>
    				<p>&nbsp;&nbsp;&nbsp;selectedKeys:所有点击选中的节点key</p>
    				2.multiple true/false,true时可以多选
    				3.selectedKeys(手动控制)选中指定的树节点
    				<p>&nbsp;&nbsp;&nbsp;multiple为false时不能多选,所以 selectedKeys只有数组第一个参数会生效</p>
					<p>&nbsp;&nbsp;&nbsp;存在selectedKeys时,树的选中/不选中效果就由selectedKeys决定</p>
					4.isGangedChecked详见第三个效果
        		</div>
	            <VtxTree
	            	data={tree}
	            	onClick={onClick}
	            	multiple={multiple}
	            	selectedKeys={selectedKeys}
	           	/>
	           	<span 
    				style={{'margin':'10px 10px','cursor': 'pointer','color':'#108EE9'}}
    				onClick={()=>changeMultiple(true)}
    			>
    				多选
				</span>
    			<span 
    				style={{'margin':'10px 10px','cursor': 'pointer','color':'#108EE9'}}
    				onClick={()=>changeMultiple(false)}
    			>
    				单选
				</span>
        	</div>
        	<div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
        		<div style={{'color':'#f50'}}>六.右击事件'(onRightClick)'</div>
        		<div>
        			1.onRightClick节点右击事件 Funciton({'{'}event,key,treeNode{'}'})
    				<p>&nbsp;&nbsp;&nbsp;event:event对象</p>
    				<p>&nbsp;&nbsp;&nbsp;key:当前点击的节点数据</p>
					<p>&nbsp;&nbsp;&nbsp;treeNode:当前点击的节点数据</p>
        		</div>
	            <VtxTree 
	            	data={tree}
	            	onRightClick={onRightClick}
	           	/>
        	</div>
        	<div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
        		<div style={{'color':'#f50'}}>七.搜索框'(isShowSearchInput,searchInput,autoExpandParent)'</div>
        		<div>
        			1.isShowSearchInput true/false显示和隐藏搜索框
    				2.multiple true/false,true时可以多选  
        			3.searchInput object (自定义搜索框后)
    				<p>&nbsp;&nbsp;&nbsp;3.1 render自定义搜索框样式 Function(onChange,onSubmit)</p>
					<p>&nbsp;&nbsp;&nbsp;3.2 onChange 自定义输入框的onChange事件 Function({'{'}val,keys{'}'})</p>
					<p>&nbsp;&nbsp;&nbsp;3.3 onSubmit 自定义输入框的onSubmit事件 Function({'{'}val,keys{'}'})</p>
					<p>&nbsp;&nbsp;&nbsp;3.4 color 自定义搜索高亮字体颜色</p>
    				4.手动控制  onChange  onSubmit事件时
    				&nbsp;&nbsp;&nbsp;4.1需要将autoExpandParent改为true
    				&nbsp;&nbsp;&nbsp;4.2需要将isExpandAll改为'other'
    				&nbsp;&nbsp;&nbsp;4.3需要控制expandedKeys来控制展开和收起

        		</div>
	            <VtxTree
	            	data={tree}
	            	isShowSearchInput={true}
	            	searchInput={isDefault?'':searchInput}
	            	autoExpandParent={autoExpandParent_input}
	            	isExpandAll={isExpandAll_input}
	            	expandedKeys={expandedKeys_input}
	           	/>
	           	<span 
    				style={{'margin':'10px 10px','cursor': 'pointer','color':'#108EE9'}}
    				onClick={()=>_isDefault(true)}
    			>
    				默认
				</span>
    			<span 
    				style={{'margin':'10px 10px','cursor': 'pointer','color':'#108EE9'}}
    				onClick={()=>_isDefault(false)}
    			>
    				自定义
				</span>
        	</div>
        	<div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
        		<div style={{'color':'#f50'}}>八.异步加载'(onLoadData)'</div>
        		<div>
        			1.onLoadData 异步加载数据(跟onExpand事件冲突,含有onloadData事件时,onExpand事件失效)
        			Funciton({'{'}key,treeNode,resolve{'}'})
    				<p>&nbsp;&nbsp;&nbsp;key:操作的对应节点key</p>
    				<p>&nbsp;&nbsp;&nbsp;treeNode: 操作的对应节数据</p>
					<p>&nbsp;&nbsp;&nbsp;resolve: Promise方法的返回使用方式见文档说明</p>
        		</div>
	            <VtxTree 
	            	data={treeLoad}
	            	onLoadData={onLoadData}
	           	/>
        	</div>
        </div>
    );
}

Tree.propTypes = {

};

export default connect(
    ({simulationData})=>({simulationData})
)(Tree);