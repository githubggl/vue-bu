export { default as buildTreeData } from './cmp/buildTreeData'

export function addWindowEvent(eventName, h){
  const old = window[eventName]
  if(old){
    window[eventName] = function(e){
      old.apply(window, arguments)
      h.apply(window, arguments)
    }
  }else{
    window[eventName] = h
  }
}
export function loadJs(path, include) {
    const script = document.createElement('script');
    script.type = "text/javascript"
    script.src = path
    if (include) {
        // script.include = include
        script.setAttribute('include', include)
    }
    document.head.appendChild(script)
};
export function appendToUrl(obj, url) {
    url = url || '';
    if (!obj) return url;
    var append = '';
    var and = true;
    if (url.indexOf('?') == -1) {
        append = '?';
        and = false;
    }
    for (var k in obj) {
        if (and) {
            append += '&';
        } else {
            and = true;
        }
        append += k + '=' + encodeURIComponent(obj[k]);
    }
    return url + append;
}
/**
 *
 * @param {Array} routes 用户过滤后的路由
 *
 * 递归为所有有子路由的路由设置第一个children.path为默认路由
 */
export function setDefaultRoute(routes) {
    routes.forEach((v, i) => {
        if (v.children && v.children.length > 0) {
            v.redirect = { name: v.children[0].name }
            setDefaultRoute(v.children)
        }
    })
}
export function splitArr(arr, tester) {
    if (!arr) return [
        [],
        []
    ];
    var item, a = [],
        b = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        item = arr[i];
        if (tester(item)) {
            a.push(item)
        } else {
            b.push(item)
        }
    }
    return [a, b];
}
export function convertMinute(minute) {
    if (!minute) {
        minute = 0;
    }
    let minuteTxt = "";
    let day = parseInt(minute / (24 * 60));
    let hour = parseInt((minute % (24 * 60)) / 60);
    let min = (minute % (24 * 60)) % 60;
    if (day > 0) {
        minuteTxt += day + "天";
    }
    if (hour > 0) {
        minuteTxt += hour + "小时";
    }
    if (min > 0) {
        minuteTxt += min + "分钟";
    }

    return { minuteTxt, day, hour, min };
}

export function geoJSONOfPoint(lng, lat) {
    return {
        "type": "Point",
        "coordinates": [lng, lat]
    }
}
export function getLngLatFromGeoJSON(geo) {
    const defaultValue = [0, 0]
    if (!geo) return defaultValue
    try {
        if (typeof geo == "string") {
            geo = JSON.parse(geo);
        }
        return geo.coordinates || defaultValue
    } catch (e) {
        console.error(e);
        return defaultValue
    }
}

export function walkTree(rootNode, func, { childrenProp = "children" } = {}) {
    if (!rootNode) return
    if (func(rootNode)) {
        return true
    }
    const children = rootNode[childrenProp]
    if (children) {
        return children.some(child => {
            return walkTree(child, func, { childrenProp })
        })
    }
}
export function findItemPath(rootItems, idPath, {idProp = "id", childrenProp = "children"} = {}){
  const itemPath = []
  if(!idPath)return itemPath
  const len = idPath.length
  if(!len) return itemPath
  let i = 0
  let items = rootItems
  const findItem = (items, id)=>{
    var item
    for(var i=0,len=items.length; i<len; i++){
      item = items[i]
      if(item[idProp] == id){
        return item
      }
    }
  };
  while((i<len) && items){
    let id = idPath[i]
    var item = findItem(items, id)
    if(item){
      itemPath.push(item)
      items = item[childrenProp]
      i++
    }else{
      break
    }
  }
  return itemPath
}

export function initAppClass(node, appClass){
  var className = node.className
  if(className){
    var classes = className.split(/\s+/).filter(className=>className.indexOf('app-')!=0)
    classes.push(appClass)
    className = classes.join(' ')
  }else{
    className = appClass
  }
  node.className = className
}

export function getStyle(obj, attr) {
    return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
}
export function debounce(fun, wait = 300) {
    let h;
    return function debouncer(e) {
        if (h) {
            clearTimeout(h);
        }
        h = setTimeout(()=>{
            fun.call(null, e)
        }, wait);
    }
}
export function getFileType(fileName) {
    const suf = getSuffix(fileName);
    if (!suf) return;
    for (var type in fileTypes) {
        var supports = fileTypes[type]
        if (supports[suf]) {
            return type
        }
    }
}

function getFileName(contentDisposition) {
    const fn = "filename="
    const i = contentDisposition.indexOf(fn)
    let name
    if (i > -1) {
        name = contentDisposition.substr(i + fn.length)
        name = name.substr(1, name.length - 2)
    } else {
        name = contentDisposition
    }
    return name
}
export function getSuffix(name) {
    var i = name.lastIndexOf(".");
    if (i > 0) {
        return name.substr(i + 1);
    }
}
const fileTypes = {
    pic: {
        bmp: 1,
        jpg: 1,
        jpeg: 1,
        png: 1,
        gif: 1
    },
    audio: {
        mp3: 1,
        // amr: 1,
        // aac: 1,
        ogg: 1,
        wav: 1,
    },
    video: {
        mp4: 1,
        // m4v: 1,
        // f4v: 1,
        '3gpp': 1,
        webm: 1,
        // flv: 1,
    }
}
export const fileType = {
    pic: 'pic',
    audio: 'audio',
    video: 'video',
    text: 'text',
}
export const imgMineType = {
    'gif': 'image/gif',
    'jp2': 'image/jp2',
    'jpe': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
}
export const imgMineTypes = ['image/gif', 'image/jp2', 'image/jpeg', 'image/png']

export const fileMineTypes = {
    ...imgMineType,

    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',

    'ogg': 'video/ogg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    // '3gpp': 'video/3gpp',
}
var _mediaMineType = []
for (var k in fileMineTypes) {
    let fileMineType = fileMineTypes[k]
    if (_mediaMineType.indexOf(fileMineType) == -1) {
        _mediaMineType.push(fileMineType)
    }
}
export const mediaMineType = _mediaMineType
