export function getCRS(epsgCodeStr, bounds, resolutions){
  const L = window.L;
  return L.Proj.CRS(epsgCodeStr,{
    bounds: L.bounds([bounds.left, bounds.bottom], [bounds.right, bounds.top]),
    resolutions: resolutions,
    origin: [bounds.left, bounds.top]
  });
};

export function getProjectionExtent(requestUrl){
	requestUrl = requestUrl + "/" + "prjCoordSys/projection/extent.json";
	var commit = new Requester();
	extent = commit.sendRequestWithResponse(requestUrl, "GET", null);
	if(extent){
		var result = eval('('+extent+')');
		if(result && result.left && result.right && result.top && result.bottom) {
			return result;
		}
	}
	return null;
}

export function getVectorStyle(requestUrl){
	requestUrl = requestUrl + "/" + "tileFeature/vectorstyles.json?type=MapBox_GL&styleonly=true";
	var commit = new Requester();
	try {
		var style = commit.sendRequestWithResponse(requestUrl, "GET", null);
		return JSON.parse(style);
	}catch(ex){
		return null;
	}
}

export function scaleToResolution(scale, dpi, mapUnit) {
	var inchPerMeter = 1 / 0.0254;
  var meterPerMapUnitValue = getMeterPerMapUnit(mapUnit);
 	var resolution = scale * dpi * inchPerMeter * meterPerMapUnitValue;
	resolution = 1 / resolution;
	return resolution;
}

export function resolutionToScale(resolution, dpi, mapUnit) {
  	var inchPerMeter = 1 / 0.0254;
  	// 地球半径。
 	 	var meterPerMapUnit = getMeterPerMapUnit(mapUnit);
 		var scale = resolution * dpi * inchPerMeter * meterPerMapUnit;
 		scale = 1 / scale;
	  	return scale;
}

export function getMeterPerMapUnit(mapUnit) {
  	var earchRadiusInMeters = 6378137;// 6371000;
  	var meterPerMapUnit;
  	if (mapUnit == "METER") {
      	meterPerMapUnit = 1;
 		} else if (mapUnit == "DEGREE") {
      	// 每度表示多少米。
      	meterPerMapUnit = Math.PI * 2 * earchRadiusInMeters / 360;
  	} else if (mapUnit == "KILOMETER") {
      	meterPerMapUnit = 1.0E-3;
  	} else if (mapUnit == "INCH") {
      	meterPerMapUnit = 1 / 2.5399999918E-2;
  	} else if (mapUnit == "FOOT") {
      	meterPerMapUnit = 0.3048;
  	}
  	return meterPerMapUnit;
}

//由于mvt的style渲染必须要传一个完整的分辨率数组，这里计算出一个从0开始的分辨率数组
export function getStyleResolutions(bounds){
	var styleResolutions = [];
	var temp = Math.abs(bounds.left - bounds.right)/ 256;
	for(var i = 0;i < 22;i++){
		if(i == 0){
			styleResolutions[i] = temp;
			continue;
		}
		temp = temp / 2;
		styleResolutions[i] = temp;
	}
	return styleResolutions;
}

export function getScales(bounds, coordUnit){
	var resolution0 = Math.abs(bounds.left - bounds.right)/ 256;
	var temp = resolutionToScale(resolution0, 96, coordUnit);
	var scales = [];
	for(var i = 0;i < 22;i++){
			if(i == 0){
				scales[i] = temp;
				continue;
			}
			temp = temp * 2;
			scales[i] = temp;
		}
		return scales;
}
const bounds = [[618612.366130086000000,2978732.385314941400000],[627334.975097656200000,	3011436.172119141000000]]
export const CRS_4506 = new window.L.Proj.CRS('EPSG:4506', {
  def:'+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs',
  bounds,
  resolutions: [
    1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125,
    0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125,
    0.000021457672119140625, 0.000010728836059570312, 0.000005364418029785156, 0.000002682209014892578, 0.000001341104507446289, 6.705522537231445e-7
  ]
})


const Requester = function(){
  this.commit = null;
  try{
      this.commit = new ActiveXObject("Msxml2.XMLHTTP");
  }catch(ex){
      try{
          this.commit = new ActiveXObject("Microsoft.XMLHTTP");
      }catch(ex){
          this.commit=null;
      }
  }
  if(!this.commit && typeof XMLHttpRequest != "undefined"){
      this.commit = new XMLHttpRequest();
  }
  /**
   * 发送异步请求。
   */
  this.sendRequest =  function(url , method ,entry ,onComplete){
      var xhr = this.commit;
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      xhr.onreadystatechange = function(){
          var readyState = xhr.readyState;
          if (readyState == 4){
              var status = xhr.status;
              var responseText =  xhr.responseText ;
              onComplete(responseText);

              xhr.onreadystatechange = function(){};
              xhr = null;
          }
      };
      xhr.send(entry);
  }
  /**
   * 发送一个同步请求。
   */
  this.sendRequestWithResponse = function(url,method,entry){
      var xhr = this.commit;
      xhr.open(method, encodeURI(url), false);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      xhr.send(entry);
      return xhr.responseText;
  }
}
