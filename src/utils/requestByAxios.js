import axios from 'axios';
import keepAlive, { stop as stopKeepAlive, putToken } from './keepAlive';
import { Notification } from 'element-ui';
import router from '../router';
import store from '@/store/store'
import { appendToUrl } from '@/utils/cmp'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export { stopKeepAlive, putToken }

const updateKeepAlive = data=> (keepAlive(), data)

const codeMessage = {
    400: '参数列表错误(缺少，格式不匹配)',
    406: '媒体内容不符合要求',
    408: '请求超时',
    409: '资源冲突，重复的资源',
    415: '不支持的数据(媒体)类型',
    422: '请求格式正确，但是由于含有语义错误，无法响应',
    423: '当前资源被锁定',
    429: '请求过多被限制',
    500: '系统内部错误',
    501: '接口未实现',
}
const checkStatus = e => {
  const response = e.response
  const status = response.status;
  // if (status == 200) {
  //     updateKeepAlive();
  //     return response
  // }
  if (status == 401) { //Unauthorized
      checkGoLogout();
      return;
  }
  if (status == 403) { //Forbidden
      store.commit('pushRoute', { name: '403' })
      return;
  }
  if (status == 404) { //Not Found
      store.commit('pushRoute', { name: '404' })
      return;
  }

  const message = response.data.message || getErrorMessage(status)
  showError(message)
};

const buildOptions = option=>{
  const options = {
      ...option,
  };
  if(!('preventCache' in options)){
      options.preventCache = true
  }
  if(options.body){
    let data = options.body
    delete options.body
    if(!options.data){
      options.data = data
    }
  }
  const newOptions = { ...options };
  const method = newOptions.method && newOptions.method.toLowerCase() || 'get'; //默认GET请求
  newOptions.method = method
  if ( method === 'post' || method === 'put' || method === 'delete' ) {
      if (newOptions.data instanceof FormData) {
          // newOptions.body is FormData
          newOptions.headers = {
              Accept: 'application/json',
              ...newOptions.headers,
          };
      } else {
          newOptions.headers = {
              Accept: 'application/json',
              'Content-Type': 'application/json; charset=utf-8',
              ...newOptions.headers,
          };
      }
  } else if (newOptions.method == 'get') {
      if (newOptions.data) {
          newOptions.params = newOptions.data
          delete newOptions.data;
      }
  }
  if (options.token !== false) {
      const token = store.state.login.token || {};
      const tk = token.tokenHeaderName,
          tv = token.value;
      if (!tk || !tv) {
          checkGoLogout();
          return;
      }
      if (!newOptions.headers) newOptions.headers = {};
      newOptions.headers[tk] = tv;
  }
  return newOptions
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "axios"
 * @return {object}           api 返回结果，如果出错，则没有返回结果
 */
export default function request(url, option) {
    const newOptions = buildOptions(option)
    if(!newOptions) return noOptionsResponse(option)
    const returnResponse = newOptions.returnResponse
    if(newOptions.preventCache){
      delete newOptions.preventCache
      url = appendToUrl({preventCache: new Date().getTime()}, url);
    }
    const autoLoading = !newOptions.noAutoLoading
    if(autoLoading){
      store.commit('incLoading')
    }
    let p = instance(url, newOptions).then(updateKeepAlive).catch(checkStatus)
    p = (returnResponse && p || p.then(getResponseData))
    if(autoLoading){
      p = p.then(decLoading)
    }
    return p;
}
export function freeRequest(url, option){
  const options = {...option, token: false}
  const newOptions = buildOptions(options)
  if(newOptions.preventCache){
    delete newOptions.preventCache
    url = appendToUrl({preventCache: new Date().getTime()}, url);
  }
  const autoLoading = !newOptions.noAutoLoading
  if(autoLoading){
    store.commit('incLoading')
  }
  let p = instance(url, newOptions)
  if(autoLoading){
    p.then(decLoading)
  }
  p = p.catch(e=>{
    if(autoLoading){
      decLoading()
    }
    const response = e.response
    if(options.showError){
      const status = response.status;
      const message = response.data.message || getErrorMessage(status)
      showError(message)
    }else{
      const data = {...response.data}
      data.errorCode = response.status
      throw data
    }
  })
  return p;
}

//自己抓异常
export function sourceRequest(url, option){
  const newOptions = buildOptions(option)
  if(!newOptions){
    return Promise.resolve()
  }
  url = appendToUrl({preventCache: new Date().getTime()}, url);
  let p = instance(url, newOptions).catch(showAxiosError).then(getResponseData)
  return p;
}

function noOptionsResponse(option){
  const response = {status: 400}
  if(option && option.returnResponse){
    return Promise.resolve({status: 400})
  }else{
    return Promise.resolve()
  }
}

export function pageRequest(url, option) {
    if (option && option.body && option.body.page) {
        if (option.body.page > 0) {
            option.body.page--;
        }
    }
    return request(url, option);
}

export function delay(time = 1000) {
    if (time instanceof Response) {
        promiseAfter(time, 1000);
    }
    return response => promiseAfter(response, time)
}
export function promiseAfter(result, time, error) {
    if (arguments.length > 2 && (error || (Math.random() >= 0.5))) {
        result = null;
    }
    return new Promise(resolve => {
        setTimeout(_ => {
            resolve(result)
        }, time)
    })
}

export function getDataOrErrorCode(response){
  if(response.status == 200){
    return response.data
  }else{
    return {errorCode: response.status, message: response.data && response.data.message || response.message}
  }
}

const checkGoLogout = () => {
    const router_ = router;
    const currentRoute = router_.currentRoute;
    if (currentRoute.name != 'login' && currentRoute.path != '/') {
        console.log(`checkGoLogout logout`, currentRoute);
        store.dispatch('login/logout')
    }
}

const getErrorMessage = status=>(codeMessage[status] || '未知错误')

const showError = message => Notification.error({ title: '错误', message: message });

const showAxiosError = e=>{
  const response = e.response
  const status = response.status;
  const message = response.data.message || getErrorMessage(status)
  showError(message)
  // return {data: {errorCode: status, message: message}}
  throw {errorCode: status, message: message}
}

export const getResponseData = response=>(response && response.data)

const decLoading = r=>(store.commit('decLoading'), r)

export function blobRequest(){}
