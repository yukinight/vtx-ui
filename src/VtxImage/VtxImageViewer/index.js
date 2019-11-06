import React from 'react';

import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import { 
	checkMode, 
	VIEWER, 
	GALLERY, 
} from './-internal';

import { isObject, isFunction } from './util';

class ImageViewer extends React.Component {

	/**
	 * props
	 * visible {[Boolean]}  [是否显示]
	 * photo   {[Object || Array]}  [图片]  {id: '', name: ''} || [{id: '', name: ''}]
	 * index   {[Number]} photo [图片下标 用于多张图片展示，从 0 开始] 
	 * options {[Object]} [viewerjs 配置项]
	 */
	constructor(props) {
		super(props);

		this.state = {}

		// 选项
		// 详细参考 https://github.com/fengyuanchen/viewerjs#options
		this.options = {
			button: true, // 显示右上角关闭按钮
			navbar: false, // 显示缩略图导航
			title: true, // 显示当前图片的标题（现实 alt 属性及图片尺寸）
			toolbar: true, // 是否显示工具栏 
			tooltip: true, // 显示缩放百分比
			movable: true, // 图片是否可移动
			zoomable: true, // 图片是否可缩放
			rotatable: true, // 图片是否可旋转
			scalable: true, // 图片是否可翻转
			transition: true, // 使用 CSS3 过度
			...props.options,
		};

		this.view = this.view.bind(this);

		this.container = document.createElement('div');
		this.viewer = new Viewer(this.container, {
			// 关闭后
			hidden() {
				if('onClose' in props && isFunction(props.onClose)) {
					props.onClose();
				}
			},
			view(e) {
				if('onIndexChange' in props && isFunction(props.onIndexChange)) {
					// 图片下标变更
					props.onIndexChange(e.detail.index);
				}
			},
			...this.options
		})
	}

    componentWillUpdate(nextProps, nextState) {
    	// visible 为true时
    	if (nextProps.visible && !isEqual(this.props.visible, nextProps.visible)) {
			this.view(nextProps);
		}
    }

    view(props) {
		const _t = this;
		// 若容器中已存在子元素，则清空
		if (this.container.childNodes.length > 0) {
			this.container.innerHTML = '';
		}

		let { photo = {}, index = 0 } = props;
		const mode = checkMode(photo);
		let newPhoto = cloneDeep(photo);

		// 单张
		if (mode === VIEWER) {
			index = 0;
			newPhoto = isObject(newPhoto) ? newPhoto : newPhoto[0];

			const imgElem = document.createElement('img');
			imgElem.src = newPhoto.id;
			imgElem.alt = newPhoto.name;

			this.container.append(imgElem);
		}

		// 多张
		if (mode === GALLERY) {
			let len = newPhoto.length - 1;
			index = index < 0 ? 0 : index;
			index = index > len ? len : index;

			const ulElem = document.createElement('ul');
			newPhoto.map(item => {
				const liElem = document.createElement('li');
				const imgElem = document.createElement('img');
				imgElem.src = item.id;
				imgElem.alt = item.name;
				liElem.append(imgElem);
				ulElem.append(liElem);
			})

			this.container.append(ulElem);
		}
		
		this.viewer.update();
        this.viewer.view(index);
    }

	render() {
		return null;
	}

	componentWillUnmount() {
    	// 销毁
		this.viewer && this.viewer.destroy();
    }
}

export default ImageViewer;