if (!Array.remove) {
	Array.prototype.remove = function(dx) {
		if (isNaN(dx) || dx > this.length) {
			return false;
		}
		for (var i = 0, n = 0; i < this.length; i++) {
			if (this[i] != this[dx]) {
				this[n++] = this[i];
			}
		}
		this.length -= 1;
	};
}

function VortexBMap(config) {
	config = config || {};
	this.morepoints=[];
	this.map = null;
	this._cluster = null;
	this.toolbar = null;// 地图绘制图形工具
	this.editToolbar = null;// 地图修改图形工具
	this.parameter;// 绘制图形参数
	this.attributes = null;
	this.initData = config.initData;// 初始化图标数据
	this.flag = true;
	this.graphicId = null;
	this.drawFlag = true;
	this.repository = [];
	this.idRepository = [];
	this.realIdRepository = [];
	this.editId = null;
	this.editEvent = null;
	this._vortexInfoBox = null;
	this.drawType = null;
	this.graphicType = [];
	this.mapLayerMaps = null;// 地图上所有图元
	this.mouseTool = null; //绘制图元方法对象
	this.heatmap = null; //热力图
	this.events = {
		clickGraphic : new Event(),// 点击图形事件
		clickMap : new Event(),// 点击地图事件
		dragMap : new Event(),// 拖动地图事件
		dragMapStart : new Event(),// 拖动地图开始事件
		dragMapEnd : new Event(),// 拖动地图结束事件
		moveStart: new Event(),
		moveEnd: new Event(),
		mapOnLoad : new Event(),// 地图加载完成事件
		onMouseOverMap : new Event(),// 当鼠标在地图上事件
		drawEnd : new Event(),// 绘制图形结束事件
		graphicVortexChange : new Event(),// 修改图形某点发生改变事件（修改线）
		editGraphicClick : new Event(),// 修改图形时点击图形事件（与不修改图形时的点击图形事件完全分离,需要区分）
		editGraphicMoveStart : new Event(),// 修改图形移动开始事件
		editGraphicMoveEnd : new Event(),// 修改图形时移动图形结束事件
		MouseOutGraphic : new Event(),// 鼠标移出图形
		MouseOverGraphic : new Event(),// 鼠标移动图形上方
		LayersAddResult : new Event(),
		onGraphicAdd : new Event(),
		zoomStart: new Event(), //地图更改缩放级别开始时触发触发此事件
		zoomEnd : new Event(), //地图更改缩放级别结束时触发触发此事件
		clickPointCollection: new Event() //点击海量点事件
	// 缩放地图结束时触发事件
	};
	// 地图默认参数
	VortexBMap.defaults = {
		center : [ gisMapConstant.defaultMapLon, gisMapConstant.defaultMapLat ],
		zoom : gisMapConstant.defaultMapZoom,
		satelliteSwitch : gisMapConstant.satelliteSwitch
	};
	// 通过config传入值覆盖默认值,如有config为空则保持默认参数
	config = $.extend(true, {}, VortexBMap.defaults, config);
	this.options = config;
	function getAttributes(id, t) {
		for (var i = 0; i < t.repository.length; i++) {
			if (t.repository[i].id == id) {
				return t.repository[i];
			}
		}
		return 0;
	}
	;
	this.getAttributes = function(id) {
		var t = this;
		return getAttributes(id, t);
	};
}
VortexBMap.prototype = {
	createMap : function(mapDIV,options) {
		var t = this;
		// var defaultOptions = {
		// 	enableMapClick : false
		// }
		// defaultOptions = $.extend(true, {}, defaultOptions, options);
		// // 创建Map实例
		// t.map = new BMap.Map(mapDIV,defaultOptions);
		t.map = mapDIV;
		// 初始化地图,设置中心点坐标和地图级别
		// var _position = new BMap.Point(parseFloat(t.options.center[0]),
		// 		parseFloat(t.options.center[1]));
		// t.map.centerAndZoom(_position, parseInt(t.options.zoom, 10));
		// t.map.enableScrollWheelZoom(); // 开启鼠标滚轮缩放
		// if (t.options.satelliteSwitch) {
		// 	var vortex_mapType = new BMap.MapTypeControl({
		// 		mapTypes : [ BMAP_NORMAL_MAP, BMAP_HYBRID_MAP ]
		// 	});
		// 	t.map.addControl(vortex_mapType);
		// }
		// 地图加载完成事件
		t.map.addEventListener("tilesloaded", function(event) {
			t.events.mapOnLoad.sender = t.map;
			t.events.mapOnLoad.notify();
		});

		// 点击地图事件
		t.map.addEventListener("click", function(event) {
			t.map.eventX = event.point.lng;
			t.map.eventY = event.point.lat;
			t.events.clickMap.sender = t.map;
			t.events.clickMap.notify(event);
		});
		// 拖动地图事件
		t.map.addEventListener("dragging", function(event) {
			t.events.dragMap.sender = t.map;
			t.events.dragMap.notify();
		});
		// 拖动地图开始事件
		t.map.addEventListener("dragstart", function(event) {
			t.events.dragMapStart.sender = t.map;
			t.events.dragMapStart.notify(event);
		});
		// 拖动地图结束事件
		t.map.addEventListener("dragend", function(event) {
			t.events.dragMapEnd.sender = t.map;
			t.events.dragMapEnd.notify(event);
		});
		t.map.addEventListener("movestart", function(event) {
			t.events.moveStart.sender = t.map;
			t.events.moveStart.notify(event);
		});
		t.map.addEventListener("moveend", function(event) {
			t.events.moveEnd.sender = t.map;
			t.events.moveEnd.notify(event);
		});
		// 当鼠标在地图上事件
		t.map.addEventListener("mouseover", function(event) {
			t.events.onMouseOverMap.sender = t.map;
			t.events.onMouseOverMap.notify(event);
		});
		// 缩放地图结束时触发事件
		t.map.addEventListener("zoomend", function(event) {
			$('.vtxAnimation').css('transition-property','top,left');
			t.events.zoomEnd.sender = t.map;
			t.events.zoomEnd.notify(event);
		});
		// 缩放地图开始时触发事件
		t.map.addEventListener("zoomstart", function(event) {
			$('.vtxAnimation').css('transition-property','none');
			t.events.zoomStart.sender = t.map;
			t.events.zoomStart.notify(event);
		});
		// 初始化地图图元Map
		t.mapLayerMaps = MapUtil.getInstance();
	},
	addData : function(data) {
		this.initData = data;
	},
	/*
	 * 添加弹出框方法
	 */
	addInfoWindow : function(src, title, content) {
		var t = this;
		t.closeInfoWindow();
		var infoLngLat;
		switch (src.geometryType) {
		case MapConstants.pelType.POINT:
			infoLngLat = [ parseFloat(src.attributes.longitude),
					parseFloat(src.attributes.latitude) ];
			break;
		case MapConstants.pelType.POLYLINE:
		case MapConstants.pelType.POLYGON:
			var points = src.mapLayer.getPath();
			var index = Math.ceil(points.length / 2);
			var infoPoint = points[index];
			infoLngLat = [ parseFloat(infoPoint.lng), parseFloat(infoPoint.lat) ];
			break;
		default:
			break;
		}
		var nowTipWidth = t.options.tipWidth;
		var nowTipHeight = t.options.tipHeight;
		if (src.attributes.config && src.attributes.config.tipWidth
				&& src.attributes.config.tipHeight) {
			nowTipWidth = src.attributes.config.tipWidth;
			nowTipHeight = src.attributes.config.tipHeight;
		}
		var _vortexTipHtml = "<div id='_vortexMapTip' style='position: absolute;z-index:10;width:"
				+ nowTipWidth + ";height:" + nowTipHeight + ";'>";
		if (title != "") {
			_vortexTipHtml = _vortexTipHtml + title;
		}
		if (content != "") {
			_vortexTipHtml = _vortexTipHtml + content;
		}
		_vortexTipHtml = _vortexTipHtml + "</div>";
		var infoBox = new BMapLib.InfoBox(t.map, _vortexTipHtml, {
			boxStyle : {
				cursor : "default"
			},
			closeIconUrl : "/vortex/gis/images/hideClose.png",
			enableAutoPan : true,
			align : INFOBOX_AT_TOP
		});
		infoBox.open(new BMap.Point(infoLngLat[0], infoLngLat[1]));
		t._vortexInfoBox = infoBox;
	},
	openInfoWindow : function(config) {
		var t = this;
		t.closeInfoWindow();
		var nowTipWidth = t.options.tipWidth;
		var nowTipHeight = t.options.tipHeight;
		if (config.tipWidth && config.tipHeight) {
			nowTipWidth = config.tipWidth;
			nowTipHeight = config.tipHeight;
		}
		if (typeof config.longitude == "string") {
			config.longitude = parseFloat(config.longitude);
		}
		if (typeof config.latitude == "string") {
			config.latitude = parseFloat(config.latitude);
		}
		var infoLngLat = [ parseFloat(config.longitude),
				parseFloat(config.latitude) ];

		var _vortexTipHtml = "<div id='_vortexMapTip' style='position: absolute;z-index:10;width:"
				+ nowTipWidth + ";height:" + nowTipHeight + ";'>";
		if (config.title != "") {
			_vortexTipHtml = _vortexTipHtml + config.title;
		}
		if (config.content != "") {
			_vortexTipHtml = _vortexTipHtml + config.content;
		}
		_vortexTipHtml = _vortexTipHtml + "</div>";
		var infoBox = new BMapLib.InfoBox(t.map, _vortexTipHtml, {
			boxStyle : {
				cursor : "default"
			},
			closeIconUrl : "/vortex/gis/images/hideClose.png",
			enableAutoPan : true,
			align : INFOBOX_AT_TOP
		});
		infoBox.open(new BMap.Point(infoLngLat[0], infoLngLat[1]));
		t._vortexInfoBox = infoBox;
	},
	// 关闭弹出框方法
	closeInfoWindow : function() {
		this.map.closeInfoWindow();
		if (null != this._vortexInfoBox) {
			this._vortexInfoBox.close();
		}
	},
	// 改变弹出框大小方法(参数缺失,不可使用)
	resizeInfoWindow : function(width, height) {
		/*
		 * var vortexInfoWindow = t.map.getInfoWindow(); if (vortexInfoWindow !=
		 * null) { vortexInfoWindow.setWidth(width);
		 * vortexInfoWindow.setHeight(height); }
		 */
	},
	/*
		添加海量点	
	*/
	addPointCollection: function (data) {
		var t = this;
		data = data || {};
		var points = [];
		data.points.map(function(d,i){
			var p = new BMap.Point(d.lng,d.lat);
			p.attributes = d;
			points.push(p);
		})
		var options = {
            size: gisMapConstant[data.size] || gisMapConstant['normal'],
            shape: gisMapConstant[data.shape] || gisMapConstant['circle'],
            color: data.color || '#d340c3'
        }
        var VotexpointCollection = new BMap.PointCollection(points, options);  // 初始化PointCollection
        var vortexObj ={
        	mapLayer: VotexpointCollection
        }
        t.map.addOverlay(VotexpointCollection);  // 添加Overlay
        t.morepoints.push({
        	id: data.id,
        	value: VotexpointCollection
        });
        VotexpointCollection.addEventListener('click', function (event) {
			t.events.clickPointCollection.sender = vortexObj;
			t.events.clickPointCollection.notify(event);
        });
	},
	updatePointCollection: function (data) {
		var t = this;
		t.morepoints.map(function (item,index) {
			if(item.id == data.id){
				var points = [];
				data.points.map(function(d,i){
					var p = new BMap.Point(d.lng,d.lat);
					p.attributes = d;
					points.push(p);
				})
				item.value.setPoints(points);
				item.value.setStyles({
					size: gisMapConstant[data.size] || gisMapConstant['normal'],
		            shape: gisMapConstant[data.shape] || gisMapConstant['circle'],
		            color: data.color || '#d340c3'
				})
			}
		})
	},
	clearPointCollection: function(id){
		var t = this;
		t.morepoints.map(function (item,index) {
			if(id == item.id){
				item.value.clear();
			}
		})
	},
	clearAllPointCollection: function () {
		var t = this;
		t.morepoints.map(function (item,index) {
			item.value.clear();
		})
	},
	/*
	 * 添加点方法
	 */
	addPoint : function(data, parameter, message) {
		var t = this;
		if (parameter == null || parameter == undefined) {
			if (data.config == null || data.config == undefined) {
				parameter = data;
			} else {
				parameter = data.config;
			}
		}
		var lng = data.longitude;
		var lat = data.latitude;
		if (typeof lng == "string") {
			lng = parseFloat(lng);
		}
		if (typeof lat == "string") {
			lat = parseFloat(lat);
		}
		if (lng == null || lat == null) {
			return;
		}
		if (lng == "" || lat == "") {
			return;
		}
		if (data.infoWindow == undefined) {
			data.infoWindow = true;
		}
		var defaults = {
			fit : false,
			width : 33,
			height : 33
		};
		var options = $.extend(true, {}, defaults, parameter);
		// var markerIconUrl = "/vortex/gis/images/defaultMarker.png";
		var markerIconUrl = "./resources/images/defaultMarker.png";
		if (data.url) {
			markerIconUrl = data.url;
		}
		var vortexPosition = new BMap.Point(lng, lat);
		var _iconSize = new BMap.Size(options.width, options.height);
		var markerIcon = new BMap.Icon(markerIconUrl, _iconSize);
		markerIcon.setSize(_iconSize);
		markerIcon.setImageSize(_iconSize);

		var vortexMarker;
		// 点标记显示内容，可以是HTML要素字符串或者HTML DOM对象。content有效时，icon属性将被覆盖
		if (data.markerContent) {
			defaults = {
				markerContentX : 0,
				markerContentY : 0
			};
			options = $.extend(true, {}, defaults, data.config);

			vortexMarker = new BMap.Label(data.markerContent);
			vortexMarker.setPosition(vortexPosition);
			vortexMarker.setOffset(new BMap.Size(options.markerContentX, options.markerContentY));
			vortexMarker.setStyle({
				backgroundColor : "0",
				border : "0"
			});

			// vortexMarker = new BMap.Marker(vortexPosition,{icon:null});
			// var labelOptions = new BMap.Label(data.markerContent);
			// labelOptions.setStyle({
			// 	border : null,
			// 	backgroundColor : null
			// });
			// vortexMarker.setLabel(labelOptions);
			// vortexMarker.setOffset(BMap.Size(12, 35))

		} else {
			defaults = {
				markerContentX : 0,
				markerContentY : 0
			};
			options = $.extend(true, {}, defaults, data.config);
			// 添加至地图
			vortexMarker = new BMap.Marker(vortexPosition, {
				icon : markerIcon,
				offset: new BMap.Size(options.markerContentX+options.width/2, options.markerContentY+options.height/2)
			});
			// 添加label
			if (data.canShowLabel && options.labelContent) {
				// label偏移量(由于用css修正，X偏转为标注起点向右偏转)
				var labelOffsetSize = null;
				if (typeof options.labelPixelX != "undefined"
						&& typeof options.labelPixelY != "undefined") {
					labelOffsetSize = new BMap.Size(options.labelPixelX,
							options.labelPixelY);
				} else {
					// 设置默认
					labelOffsetSize = new BMap.Size(12, 35);
				}
				var labelClass = 'label-content' ;
				if(data.labelClass){
					labelClass = data.labelClass.split(',').join(' ');
				}
				var labelOptions = new BMap.Label(
						"<div class='"+labelClass+"' style=\"margin-left: 0;\">"
								+ options.labelContent + "</div>", {
							offset : labelOffsetSize
						});
				labelOptions.setStyle({
					border : null,
					backgroundColor : null
				});
				// label的父div默认蓝框白底右下角显示，样式className为：amap-marker-label
				vortexMarker.setLabel(labelOptions);
			}
			if(data.config.zIndex !== null || data.config.zIndex !== undefined){
				vortexMarker.setZIndex(data.config.zIndex);
			}
			vortexMarker.setRotation(data.config.deg || 0);
		}

		// 封装对象,缓存
		var vortexObj = {
			geometryType : MapConstants.pelType.POINT,
			attributes : data,
			mapLayer : vortexMarker
		};
		if (data.id) {
			t.mapLayerMaps.add(data.id, vortexObj);
		}
		// 点击图形事件
		vortexMarker.addEventListener('click', function(event) {
			// 关闭气泡
			t.closeInfoWindow();
			// 设置其它信息
			vortexObj = t.setVortexObjOtherValue(vortexObj);
			t.events.clickGraphic.sender = vortexObj;
			t.events.clickGraphic.notify(event);
		});
		// 鼠标移出图形
		vortexMarker.addEventListener('mouseout', function(event) {
			t.events.MouseOutGraphic.sender = vortexObj;
			t.events.MouseOutGraphic.notify(event);
		});
		// 鼠标移动图形上方
		vortexMarker.addEventListener('mouseover', function(event) {
			t.events.MouseOverGraphic.sender = vortexObj;
			t.events.MouseOverGraphic.notify(event);
		});
		
		t.map.addOverlay(vortexMarker);

		if (!data.markerContent){
			if(data.config.BAnimationType == 0){
				vortexMarker.setAnimation(BMAP_ANIMATION_BOUNCE);
			}else if(data.config.BAnimationType == 1){
				vortexMarker.setAnimation(BMAP_ANIMATION_DROP);
			}
		}
		// if (options.fit == true/* || typeof options.fit == "undefined" */) {
		// 	if (data.id) {
		// 		t.setFitview([ data.id ]);
		// 	}
		// }
		// if(data.config.isAnimation){
		// 	if(t.getGraphic(data.id).mapLayer.Xc){
		// 		t.getGraphic(data.id).mapLayer.Xc.className = t.getGraphic(data.id).mapLayer.Xc.className + ' vtxAnimation';
		// 		t.getGraphic(data.id).mapLayer.Xc.style.transitionDuration= (data.config.animationDelay || 3) + "s";
		// 		t.getGraphic(data.id).mapLayer.Xc.style.transitionProperty="top,left";
		// 	}
		// }
	},
	updatePoint : function(data) {// 更新点
		var t = this;
		if (data.id) {
			var vortexObj = t.mapLayerMaps.get(data.id);
			if (undefined != vortexObj) {
				var vortexMarker = vortexObj.mapLayer;
				// var markerIconUrl = "/vortex/gis/images/defaultMarker.png";
				var markerIconUrl = "./resources/images/defaultMarker.png";
				if (data.url) {
					markerIconUrl = data.url;
				}
				var defaults = {
					width : 33,
					height : 33
				};
				var _iconSize = new BMap.Size(defaults.width, defaults.height);
				if (data.config) {
					if (data.config.width && data.config.height) {
						_iconSize = new BMap.Size(data.config.width,
								data.config.height);
					}
				}
				
				if (data.markerContent) {
					defaults = {
						markerContentX : 0,
						markerContentY : 0
					};
					options = $.extend(true, {}, defaults, data.config);
					vortexMarker.setContent(data.markerContent);
					vortexMarker.setOffset(new BMap.Size(options.markerContentX, options.markerContentY));
					vortexMarker.setStyle({
						backgroundColor : "0",
						border : "0"
					});

				} else {
					defaults = {
						markerContentX : 0,
						markerContentY : 0
					};
					options = $.extend(true, {}, defaults, data.config);
					var markerIcon = new BMap.Icon(markerIconUrl, _iconSize);
					markerIcon.setSize(_iconSize);
					markerIcon.setImageSize(_iconSize);
					vortexMarker.setIcon(markerIcon);
					vortexMarker.setOffset(new BMap.Size(options.markerContentX+options.width/2, options.markerContentY+options.height/2));

					// 添加label
					if (data.canShowLabel && data.config.labelContent) {
						// label偏移量(由于用css修正，X偏转为标注起点向右偏转)
						var labelOffsetSize = null;
						if (typeof data.config.labelPixelX != "undefined"
								&& typeof data.config.labelPixelY != "undefined") {
							labelOffsetSize = new BMap.Size(
									data.config.labelPixelX,
									data.config.labelPixelY);
						} else {
							// 设置默认
							labelOffsetSize = new BMap.Size(12, 35);
						}

						var labelOptions = vortexMarker.getLabel();
						var labelClass = 'label-content' ;
						if(data.labelClass){
							labelClass = data.labelClass.split(',').join(' ');
						}
						if (null == labelOptions) {
							labelOptions = new BMap.Label(
									"<div class='"+labelClass+"' style=\"margin-left: 0;\">"
											+ data.config.labelContent
											+ "</div>", {
										offset : labelOffsetSize
									});
						} else {
							labelOptions
									.setContent("<div class='"+labelClass+"' style=\"margin-left: 0;\">"
											+ data.config.labelContent
											+ "</div>");
							labelOptions.setOffset(labelOffsetSize);
						}

						labelOptions.setStyle({
							border : null,
							backgroundColor : null
						});
						// label的父div默认蓝框白底右下角显示，样式className为：amap-marker-label
						vortexMarker.setLabel(labelOptions);
					}
					if(data.config.zIndex !== null || data.config.zIndex !== undefined){
						vortexMarker.setZIndex(data.config.zIndex);
					}
					vortexMarker.setRotation(data.config.deg || 0);
					if(data.config.BAnimationType == 0){
						vortexMarker.setAnimation(BMAP_ANIMATION_BOUNCE);
					}else if(data.config.BAnimationType == 1){
						vortexMarker.setAnimation(BMAP_ANIMATION_DROP);
					}else{
						vortexMarker.setAnimation(null);
					}
				}


				var lng = data.longitude;
				var lat = data.latitude;
				if (lng && lat) {
					if (typeof lng == "string") {
						lng = parseFloat(lng);
					}
					if (typeof lat == "string") {
						lat = parseFloat(lat);
					}
					vortexMarker.setPosition(new BMap.Point(lng, lat));
				}
				vortexObj.attributes = $.extend(true, {}, vortexObj.attributes,
						data);
				vortexObj.mapLayer = vortexMarker;
				t.mapLayerMaps.add(data.id, vortexObj);

				if(data.config.isAnimation){
					// if(t.getGraphic(data.id).mapLayer.Xc){
					// 	t.getGraphic(data.id).mapLayer.Xc.className = t.getGraphic(data.id).mapLayer.Xc.className + ' vtxAnimation';
					// 	t.getGraphic(data.id).mapLayer.Xc.style.transitionDuration= (data.config.animationDelay || 3) + "s";
					// 	t.getGraphic(data.id).mapLayer.Xc.style.transitionProperty="top,left";
					// }
					var doms = t.map.getPanes().markerPane.children;
					for(var ii = 0 ; ii < doms.length ; ii++){
						if(doms[ii].className.indexOf('vtxAnimation') == -1){
							doms[ii].className = doms[ii].className + ' vtxAnimation';
						}
						doms[ii].style.transitionDuration= (data.config.animationDelay || 3) + "s";
						doms[ii].style.transitionProperty="top,left";
						doms[ii].style.transitionTimingFunction="linear";
					}
				}
			}
		}
	},
	/*
	 * 添加多个点方法
	 */
	addPoints : function(data, parameter, message) {
		for (var i = 0; i < data.length; i++) {
			this.addPoint(data[i], parameter, message);
		}
	},
	/*
	 * 添加线方法
	 */
	addLine : function(data, parameter, message) {
		var t = this;
		var data_path = new Array();
		if (data.paths.length > 0) {
			var oneLine = data.paths[0];
			for (var j = 0; j < oneLine.length; j++) {
				var onePoint = oneLine[j];
				var lng = onePoint[0];
				var lat = onePoint[1];
				if (typeof lng == "string") {
					lng = parseFloat(lng);
				}
				if (typeof lat == "string") {
					lat = parseFloat(lat);
				}
				data_path.push([ lng, lat ]);
			}
		}
		if (parameter == null || parameter == undefined) {
			if (data.config == null || data.config == undefined) {
				parameter = data;
			} else {
				parameter = data.config;
			}
		}
		if (data.infoWindow == undefined) {
			data.infoWindow = true;
		}
		var defaults = {
			lineStyle : t.getLineType(MapConstants.lineType.LINE_SOLID),
			lineWidth : 3,
			color : "#FF33FF",
			pellucidity : 1,
			fit : false
		};

		// 颜色转换
		if (parameter.color) {
			parameter.color = MapConstants.format10To16(parameter.color);
		}

		var options = $.extend(true, {}, defaults, parameter);
		if (options.lineType == null || options.lineType == ""
				|| options.lineType == undefined) {
			options.lineType = options.lineStyle;
		}
		var vortexLinePath = new Array();
		for (var i = 0; i < data_path.length; i++) {
			var onePoint = data_path[i];
			vortexLinePath.push(new BMap.Point(onePoint[0], onePoint[1]));
		}
		var vortexLineOptions = {
			strokeColor : options.color, // 线颜色
			strokeWeight : options.lineWidth, // 线宽
			strokeOpacity : options.pellucidity, // 线透明度
			strokeStyle : options.lineType
		// 线样式
		};
		// 添加至地图
		var vortexLine = new BMap.Polyline(vortexLinePath, vortexLineOptions);
		if(data.config.isHidden){
			vortexLine.hide();
		}
		// 封装对象,缓存
		var vortexObj = {
			geometryType : MapConstants.pelType.POLYLINE,
			attributes : data,
			mapLayer : vortexLine
		};
		if (data.id) {
			t.mapLayerMaps.add(data.id, vortexObj);
		}
		// 点击图形事件
		vortexLine.addEventListener('click', function(event) {
			// 关闭气泡
			t.closeInfoWindow();
			// 设置其它信息
			vortexObj = t.setVortexObjOtherValue(vortexObj);
			t.events.clickGraphic.sender = vortexObj;
			t.events.clickGraphic.notify(event);
		});
		// 鼠标移出图形
		vortexLine.addEventListener('mouseout', function(event) {
			t.events.MouseOutGraphic.sender = vortexObj;
			t.events.MouseOutGraphic.notify(event);
		});
		// 鼠标移动图形上方
		vortexLine.addEventListener('mouseover', function(event) {
			t.events.MouseOverGraphic.sender = vortexObj;
			t.events.MouseOverGraphic.notify(event);
		});

		t.map.addOverlay(vortexLine);
		// 不设置或者fit==true，控制视野
		if (options.fit == true/* || typeof options.fit == "undefined" */) {
			if (data.id) {
				t.setFitview([ data.id ]);
			}
		}
	},
	/*
	 * 添加多条线方法
	 */
	addLines : function(data, parameter, message) {
		for (var i = 0; i < data.length; i++) {
			this.addLine(data[i], parameter, message);
		}
	},
	//显示隐藏的图元
	showGraphicById: function (id) {
		var graphic = this.getGraphic(id);
		if(graphic.mapLayer){
			graphic.mapLayer.show();
		}
	},
	//隐藏图元
	hideGraphicById: function (id) {
		var graphic = this.getGraphic(id);
		if(graphic.mapLayer){
			graphic.mapLayer.hide();
		}
	},
	/*
	 * 添加多边形方法
	 */
	addPolygon : function(data) {
		var t = this;
		var data_path = new Array();
		if (data.rings.length > 0) {
			var oneLine = data.rings[0];
			for (var j = 0; j < oneLine.length; j++) {
				var onePoint = oneLine[j];
				var lng = onePoint[0];
				var lat = onePoint[1];
				if (typeof lng == "string") {
					lng = parseFloat(lng);
				}
				if (typeof lat == "string") {
					lat = parseFloat(lat);
				}
				data_path.push([ lng, lat ]);
			}
		}
		if (data.infoWindow == undefined) {
			data.infoWindow = true;
		}
		var defaults = {
			lineStyle : t.getLineType(MapConstants.lineType.LINE_SOLID),
			pellucidity : 0.7,
			lineWidth : 3,
			lineOpacity : 1,
			lineColor : "#FF33FF",
			color : "#FF99FF",
			fit : false
		};
		var vortexPolygonPath = new Array();
		for (var i = 0; i < data_path.length; i++) {
			var onePoint = data_path[i];
			vortexPolygonPath.push(new BMap.Point(onePoint[0], onePoint[1]));
		}
		// 颜色转换
		if (data.config) {
			if (data.config.color) {
				data.config.color = MapConstants
						.format10To16(data.config.color);
			}
			if (data.config.lineColor) {
				data.config.lineColor = MapConstants
						.format10To16(data.config.lineColor);
			}
		}
		var options = $.extend(true, {}, defaults, data.config);
		var vortexPolygonOptions = {
			strokeColor : options.lineColor, // 线颜色
			fillColor : options.color, // 填充色
			strokeWeight : options.lineWidth, // 线宽
			strokeOpacity : options.lineOpacity, // 线透明度
			fillOpacity : options.pellucidity, // 填充的透明度，取值范围0 - 1。
			strokeStyle : options.lineType
		};
		// 添加至地图
		var vortexPolygon = new BMap.Polygon(vortexPolygonPath,
				vortexPolygonOptions);
		// 封装对象,缓存
		var vortexObj = {
			geometryType : MapConstants.pelType.POLYGON,
			attributes : data,
			mapLayer : vortexPolygon
		};
		if (data.id) {
			t.mapLayerMaps.add(data.id, vortexObj);
		}
		// 点击图形事件
		vortexPolygon.addEventListener('click', function(event) {
			// 关闭气泡
			t.closeInfoWindow();
			// 设置其它信息
			vortexObj = t.setVortexObjOtherValue(vortexObj);
			t.events.clickGraphic.sender = vortexObj;
			t.events.clickGraphic.notify(event);
		});
		// 鼠标移出图形
		vortexPolygon.addEventListener('mouseout', function(event) {
			t.events.MouseOutGraphic.sender = vortexObj;
			t.events.MouseOutGraphic.notify(event);
		});
		// 鼠标移动图形上方
		vortexPolygon.addEventListener('mouseover', function(event) {
			t.events.MouseOverGraphic.sender = vortexObj;
			t.events.MouseOverGraphic.notify(event);
		});

		t.map.addOverlay(vortexPolygon);

		// 不设置或者fit==true，控制视野
		if (options.fit == true/* || typeof options.fit == "undefined" */) {
			if (data.id) {
				t.setFitview([ data.id ]);
			}
		}
	},

	addCircle : function(data) {
		var t = this;
		var lng = data.longitude;
		var lat = data.latitude;
		if (typeof lng == "string") {
			lng = parseFloat(lng);
		}
		if (typeof lat == "string") {
			lat = parseFloat(lat);
		}
		if (typeof data.radius == "string") {
			data.radius = parseFloat(data.radius);
		}
		var defaults = {
			lineStyle : t.getLineType(MapConstants.lineType.LINE_SOLID),
			pellucidity : 0.7,
			lineWidth : 3,
			lineOpacity : 1,
			lineColor : "#FF33FF",
			color : "#FF99FF"
		};

		// 颜色转换
		if (data.config) {
			if (data.config.color) {
				data.config.color = MapConstants
						.format10To16(data.config.color);
			}
			if (data.config.lineColor) {
				data.config.lineColor = MapConstants
						.format10To16(data.config.lineColor);
			}
		}

		var options = $.extend(true, {}, defaults, data.config);
		var vortexCircleOptions = {
			strokeColor : options.lineColor, // 线颜色
			strokeOpacity : options.lineOpacity, // 线透明度
			strokeWeight : options.lineWidth, // 线宽
			fillColor : options.color, // 填充色
			fillOpacity : options.pellucidity,// 填充透明度
			strokeStyle : options.lineType
		}

		// 添加至地图
		var vortexCircle = new BMap.Circle(new BMap.Point(lng, lat),
				data.radius, vortexCircleOptions);

		// 封装对象,缓存
		var vortexObj = {
			geometryType : MapConstants.pelType.CIRCLE,
			attributes : data,
			mapLayer : vortexCircle
		};
		if (data.id) {
			t.mapLayerMaps.add(data.id, vortexObj);
		}
		// 点击图形事件
		vortexCircle.addEventListener('click', function(event) {
			// 关闭气泡
			t.closeInfoWindow();
			// 设置其它信息
			vortexObj = t.setVortexObjOtherValue(vortexObj);
			t.events.clickGraphic.sender = vortexObj;
			t.events.clickGraphic.notify(event);
		});
		// 鼠标移出图形
		vortexCircle.addEventListener('mouseout', function(event) {
			t.events.MouseOutGraphic.sender = vortexObj;
			t.events.MouseOutGraphic.notify(event);
		});
		// 鼠标移动图形上方
		vortexCircle.addEventListener('mouseover', function(event) {
			t.events.MouseOverGraphic.sender = vortexObj;
			t.events.MouseOverGraphic.notify(event);
		});

		t.map.addOverlay(vortexCircle);
		// 不设置或者fit==true，控制视野
		if (options.fit == true/* || typeof options.fit == "undefined" */) {
			if (data.id) {
				t.setFitview([ data.id ]);
			}
		}
	},
	// 获取线的类型
	getLineType : function(type) {
		if (type == MapConstants.lineType.LINE_DASHED) {
			return "dashed";
		} else if (type == MapConstants.lineType.LINE_SOLID) {
			return "solid";
		}
	},
	/*
	 * 绘图方法
	 */
	draw : function(geometryType, parameter, data) {
		var t = this;
		var vortexMarker = {
			icon : "./resources/images/defaultMarker.png",
			width : 33,
			height : 33
		};
		var vortexPolyline = {
			strokeColor : "#FF33FF",
			strokeOpacity : 1,
			strokeWeight : 2
		};
		var vortexPolygon = {
			strokeColor : "#FF33FF",
			fillColor : "#FF99FF",
			strokeOpacity : 1,
			strokeWeight : 2
		};
		var vortexCircle = {
			strokeColor : "#FF33FF",
			fillColor : "#FF99FF",
			fillOpacity : 0.5,
			strokeOpacity : 1,
			strokeWeight : 2
		};
		if (null == parameter || undefined == parameter) {
			parameter = {};
		}
		if (null == parameter || undefined == parameter) {
			parameter = {};
		}
		switch (geometryType) {
		case MapConstants.pelType.POINT:
			if (parameter.url) {
				parameter.icon = parameter.url;
			}
			break;
		case MapConstants.pelType.LINE:
		case MapConstants.pelType.POLYLINE:
			// 颜色转换
			if (parameter.color) {
				parameter.strokeColor = MapConstants
						.format10To16(parameter.color);
			}
			// 线透明度
			if (parameter.pellucidity) {
				parameter.strokeOpacity = parameter.pellucidity;
			}
			// 线宽
			if (parameter.lineWidth) {
				parameter.strokeWeight = parameter.lineWidth;
			}
			break;
		case MapConstants.pelType.POLYGON:
		case MapConstants.pelType.RECTANGLE:
		case MapConstants.pelType.CIRCLE:
			// 颜色转换
			if (parameter.color) {
				parameter.fillColor = MapConstants
						.format10To16(parameter.color);
			}
			// 线颜色
			if (parameter.lineColor) {
				parameter.strokeColor = MapConstants
						.format10To16(parameter.lineColor);
			}
			// 线透明度
			if (parameter.lineOpacity) {
				parameter.strokeOpacity = parameter.lineOpacity;
			}
			// 线宽
			if (parameter.lineWidth) {
				parameter.strokeWeight = parameter.lineWidth;
			}
			// 线宽
			if (parameter.pellucidity) {
				parameter.fillOpacity = parameter.pellucidity;
			}
			break;
		default:
			break;
		}
		switch (geometryType) {
		case MapConstants.pelType.POINT:
			vortexMarker = $.extend(true, {}, vortexMarker, parameter);
			var _iconSize = new BMap.Size(vortexMarker.width,
					vortexMarker.height);
			var _icon = new BMap.Icon(vortexMarker.icon, _iconSize);
			_icon.setSize(_iconSize);
			_icon.setImageSize(_iconSize);
			vortexMarker.icon = _icon;
			break;
		case MapConstants.pelType.LINE:
		case MapConstants.pelType.POLYLINE:
			vortexPolyline = $.extend(true, {}, vortexPolyline, parameter);
			break;
		case MapConstants.pelType.POLYGON:
		case MapConstants.pelType.RECTANGLE:
			vortexPolygon = $.extend(true, {}, vortexPolygon, parameter);
			break;
		case MapConstants.pelType.CIRCLE:
			vortexCircle = $.extend(true, {}, vortexCircle, parameter);
			break;
		default:
			break;
		}

		// 实例化鼠标绘制工具
		var mouseTool = new BMapLib.DrawingManager(t.map, {
			isOpen : true, // 是否开启绘制模式
			enableCalculate : false,// 绘制是否进行测距(画线时候)、测面(画圆、多边形、矩形)
			enableDrawingTool : false, // 是否显示工具栏
			markerOptions : vortexMarker,
			circleOptions : vortexCircle, // 圆的样式
			polylineOptions : vortexPolyline, // 线的样式
			polygonOptions : vortexPolygon, // 多边形的样式
			rectangleOptions : vortexPolygon
		// 矩形的样式
		});

		switch (geometryType) {
		case MapConstants.pelType.POINT:
			mouseTool.setDrawingMode(BMAP_DRAWING_MARKER);
			break;
		case MapConstants.pelType.LINE:
		case MapConstants.pelType.POLYLINE:
			mouseTool.setDrawingMode(BMAP_DRAWING_POLYLINE);
			break;
		case MapConstants.pelType.POLYGON:
			mouseTool.setDrawingMode(BMAP_DRAWING_POLYGON);
			break;
		case MapConstants.pelType.RECTANGLE:
			mouseTool.setDrawingMode(BMAP_DRAWING_RECTANGLE);
			break;
		case MapConstants.pelType.CIRCLE:
			mouseTool.setDrawingMode(BMAP_DRAWING_CIRCLE);
			break;
		default:
			break;
		}
		this.mouseTool = mouseTool;
		// 添加鼠标绘制工具监听事件，用于获取绘制结果
		mouseTool.addEventListener('overlaycomplete', function(event) {
			// 封装对象,缓存
			var vortexObj = {
				geometryType : geometryType,
				attributes : data,
				mapLayer : event.overlay
			};
			if (data.id) {
				vortexObj.id = data.id;
			}
			// 设置其它信息
			vortexObj = t.setVortexObjOtherValue(vortexObj);

			t.mapLayerMaps.add(data.id, vortexObj);
			// 关闭绘图
			mouseTool.disableCalculate();
			mouseTool.close();
			// 绘制图形结束事件
			t.events.drawEnd.sender = vortexObj;
			t.events.drawEnd.notify(event);
			// 点击图形事件
			vortexObj.mapLayer.addEventListener('click', function(event) {
				t.events.clickGraphic.sender = vortexObj;
				t.events.clickGraphic.notify(event);
			});
		});

	},
	closeDraw: function(){
		this.mouseTool.disableCalculate();
		this.mouseTool.close();
	},
	// 修改制定图形方法
	doEdit : function(src,id) {
		var t = this;
		this.editEvent = function (event) {
			// 封装对象,缓存
			var vortexObj = {
				geometryType : src.geometryType,
				attributes : src.attributes,
				mapLayer : event.target
			};
			// 设置其它信息
			vortexObj = t.setVortexObjOtherValue(vortexObj);
			t.events.graphicVortexChange.sender = vortexObj;
			t.events.graphicVortexChange.notify(event);
		}
		switch (src.geometryType) {
		case MapConstants.pelType.POINT:
			// 开启编辑
			src.mapLayer.enableDragging();
			src.mapLayer.addEventListener("dragend",t.editEvent);
			break;
		case MapConstants.pelType.POLYLINE:
		case MapConstants.pelType.POLYGON:
		case MapConstants.pelType.RECTANGLE:
			// 开启编辑
			src.mapLayer.enableEditing();
			src.mapLayer.addEventListener("lineupdate",t.editEvent);
			break;
		case MapConstants.pelType.CIRCLE:
			// 开启编辑
			src.mapLayer.enableEditing();
			src.mapLayer.addEventListener("lineupdate",t.editEvent);
			break;
		default:
			break;
		}
	},
	//关闭编辑
	endEdit: function (src) {
		var t = this;
		switch (src.geometryType) {
		case MapConstants.pelType.POINT:
			// 开启编辑
			src.mapLayer.disableDragging();
			src.mapLayer.removeEventListener('dragend',t.editEvent);
			break;
		case MapConstants.pelType.POLYLINE:
		case MapConstants.pelType.POLYGON:
		case MapConstants.pelType.RECTANGLE:
			// 开启编辑
			src.mapLayer.disableEditing();
			src.mapLayer.removeEventListener('lineupdate',t.editEvent);
			break;
		case MapConstants.pelType.CIRCLE:
			// 开启编辑
			src.mapLayer.disableEditing();
			src.mapLayer.removeEventListener("lineupdate",t.editEvent);
			break;
		default:
			break;
		}
	},
	//获取对应边界线 name地区名  call(ary)回调ary对应边界线所有点
	getBoundary : function(name,call){
		var t = this;
		var b = new BMap.Boundary();
		b.get(name, call)
	},
	//置顶图元
	isSetTop : function(src,type){
		var t = this;
		if(src.geometry.type === 'point' && !!src.mapLayer.setTop){
			src.mapLayer.setTop(type);
			// src.mapLayer.getZIndex()
			// src.mapLayer.setZIndex(null);
		}
	},
	// 代码触发点击图形事件方法
	clickPoint : function(point) {
		this.events.clickGraphic.sender = point;
		this.events.clickGraphic.notify();
	},
	stopDraw : function() {
	},
	// 设置其他信息
	setVortexObjOtherValue : function(vortexObj) {
		switch (vortexObj.geometryType) {
		case MapConstants.pelType.POINT:
			var vortexMarker = vortexObj.mapLayer;
			var markerPosition = vortexMarker.getPosition();
			vortexObj.geometry = {};
			vortexObj.geometry.type = vortexObj.geometryType;
			vortexObj.geometry.x = markerPosition.lng;
			vortexObj.geometry.y = markerPosition.lat;
			break;
		case MapConstants.pelType.LINE:
		case MapConstants.pelType.POLYLINE:
			var vortexLine = vortexObj.mapLayer;
			vortexObj.geometry = {};
			vortexObj.geometry.type = vortexObj.geometryType;
			var aLinePaths = vortexLine.getPath();
			var linePaths = new Array();
			var objLngLats = new Array();
			for (var i = 0; i < aLinePaths.length; i++) {
				linePaths.push([ aLinePaths[i].lng, aLinePaths[i].lat ]);
				objLngLats.push({
					latY : aLinePaths[i].lat,
					lngX : aLinePaths[i].lng
				});
			}
			vortexObj.geometry.paths = new Array();
			vortexObj.geometry.paths.push(linePaths);
			vortexObj.lnglatArr = objLngLats;
			break;
		case MapConstants.pelType.POLYGON:
		case MapConstants.pelType.RECTANGLE:
			var vortexPolygon = vortexObj.mapLayer;
			vortexObj.geometry = {};
			vortexObj.geometry.type = vortexObj.geometryType;
			var aPolygonRings = vortexPolygon.getPath();
			var polygonRings = new Array();
			var objLngLats = new Array();
			for (var i = 0; i < aPolygonRings.length; i++) {
				polygonRings
						.push([ aPolygonRings[i].lng, aPolygonRings[i].lat ]);
				objLngLats.push({
					latY : aPolygonRings[i].lat,
					lngX : aPolygonRings[i].lng
				});
			}
			vortexObj.geometry.rings = new Array();
			vortexObj.geometry.rings.push(polygonRings);
			var polygonBounds = vortexPolygon.getBounds();
			if (polygonBounds != null) {
				var southWestLngLat = polygonBounds.getSouthWest();
				var northEastLngLat = polygonBounds.getNorthEast();
				vortexObj.geometry._extent = {};
				vortexObj.geometry._extent.xmax = northEastLngLat.lng;
				vortexObj.geometry._extent.xmin = southWestLngLat.lng;
				vortexObj.geometry._extent.ymax = northEastLngLat.lat;
				vortexObj.geometry._extent.ymin = southWestLngLat.lat;
			}
			vortexObj.lnglatArr = objLngLats;
			break;
		case MapConstants.pelType.CIRCLE:
			var vortexCircle = vortexObj.mapLayer;
			vortexObj.geometry = {};
			vortexObj.geometry.type = vortexObj.geometryType;
			vortexObj.geometry.x = vortexCircle.getCenter().lng;
			vortexObj.geometry.y = vortexCircle.getCenter().lat;
			vortexObj.geometry.radius = vortexCircle.getRadius();
			break;
		default:
			break;
		}
		return vortexObj;
	},
	/*
	 * 设置几个覆盖物自适应当前窗口 ids为一个数组
	 */
	setFitview : function(ids) {
		var t = this;
		if (ids) {
			if (ids.length > 0) {
				var fitLayers = new Array();
				for (var i = 0; i < ids.length; i++) {
					if (t.getGraphic(ids[i]) != null
							&& t.getGraphic(ids[i]).mapLayer != null) {
						var oneLayer = t.getGraphic(ids[i]).mapLayer;
						switch (t.getGraphic(ids[i]).geometryType) {
						case MapConstants.pelType.POINT:
							fitLayers.push(oneLayer.getPosition());
							break;
						case MapConstants.pelType.POLYLINE:
						case MapConstants.pelType.POLYGON:
							if (oneLayer.getPath().length > 0) {
								for (var int = 0; int < oneLayer.getPath().length; int++) {
									fitLayers.push(oneLayer.getPath()[int]);
								}
							}
							break;
						case MapConstants.pelType.CIRCLE:
							fitLayers.push(oneLayer.point);
							break;
						default:
							break;
						}
					}
				}
				if (fitLayers.length > 0) {
					$('.vtxAnimation').css('transition-property','none');
					t.map.setViewport(fitLayers);
					$('.vtxAnimation').css('transition-property','top,left');
				}
			}

		}
	},
	//获取当前最佳zoom和center
	getFitView: function (ids) {
		var t = this;
		if (ids) {
			if (ids.length > 0) {
				var fitLayers = new Array();
				for (var i = 0; i < ids.length; i++) {
					if (t.getGraphic(ids[i]) != null
							&& t.getGraphic(ids[i]).mapLayer != null) {
						var oneLayer = t.getGraphic(ids[i]).mapLayer;
						switch (t.getGraphic(ids[i]).geometryType) {
						case MapConstants.pelType.POINT:
							fitLayers.push(oneLayer.getPosition());
							break;
						case MapConstants.pelType.POLYLINE:
						case MapConstants.pelType.POLYGON:
							if (oneLayer.getPath().length > 0) {
								for (var int = 0; int < oneLayer.getPath().length; int++) {
									fitLayers.push(oneLayer.getPath()[int]);
								}
							}
							break;
						case MapConstants.pelType.CIRCLE:
							fitLayers.push(oneLayer.point);
							break;
						default:
							break;
						}
					}
				}
				if (fitLayers.length > 0) {
					return this.map.getViewport(fitLayers);
				}
			}

		}
		
	},
	// 通过id获得图形方法
	getGraphic : function(id) {
		var t = this;
		if (null == t.mapLayerMaps.get(id)) {
			return null;
		}
		var vortexObj = t.mapLayerMaps.get(id);
		// 设置其它信息
		vortexObj = t.setVortexObjOtherValue(vortexObj);
		return vortexObj;
	},
	// 移除指定图形方法
	removeGraphic : function(graphic) {
		if(!graphic){return false}
		var t = this;
		var removeItem;
		if (graphic.mapLayer) {
			// 先清除聚合
			if (t._cluster != null
					&& graphic.geometryType == MapConstants.pelType.POINT) {
				t._cluster.removeMarker(graphic.mapLayer);
			}
			t.map.removeOverlay(graphic.mapLayer);
			removeItem = graphic.mapLayer;
		} else {
			t.map.removeOverlay(graphic);
			removeItem = graphic;
		}
		var keyArray = t.mapLayerMaps.getAllKey();
		for (var i = 0; i < keyArray.length; i++) {
			if (t.mapLayerMaps.get(keyArray[i]).mapLayer == removeItem) {
				t.mapLayerMaps.remove(keyArray[i]);
				break;
			}
		}
		t.closeInfoWindow();
	},

	/*
	 * 设置覆盖物是否隐藏
	 */
	setGraphicVisibleById : function(overlayId, isVisible) {
		var t = this;
		var mapOverlay = t.getGraphic(overlayId);
		if (mapOverlay != null && mapOverlay.mapLayer != null) {
			if (isVisible) {
				mapOverlay.mapLayer.show();
			} else {
				mapOverlay.mapLayer.hide();
			}
		}
	},
	/*
	 * 地图设定中心方法
	 */
	setCenter : function(x, y) {
		var t = this;
		if (x == null || y == null) {
			return;
		}
		if (x == "" || y == "") {
			return;
		}
		if (typeof x == "string") {
			x = parseFloat(x);
		}
		if (typeof y == "string") {
			y = parseFloat(y);
		}
		this.map.setCenter(new BMap.Point(x, y));
	},
	/*
	 * 获取当前地图中心点
	 */
	getNowCenter : function() {
		var _mapCenter = this.map.getCenter();
		return [ _mapCenter.lng, _mapCenter.lat ];
	},
	// 清空地图上所有图形方法
	clear : function() {
		var t = this;
		if (t._cluster != null) {
			t._cluster.clearMarkers();
		}
		t.mapLayerMaps.clear();
		t.map.clearOverlays();
		if (t.rangingTool) {
			t.rangingTool.close();
		}
	},
	// 设定地图缩放比方法
	setZoom : function(zoom) {
		this.map.setZoom(zoom);
	},
	getZoom : function() {
		return this.map.getZoom();
	},
	// 设定地图大小(无此方法)
	resize : function() {
	},
	/*
	 * 设定鼠标图案
	 */
	setCursor : function(url) {
		if (url) {
			if (url.indexOf("http") == 0) {
				this.map.setDefaultCursor("url('" + url + "'),pointer");
			} else {
				this.map.setDefaultCursor(url);
			}
		} else {
			this.map.setDefaultCursor("pointer");
		}
	},
	/*
	 * 获得当前比例尺
	 */
	getScale : function() {
		// return this.map.getScale();
		return 0;
		// return this.map.getUnit();
		// return this.map.getSize();
	},
	/*
	 * 计算面积
	 */
	calculateArea : function(graphic) {
		var _graphicArea = 0;
		var _mapLayer = null;
		var geometryType = null;
		if (graphic.mapLayer) {
			geometryType = graphic.geometryType;
			_mapLayer = graphic.mapLayer;
		} else {
			_mapLayer = graphic;
		}

		if (geometryType == MapConstants.pelType.CIRCLE) {
			var r = graphic.geometry.radius;
			_graphicArea = MapConstants.PI * r * r;
		} else {
			var lnglats = _mapLayer.getPath();
			var firstPoint = lnglats[0];
			var lastPoint = lnglats[lnglats.length - 1];
			if (firstPoint.equals(lastPoint)) {
				lnglats.pop();
				_mapLayer.setPath(lnglats);
			}
			_graphicArea = BMapLib.GeoUtils.getPolygonArea(_mapLayer);
		}

		if (!_graphicArea || _graphicArea < 0) {
			_graphicArea = 0;
		}
		return parseFloat(_graphicArea.toFixed(2));
	},
	/*
	 * 计算线距离
	 */
	calculateDistance : function(data) {
		var t = this;
		var totalDistance = 0;
		if (data.length > 0) {
			for (var x = 0; x < data.length - 1; x++) {
				var firstPoint = new BMap.Point(data[x][0], data[x][1]);
				var secondPoint = new BMap.Point(data[x + 1][0], data[x + 1][1]);
				totalDistance = totalDistance
						+ t.map.getDistance(firstPoint, secondPoint);
			}
		}
		return parseFloat(totalDistance.toFixed(2));
	},
	//计算2点间的距离 单位m
	calculatePointsDistance: function (f,s) {
		var firstPoint = new BMap.Point(f[0], f[1]);
		var secondPoint = new BMap.Point(s[0], s[1]);
		return this.map.getDistance(firstPoint, secondPoint);
	},
	/*
	 * 计算2点间的距离
	 */

	/*
	 * 保存当前地图图片(无)
	 */
	saveMap : function() {
		var t = this;
	},
	/*
	 * 打印地图(无)
	 */
	printMap : function() {
		var t = this;
	},
	/*
	 * 把经纬度坐标转换成屏幕坐标
	 */
	fromLngLatToContainerPixel : function(lng, lat) {
		if (lng == null || lat == null) {
			return;
		}
		if (lng == "" || lat == "") {
			return;
		}
		if (typeof lng == "string") {
			lng = parseFloat(lng);
		}
		if (typeof lat == "string") {
			lat = parseFloat(lat);
		}
		var t = this;
		var pixel = t.map.pointToPixel(new BMap.Point(lng, lat));
		return [ pixel.x, pixel.y ];

	},
	/*
	 * 把屏幕坐标转化成经纬度坐标
	 */
	fromContainerPixelToLngLat : function(x, y) {
		if (x == null || y == null) {
			return;
		}
		if (x == "" || y == "") {
			return;
		}
		if (typeof x == "string") {
			x = parseFloat(x);
		}
		if (typeof y == "string") {
			y = parseFloat(y);
		}
		var t = this;
		var lnglat = t.map.pixelToPoint(new BMap.Pixel(x, y));
		return [ lnglat.lng, lnglat.lat ];
	},
	/*
	 * 获得包装后的经纬度坐标
	 */
	getLngLat : function(lng, lat) {
		if (lng == null || lat == null) {
			return null;
		}
		if (lng == "" || lat == "") {
			return null;
		}
		if (typeof lng == "string") {
			lng = parseFloat(lng);
		}
		if (typeof lat == "string") {
			lat = parseFloat(lat);
		}
		return new BMap.Point(lng, lat);
	},
	// 绑定监听事件方法
	bind : function(event, callback) {
		var t = this;
		if (event === "mapOnLoad") {
			t.mapOnLoad(callback);
		} else if (event === "clickGraphic") {
			t.clickGraphic(callback);
		} else if (event === "clickMap") {
			t.clickMap(callback);
		} else if (event === "dragMap") {
			t.dragMap(callback);
		} else if (event === "dragMapStart") {
			t.dragMapStart(callback);
		} else if (event === "dragMapEnd") {
			t.dragMapEnd(callback);
		} else if (event === "moveStart") {
			t.moveStart(callback);
		}else if (event === "moveEnd") {
			t.moveEnd(callback);
		}else if (event === "drawEnd") {
			t.drawEnd(callback);
		} else if (event === "onMouseOverMap") {
			t.onMouseOverMap(callback);
		} else if (event === "graphicVortexChange") {
			t.graphicVortexChange(callback);
		} else if (event === "clickEditGraphic") {
			t.editGraphicClick(callback);
		} else if (event === "editGraphicMoveStart") {
			t.editGraphicMoveStart(callback);
		} else if (event === "editGraphicMoveEnd") {
			t.editGraphicMoveEnd(callback);
		} else if (event === "mouseOutGraphic") {
			t.MouseOutGraphic(callback);
		} else if (event === "mouseOverGraphic") {
			t.MouseOverGraphic(callback);
		} else if (event === "layersAddResult") {
			t.LayersAddResult(callback);
		} else if (event === "onGraphicAdd") {
			t.onGraphicAdd(callback);
		}else if (event === "zoomStart") {
			t.zoomStart(callback);
		}else if (event === "zoomEnd") {
			t.zoomEnd(callback);
		}else if(event === 'clickPointCollection'){
			t.clickPointCollection(callback);
		}
	},
	clickPointCollection: function (callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.clickPointCollection.attach(callback,'clickPointCollection');
		}
	},
	zoomStart : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.zoomStart.attach(callback,'zoomStart');
		}
	},
	zoomEnd : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.zoomEnd.attach(callback,'zoomEnd');
		}
	},
	// 执行绑定地图监听事件方法
	onGraphicAdd : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.onGraphicAdd.attach(callback,'onGraphicAdd');
		}
	},
	LayersAddResult : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.LayersAddResult.attach(callback,'LayersAddResult');
		}
	},
	clickGraphic : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.clickGraphic.attach(callback,'clickGraphic');
		}
	},
	clickMap : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.clickMap.attach(callback,'clickMap');
		}
	},
	dragMap : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.dragMap.attach(callback,'dragMap');
		}
	},
	dragMapStart : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.dragMapStart.attach(callback,'dragMapStart');
		}
	},
	dragMapEnd : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.dragMapEnd.attach(callback,'dragMapEnd');
		}
	},
	moveStart : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.moveStart.attach(callback,'moveStart');
		}
	},
	moveEnd : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.moveEnd.attach(callback,'moveEnd');
		}
	},
	mapOnLoad : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.mapOnLoad.attach(callback,'mapOnLoad');
		}
	},
	onMouseOverMap : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.onMouseOverMap.attach(callback,'onMouseOverMap');
		}
	},
	drawEnd : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.drawEnd.attach(callback,'drawEnd');
		}
	},
	graphicVortexChange : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.graphicVortexChange.attach(callback,'graphicVortexChange');
		}
	},
	editGraphicClick : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.editGraphicClick.attach(callback,'editGraphicClick');
		}
	},
	editGraphicMoveStart : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.editGraphicMoveStart.attach(callback,'editGraphicMoveStart');
		}
	},
	editGraphicMoveEnd : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.editGraphicMoveEnd.attach(callback,'editGraphicMoveEnd');
		}
	},
	MouseOutGraphic : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.MouseOutGraphic.attach(callback,'MouseOutGraphic');
		}
	},
	MouseOverGraphic : function(callback) {
		var t = this;
		if (typeof callback == 'function') {
			t.events.MouseOverGraphic.attach(callback,'MouseOverGraphic');
		}
	},
	// 添加点聚合用id
	addClustersByIds : function(markerIds) {
		var t = this;
		var markerArr = new Array();
		if (markerIds != null && markerIds.length > 0) {
			for (var i = 0; i < markerIds.length; i++) {
				var vortexObj = t.mapLayerMaps.get(markerIds[i]);
				if (vortexObj.mapLayer
						&& vortexObj.geometryType == MapConstants.pelType.POINT) {
					markerArr.push(vortexObj.mapLayer);
				}
			}
		}
		if (markerArr.length > 0) {
			t.addClusters(markerArr);
		}
	},
	// 添加点聚合
	addClusters : function(markerArr) {
		var t = this;
		if (t._cluster == null) {
			t._cluster = new BMapLib.MarkerClusterer(t.map, {
				maxZoom : 17
			});
		}
		// t.romoveAllClusters();
		t._cluster.addMarkers(markerArr);
	},
	// 删除点聚合
	romoveClusters : function(markerArr) {
		var t = this;
		if (t._cluster != null) {
			t._cluster.removeMarkers(markerArr);
		}
	},
	// 清除点聚合
	romoveAllClusters : function(markerArr) {
		var t = this;
		if (t._cluster != null) {
			t._cluster.clearMarkers();
		}
	},
	/*
	 * 聚合地图上的点
	 */
	cluster : function(markerArrIds) {
		var t = this;
		if (markerArrIds == null || markerArrIds == undefined) {
			markerArrIds = new Array();
			var mapLayerKeys = t.mapLayerMaps.getAllKey();
			for (var i = 0; i < mapLayerKeys.length; i++) {
				var vortexObj = t.mapLayerMaps.get(mapLayerKeys[i]);
				if (vortexObj.geometryType == MapConstants.pelType.POINT) {
					markerArrIds.push(mapLayerKeys[i]);
				}
			}
		}
		if (Object.prototype.toString.call(markerArrIds) === '[object Array]') {
			if (markerArrIds.length > 0) {
				t.addClustersByIds(markerArrIds);
			}
		}
	},
	/***************************************************************************
	 * graphic：移动的点 linePath：移动路线 limitTime：移动耗时(s) moveEndCallBack：移动结束回调事件
	 * 
	 * 
	 **************************************************************************/
	vortexMarkerStartMove : function(graphic, linePath, limitTime,
			moveEndCallBack) {
		var t = this;
		var moveMarker = null;
		if (graphic.mapLayer) {
			moveMarker = graphic.mapLayer;
		} else {
			moveMarker = graphic;
		}
		if (moveMarker) {
			if (limitTime != null && limitTime != "") {
				if (typeof limitTime == "string") {
					limitTime = parseFloat(limitTime);
				}
				if (moveMarker
						&& linePath
						&& limitTime
						&& Object.prototype.toString.call(linePath) === '[object Array]') {
					if (linePath.length > 1) {
						var lineSpeed = Math
								.ceil((limitTime / linePath.length)) * 1000;
						t.vortexMarkerStopMove();
						var i = 0;
						function resetMkPoint() {
							if (i < linePath.length) {
								var indexPosition = new Array();
								indexPosition.push(linePath[i][0]);
								indexPosition.push(linePath[i][1]);
								moveMarker.setPosition(new BMap.Point(
										parseFloat(indexPosition[0]),
										parseFloat(indexPosition[1])));

								t.markerMoveTimer = window.setTimeout(
										function() {
											i++;
											resetMkPoint(i);
										}, lineSpeed);
							} else {
								if (typeof moveEndCallBack == 'function') {
									moveEndCallBack();
								}
							}
						}
						resetMkPoint();
					}
				}
			}
		}
	},
	vortexMarkerStopMove : function(graphic) {
		var t = this;
		if (t.markerMoveTimer) {
			window.clearTimeout(t.markerMoveTimer);
		}
	},/*
		 * 路线规划 param:planType: walk,bus,car
		 * param:startPoint:{lng:xxxx,lat:xxxx}
		 * param:endPoint:{lng:xxxx,lat:xxxx} ) return {
		 * status:complete,error,no_data, result:[{ routeTime:,//耗时（s）
		 * routeDistance://距离（m） routeSteps:[[lng,lat],[lng1,lat1]] }] }
		 */
	vortexRoutePlan : function(planType, startPoint, endPoint, callBack) {
		var t = this;
		var route_search = null;
		switch (planType) {
		case "walk":
			route_search = new BMap.WalkingRoute(t.map, {
				renderOptions : {
					map : t.map
				}
			});
			break;
		case "bus":
			route_search = new BMap.TransitRoute(t.map, {
				renderOptions : {
					map : t.map
				}
			});

			break;
		case "car":
			route_search = new BMap.DrivingRoute(t.map, {
				renderOptions : {
					map : t.map
				}
			});
			break;
		default:
			break;
		}
		route_search.setSearchCompleteCallback(function(result) {
			if (typeof callBack == 'function') {
				var vortexResult = new Array();
				var status = route_search.getStatus();
				if (status == BMAP_STATUS_SUCCESS) {
					if (planType == 'bus') {// 只有公交线路的路径点数据(因为步行的和公交的顺序错乱)
						for (var i = 0; i < result.getNumPlans(); i++) {
							var onePlan = result.getPlan(i);
							for (var x = 0; x < onePlan.getNumLines(); x++) {
								var oneRoute = onePlan.getLine(x);
								var oneVortexRoute = {
									routeTime : onePlan.getDuration(false),
									routeDistance : onePlan.getDistance(false)
								};
								var oneRouteLngLat = new Array();
								var oneRoutePath = oneRoute.getPath();
								for (var y = 0; y < oneRoutePath.length; y++) {
									oneRouteLngLat.push([ oneRoutePath[y].lng,
											oneRoutePath[y].lat ]);
								}
								oneVortexRoute.routeSteps = oneRouteLngLat;
								vortexResult.push(oneVortexRoute);
							}
						}
					} else {
						for (var i = 0; i < result.getNumPlans(); i++) {
							var onePlan = result.getPlan(i);
							for (var x = 0; x < onePlan.getNumRoutes(); x++) {
								var oneRoute = onePlan.getRoute(x);
								var oneVortexRoute = {
									routeTime : onePlan.getDuration(false),
									routeDistance : onePlan.getDistance(false)
								};
								var oneRouteLngLat = new Array();
								var oneRoutePath = oneRoute.getPath();
								for (var y = 0; y < oneRoutePath.length; y++) {
									oneRouteLngLat.push([ oneRoutePath[y].lng,
											oneRoutePath[y].lat ]);
								}
								oneVortexRoute.routeSteps = oneRouteLngLat;
								vortexResult.push(oneVortexRoute);
							}
						}
					}
				}
				switch (status) {
				case BMAP_STATUS_SUCCESS:// 检索成功。对应数值“0”
					status = "complete";
					break;
				case BMAP_STATUS_UNKNOWN_LOCATION:// 位置结果未知。对应数值“2”
				case BMAP_STATUS_UNKNOWN_ROUTE:// 导航结果未知。对应数值“3”
					status = "no_data";
					break;
				case BMAP_STATUS_INVALID_KEY:// 非法密钥。对应数值“4”
				case BMAP_STATUS_INVALID_REQUEST:// 非法请求。对应数值“5”
				case BMAP_STATUS_PERMISSION_DENIED:// 没有权限。对应数值“6”
				case BMAP_STATUS_SERVICE_UNAVAILABLE:// 服务不可用。对应数值“7”
				case BMAP_STATUS_TIMEOUT:// 超时。对应数值“8”
					status = "error";
					break;
				default:
					break;
				}
				// 查询结果返回
				callBack(status, vortexResult);
			}
		})
		route_search.search(new BMap.Point(startPoint.lng, startPoint.lat),
				new BMap.Point(endPoint.lng, endPoint.lat));
	},
	// 初始化热力图 data格式：[{lng:,lat:,count:}]
	creatHeatMapOverlay : function(data) {
		var t = this;
		var d = data || {};
		var defaults = {
			radius: 20,
			max: 100,
			visible: true,
			opacity: 1
		};
		var cg = $.extend(true, {}, defaults, d.config);
		if(!t.heatmap){
			t.heatmap = new BMapLib.HeatmapOverlay({
				visible: cg.visible
			});
			t.map.addOverlay(t.heatmap);
		}
		var option = {
			radius: cg.radius,
			opacity: cg.radius,
			visible: cg.visible
		}
		if(cg.gradient){
			option.gradient = cg.gradient;
		}
		t.heatmap.setOptions(option);
		t.heatmap.setDataSet({
			max: cg.max,
			data: d.data
		});
		if(cg.visible){
			t.heatmap.show();
		}else{
			t.heatmap.hide();
		}

	},
	// 获取当前地图视图范围 return {southWest:{lng,lat},northEast:{lng,lat},zoom:}
	getMapExtent : function() {
		var t = this;
		var nowBounds = t.map.getBounds();
		var nowCenter = t.map.getCenter();
		var obj = {};
		obj.southWest = {
			lng : nowBounds.getSouthWest().lng,
			lat : nowBounds.getSouthWest().lat
		};
		obj.northEast = {
			lng : nowBounds.getNorthEast().lng,
			lat : nowBounds.getNorthEast().lat
		};
		obj.nowCenter = nowCenter;
		obj.zoom = t.map.getZoom();
		obj.mapSize = t.map.getSize();
		return obj;
	},
	// 指定当前地图显示范围data:{southWest:{lng,lat},northEast:{lng,lat},zoom:}
	setMapExtent : function(data) {
		var t = this;
		if (data.southWest && data.northEast && data.zoom) {
			var userBounds = new BMap.Bounds(new BMap.Point(
					parseFloat(data.southWest.lng),
					parseFloat(data.southWest.lat)), new BMap.Point(
					parseFloat(data.northEast.lng),
					parseFloat(data.northEast.lat)));

			t.setZoom(parseInt(data.zoom, 10));

			t.map.panTo(userBounds.getCenter(), {
				noAnimation : "no"
			});
		}
	},
	// 测距功能,绘制完成返回{lnglats:[[,],[]],distance:(单位：公里)}
	vtxRangingTool : function(callback) {
		var t = this;
		t.rangingTool = new BMapLib.DistanceTool(t.map);
		t.rangingTool.addEventListener("drawend", function(e) {
			t.rangingTool.close();
			if (typeof callback == 'function') {
				var obj = {
					distance : e.distance
				};
				var objLngLats = new Array();
				for (var i = 0; i < e.points.length; i++) {
					objLngLats.push([ e.points[i].lng, e.points[i].lat ]);
				}
				obj.lnglats = objLngLats;
				callback(obj);
			}
		});
		t.rangingTool.open(); // 开启鼠标测距
	},
	// 平移
	vtxPanTo : function(lng, lat) {
		var t = this;
		var _lng = lng;
		var _lat = lat;
		if (_lng == null || _lat == null) {
			return;
		}
		if (_lng == "" || _lat == "") {
			return;
		}
		if (typeof _lng == "string") {
			_lng = parseFloat(_lng);
		}
		if (typeof _lat == "string") {
			_lat = parseFloat(_lat);
		}
		t.map.panTo(new new BMap.Point(_lng, _lat));
	},
	// 地名搜索{areaName,cfg,callback}
	vtxAreaNameSearch : function(areaName, callback, cfg) {
		var t = this;
		if (undefined != areaName && null != areaName && "" != areaName) {
			var options = {
				onSearchComplete : function(results) {
					if (typeof callback == 'function') {
						var vortexResult = new Array();
						// 判断状态是否正确
						for (var i = 0; i < results.getCurrentNumPois(); i++) {
							var element = results.getPoi(i);
							var oneResult = {
								name : element.title,
								address : element.address,
								district : "",
								city : element.city,
								lnglat : [ element.point.lng, element.point.lat ]
							};
							vortexResult.push(oneResult);
						}
						var status = "";
						switch (local.getStatus()) {
						case BMAP_STATUS_SUCCESS:// 检索成功。对应数值“0”
							status = "complete";
							break;
						case BMAP_STATUS_UNKNOWN_LOCATION:// 位置结果未知。对应数值“2”
						case BMAP_STATUS_UNKNOWN_ROUTE:// 导航结果未知。对应数值“3”
							status = "no_data";
							break;
						case BMAP_STATUS_INVALID_KEY:// 非法密钥。对应数值“4”
						case BMAP_STATUS_INVALID_REQUEST:// 非法请求。对应数值“5”
						case BMAP_STATUS_PERMISSION_DENIED:// 没有权限。对应数值“6”
						case BMAP_STATUS_SERVICE_UNAVAILABLE:// 服务不可用。对应数值“7”
						case BMAP_STATUS_TIMEOUT:// 超时。对应数值“8”
							status = "error";
							break;
						default:
							break;
						}
						callback(status, vortexResult);
					}

				}
			};
			var local = new BMap.LocalSearch(t.map, options);
			local.search(areaName, {
				forceLocal : false
			});
		}
	},
	openTrafficInfo : function() {
		var t = this;
		if (t.trafficCtrl == null || t.trafficCtrl == undefined) {
			t.trafficCtrl = new BMapLib.TrafficControl({
				// 是否显示路况提示面板
				showPanel : false
			});
			t.map.addControl(t.trafficCtrl);
		}
		t.trafficCtrl.showTraffic();
		$("#tcBtn").hide();
	},
	hideTrafficInfo : function() {
		var t = this;
		if (t.trafficCtrl == null || t.trafficCtrl == undefined) {
		} else {
			t.trafficCtrl.hideTraffic();
		}
	},
	//展开比例尺 type small/pan/zoom  location tl/bl/tr/br
	showControl: function (type,location){
		var t = this;
		switch(location){
			case 'tl':
				location = BMAP_ANCHOR_TOP_LEFT;
			break;
			case 'bl':
				location = BMAP_ANCHOR_BOTTOM_LEFT;
			break;
			case 'tr':
				location = BMAP_ANCHOR_TOP_RIGHT;
			break;
			case 'br':
				location = BMAP_ANCHOR_BOTTOM_RIGHT;
			break;
		}
		switch(type){
			case 'all':
				type = '';
			break;
			case 'small':
				type = BMAP_NAVIGATION_CONTROL_SMALL;
			break;
			case 'pan':
				type = BMAP_NAVIGATION_CONTROL_PAN;
			break;
			case 'zoom':
				type = BMAP_NAVIGATION_CONTROL_ZOOM;
			break;
		}
		var control = new BMap.ScaleControl({anchor: location});// 左上角，添加比例尺
		t.map.addControl(control);
		if(type !== 'null'){
			var navigation = new BMap.NavigationControl({anchor: location, type: type}); //右上角，仅包含平移和缩放按钮
			t.map.addControl(navigation);
		}
	}
};