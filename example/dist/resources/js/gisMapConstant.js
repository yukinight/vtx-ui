/*
建议所有在使用经纬度时，都将值设置为float，不要使用string，避免出现问题
 */
var gisMapConstant = {
	isUseWmtsMapLayer : false, // 是否使用天地图(瓦片，切层)
	defaultGisWkid : 4326,// 坐标系
	defaultMapLayerServices : "http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer",// 默认图层
	defaultLoadGisType : 'bMap',// arcgis,mapABCFlash,mapABCJs,aMap
	defaultMapLng : "116.468021",
	defaultMapLat : "39.890092",
	defaultMapCenter : [ 116.468021, 39.890092 ],// 北京市
	defaultMapZoom : "17",
	defaultMapCityName : "北京市",
	gisVersion : "2.6",
	gisJsCssUrlServer : 'http://192.168.1.23:8888/vortex/arcgis',
	circle: 'BMAP_POINT_SHAPE_CIRCLE',//圆形
	star: 1,//星形
	square: 4,//方形
	rhombus: 5,//菱形
	waterrdrop: 2,//水滴状，该类型无size和color属性
	tiny: 1, //定义点的尺寸为超小，宽高为2px*2px
	smaller: 2,//定义点的尺寸为很小，宽高为4px*4px
	small: 3,//定义点的尺寸为小，宽高为8px*8px
	normal: 4,//定义点的尺寸为正常，宽高为10px*10px，为海量点默认尺寸
	big: 5,//定义点的尺寸为大，宽高为16px*16px
	bigger: 6,//定义点的尺寸为很大，宽高为20px*20px
	huge: 7,//定义点的尺寸为超大，宽高为30px*30px
	getDefaultMapCenter: function (){
		$.ajax({
			url : path + "/cloud/login/logininfo.sa",
			type: "post",
			dataType : "json",
			async: false,
			success: function (data){
				if(data.latitude && data.longitude){
					gisMapConstant.defaultMapCenter = [data.longitude, data.latitude];
					gisMapConstant.defaultMapLng = data.longitude;
					gisMapConstant.defaultMapLat = data.latitude;
				}
			}
		});
	}
};
// center : [ 117.18138, 34.24751 ],//徐州
// center : [ 119.945812, 30.055723 ],//富阳
// center : [ 119.82, 31.36 ],//宜兴
// center : [ 120.61, 31.30 ],//苏州
// center : [ 120.910721, 32.018556 ],//南通
// center : [ 119.967957, 30.534468 ],//浙江德清