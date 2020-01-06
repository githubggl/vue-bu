// import shop from '../../api/shop'
// import { preLogin as preLoginService, doLogin as doLoginService, doLogout as doLogoutService } from '@/service/loginService'
import { authLogin, authLogout, preLogin } from '@/service/loginService'

import request, { putToken } from '@/utils/request'
import { updateToken, getToken } from '@/utils/storage'

import { Notification } from 'element-ui';

// import router from '@/router'

// initial state
const state = {
    status: '', //error  ok
    errorMsg: '',
    errorCode: 0,
    get token() {
        return getToken() || {}
    },
    set token(value) {
        updateToken(value)
    },

    loginSession: '',
    loginCount: 0,
    logining: false,
}

// getters
const getters = {}

// actions
const actions = {
    async preLogin({ state, commit, dispatch }){
      const response = await preLogin().catch(e=>null);
      // const { session, tryCount } = response || {}
      commit('setLoginSession', response || {})
    },

    login({ state, commit, dispatch }, payload) {
        commit('setLogining', true)
        const params = { ...payload, session: state.loginSession };
        authLogin(params)
          .then(response=>dispatch('loginSuccess', response.data))
          .catch(response=>dispatch('loginError', response))
          .then(()=>commit('setLogining', false));
    },

    async loginSuccess({ state, commit, dispatch, rootState }, payload) {
        const { userId, loginName, token, tokenHeaderName, createTokenTime, tokenExpirePeriod } = payload;
        commit('saveToken', payload)
        // await dispatch('menu/loadMenus', {}, { root: true });
        // commit('replaceRoute', {name: 'main'}, { root: true })
        dispatch('goDefaultRoute', null, {root: true})
    },

    loginError({ state, commit, dispatch }, response) {
      commit('incLoginCount')
      let { errorCode, message} = response
        if (!message) {
          message = '用户名或密码错误！';
        }
        if (errorCode == 400 || errorCode == 401) {
            // msg = '用户名或密码错误！';
        } else if(errorCode == 403){
          commit('resetLoginCount')
       } else {
            console.error(`login error code: ${errorCode}`);
        }
        commit('saveError', { errorMsg: message, errorCode });
        dispatch('hideProgress', null, { root: true });

    },
    //主动退出
    async logout({ commit, dispatch }) {
        dispatch('showProgress', null, { root: true });
        await authLogout();
        dispatch('reload', null, { root: true })
    },

    clear({ commit }) { //
        commit('clear');
        // commit('user/removeLoginUser', null, {root: true});
    },

    async updateTokenByValue({ state, commit, dispatch }, { value }) {
        const oldToken = state.token;
        const tokenHeaderName = oldToken && oldToken.tokenHeaderName || 'x-user-token'; //正确的做法应该是通过解析value得到
        return await putToken(tokenHeaderName, value)
    },

}

const mutations = {
    saveError(state, { errorMsg, errorCode }) {
        state.errorMsg = errorMsg || '';
        state.errorCode = errorCode || 0;
        state.status = 'error';
        state.token = {};
    },

    saveToken(state, { token, tokenExpirePeriod, ...rest }) {
        //userId,loginName,token,tokenHeaderName,createTokenTime,tokenExpirePeriod
        const expire = tokenExpirePeriod - 30 * 1000;
        state.token = {
            value: token,
            tokenExpirePeriod: expire > 1000 ? expire : tokenExpirePeriod,
            ...rest
        }
        state.errorMsg = '';
        state.errorCode = 0;
        state.status = 'ok';
    },

    clear(state) {
        state.errorMsg = '';
        this.errorCode = 0;
        this.status = '';
        state.token = {};
    },

    updateToken(state, { token, tokenExpirePeriod, ...rest }) {
        //userId,loginName,token,tokenHeaderName,createTokenTime,tokenExpirePeriod
        const expire = tokenExpirePeriod - 30 * 1000;
        state.token = {
            value: token,
            tokenExpirePeriod: expire > 1000 ? expire : tokenExpirePeriod,
            ...rest
        }
    },

    setLoginSession(state, { session, tryCount }){
      state.loginSession = session
      state.loginCount = tryCount || 0
    },

    incLoginCount(state){
      state.loginCount++
    },
    resetLoginCount(state){
      state.loginCount=0
    },

    setLogining(state, logining){
      state.logining = logining
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
