(function() {
	MapConstants = {
		getMapOption : getMapOption,
		getMarkerOption : getMarkerOption,
		getTipOption : getTipOption,
		getLabelOption : getLabelOption,
		getLineOption : getLineOption,
		getAreOption : getAreOption,
		colorReg : /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
		colorToHex : colorToHex,
		colorToRgb : colorToRgb,
		format10To16 : format10To16,
		lineType : {
			LINE_DASHED : "line_dashed",
			LINE_SOLID : "line_solid"
		},
		pelType : {
			POINT : "point",
			LINE : "line",
			POLYLINE : "polyline",
			POLYGON : "polygon",
			CIRCLE : "circle",
			RECTANGLE : "rectangle"
		},
		PI : 3.1416
	};
	function format10To16(color10) {
		if (typeof color10 == "number") {// 判断是否为数字,若是,则进行字符串转化
			var hexColor = color10;
			var hexColorStr = hexColor.toString(16);// 将10进制数转换为16进制
			if (hexColorStr.length < 6) {// 不足6位补0
				var n = 6 - hexColorStr.length;
				for (var i = 0; i < n; i++) {
					hexColorStr = "0" + hexColorStr;
				}
			}
			return "#" + hexColorStr;
		} else if (typeof color10 == "string") {// 判断是否为字符串,若是,则进行rgb转码
			if (color10 == "red") {
				color10 = "#FF0000";
			} else if (color10 == "green") {
				color10 = "#00FF00"
			} else if (color10 == "blue") {
				color10 = "#0000FF";
			} else if (color10 == "yellow") {
				color10 = "#FFFF00";
			}
			return color10;
		}
	}
	function getMapOption(options) {
		var gisType = options.gisType;
		if (gisType == "") {
			gisType = gisMapConstant.defaultLoadGisType;
		}
		if (gisType == "") {
			return null;
		}
		if (gisType == "arcgis") {
			// t.createArcGis(callback);
		} else if (gisType == "mapABCFlash") {
			var mapoption = new MMapOptions();
			// mapoption.toolbar=MConstants.ROUND; //设置地图初始化工具条，ROUND:新版圆工具条
			mapoption.overviewMap = options.overviewMap; // 设置鹰眼地图的状态，SHOW:显示，HIDE:隐藏（默认）
			mapoption.scale = MConstants.SHOW; // 设置地图初始化比例尺状态，SHOW:显示（默认），HIDE:隐藏。
			mapoption.language = MConstants.MAP_CN;// 设置地图类型，MAP_CN:中文地图（默认），MAP_EN:英文地图
			mapoption.fullScreenButton = MConstants.SHOW;// 设置是否显示全屏按钮，SHOW:显示（默认），HIDE:隐藏
			mapoption.centerCross = MConstants.SHOW;// 设置是否在地图上显示中心十字,SHOW:显示（默认），HIDE:隐藏
			// mapoption.toolbarPos=new MPoint(toolbarWidth,20);
			// //设置工具条在地图上的显示位置
			mapoption.zoom = options.zoom;// 要加载的地图的缩放级别
			mapoption.requestNum = options.requestNum;// 设置地图切片请求并发数。默认100。
			mapoption.isQuickInit = options.isQuickInit;// 设置是否快速显示地图，true显示，false不显示。
			// mapoption.hasDefaultMenu = false;
			mapoption.center = new MLngLat(options.center[0], options.center[1]);
			mapoption.logoUrl = path + '/vortex/gis/images/ditu.png';
			return mapoption;
		} else if (gisType == "mapABCJs") {
			t.createMapABCJs(callback);
		}
	}
	function getTipOption(data, options) {
		var tipOption = new MTipOptions();
		var linestyle = new MLineStyle();
		linestyle.thickness = 2;
		linestyle.color = 0xffffff;
		linestyle.alpha = 1;

		var fontstyle = new MFontStyle();
		fontstyle.name = "Arial";
		fontstyle.size = 13;
		fontstyle.color = 0x000000;
		fontstyle.bold = true;

		var fillStyle = new MFillStyle();
		fillStyle.color = 0xffffff;
		tipOption.tipType = MConstants.HTML_BUBBLE_TIP;
		// tipOption.tipType = MConstants.HTML_CUSTOM_TIP;
		tipOption.tipHeight = options.tipHeight;
		tipOption.tipWidth = options.tipWidth;
		tipOption.hasShadow = false;
		tipOption.fillStyle = fillStyle;
		tipOption.contentFontStyle = fontstyle;
		tipOption.titleFillStyle = fillStyle;
		tipOption.titleFontStyle = fontstyle;
		tipOption.borderStyle = linestyle;
		if (data.config.tipContent && data.config.tipTitle) {
			$(".MFMP_allTitle").css('display', 'none');
			$(".MFMP_b1").css('display', 'none');
			$(".MFMP_b2").css('display', 'none');
			$(".MFMP_b4").css('display', 'none');
			$(".MFMP_b3").css('display', 'none');
			tipOption.content = "<div id='" + data.id
					+ "' style='height:100%;width:100%;'>"
					+ data.config.tipContent + data.config.tipTitle + "</div>";
			tipOption.title = "<div id='" + data.id
					+ "_' style='height:100%;width:100%;'></div>";
		} else {
			tipOption.content = "<div id='" + data.id
					+ "' style='height:100%;width:100%;'></div>";
			tipOption.title = "<div id='" + data.id
					+ "_' style='height:100%;width:100%;'></div>";
		}
		return tipOption;
	}
	function getLabelOption(data) {
		var labelOption = new MLabelOptions();// 添加标注
		labelOption.content = data.config.labelContent;// 标注的内容
		labelOption.hasBorder = data.config.labelBoder == false ? false : true;// 设置标注背景是否有边框，默认为false，即没有边框
		labelOption.hasBackground = data.config.hasBackground == false ? false
				: true;// 设置标注是否有背景，默认为false，即没有背景
		// 标注左上角相对于图片中下部的锚点。Label左上角与图片中下部重合时，记为像素坐标原点(0,0)。
		if (typeof data.config.labelX != "undefined"
				&& typeof data.config.labelY != "undefined") {
			var x = data.config.labelX ? data.config.labelX : 10;
			var y = data.config.labelY ? data.config.labelY : 10;
			labelOption.labelPosition = new MPoint(x, y);
		} else {
			labelOption.labelAlign = MConstants.BOTTOM_CENTER;
		}
		return labelOption;
	}
	function getMarkerOption(data, options, object) {
		var markerOption = new MMarkerOptions();
		if (data.infoWindow != false) {
			var tipOption = MapConstants.getTipOption(data, options);
			markerOption.tipOption = tipOption;
			markerOption.canShowTip = true;// 设置是否在地图中显示信息窗口，true，可显示（默认）；false，不显示
		} else {
			markerOption.canShowTip = false;// 设置是否在地图中显示信息窗口，true，可显示（默认）；false，不显示
		}
		if (data.canShowLabel) {
			// 设置点的标注参数选项
			markerOption.labelOption = MapConstants.getLabelOption(data);
		}
		if (typeof options.anchorX != "undefined"
				&& typeof options.anchorY != "undefined") {
			markerOption.anchor = new MPoint(options.anchorX, options.anchorY);
		}
		markerOption.isDimorphic = true;
		markerOption.picAgent = false;
		if (data.gisCode) {
			if (object.initData) {
				for (var j = 0; j < object.initData.length; j++) {
					if (data.gisCode == object.initData[j].gisCode) {
						markerOption.imageUrl = object.initData[j].url;
					}
				}
				if (!markerOption.imageUrl) {
					if (data.url) {
						markerOption.imageUrl = data.url;
					} else {
						markerOption.imageUrl = "http://code.mapabc.com/images/lan_1.png";
					}
				}
			} else {
				if (data.url) {
					markerOption.imageUrl = data.url;
				} else {
					markerOption.imageUrl = "http://code.mapabc.com/images/lan_1.png";
				}
			}
		} else {
			if (data.url) {
				markerOption.imageUrl = data.url;
			} else {
				markerOption.imageUrl = "http://code.mapabc.com/images/lan_1.png";
			}
		}
		if (data.url) {
			markerOption.imageUrl = data.url;
		}
		if (data.angle) {
			markerOption.rotation = data.angle;
		}
		if (data.edit) {
			markerOption.isEditable = true;
		}
		return markerOption;
	}
	function getLineOption(data, options) {
		var lineopt = new MLineOptions();// 构造一个名为lineopt的线选项对象
		if (data.infoWindow != false) {
			var tipOption = MapConstants.getTipOption(data, options);
			lineopt.tipOption = tipOption;// 设置线的信息窗口参数选项
			lineopt.canShowTip = true;// 设置是否在地图中显示信息窗口，true，可显示（默认）；false，不显示
		} else {
			lineopt.canShowTip = false;// 设置是否在地图中显示信息窗口，true，可显示（默认）；false，不显示
		}
		var linestyle = new MLineStyle();// 创建线样式对象
		linestyle.thickness = options.thickness;// 线的粗细度，默认为2
		linestyle.color = options.color;
		linestyle.lineType = options.lineType;// 线的表现样式，LINE_SOLID，实线（默认），LINE_DASHED，虚线
		lineopt.lineStyle = linestyle;// 设置线的边缘风格
		if (data.edit) {
			lineopt.isEditable = true;
		}
		// 设置线是否高亮显示，默认为false,即没有高亮显示；true，有高亮显示
		if (options.isDimorphic != null) {
			lineopt.isDimorphic = options.isDimorphic;
		} else {
			lineopt.isDimorphic = true;
		}
		// 设置第二种状态的颜色，默认为0xFF0000，即红色
		if (options.dimorphicColor != null) {
			lineopt.dimorphicColor = options.dimorphicColor;
		} else {
			lineopt.dimorphicColor = 0x00A0FF;
		}
		// lineopt.isEditable = false;// 设置线是否为可编辑状态，true，可编辑；false，不可编辑（默认）
		return lineopt;
	}
	function getAreOption(data, options) {
		var areaopt = new MAreaOptions();// 构建一个名为areopt的面选项对象。
		var linestyle = new MLineStyle();// 创建线样式对象
		if (options.thickness) {
			linestyle.thickness = options.thickness;
		} else {
			linestyle.thickness = 3;// 线的粗细度，默认为2
		}
		if (options.lineColor) {
			linestyle.color = options.lineColor;
		} else {
			linestyle.color = 0x0000ff;// 线的颜色，16进制整数，默认为0x005890（蓝色）
		}
		linestyle.lineType = MConstants.LINE_SOLID;// 线的表现样式，LINE_SOLID，实线（默认），LINE_DASHED，虚线
		var fillstyle = new MFillStyle();// 创建填充样式对象
		if (options.color) {
			fillstyle.color = options.color;
		} else {
			fillstyle.color = 0xf5deb3;// 面的填充颜色，16进制整数。
		}
		fillstyle.alpha = 0.5;// 填充面的透明度，范围0~1，0为透明，1为不透明（默认）
		var areastyle = new MAreaStyle();// 创建面样式对象
		areastyle.borderStyle = linestyle;// 面的边框风格。
		areastyle.fillStyle = fillstyle;// 面的填充风格。
		if (data.infoWindow != false) {
			var tipoption = MapConstants.getTipOption(data, options);// 添加信息窗口
			areaopt.tipOption = tipoption;// 设置面的信息窗口参数选项
			areaopt.canShowTip = true;// 设置面是否显示信息窗口
		} else {
			areaopt.canShowTip = false;// 设置面是否显示信息窗口
		}
		if (data.label) {
			var labeloption = new MLabelOptions();// 添加标注
			labeloption.content = data.label;// 标注的内容
			// 设置标注左上角相对于面对象中心的锚点。标注左上角与面对象中心重合时，像素坐标原点(0,0)
			labeloption.labelPosition = new MPoint(10, 10);
			areaopt.labelOption = labeloption;// 设置面的标注选项参数
		}
		// 设置面是否高亮显示，默认为false即没有高亮显示,true有高亮显示
		if (options.isDimorphic != null) {
			areaopt.isDimorphic = options.isDimorphic;
		} else {
			areaopt.isDimorphic = true;
		}
		// 设置第二种状态的颜色，默认为0xFF0000，即红色
		if (options.dimorphicColor != null) {
			areaopt.dimorphicColor = options.dimorphicColor;
		} else {
			areaopt.dimorphicColor = 0x00A0FF;
		}
		areaopt.areaStyle = areastyle;// 设置面的风格
		areaopt.isEditable = false;// 设置面是否为可编辑状态，true，可编辑；false，不可编辑（默认）
		return areaopt;
	}

	function colorToHex(data) {
		if (/^(rgb|RGB)/.test(data)) {
			var rgbColor = data.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
			var strHex = "#";
			for (var i = 0; i < rgbColor.length; i++) {
				var hex = Number(rgbColor[i]).toString(16);
				if (hex === "0") {
					hex += hex;
				}
				strHex += hex;
			}
			if (strHex.length !== 7) {
				strHex = data;
			}
			return strHex;
		} else if (reg.test(data)) {
			var aNum = data.replace(/#/, "").split("");
			if (aNum.length === 6) {
				return data;
			} else if (aNum.length === 3) {
				var numHex = "#";
				for (var i = 0; i < aNum.length; i += 1) {
					numHex += (aNum[i] + aNum[i]);
				}
				return numHex;
			}
		} else {
			return "";
		}
	}
	;

	function colorToRgb(data) {
		var hexColor = data.toLowerCase();
		if (hexColor && this.colorReg.test(hexColor)) {
			if (hexColor.length === 4) {
				var hexColorNew = "#";
				for (var i = 1; i < 4; i += 1) {
					hexColorNew += hexColor.slice(i, i + 1).concat(
							hexColor.slice(i, i + 1));
				}
				hexColor = hexColorNew;
			}
			// 处理六位的颜色值
			var hexColorChange = [];
			for (var i = 1; i < 7; i += 2) {
				hexColorChange.push(parseInt("0x" + hexColor.slice(i, i + 2)));
			}
			return hexColorChange;
		} else {
			return [ 0, 0, 0 ];
		}
	}
	;
})();