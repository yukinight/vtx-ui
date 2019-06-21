/* 
地图实例：@map
需要播放的点位数组：@path --- [{longitude,latitude,name,id}]

播放速度：@speed  ---  Number
播放倍率：@playRate,
点位设置：@pointSetting,
线设置：@lineSetting,
是否开启图标自动旋转：@enableRotation,
点位变化事件：@onChange
setSpeed
setCurrentIndex
play
pause
stop
destroy
*/
export default class MapPlayer{
    constructor({map,path,speed,playRate,pointSetting,lineSetting,enableRotation,mapMove,onChange}){
        this.map = map; //地图实例
        this.path = path||[]; //点位数组
        this.speed = speed||12;//点位移动速度，m/s
        this.playFrame = 24; //播放帧率
        this.playRate = playRate||1; //播放速率
        this.enableRotation = enableRotation||false; //是否开启图标自动旋转
        this.mapMove = mapMove||false; //地图是否跟随播放点位移动
        this.pointSetting = pointSetting||{
            config:{
                width:30,
                height:30,            
                markerContentX:-15,
                markerContentY:-15,                
            }
        }
        this.lineSetting = lineSetting||{lineWidth:3,color:'blue'}; //线的样式配置
        this.onChange = onChange;
        
        const uniqueID = `${new Date().valueOf()}_${parseInt(Math.random()*100000000)}`;
        this._pointId = `point_${uniqueID}`;
        this._lineId = `line_${uniqueID}`;
        this._currentIndex = 0; //当前播放的点位序号
        this._supplementPoints = [];//补点列表
        this._currentSupplementIndex = 0;//当前补点序号
        this._timer = null; //播放定时器
        this.map.loadMapComplete.then(()=>{
            this._redraw();
        })
        
    }
    // 根据当前数据重新渲染点和线的图形
    _redraw(){
        if(this.path.length==0 ){
            this.map.GM.isRepetition(this._pointId) && this.map.removeGraphic(this._pointId);
            this.map.GM.isRepetition(this._lineId) && this.map.removeGraphic(this._lineId);
            return;
        }
        if(this._currentIndex < this.path.length){
            // 画点
            let currentPoint;
            if(this._currentIndex==this.path.length-1 || this._supplementPoints.length==0){
                currentPoint = this.path[this._currentIndex];
            }
            else{
                currentPoint = this._supplementPoints[this._currentSupplementIndex];
            }
            let pointObj = {
                ...currentPoint,
                id: this._pointId,
                latitude:currentPoint.latitude,
                longitude:currentPoint.longitude,
                ...this.pointSetting,
                config:{
                    ...(this.pointSetting.config||{}),
                    labelContent:currentPoint.name||'',
                }
            }
            if(this.enableRotation){
                const deg = this._currentIndex+1<this.path.length?this._getIconAngle({
                    x:this.path[this._currentIndex].longitude,
                    y:this.path[this._currentIndex].latitude,
                },{
                    x:this.path[this._currentIndex+1].longitude,
                    y:this.path[this._currentIndex+1].latitude
                }):0;
                pointObj.config.deg = deg;
            }
            
            if(this.map.GM.isRepetition(this._pointId)){
                this.map.updatePoint([pointObj]);
                this.mapMove && this.map.setCenter([pointObj.longitude,pointObj.latitude]);
            }
            else{
                this.map.addPoint([pointObj],'defined');
            }
            // 画线
            let paths = [];
            for(let i=0; i<=this._currentIndex; i++){
                paths.push([this.path[i].longitude,this.path[i].latitude]);
            }
            
            if(this._supplementPoints.length>0){
                for(let i=0;i<=this._currentSupplementIndex;i++){
                    paths.push([this._supplementPoints[i].longitude,this._supplementPoints[i].latitude])
                }
            }
            if(paths.length>1){
                const lineObj = {
                    id:this._lineId,
                    paths,
                    config:this.lineSetting
                }
                if(this.map.GM.isRepetition(this._lineId)){
                    this.map.updateLine([lineObj]);
                }
                else{
                    this.map.addLine([lineObj],'defined');
                }
            }
            else{
                if(this.map.GM.isRepetition(this._lineId)){
                    this.map.removeGraphic(this._lineId);
                } 
            } 
        }
    }
    _clearTimer(){
        if(this._timer){
            clearTimeout(this._timer);
            this._timer = null;
        }
    }
    // 计算图标转动角度（仅适用于当前车辆图标，仅适用于中国区域）
    _getIconAngle(start,end){
        const diff_x = end.x - start.x,
            diff_y = end.y - start.y;
        // 1,4象限夹脚计算
        const ag = 360*Math.atan(diff_y/diff_x)/(2*Math.PI);
        // 地图夹角偏转计算
        if(diff_x==0){
            if(diff_y>0){
                return -90;
            }
            else if(diff_y<0){
                return 90;
            }
            else{
                return 0;
            }
        }
        // 坐标系1,4象限
        else if(diff_x>0){
            return -ag;
        }
        // 坐标系2,3象限
        else{
            return 180 - ag;
        }
    }
    // 根据两点生成补点列表
    _generateSupplyPoints(p1,p2){
        const {longitude:currentLng, latitude:currentLat} = p1;
        const {longitude:nextLng, latitude:nextLat} = p2;
        const runTime = this.map.calculateDistance([
            [currentLng,currentLat],
            [nextLng,nextLat]
        ])/(this.speed*this.playRate);
        //不需要补点    
        if(runTime<=1/this.playFrame){
            return [];
        }
        // 需要补点
        else{
            const supplementNum = Math.ceil(runTime/(1/this.playFrame))-1;
            const lng_spacing = (nextLng - currentLng)/(supplementNum+1);
            const lat_spacing = (nextLat - currentLat)/(supplementNum+1);
            let supplementPoints = [];
            for(let i=1;i<=supplementNum;i++){
                supplementPoints.push({
                    ...this.path[this._currentIndex],
                    longitude:currentLng+lng_spacing*i,
                    latitude:currentLat+lat_spacing*i,
                });
            }
            return supplementPoints;
        }
    }
    // 开始播放
    play(){
        this._clearTimer();
        if(this.path.length==0 || this._currentIndex==this.path.length-1){
            return;
        };
        // 当前处于补点播放
        if(this._supplementPoints.length>0){
            this._timer = setTimeout(()=>{
                if(this._currentSupplementIndex<this._supplementPoints.length-1){
                    this._currentSupplementIndex = this._currentSupplementIndex+1;
                }
                else{
                    this._currentSupplementIndex = 0;
                    this._supplementPoints = [];
                    this._currentIndex = this._currentIndex+1;
                    typeof this.onChange=='function' && this.onChange(this.path[this._currentIndex],this._currentIndex);
                }
                this._redraw();
                this.play();
            },1000/this.playFrame);
        }
        // 当前处于非补点播放
        else{
            const spPoints = this._generateSupplyPoints(this.path[this._currentIndex],this.path[this._currentIndex+1]);
            //不需要补点    
            if(spPoints.length==0){
                this._timer = setTimeout(()=>{
                    this._currentIndex = this._currentIndex+1;
                    typeof this.onChange=='function' && this.onChange(this.path[this._currentIndex],this._currentIndex);
                    this._redraw();
                    this.play();
                },runTime*1000);
            }
            // 需要补点
            else{
                this._timer = setTimeout(()=>{
                    this._currentSupplementIndex = 0;
                    this._supplementPoints = spPoints;
                    this._redraw();
                    this.play();
                },1000/this.playFrame);
            }
        }   
    }
    // 暂停播放
    pause(onPlayPause){
        this._clearTimer();
        typeof onPlayPause == "function" && onPlayPause(this.path[this._currentIndex],this._currentIndex);
    }
    // 停止播放（回到初始点位）
    stop(){
        this._clearTimer();
        this._currentIndex = 0;
        this._supplementPoints = [];
        this._currentSupplementIndex = 0;
        this._redraw();
        // typeof this.onChange == "function" && this.onChange(this.path[0],0);
    }
    // 销毁（删除所有添加的图层）
    destroy(){
        this._clearTimer();
        this.map.removeGraphic(this._pointId);
        this.map.removeGraphic(this._lineId);
        this._currentIndex = 0;
        this._supplementPoints = [];
        this._currentSupplementIndex = 0;
    }
    // 设置速度
    setPlayRate(newPlayRate){
        this.playRate = newPlayRate;
        //如果当前处于补点状态，重新生成新的补点
        if(this._supplementPoints.length>0){
            const newSpPoints = this._generateSupplyPoints(this._supplementPoints[this._currentSupplementIndex],this.path[this._currentIndex+1]);
            this._supplementPoints = [...this._supplementPoints.slice(0,this._currentSupplementIndex+1),...newSpPoints];
        }
    }
    // 设置当前播放点位的位置
    setCurrentIndex(pIndex){
        if(pIndex >= this.path.length)return;
        
        this._currentIndex = pIndex;
        this._supplementPoints = [];
        this._currentSupplementIndex = 0;
        // typeof this.onChange == "function" && this.onChange(this.path[pIndex],pIndex);
        this._redraw();
        if(this._timer){
            this._clearTimer();
            this.play();
        }
    }
    // 重新设置播放路线
    setPath(newPath){
        this.path = newPath;
        this._currentIndex = 0;
        this._supplementPoints = [];
        this._currentSupplementIndex = 0;
        this._redraw();
        if(this._timer){
            this._clearTimer();
            this.play();
        }
    }
}