
import {getToken} from '@/utils/storage'

import { emergencyAuthorityCode } from '@/common/constants'

import { getAuthorities } from '@/service/userService'

import { getAllOrganizations } from '@/service/userService'

// initial state
const state = {
  get currentUser(){
    const tokenAll = getToken() || {}
    const {createTokenTime,token,value,tokenExpirePeriod,tokenHeaderName,...userInfo} = tokenAll;
    return userInfo
  },
  pathname: '',
  authorities: null,

  allOrgs: [],
}

// getters
const getters = {
  getOrgNameById: (state, getters, rootState, rootGetters) => (orgId) => {
    if(!orgId) return ''
    const orgItem = state.allOrgs.find(item=>item.id == orgId)
    return orgItem && orgItem.organname || ''
  },
}

// actions
const actions = {
  hasEmergencyRight({ state }){
    if (process.env.NODE_ENV != 'production') {
      return true
    }
    return state.authorities && state.authorities[emergencyAuthorityCode];
  },

  //getAuthorities，需要自己处理错误
  //仅在全局路由钩子中使用。
  async loadAuthorities({commit, dispatch}){
    console.log('loadAuthorities');
    const response = await getAuthorities()
    console.log('loadAuthorities response',response);
    let items = response
    const authoritiesCodeMap = {}
    items.forEach(authority=>{
      let authoritycode = authority.authoritycode
      authoritiesCodeMap[authoritycode] = authority
    });
    await commit('setAuthorities', authoritiesCodeMap);
  },

  async loadAllOrgs({commit}){
    const response = await getAuthorities() || []
    await commit('setAllOrgs', response);
  },
}

// mutations
const mutations = {
  // saveLoginUser(state, payload){
  //   state.currentUser = payload;
  // },
  // removeLoginUser(state){
  //   state.currentUser = {};
  //   state.pathname = '';
  // },
  savePathname(state, pathname){
    state.pathname = pathname;
  },
  setAuthorities(state, authorities){
    console.log('setAuthorities');
    state.authorities = authorities
  },
  setAllOrgs(state, allOrgs){
    state.allOrgs = allOrgs
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
