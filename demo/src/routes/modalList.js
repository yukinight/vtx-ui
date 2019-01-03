import React from 'react';
import {connect} from 'dva';
import styles from './modalList.less';
import {Input,Select,Button} from 'antd';
const Option = Select.Option;
import {VtxModal,VtxModalList} from 'vtx-ui';
class IndexPage extends React.Component{
    constructor(props){
        super(props);
        this.lis = null;
        this.state= {}
    }
    render(){
        let t = this,_props = t.props;
        let dispatch = _props.dispatch;
        let {
            value1,value2,value3,value4,value5,value7,
            select1,isShow,visible,lists,a1,a2
        } = _props.modalList;
        let a = [1,2];
        const aa = a.map(()=>{
            return [
                <Input 
                    value={value2}
                    onChange={(e)=>{
                        dispatch({
                            type: 'modalList/updateState',
                            payload:{
                                value2: e.target.value
                            }
                        })
                    }}
                    data-modallist={{
                        layout:{width: 50,name: '测试1111',require: true},
                        regexp:{
                            value: value2,
                            exp: /\S/
                        }
                    }}
                />,
                <Input 
                    value={value2}
                    onChange={(e)=>{
                        dispatch({
                            type: 'modalList/updateState',
                            payload:{
                                value2: e.target.value
                            }
                        })
                    }}
                    data-modallist={{
                        layout:{width: 50,name: '测试1111',require: true},
                        regexp:{
                            value: value2,
                            exp: /\S/
                        }
                    }}
                />
            ];
        });
        return (
            <div>
                <Button onClick={()=>{
                    dispatch({
                        type: 'modalList/updateState',
                        payload: {
                            visible: true
                        }
                    })
                }}>新增</Button>
                <VtxModal
                    title={'新增'}
                    visible={visible}
                    onOk={
                        ()=>{
                            this.lis.submit().then(data=>{
                                console.log(data);
                                if(data){
                                    dispatch({
                                        type: 'modalList/updateState',
                                        payload: {
                                            visible: false,
                                            value1: '',
                                            value2: '',
                                            value3: '',
                                            value4: '',
                                            value5: '',
                                            value7: '',
                                            select1: '',
                                        }
                                    })
                                }
                            })
                        }
                    }
                    onCancel={
                        ()=>{
                            // this.lis.clear();
                            dispatch({
                                type: 'modalList/updateState',
                                payload: {
                                    visible: false
                                }
                            })
                        }
                    }
                >
                    <VtxModalList 
                        ref={(lis)=>{this.lis = lis}}
                        visible={visible}
                        isRequired={true}
                    >
                        <div data-modallist={{layout:{type: 'title',require: false,}}}>title</div>
                        <div data-modallist={{layout:{type: 'text',require: true,}}}>dakjhd</div>
                        <div data-modallist={{layout:{type: 'text',name: '测试',require: true,className: 'a',}}}>dakjhd</div>
                        <div data-modallist={{layout:{type: 'title',require: false}}}>title2</div>
                        <div data-modallist={{layout:{type: 'text',name: '测试',require: true}}}>dakjhd</div>
                        <div data-modallist={{layout:{type: 'text',name: '测试'}}}>dakjhd</div>
                        {
                            lists.map((item)=>{
                                return <Input 
                                    key={item}
                                    value={_props.modalList[`a${item}`]}
                                    onChange={(e)=>{
                                        dispatch({
                                            type: 'modalList/updateState',
                                            payload:{
                                                [`a${item}`]: e.target.value
                                            }
                                        })
                                    }}
                                    data-modallist={{
                                        layout:{key: item+1,width: 60,name: `${item}-23测试`,require: item == 1,comType: 'input'},
                                        regexp:{
                                            value: _props.modalList[`a${item}`],
                                            exp: /^\d*$/,
                                            errorMsg: '111',
                                            repete: {
                                                url: '/apis/repete',
                                                key: {name: _props.modalList[`a${item}`]}
                                            }
                                        }
                                    }}
                                />
                            })
                        }
                        <Input 
                            value={value1}
                            onChange={(e)=>{
                                dispatch({
                                    type: 'modalList/updateState',
                                    payload:{
                                        value1: e.target.value
                                    }
                                })
                            }}
                            data-modallist={{
                                layout:{width: 60,name: '测试1',require: false,comType: 'input'},
                                regexp:{
                                    value: value1,
                                    exp: /^\d*$/,
                                    errorMsg: '111',
                                    repete: {
                                        url: '/apis/repete',
                                        key: {name: value1}
                                    }
                                }
                            }}
                        />
                        <Button onClick={()=>{
                            dispatch({
                                type: 'modalList/updateState',
                                payload: {
                                    lists: lists.length > 1?[2]:[1,2]
                                }
                            })
                        }}>TTTT</Button>
                        {
                            isShow?
                            <Input 
                                value={value7}
                                inherit
                                style={{width: '100%'}}
                                onChange={(e)=>{
                                    dispatch({
                                        type: 'modalList/updateState',
                                        payload:{
                                            value7: e.target.value
                                        }
                                    })
                                }}
                                data-modallist={{
                                    layout:{width: 50,name: '测试数字',require: true,maxNum: 50,comType: 'input'},
                                    regexp:{
                                        value: value7,
                                        exp: [function(){return true},/^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/],
                                        errorMsg: ['必须是数字22222','必须是数字1']
                                    }
                                }}
                            />:null
                        }
                        <Input 
                            value={value2}
                            onChange={(e)=>{
                                dispatch({
                                    type: 'modalList/updateState',
                                    payload:{
                                        value2: e.target.value
                                    }
                                })
                            }}
                            data-modallist={{
                                layout:{width: 50,name: '测试1111',require: true},
                                regexp:{
                                    value: value2,
                                    exp: /\S/
                                }
                            }}
                        />
                        {null}
                        <Input
                            value={value3}
                            onChange={(e)=>{
                                dispatch({
                                    type: 'modalList/updateState',
                                    payload:{
                                        value3: e.target.value
                                    }
                                })
                            }}
                            data-modallist={{
                                layout:{type: 'ctext',width: 100,name: '测试3333',require: true},
                                regexp:{
                                    value: value3,
                                    exp: (val)=>{ if(/\S/.test(val)){return true}else{return false}}
                                }
                            }}
                        />
                        <Input 
                            value={value4}
                            onChange={(e)=>{
                                dispatch({
                                    type: 'modalList/updateState',
                                    payload:{
                                        value4: e.target.value
                                    }
                                })
                            }}
                            data-modallist={{
                                layout:{width: 50,name: '测试',require: true},
                                regexp:{
                                    value: value4,
                                    exp: (val)=>{ if('123'.indexOf(val) > -1 ){return true}else{return false}}
                                }
                            }}
                        />
                        <Input
                            inherit
                            value={value5}
                            onChange={(e)=>{
                                dispatch({
                                    type: 'modalList/updateState',
                                    payload:{
                                        value5: e.target.value
                                    }
                                })
                            }}
                            data-modallist={{
                                layout:{name: '测试nnnn',require: false,style: {width:'300px'}},
                                regexp: {
                                    value: value5,
                                    exp: (val)=>{ if('111'.indexOf(val) > -1 ){return true}else{return false}}
                                }
                            }}
                        />
                        {aa}
                        <Select
                            value={select1}
                            onChange={(val)=>{
                                dispatch({
                                    type: 'modalList/updateState',
                                    payload: {
                                        select1: val
                                    }
                                })
                            }}
                            data-modallist={{
                                layout:{width: 50,name: '测试',require: false,style: {width:'100%'}},
                            }}
                        >
                            <Option value={'1'}>12</Option>
                            <Option value={'2'}>2</Option>
                            <Option value={'3'}>3</Option>
                        </Select>

                    </VtxModalList>
                </VtxModal>
            </div>
        )
    }
}

export default connect(
    ({modalList})=>({modalList})
)(IndexPage);