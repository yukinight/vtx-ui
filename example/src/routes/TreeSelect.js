import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import styles from './TreeSelect.less';
import {VtxTreeSelect} from 'vtx-ui';

function TreeSelect({dispatch,location,treeSelect}) {
    const {data,noMuilBoxValue,MuilnoBoxValue,BoxValue,dataLoad} = treeSelect;
    //异步加载方法
    function onLoadData({key,treeNode,isExpand,resolve}) {
        dispatch({
            type: 'treeSelect/onLoadData',
            payload: {
                key,treeNode,resolve
            }
        })
    }
    return (
        <div className={styles.normal}>
            <div style={{'textAlign':'center','color':'#108EE9','fontSize':'36px'}}>TreeSelect  Demo</div>
            <div style={{'textAlign':'center','color':'#108EE9','fontSize':'20px'}}>SVN地址：{'https://222.92.212.126:8443/svn/vtx-dt-product/trunk/web/components/VtxTreeSelect'}</div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>一.基本渲染(icon > img)</div>
                <VtxTreeSelect 
                    data={data}
                    allowClear={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>必填的下拉框（required）</div>
                test:&nbsp;&nbsp;&nbsp;
                <VtxTreeSelect 
                    data={data}
                    allowClear={true}
                    required={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>二.展开全部'(treeDefaultExpandAll)'</div>
                <div>
                    1.treeDefaultExpandAll为true时,下拉树会全部展开<br/>
                    2.要注意的是,这个参数只会在初始化的时候生效一次,后续更改没有作用
                </div>
                <VtxTreeSelect 
                    data={data}
                    treeDefaultExpandAll={true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>三.部分展开'(treeDefaultExpandedKeys)'</div>
                <div>
                    1.通过手动操作key可以,展开对应的节点<br/>
                    2.例如treeDefaultExpandedKeys = ['0-0','0-1']
                </div>
                <VtxTreeSelect 
                    data={data}
                    treeDefaultExpandedKeys = {['0-1']}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>四.含搜索框的下拉'(showSearch,placeholder,searchPlaceholder)'</div>
                <div>
                    1.showSearch为true时,下拉树含有搜索框<br/>
                    2.placeholder: 可以改变下拉树框中的提示语<br/>
                    3.searchPlaceholder: 在有搜索框时使用,可以改变搜索框的提示语
                </div>
                <VtxTreeSelect 
                    data={data}
                    showSearch = {true}
                    placeholder = {'这是一个含有搜索框的下拉树'}
                    searchPlaceholder={'这是下拉树的搜索框'}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>五.checkedBox多选/部分禁选'(treeCheckable)'</div>
                <div>
                    1.treeCheckable为true时,下拉树含有复选框<br/>
                </div>
                <VtxTreeSelect 
                    data={data}
                    treeCheckable = {true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>六.checkedBox多选/全部禁选'(treeCheckable,disableCheckboxAll)'</div>
                <div>
                    1.treeCheckable为true时,下拉树含有复选框<br/>
                    2.disableCheckboxAll为true时,下拉树所有复选框禁选<br/>
                </div>
                <VtxTreeSelect 
                    data={data}
                    treeCheckable = {true}
                    disableCheckboxAll = {true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>七.多选/部分禁选'(multiple)'</div>
                <div>
                    1.multiple为true时,下拉树可以多选<br/>
                    2.treeCheckable为true时,multiple失效<br/>
                </div>
                <VtxTreeSelect 
                    data={data}
                    multiple = {true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>八.多选/全部禁选'(multiple,disabledAll)'</div>
                <div>
                    1.multiple为true时,下拉树可以多选<br/>
                    2.treeCheckable为true时,multiple失效<br/>
                    3.disabledAll为true时,禁止选择所有节点<br/>
                </div>
                <VtxTreeSelect 
                    data={data}
                    multiple = {true}
                    disabledAll = {true}
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>九.手动控制选中-单选/非checkedBox'(onChage,value)'</div>
                <div>
                    1.onChage是下拉树选择后的回调,返回{'{'}allValue,allLabel,value,label{'}'}<br/>
                    2.value通过传入对应的key值,手动控制选项
                </div>
                <VtxTreeSelect 
                    data={data}
                    value={noMuilBoxValue}
                    onChange={
                        ({allValue,allLabel,value,label})=>{
                            dispatch({
                                type: 'treeSelect/updateState',
                                payload: {
                                    noMuilBoxValue: allValue
                                }
                            });
                        }
                    }
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>十.手动控制选中-多选/非checkedBox'(onChage,value)'</div>
                <div>
                    1.multiple为true时,下拉树可以多选<br/>
                    2.onChage是下拉树选择后的回调,返回{'{'}allValue,allLabel,value,label{'}'}<br/>
                    3.value通过传入对应的key值,手动控制选项
                </div>
                <VtxTreeSelect 
                    data={data}
                    multiple = {true}
                    value={MuilnoBoxValue}
                    onChange={
                        ({allValue,allLabel,value,label})=>{
                            dispatch({
                                type: 'treeSelect/updateState',
                                payload: {
                                    MuilnoBoxValue: allValue
                                }
                            });
                        }
                    }
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>十一.手动控制选中-多选/checkedBox'(onChage,value)'</div>
                <div>
                    1.treeCheckable为true时,multiple失效<br/>
                    2.onChage是下拉树选择后的回调,返回{'{'}allValue,allLabel,value,label{'}'}<br/>
                    3.value通过传入对应的key值,手动控制选项
                </div>
                <VtxTreeSelect 
                    data={data}
                    treeCheckable = {true}
                    value={BoxValue}
                    onChange={
                        ({allValue,allLabel,value,label})=>{
                            dispatch({
                                type: 'treeSelect/updateState',
                                payload: {
                                    BoxValue: value
                                }
                            });
                        }
                    }
                />
            </div>
            <div style={{'margin':'50px 50px','verticalAlign': 'top'}}>
                <div style={{'color':'#f50'}}>十二.异步加载(onLoadData)'</div>
                <div>
                    1.onLoadData异步加载
                </div>
                <VtxTreeSelect 
                    data={dataLoad}
                    value={BoxValue}
                    onLoadData={onLoadData}
                    onChange={
                        ({allValue,allLabel,value,label})=>{
                            dispatch({
                                type: 'treeSelect/updateState',
                                payload: {
                                    BoxValue: value
                                }
                            });
                        }
                    }
                />
            </div>
        </div>
    );
}

export default connect(
    ({treeSelect})=>({treeSelect})
)(TreeSelect);