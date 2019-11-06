import React from 'react';
import styles from './image.less';

import {VtxImage} from 'vtx-ui';
const {VtxImageViewer} = VtxImage;

const imgs = [
    {id: './resources/images/1.jpg', name: '1.jpg'},
    {id: './resources/images/2.jpg', name: '2.jpg'},
];

class Demo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            photo: {},
            visible1: false,
            index: 0
        };

        this.view = this.view.bind(this);
        this.close = this.close.bind(this);
        this.viewGallery = this.viewGallery.bind(this);
        this.closeGallery = this.closeGallery.bind(this);
        this.onIndexChange = this.onIndexChange.bind(this);
    }

    view(photo) {
        this.setState({
            photo,
            visible: true
        })
    }

    close() {
        this.setState({
            photo: {},
            visible: false
        })
    }

    viewGallery(index) {
        this.setState({
            index,
            visible1: true
        })
    } 

    closeGallery() {
        this.setState({
            visible1: false
        })
    }

    onIndexChange(index) {
        console.log(index)
    }

    render() {

        let { visible, photo, visible1, index } = this.state;

        return (
            <div className={styles.page}>
                <div className={styles.markdown}>
                    <h1>单张图片</h1>
                    <VtxImage src={imgs[0].id} onClick={() => this.view(imgs[0])} alt={imgs[0].name} className={styles.img}/>
                    <div className="imgItem">
                        <VtxImage src={imgs[1].id} thumb onClick={() => this.view(imgs[1])} alt={imgs[1].name} />
                    </div>
                    <h1>多张图片</h1>
                    {
                        imgs.map((item, index) => (
                            <img key={item.id} src={item.id} alt={item.name} onClick={() => this.viewGallery(index)} className="img"/>
                        ))
                    }
                    <h1>API</h1>
                    <h4>基于 viewerjs</h4>
                    <a href="https://github.com/fengyuanchen/viewerjs">https://github.com/fengyuanchen/viewerjs</a>
                    
                </div>
                <VtxImageViewer 
                    visible={visible}
                    onClose={this.close} 
                    photo={photo}
                    prefix=""
                />
                <VtxImageViewer 
                    visible={visible1} 
                    photo={imgs}
                    index={index}
                    prefix=""
                    onClose={this.closeGallery} 
                    onIndexChange={this.onIndexChange}
                />
            </div> 
        )
    }
}

export default Demo;
