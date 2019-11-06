import React from 'react';
import './index.css';

import isEqual from 'lodash/isEqual';
import classnames from 'classnames';

import ImageViewer from '../VtxImageViewer';

import { 
	getComponentProps, 
} from './util';

let defaultEmptyImageSrc = '';
let defaultErrorImageSrc = '';
let defaultEmptyText = '暂无图片';
let defaultErrorText = '图片出错';

class ImageCustom extends React.Component{

	static defaultProps = {
		prefixCls: 'vtx-image',
		thumb: false, // 缩略图模式
	}

	constructor(props){
		super(props);
        this.state = {
			loadError: false, // 图片是否加载失败
			emptyError:false, // 空白图片是否加载失败
			errorError: false, // 报错图片是否加载失败
			viewerVisible: false, // 是否查看
		}

		this.emptyImageSrc = props.emptyImageSrc || defaultEmptyImageSrc;
		this.errorImageSrc = props.errorImageSrc || defaultErrorImageSrc;
		
		// 缩略图
		this.hasThumb = !!props.thumb;

		this.renderImgNode = this.renderImgNode.bind(this);
		this.onImgClick = this.onImgClick.bind(this);
		this.renderImageViewer = this.renderImageViewer.bind(this);
		this.onViewerClose = this.onViewerClose.bind(this);
    }

	componentWillReceiveProps(nextProps) {
		const nextSrc = nextProps.src;
		if (!isEqual(this.props.src, nextSrc)) {
			this.setState({
				loadError: false,
			})
		}
	}

	// 图片点击
	onImgClick() {
		this.setState({
			viewerVisible: true,
		})
		// 回调
		if (typeof this.props.onClick == 'function') {
			this.props.onClick();
		}
	}
	
	// 关闭画廊
	onViewerClose() {
		this.setState({
			viewerVisible: false,
		})
	}

	// 查看
	renderImageViewer({allowView, viewer}) {
		if (!allowView) {
			return null;
		}
		const { src, title, alt } = this.props;
		const { photo } = getComponentProps(viewer);
		let newPhoto = photo;

		// 若未配置photo，则默认使用Iamge src展示
		if (!photo) {
			newPhoto = {id: src, name: title || alt};
		}
		return (
			<ImageViewer 
				photo={newPhoto}
				{...viewer}
				visible={this.state.viewerVisible}
				onClose={this.onViewerClose}
			/>
		)
	}

	renderImgNode() {
		const { 
			prefixCls, thumb,
			className, style, alt, src,
			emptyText = defaultEmptyText, errorText = defaultErrorText,
			onClick, 
		} = this.props;

		let imgProps = {
			src,
			className,
			style,
			alt,
			onClick,
		};

		// 无图片
		if (!src ) {
			//有替代图片
			if(this.emptyImageSrc && !this.state.emptyError){
				imgProps.src = this.emptyImageSrc;
				imgProps.onError = ()=>{
					this.setState({emptyError:true})
				}
			}else{// 没有替代图片或替代图片无法加载
				return (
					<div className={`${prefixCls}-nodata`} style={style}>
						<p>{emptyText}</p>
					</div>
				)
			}
		}

		// 无法加载图片时记录图片地址方便跟踪
		if(this.state.loadError){
			// 加载报错图片
			if(this.errorImageSrc && !this.state.errorError){
				imgProps['data-error-img'] =  src;
				imgProps.src = this.errorImageSrc;
				imgProps.onError = ()=>{
					this.setState({errorError:true})
				}
			}else{
				// 无法加载报错图片
				return (
					<div className={`${prefixCls}-error`} style={style} data-error-img={src}>
						<p>{errorText}</p>
					</div>
				)
			}
		}else{
			imgProps.onError = ()=>{
				this.setState({
					loadError: true,
				});
			};
		}
		

		// 缩略图模式 | 此模式下支持放大查看
		if (this.hasThumb) {
			const { 
				backgroundColor, // 背景色
				allowView = false, // 是否允许点击
				viewer = {},
			} = getComponentProps(thumb);

			// class
			const thumbCls = classnames(`${prefixCls}-thumb`, {
				[`${prefixCls}-view`]: allowView,
			});
			// 允许查看
			if (allowView) {
				imgProps.onClick = this.onImgClick;
			}
			return (
				<div className={thumbCls} style={backgroundColor?{ backgroundColor}:null}>
					<img {...imgProps}/>
					{this.renderImageViewer({allowView, viewer})}
				</div>
			)
		}

		return <img {...imgProps}/>;
	}

	render() {
		return this.renderImgNode();
	}

}

function setImageConfig(options) {
	const { emptyImageSrc, errorImageSrc, emptyText, errorText } = options;
	if (emptyImageSrc !== undefined) {
		defaultEmptyImageSrc = emptyImageSrc;
	}
	if (errorImageSrc !== undefined) {
		defaultErrorImageSrc = errorImageSrc;
	}
	if (emptyText !== undefined) {
		defaultEmptyText = emptyText;
	}
	if (errorText !== undefined) {
		defaultErrorText = errorText;
	}
}

ImageCustom.config = setImageConfig;

export default ImageCustom;