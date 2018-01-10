import React from 'react';

import { TreeSelect } from 'antd';
const TreeNode = TreeSelect.TreeNode;

function TestTreeSelect(props) {
    function onChange(){
        
    }
    return (
        <TreeSelect
            showSearch
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto'}}
            placeholder="必须加提示"
            allowClear
            treeDefaultExpandAll
            onChange={onChange}
        >
        <TreeNode value="parent 1" title="parent 1" key="0-1">
            <TreeNode value="parent 1-0" title="parent 1-0" key="0-1-1">
                <TreeNode value="leaf1" title="my leaf" key="random" />
                <TreeNode value="leaf2" title="your leaf" key="random1" />
            </TreeNode>
            <TreeNode value="parent 1-1" title="parent 1-1" key="random2">
                <TreeNode value="sss" title={<b style={{ color: '#08c' }}>sss</b>} key="random3" />
            </TreeNode>
            </TreeNode>
        </TreeSelect>
    );
}
export default TestTreeSelect;

