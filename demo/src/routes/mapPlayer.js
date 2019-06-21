import React from 'react';
import {VtxMap} from 'vtx-ui';
const MapPlayer = VtxMap.MapPlayer;

export default class Player extends React.Component{
    constructor(props){
        super(props);
    }
    componentDidMount(){
        this.mapPlayer = new MapPlayer({
            map:this.map,
            speed:80,
            playRate:10,
            path:[
                {longitude:117.468021,latitude:38.890092,id:'42342gd',url:'./resources/images/03.png'},
                {longitude:117.488021,latitude:38.950092,id:'4234fds2gd',url:'./resources/images/03.png'},
                {longitude:117.478021,latitude:38.860092,id:'42fsf342gd',url:'./resources/images/03.png'},
            ],
            // lineSetting:{lineWidth:5,color:'red'},
            // enableRotation:true,
            // mapMove:true,
            onChange:(p,index)=>{
                console.log(p,index)
            },
        });
    }
    render(){
        return <div>
            <div>
                <button onClick={()=>{
                    this.mapPlayer.play()
                }}>播放</button>
                <button onClick={()=>{
                    this.mapPlayer.pause((p,index)=>console.log(p,index))
                }}>暂停</button>
                <button onClick={()=>{
                    this.mapPlayer.stop()
                }}>停止</button>
                <button onClick={()=>{
                    this.mapPlayer.setPlayRate(3)
                }}>播放速度变慢</button>
                <button onClick={()=>{
                    this.mapPlayer.setPlayRate(30)
                }}>播放速度变快</button>
                <button onClick={()=>{
                    this.mapPlayer.setCurrentIndex(1)
                }}>跳转第2个点位</button>
                <button onClick={()=>{
                    this.mapPlayer.setPath([
                        {longitude:115.468021,latitude:36.890092,id:'fhdsas'},
                        {longitude:115.488021,latitude:36.950092,id:'jyj5'},
                        {longitude:115.478021,latitude:36.860092,id:'dfsfr'},
                    ])
                }}>新路线</button>
                <button onClick={()=>{
                    this.mapPlayer.destroy()
                }}>销毁</button>
            </div>
            <div style={{height:'500px'}}>
                <VtxMap 
                getMapInstance={(m)=>{
                    this.map=m;
                }}
                mapId={'dsd'}
                mapType={'bmap'}
                />
            </div>
        </div>
    }
}