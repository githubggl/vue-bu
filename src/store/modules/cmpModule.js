// import shop from '../../api/shop'
import { getConfigByGroupName,loadSystemMenuService } from '@/service/cmpService'

import router from '@/router'

import { appendToUrl } from '@/utils/cmp'

const configToOption = config=>{
    return {
        value: config.value,
        label: config.name,
        config,
    }
}

// initial state
const state = {
  systemMenuData: null,//系统菜单
  currentSystem: null,

  monitorConfigs: null,
  longTimeOnline: 3, // 单位：小时

  newEventSignal: null,

  systemConfigs: {},
}

// getters
const getters = {
  // menuData(state, getters, rootState, rootGetters){
  //   return rootGetters.menuData;
  // }
}


// actions
const actions = {

  async loadSystemMenu({state, commit, dispatch}){
    const response = await loadSystemMenuService();
    console.log('菜单：   ', response)
    const systemMenuData = response || []
    commit('saveSystemMenuData', systemMenuData)
    // throw new Error("slskjlfajsdlfasj fldajdflajdfka")
  },

  async selectCurrentSystem({state, commit, dispatch}, payload){
    const goSubRoute = await dispatch('setCurrentSystemAndLoadMenus', payload)
    if(goSubRoute){
      await dispatch('goSubDefaultRoute', null, {root: true})
      return true
    }
    return false
  },

  async setCurrentSystemAndLoadMenus({state, rootState, commit, dispatch}, payload){
    const systemMenuData = state.systemMenuData
    if(systemMenuData){
      const {code} = payload
      const currentSystem = systemMenuData.find(menu=>menu.code == code) || {virtual: true, code: code}
      const sysurl = currentSystem.sysurl
      if(sysurl){
        window.open(appendToUrl({token:rootState.login.token.value},sysurl))
        return false
      }
      commit('setCurrentSystem', currentSystem)
      await dispatch('menu/loadMenus', currentSystem, {root: true})
      return true
    }else{
      await dispatch('loadSystemMenu')
      return await dispatch('setCurrentSystemAndLoadMenus', payload)
    }
  },

  async loadMonitorConfig({commit, dispatch}){
      const configs = await dispatch('loadSystemConfig', '监控')
      if(!configs){
        return;
      }
      const map = {}
      configs.forEach(({code, value})=>{
        map[code] = value
      });
      commit('updateMonitorConfigs', map)
      return map
  },
  async loadLongTimeConfig({commit, dispatch}){//长时间在线 时长配置
      const configs = await dispatch('loadSystemConfig', 'longTimeOnline')
      if(!configs){
        return;
      }
      const config = configs[0]
      if(!config) return
      const time = +config.value
      commit('updateLongTimeOnlineConfig', time)
      return time
  },

  loadMapConfigs({dispatch}){
    dispatch('loadMonitorConfig')
    dispatch('loadLongTimeConfig')
  },

  async loadSystemConfig({commit}, groupName){
    const configs = await getConfigByGroupName(groupName)
    if(!configs){
      return;
    }
    await commit('updateGroupSystemConfigs', {groupName, configs})
    return configs
  },

  async getSystemConfig({state, dispatch}, {groupName, force, isToOption, valueNameMap}){
      let configs = state.systemConfigs[groupName]
      if(!configs || force){
          configs = await dispatch('loadSystemConfig', groupName)
      }
      configs = configs || []
      if(isToOption){
          configs = configs.map(configToOption)
      }else if(valueNameMap){
          const obj = {}
          configs.forEach(config=>{
              obj[config.value] = config.name
          });
          configs = obj
      }
      return configs
  },

  clear({commit}){
    commit('clear')
  },
}

// mutations
const mutations = {

  saveSystemMenuData(state, systemMenuData){
    systemMenuData.forEach(sysMenu=>{
      const oriCode = sysMenu.code
      sysMenu.code = sysMenu.sysaction || sysMenu.syscode || oriCode
      sysMenu.oriCode = oriCode
    })
    state.systemMenuData = systemMenuData
    console.log('saveSystemMenuData');
  },

  setCurrentSystem(state, name){
    state.currentSystem = name
  },

  updateGroupSystemConfigs(state, {groupName, configs}){
    state.systemConfigs[groupName] = configs
  },
  updateMonitorConfigs(state, configs){
    state.monitorConfigs = configs
  },
  updateLongTimeOnlineConfig(state, longTime){
    state.longTimeOnline = longTime
  },

  updateNewEventSignal(state){
      state.newEventSignal = {}
  },

  clear(state){
    state.systemMenuData = null
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
