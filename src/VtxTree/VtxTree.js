import React from 'react';
import './VtxTree.css';
const styles = {
	normal: 'vtx-ui-tree-normal',
	searchInput: 'vtx-ui-tree-searchInput',
	treeBody: 'vtx-ui-tree-treeBody',
	text_ellipsis: 'vtx-ui-tree-text_ellipsis',
	dis_n: 'vtx-ui-tree-dis_n',
	treeNode: 'vtx-ui-tree-treenode',
	disable: 'vtx-ui-tree-disable'
}
import Tree from 'antd/lib/tree';
import 'antd/lib/tree/style/css';
import Input from 'antd/lib/input';
import 'antd/lib/input/style/css';
import Tooltip from 'antd/lib/tooltip';
import 'antd/lib/tooltip/style/css';
import Spin from 'antd/lib/spin';
import 'antd/lib/spin/style/css';
import Icon from 'antd/lib/icon';
import 'antd/lib/icon/style/css';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
import _isEqual from 'lodash/isEqual';

class VtxTree extends React.Component {
	constructor(props){
		super(props);
		this.askeys = [];
		this.allKeys = [];
		this.state = {
			isExpandAll: props.isExpandAll || 'other',
			autoExpandParent: ('autoExpandParent' in props?props.autoExpandParent : true),
        	expandedKeys: props.expandedKeys || [],
        	selectedKeys: props.selectedKeys,
        	data: props.data,
        	onLoad: props.onLoad,
        	inputValue: '',
		}

	}
	/*
		vtxTree事件处理
	 */
	//右击事件
	onRightClick({event,node}){
		let t = this;

		if('onRightClick' in t.props && typeof(t.props.onRightClick) === 'function'){
			let key = node.props.eventKey;
			let treeNode = t.getTreeNodeByKey(t.props.data,key);
			t.props.onRightClick({event,key,treeNode});
		}
	}
	//点击事件(checkable为true时,效果和onCheck相同,即为多选事件)
	onSelect(selectedKeys, e){

		let t = this;
		let _tree = t.props;
		let key = e.node.props.eventKey;
		//同时为true时,onSelect事件执行onCheck方法
		if(_tree.checkable && _tree.isGangedChecked){
			e.node.onCheck();
			return false;
		}
		let treeNode = t.getTreeNodeByKey(t.props.data,key);
		//无关联的点击事件
		if('onClick' in t.props && typeof(t.props.onClick) === 'function'){
			_tree.onClick({key,selectedKeys,treeNode});
		}else{
			t.setState({
				selectedKeys
			})
		}
	}
	//复选框存在时的多选事件
	onCheck(checkedKeys,e){

		let t = this;
		let _tree = t.props;
		let key = e.node.props.eventKey;
		let isChecked = e.node.props.checked;
		let treeNode;
		let leafNode = [];
		let isCheckAll = true;
		for(let i = 0 ; i < t.allKeys.length; i++){
			if(t.allKeys[i] !== t.props.data[0].key){
				if((t.props.checkedKeys || []).indexOf(t.allKeys[i]) === -1){
					isCheckAll = false;
				}
			}
		}
		if(t.allKeys.length <= checkedKeys.length){
			if(!isCheckAll){
				checkedKeys = t.allKeys;
			}else{
				checkedKeys = [];
			}
		}
		//遍历获取所有选中叶子节点 和 当前点击的节点
		let getNodes = (item,index)=>{
			if(item.key === key){
				treeNode = item;
			}
			checkedKeys.map((itemK,indexK)=>{
				if(item.key === itemK && item.isLeaf && !(item.disabled || item.disableCheckbox)){
					leafNode.push(item);
				}
			});
			if(t.isArray(item.children)){
				t.traverse(item.children,getNodes);
			}
		}
		t.traverse(_tree.data,getNodes);

		if('onCheck' in t.props && typeof(t.props.onCheck) === 'function'){
			_tree.onCheck({key,isChecked,checkedKeys,treeNode,leafNode});
		}
	}

	//展开和收起事件
	onExpand(expandedKeys, e){
		let t = this;
		if('onExpand' in t.props && typeof(t.props.onExpand) === 'function'){
			let key = e.node.props.eventKey;
			let isExpand = e.expanded;
			let treeNode = t.getTreeNodeByKey(t.props.data,key);
			t.props.onExpand({key,expandedKeys,isExpand,treeNode});
		}else{
			t.setState({
				isExpandAll: 'other',
				expandedKeys: expandedKeys,
				autoExpandParent: false,
			});
		}
	}
	//动态加载树数据
	onLoadData(node){
		let t = this;
		let key = node.props.eventKey;
		let isExpand = node.props.expanded;
		let treeNode = t.getTreeNodeByKey(t.props.data,key);
		treeNode.children = !treeNode.children?[]:treeNode.children;
        if(treeNode.children.length === 0){
            return new Promise((resolve) => {
                this.props.onLoadData({key,treeNode,isExpand,resolve});
            })
        }else{
            return new Promise((resolve) => {
                resolve();
            })
        }
	}
	//搜索框onchange事件
	onChange(e){
		let t = this;
		let val = e.target.value;
		//内部记录搜索框输入的内容
		t.setState({
			inputValue: e.target.value,
		});
		let keys = t.getKeysbySearch(val);
		//使用者控制onChange事件
		if(!!t.props.searchInput && 'onChange' in t.props.searchInput){
			t.props.searchInput.onChange({val,keys});
			//手动控制事件后,默认事件被阻止
			return false;
		}
		t.setState({
			expandedKeys: keys,
			isExpandAll: 'other',
			autoExpandParent: true
		})
	}
	//搜索框onchange事件
	filtrateTree(val){
		let t = this;
		let keys = t.getKeysbySearch(val);
		t.setState({
			inputValue: val,
			expandedKeys: keys,
			isExpandAll: 'other',
			autoExpandParent: true
		})
	}
	//搜索框onsubmit确定事件
	onSubmit(){
		let t = this;
		let val = t.state.inputValue;
		let keys = t.getKeysbySearch(val);
		//使用者控制onSubmit事件
		if(!!t.props.searchInput && 'onSubmit' in t.props.searchInput){
			t.props.searchInput.onSubmit({val,keys});
			//手动控制事件后,默认事件被阻止
			return false;
		}
		t.setState({
			expandedKeys: keys,
			isExpandAll: 'other',
			autoExpandParent: true
		})
	}
	/*
		公共方法
	 */
	//通过searchInput找出对应的keys
	getKeysbySearch(val){
		let t = this;
		let data = t.props.data;
		let keys = [],askeys=[];
		let getKeys = function (item,index,p) {
			if(item.name.toString().toUpperCase().indexOf(val.toString().toUpperCase()) > -1){
				keys.push(item.key);
				if(askeys.indexOf(p) > -1){
					askeys.splice(askeys.indexOf(p),1);
				}
				askeys.push(`${p},${item.key}`);
			}
			if(('children' in item) && t.isArray(item.children)){
				t.traverse(item.children,getKeys,p?`${p},${item.key}`:item.key);
			}
		}
		t.traverse(data,getKeys);
		//根节点必须展示
		this.askeys = [data[0].key];
		//获取所有需要展示
		for(let i = 0 ; i < askeys.length ; i++){
		    let b =  askeys[i].split(',');
		    for(let j = 0 ; j <  b.length; j++){
		        if(this.askeys.indexOf(b[j]) === -1){
		            this.askeys.push(b[j]);
		        }
		    }
		}
		return keys;
	}
	//通过key获取对应的treeNode
	getTreeNodeByKey(data,key){
		let t = this;
		let treeNode;
		let loop = (item,index)=>{
			if(item.key == key){
				treeNode = item;
				return true;
			}
			if('children' in item && t.isArray(item.children)){
				t.traverse(item.children,loop);
			}
		}
		t.traverse(data,loop);
		return treeNode;
	}
	//遍历tree数据方法
	traverse(ary,backcall,p){
		ary.map((item,index)=>{
			backcall(item,index,p);
		});
	}
	//判断对应参数是否是数组
	isArray(ary){
		return Object.prototype.toString.call(ary) === '[object Array]';
	}
	//获取所有叶子节点(onload事件)
	getLeafKeys(){
		let t = this;
		let leafNode = [];
		let leafKeys = [];
		let getNodes = (item,index)=>{
			if(item.isLeaf){
				leafNode.push(item);
				leafKeys.push(item.key);
			}
			if(t.isArray(item.children)){
				t.traverse(item.children,getNodes);
			}
		}
		t.traverse(t.state.data,getNodes);
		return {leafNode,leafKeys};
	}
	render(){
		let t = this;
		let _tree = t.props;
		t.allKeys = [];
		//antd-tree树参数
		let TreeProps = {
			multiple: _tree.multiple || false, //true可以点击多个节点
			checkable: _tree.checkable || false, //true时有复选框
			autoExpandParent: t.state.autoExpandParent,//是否自动展开父节点

			onSelect: t.onSelect.bind(t),//点击节点事件 (checkable时效果和onCheck相同,即为多选事件)
			onCheck: t.onCheck.bind(t),//在checkable为true时点击复选框事件
			onExpand: t.onExpand.bind(t),//展开和收起节点事件
		}
		//右击事件
		if('onRightClick' in _tree && typeof(_tree.onRightClick) === 'function'){
			TreeProps.onRightClick = t.onRightClick.bind(t); 
		}
		//可控显示选中节点
		if('selectedKeys' in _tree){
			if(t.isArray(_tree.selectedKeys)){
				TreeProps.selectedKeys = t.state.selectedKeys || [];
			}
			else{
				console.error('warn: selectedKeys: Data type error!');
			}
		}
		//清空在isGangedChecked为true时的tree默认操作
		if(_tree.isGangedChecked){
			TreeProps.selectedKeys = [];
		}
		//动态加载树数据
		if('checkedKeys' in _tree){
			if(t.isArray(_tree.checkedKeys))
				TreeProps.checkedKeys = _tree.checkedKeys || [];
			else
				console.error('warn: checkedKeys: Data type error!');
		}
		//动态加载树数据
		if('onLoadData' in _tree){
			if(typeof(_tree.onLoadData) === 'function')
				TreeProps.loadData = t.onLoadData.bind(t);
			else
				console.error('warn: VtxTree data: onLoadData is not a function!');
		}
		//树展开功能
		if('isExpandAll' in _tree && t.state.isExpandAll === 'openAll'){//（受控）展开全部节点
			let ary = [];
			let isLeaf = (item,index)=>{
				//判断是否是叶子节点 (是叶子节点,记录下节点key,不是则继续往下找)
				ary.push(item.key);
				if('children' in item && item.children instanceof Array && !item.isLeaf){
					t.traverse(item.children,isLeaf);
				}
			}
			t.traverse(_tree.data,isLeaf);
			TreeProps.expandedKeys = ary;
		}else if('isExpandAll' in _tree && t.state.isExpandAll === 'closeAll'){//（受控）收起全部节点
			TreeProps.expandedKeys = [];
		}else if(t.state.isExpandAll === 'other'){//（受控）展开树节点
			TreeProps.expandedKeys = t.state.expandedKeys || [];
		}else if('expandedKeys' in _tree){//（受控）展开指定的树节点
			TreeProps.expandedKeys = t.state.expandedKeys || [];
		}
		//加载节点树
		let loop = (data) => {
			//检索传入树的数据格式是否正确
			if(typeof(data) !== 'object' || (!data.length && data.length !== 0)){
				console.error('warn: VtxTree data: Data type error!');
				return false;
			}
			let render = data.map((item,index)=>{
				let searchValue = t.state.inputValue;
				let name = item.name;
				//搜索框搜索文字高亮功能
		      	// if(t.state.expandedKeys.indexOf(item.key) === -1){
		      	// 	return '';
		      	// }
				if(!!_tree.isShowSearchInput && searchValue.length > 0){
			      	const indexn = item.name.search(t.state.inputValue);
			      	const beforeStr = item.name.substr(0,indexn);
			      	const afterStr = item.name.substr(indexn + searchValue.length);
			      	name = (
			      		indexn != -1?
			      			<span>
			      				{beforeStr}
						        <span style={{ color: (!!_tree.searchInput ? _tree.searchInput.color || '#f50': '#f50'),padding: 0}}>{searchValue}</span>
						        {afterStr}
			      			</span>
				      		:
				      		<span>{name}</span>
			      		);
				}
				let disabledClass = item.disabled || _tree.disabledAll?styles.disable:'';
				let _title = (
					!!item.icon ?
					<div className={`${styles.treeNode} ${disabledClass}`} onClick={(e)=>{
							if(item.disabled || _tree.disabledAll){
								e.stopPropagation();
	    						e.nativeEvent.stopImmediatePropagation();
	    						return false;
							}
						}}>
						<i className={`iconfont ${item.icon} ${item.iconClassName || ''}`}
							style={{'verticalAlign':'middle','marginRight':'4px'}}></i>
						{name}
					</div>
					:(
						!!item.antdIcon?
						<div className={`${styles.treeNode} ${disabledClass}`} onClick={(e)=>{
							if(item.disabled || _tree.disabledAll){
								e.stopPropagation();
	    						e.nativeEvent.stopImmediatePropagation();
	    						return false;
							}
						}}>
							<Icon 
								type={item.antdIcon} className={`${item.iconClassName || ''}`}
								style={{'verticalAlign':'middle','marginRight':'4px'}}
							/>
							{name}
						</div>
						:(
							!!item.img ?
							<div className={`${styles.treeNode} ${disabledClass}`} onClick={(e)=>{
								if(item.disabled || _tree.disabledAll){
									e.stopPropagation();
		    						e.nativeEvent.stopImmediatePropagation();
		    						return false;
								}
							}}>
								<img src={item.img} alt=""
									style={{'width':'16px','height':'16px','verticalAlign':'middle','marginRight':'4px'}}/>
								{name}
							</div>
							:
							<div className={`${styles.treeNode} ${disabledClass}`} onClick={(e)=>{
								if(item.disabled || _tree.disabledAll){
									e.stopPropagation();
		    						e.nativeEvent.stopImmediatePropagation();
		    						return false;
								}
							}}>
								{name}
							</div>
						)
					)
				);
				_title = (
					<Tooltip placement="right" title={name} overlay={name}>
        				{_title}
	      			</Tooltip>
		      	);
		      	if(!(_tree.isShowSearchInput 
					&& this.askeys.indexOf(item.key) === -1
						&& t.state.inputValue.length > 0)){
					  t.allKeys.push(item.key);
				}
				let TreeNodeProps = {
					// disabled: item.disabled || (_tree.disabledAll?true:false),
					disableCheckbox:  item.disableCheckbox || (_tree.disableCheckboxAll?true:false),
					title: _title,
					key: item.key,
					isLeaf: item.isLeaf || false,
					className: _tree.isShowSearchInput 
						&& this.askeys.indexOf(item.key) === -1
							&& t.state.inputValue.length > 0
							?styles.dis_n:''
				}
				return(
					<TreeNode {...TreeNodeProps} >
					{
						//子节点数据处理,避免数据异常
						(('children' in item) && t.isArray(item.children) && !item.isLeaf)?
						loop(item.children):''
					}
					</TreeNode>
				);
			});
			return render;
		} 
		let isFixed =  _tree.isFixed == undefined?true:_tree.isFixed;
		return(
			<div className={styles.normal} 
				style={{paddingTop: _tree.isShowSearchInput && isFixed?'30px':'0px'}}
			>
				<div className={styles.searchInput}
					style={{
						position: isFixed?'absolute':'relative'
					}}
				>
					{
						!_tree.isShowSearchInput?''
						:(!!_tree.searchInput && 'render' in _tree.searchInput)
							?_tree.searchInput.render(t.onChange.bind(t),t.onSubmit.bind(t))
							:<Search  placeholder="搜索" onChange={t.onChange.bind(t)} onSearch={t.onSubmit.bind(t)}/>
					}
				</div>
				<div className={styles.treeBody}>
					{
						_tree.data.length?
						<Tree {...TreeProps}>{loop(_tree.data)}</Tree>:
						<Spin tip="加载中...">
							<div style={{width:'100%',height: '50px'}}></div>
						</Spin>
					}
				</div>
			</div>
		);
	}
	componentDidMount(){
		let t = this;
		//树加载完后回调事件
		let keys = t.getLeafKeys();
		if(!!t.state.onLoad && !!t.state.data[0])
			t.state.onLoad({leafNode:keys.leafNode,leafKeys:keys.leafKeys});
	}
	componentDidUpdate(prevProps, prevState) {//重新渲染结束
		let t = this;
		//加载完后回调事件
		let keys = t.getLeafKeys();
		if(!!t.state.onLoad && !!t.state.data[0])
			t.state.onLoad({leafNode:keys.leafNode,leafKeys:keys.leafKeys});
    }
    shouldComponentUpdate(nextProps, nextState){
    	let t = this;
    	let oldProps = {...t.props};
    	let newProps = {...nextProps};
    	let oldState = {...t.state};
    	let newState = {...nextState};
    	delete oldProps.onClick;
    	delete oldProps.onCheck;
    	delete oldProps.onLoadData;
    	delete oldProps.onExpand;
    	delete oldProps.onRightClick;
    	delete oldProps.onLoad;
    	delete oldProps.searchInput;

    	delete newProps.onClick;
    	delete newProps.onCheck;
    	delete newProps.onLoadData;
    	delete newProps.onExpand;
    	delete newProps.onRightClick;
    	delete newProps.onLoad;
    	delete newProps.searchInput;

    	delete oldState.onLoad;
    	delete newState.onLoad;
		return !_isEqual(oldProps,newProps) || !_isEqual(oldState,newState);
    	
    }
	componentWillReceiveProps(nextProps) {//已加载组件，收到新的参数时调用
    	let t = this;
    	t.setState({
    		isExpandAll : (nextProps.isExpandAll?nextProps.isExpandAll:t.state.isExpandAll),
    		selectedKeys: (nextProps.selectedKeys?nextProps.selectedKeys:t.state.selectedKeys),
    		expandedKeys: (nextProps.expandedKeys?nextProps.expandedKeys:t.state.expandedKeys),
    		autoExpandParent: ('autoExpandParent' in nextProps?nextProps.autoExpandParent:t.state.autoExpandParent),
    		data: (nextProps.data?nextProps.data:t.state.data),
    		onLoad: nextProps.onLoad
    	})
    }
}

export default VtxTree;
