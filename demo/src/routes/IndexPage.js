import React from 'react';
import { connect } from 'dva';
import styles from './IndexPage.css';
import {Link} from 'dva/router';

function IndexPage() {

    return (
        <div className={styles.normal}>
            <ul>
                <li><Link to='/tree'>树</Link></li>
                <li><Link to='/ztree'>高性能树</Link></li>
                <li><Link to='/treeselect'>下拉树</Link></li>
                <li><Link to='/datagrid'>表格</Link></li>
                <li><Link to='/map'>地图</Link></li>
                <li><Link to='/mapplayer'>地图播放</Link></li>
                <li><Link to='/optmap'>网格地图(点位过滤)</Link></li>
                <li><Link to='/searchmap'>弹框地图</Link></li>
                <li><Link to='/date'>日期控件</Link></li>
                <li><Link to='/grid'>CRUD头部查询条件</Link></li>
                <li><Link to='/combogrid'>下拉表格</Link></li>
                <li><Link to='/modal'>弹框</Link></li>
                <li><Link to='/upload'>上传</Link></li>
                <li><Link to='/import'>导入</Link></li>
                <li><Link to='/export'>导出</Link></li>
            </ul>
        </div>
    );
}

export default connect()(IndexPage);
