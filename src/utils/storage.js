const memoryStore = {};
const memoryGet = key=>{
  return memoryStore[key]
}
const memorySet = (key, obj) =>{
  memoryStore[key] = obj
}
const memoryRemove = key=>{
  delete memoryStore[key]
}
// const localStorageGet = key=>{
//   const str = window.localStorage.getItem(key);
//   if(str && str.length > 1){
//     if((str[0] == '{' && str[str.length - 1] == '}') || (str[0] == '[' && str[str.length - 1] == ']')){
//       try {
//         return JSON.parse(str);
//       } catch (e) {
//         console.log(`localStorageGet parse error, key=${key} value=${str}`);
//         return;
//       }
//     }
//   }
//   return str;
// }
// const localStorageSet = (key, value)=>{
//   if(arguments.length == 1){
//     localStorage.removeItem(key);
//     return;
//   }
//   const opt = Object.prototype.toString.call(value);
//   if(opt == '[object Object]' || opt == '[object Array]'){
//     value = JSON.stringify(value);
//   }
//   localStorage.setItem('tk', value);
// }
const localStorageGet = key=>{
  return window.localStorage.getItem(key);
}
const localStorageSet = (key, value)=>{
  window.localStorage.setItem(key, JSON.stringify(value));
}
const localStorageRemove = key=>{
  window.localStorage.removeItem(key);
}
let getObj, setObj, removeObj;
if(window.localStorage){
  getObj = localStorageGet
  setObj = localStorageSet
  removeObj = localStorageRemove
} else {
  getObj = memoryGet
  setObj = memorySet
  removeObj = memoryRemove
}



export function updateToken(token) {
  if(token){
    setObj('tk', token)
  }else {
    removeObj('tk');
  }
}
export function getToken(){
  const token = getObj('tk')
  if(token){
    try{
      return JSON.parse(token)
    } catch(e){
      
    }
  }
}

export {
  getObj, setObj, removeObj
}
