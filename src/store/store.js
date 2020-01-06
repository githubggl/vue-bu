import Vue from 'vue'
import Vuex from 'vuex'

import {startProgress, stopProgress} from '@/utils/progress'

import { downloadApi,emergencyAuthorityCode } from '@/common/constants'

import router, { createCmpRoute, getExceptions, resetRouter, cmpName } from '@/router'

import login from './modules/loginModule'
import user from './modules/userModule'
import cmp from './modules/cmpModule'
import menu from './modules/menuModule'

import { setDefaultRoute, getFileType, fileType } from '@/utils/cmp'

import { getSysTime } from '@/service/loginService'

Vue.use(Vuex)

const cloneRoutes = routes=>routes.map(route=>{
  let newRoute = {}
  for(var k in route){
    if(k == 'component'){
      newRoute['component'] = route.component
    }else if(k == 'children'){
      newRoute['children'] = cloneRoutes(route['children'])
    }else{
      newRoute[k] = route[k]
    }
  }
  return newRoute
});

export default new Vuex.Store({
    state: {
      loading: false,
      loadingCount: 0,
      routes: null,
      dynamicRootRoute: null,
      dynamicRouteProcess: false, //在动态路由处理中时，不做其它的路由切换

      isBigScreen: false,
      sources: {},

      ready: false,//登录过后的基础资源是否准备完毕
      hasLoadCmpRoute: false,
    },
    mutations: {
      clear(state){
        state.ready = false
        state.hasLoadCmpRoute = false
      },
      showLoading(state) {
          startProgress()
          state.loading = true
      },
      hideLoading(state) {
          stopProgress()
          state.loadingCount = 0
          state.loading = false
      },
      incLoading(state){
        if(state.loadingCount == 0){
          startProgress()
          state.loading = true
        }
        state.loadingCount ++
      },
      decLoading(state){
        state.loadingCount --
        if(state.loadingCount == 0){
          stopProgress()
          state.loading = false
        }else if(state.loadingCount < 0){
          state.loadingCount = 0
        }
      },

      updateRoutes(state, { routes, dynamicRootRoute }) {
          state.routes = routes;
          state.dynamicRootRoute = dynamicRootRoute;
      },
      // setDynamicRouteProcess(state, dynamicRouteProcess) {
      //   debugger
      //     state.dynamicRouteProcess = dynamicRouteProcess;
      // },
      pushRoute(state, payload) {
          // if (!state.dynamicRouteProcess) {
              router.push(payload);
          // } else {
          //     console.warn('dynamicRouteProcess, skip route: ', payload);
          // }
      },
      // replaceRoute(state, payload) {
      //     if (!state.dynamicRouteProcess) {
      //         router.replace(payload);
      //     } else {
      //         console.trace('dynamicRouteProcess, skip route: ', payload);
      //         debugger
      //     }
      // },

      setIsBigScreen(state, isBigScreen){
        state.isBigScreen = isBigScreen
      },

      addLoadedJs(state, arr){
        arr.forEach(item=>state.sources[item]=true)
      },
      setReady(state){
        state.ready = true
      },

      setLoadCmpRoute(state, hasLoadCmpRoute){
        state.hasLoadCmpRoute = hasLoadCmpRoute
      },
    },
    actions: {
        /**
        *  初始化一些必要的资源
        *  完成后要 commit('setReady')
        */
        initResource({commit, dispatch}){
          commit('setReady')
        },

        clear({commit, dispatch}){
          console.log('store clear');
          commit('clear')
          dispatch('cmp/clear')
          dispatch('login/clear')
          dispatch('menu/clear')
        },

        goDefaultRoute(){
          const redirect = router.currentRoute.query.redirect
          if(redirect){
            console.log(`default redirect = ${redirect}`);
            router.push({path: redirect})
          }else{
            router.push({name: cmpName})
          }
        },

        goSubDefaultRoute(){
          const redirect = router.currentRoute.query.redirect
          // const nextRoute = redirect ? {path: redirect} : {name: 'welcome'}
          // router.push(nextRoute)
          router.push({name: 'welcome'})
          // router.push({path: '/cmp/event'})
          if(redirect){
            setTimeout(()=>router.replace({path: redirect}),0)
          }
        },

        setMainRoutes({ commit }){
          console.log('setMainRoutes start');
          resetRouter()
          let realDynamicRoutes = createCmpRoute()
          const dynamicRootRoute = realDynamicRoutes.find(route=>route.meta.cmp);
          dynamicRootRoute.children.push(...getExceptions());
          setDefaultRoute([dynamicRootRoute])
          router.matcher.addRoutes(realDynamicRoutes)
          router.matcher.addRoutes(getExceptions({name: true}));
          commit('updateRoutes', { routes: [], dynamicRootRoute })
          commit('setLoadCmpRoute', true)
          console.log('setMainRoutes end');
        },

        //对于任意的路由访问如 /a/b ，都构造有对应的/a的路由
        updateRoutes({ state, commit }, { routes }) {
          resetRouter()
          const currentSystem = state.cmp.currentSystem
          let realDynamicRoutes = createCmpRoute(currentSystem.code)
          const dynamicRootRoute = realDynamicRoutes.find(route=>route.meta.cmp);
          dynamicRootRoute.children.push(...routes);
          dynamicRootRoute.children.push(...getExceptions({main: currentSystem.virtual}));
          setDefaultRoute([dynamicRootRoute])
          router.matcher.addRoutes(realDynamicRoutes)
          // router.matcher.addRoutes(getExceptions({name: true}));
          commit('updateRoutes', { routes, dynamicRootRoute })
        },

        async reload({ dispatch }) {
            await dispatch('clear')
            router.replace({ name: 'login' });
            resetRouter()
        },

        showProgress({commit}) {
          commit('showLoading')
        },
        hideProgress({commit}) {
          commit('hideLoading')
        },
        incLoading({commit}){
          commit('incLoading')
        },
        decLoading({commit}){
          commit('decLoading')
        },

        async getSysTime(_, {format}={}){
          const response = await getSysTime()
          let date;
          if(!response){
            date = new Date()
            if(!format)return date
          }else{
            const {datetime} = response
            if(format === true) return datetime
            date = datetime.split(/\s+/).slice(0,2).join(' ').toDate()
          }
          if (format) {
            date = date.format(format)
          }
          return date
        },
    },
    getters: {
        menuData(state) {
            return state.menu.menuData;
        },
        validateCode(state) {
            const token = state.login.token.value
            let code = ''
            if (token) {
                const tokenParts = token.split('.')
                if (tokenParts.length > 1) {
                    code = tokenParts[1]
                }
            }
            return code
        },
        hasEmergencyRight(state){
          if (process.env.NODE_ENV != 'production') {
              return true
          }
          const authorities = state.user.authorities
          return authorities && authorities[emergencyAuthorityCode];
        },
    },
    modules: {
        login,
        user,
        cmp,
        menu
    },
})
