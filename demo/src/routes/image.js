import React from 'react';
import styles from './image.less';

import {VtxImage} from 'vtx-ui';

import { Input } from 'antd';

const IMAGE_1 = "./resources/images/1.jpg";
const IMAGE_2 = "./resources/images/2.jpg";
const ERROR_IMAGE = "./resources/images/error.jpg";
const EMPTY_IMAGE = "./resources/images/placeholder.png";

class ImageTest extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            src: '',
            defalutSrc: EMPTY_IMAGE,
            errorSrc: ERROR_IMAGE
        }
    }

    changeText = (e, action) => {
        this.setState({
            [action]: e.target.value
        })
    }

    render() {

        const { src, defalutSrc, errorSrc } = this.state;

        return (
            <div className={styles.page}>
                <div className={styles.markdown}>
                    <h2>测试</h2>
                    <div style={{padding: 10}}>
                        src: <Input style={{width: 200}} onChange={(e) => this.changeText(e, 'src')}/>
                        emptyImageSrc: <Input style={{width: 200}} defaultValue={defalutSrc}/>
                        errorImageSrc: <Input style={{width: 200}} defaultValue={errorSrc}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage src={src}  thumb={{allowView: true}} alt="花" emptyText="出错辣" errorImageSrc={ERROR_IMAGE}/>
                    </div>
                    <h2>默认展示</h2>
                    <div className={styles.item}>
                        <VtxImage src={IMAGE_1} style={{width: '100%', height: '100%'}} alt="花"/>
                    </div>
                    <pre>
                        {`<VtxImage src={IMAGE_1} style={{width: '100%', height: '100%'}} alt="花"/>`}
                    </pre>
                    <h2>缩略图模式</h2>
                    <div className={styles.item}>
                        <VtxImage src={IMAGE_1} thumb/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage src={IMAGE_1} thumb={{backgroundColor: '#5a5a5a'}}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage src={IMAGE_1} thumb={{allowView: true}}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage src={IMAGE_1} thumb={{allowView: true, viewer: {photo: {id: './resources/images/2.jpg', name: '2'}}}}/>
                    </div>
                    <pre>
                        <p>{`<VtxImage src={IMAGE_1} thumb/>`}</p>
                        <p>{`<VtxImage src={IMAGE_1} thumb={{backgroundColor: '#5a5a5a'}}/>`}</p>
                        <p>{`<VtxImage src={IMAGE_1} thumb={{allowView: true}}/>`}</p>
                        <p>{`<VtxImage src={IMAGE_1} thumb={{allowView: true, viewer: {photo: {id: './resources/images/2.jpg', name: '2'}}}}/>`}</p>
                    </pre>
                    <h2>src 为空</h2>
                    <div className={styles.item}>
                        <VtxImage style={{width: '100%', height: '100%'}}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage 
                            emptyImageSrc={EMPTY_IMAGE}
                            errorImageSrc={ERROR_IMAGE}
                            thumb={{backgroundColor: '#fff'}}
                        />
                    </div>
                    <pre>
                        <p>{`<VtxImage style={{width: '100%', height: '100%'}}/>`}</p>
                        <p>{`<VtxImage emptyImageSrc="./resources/images/placeholder.jpg" errorImageSrc="./resources/images/error.jpg" thumb={{backgroundColor: '#fff'}}/>`}</p>
                    </pre>
                    <h2>src 资源有问题</h2>
                    <div className={styles.item}>
                        <VtxImage src="./resources/images/3.jpg" style={{width: '100%', height: '100%'}}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage src="./resources/images/3.jpg" errorImageSrc={ERROR_IMAGE} style={{width: '100%', height: '100%'}}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage src="./resources/images/3.jpg" thumb errorImageSrc={ERROR_IMAGE}/>
                    </div>
                    <pre>
                        <p>{`<VtxImage src="./resources/images/3.jpg" style={{width: '100%', height: '100%'}}/>`}</p>
                        <p>{`<VtxImage src="./resources/images/3.jpg" errorImageSrc="./resources/images/error.jpg" style={{width: '100%', height: '100%'}}/>`}</p>
                        <p>{`<VtxImage src="./resources/images/3.jpg" thumb errorImageSrc="./resources/images/error.jpg"/>`}</p>
                    </pre>
                    <h2>全局配置 errorImageSrc 和 emptyImageSrc</h2>
                    <div className={styles.item}>
                        <VtxImage style={{width: '100%', height: '100%'}}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage style={{width: '100%', height: '100%'}} emptyImageSrc={IMAGE_1}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage src="./resources/images/3.jpg" style={{width: '100%', height: '100%'}}/>
                    </div>
                    <div className={styles.item}>
                        <VtxImage src="./resources/images/3.jpg" errorImageSrc={IMAGE_2} style={{width: '100%', height: '100%'}}/>
                    </div>
                    <pre>
                        <p>{`VtxImage.config({`}</p>
                        <p>{`    emptyImageSrc: EMPTY_IMAGE,`}</p>
                        <p>{`    errorImageSrc: ERROR_IMAGE,`}</p>
                        <p>{`})`}</p>
                        <br/>
                        <p>{`<VtxImage style={{width: '100%', height: '100%'}}/>`}</p>
                        <p>{`<VtxImage style={{width: '100%', height: '100%'}} emptyImageSrc={IMAGE_1}/>`}</p>
                        <p>{`<VtxImage src="./resources/images/3.jpg" style={{width: '100%', height: '100%'}}/>`}</p>
                        <p>{`<VtxImage src="./resources/images/3.jpg" errorImageSrc={IMAGE_2} style={{width: '100%', height: '100%'}}/>`}</p>
                    </pre>
                </div>
            </div>
        );
    }
}

export default ImageTest;
