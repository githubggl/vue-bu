import fetch from './fetchByAxios';
import store from '@/store/store'

let timer;
export default function keep(){
  const token = store.state.login.token || {};
  if(timer){
    window.clearInterval(timer);
  }
  if(!token.tokenExpirePeriod){
    console.error('keep alive start failed', token);
    return;
  }
  const tokenExpirePeriod = token.tokenExpirePeriod;
  timer = window.setInterval(keeper, tokenExpirePeriod)
  console.log('prepare keepAlive, ',tokenExpirePeriod, timer);
}
export function stop(){
  console.log('stop keepAlive,',timer);
  if(timer){
    window.clearInterval(timer);
  }
}

export function keeper(){
  const token = store.state.login.token || {};
  const tk = token.tokenHeaderName, tv = token.value;
  if(!tk || !tv){
    store.dispatch('login/clear');
    if(timer){
      window.clearInterval(timer);
    }
    return;
  }
  console.log('keepAlive');
  return putToken(tk, tv);
}
export function putToken(tokenHeaderName, value){
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
  }
  headers[tokenHeaderName] = value;
  return fetch('/api/auth/token', {
    method: 'PUT',
    headers,
  }).then(response=>{
    console.log('keeper response:', response);
    if(response.status !== 200){
      if(timer){
        window.clearInterval(timer);
      }
      store.dispatch('login/clear');
    }else{
      // const {userId, loginName} = response;
      // store.commit('user/saveLoginUser', {userId, loginName}, {root: true});
      store.commit('login/updateToken', response.data,  {root: true});
    }
    return response;
  });
}
