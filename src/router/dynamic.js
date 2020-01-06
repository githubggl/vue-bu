
import CmpLayout from '@/views/cmp/Cmp.vue'
import Welcome from '@/views/cmp/Welcome.vue'
import Main from '@/views/cmp/Main.vue'
import updatePsw from '@/views/cmp/userInterior/updatePsw.vue'
import updateUserInfo from '@/views/cmp/userInterior/updateUserInfo.vue'

import store from '@/store/store'

import { MessageBox } from 'element-ui';

const cmpName = 'cmp'

const createCmpRoute = path=>(path=path || 'cmp', [
  {
    path: `/${path}`,
    name: cmpName,
    component: CmpLayout,
    meta: {
      requiresAuth: true,
      cmp: true
    },
    children: [
      {
        path: 'main',
        name: 'main',
        component: Main,
        meta: {
          requiresAuth: true,
          main: true,
        },
      },
      {
        path: 'welcome',
        name: 'welcome',
        component: Welcome,
      },{
        path: 'updatePsw',
        name: 'updatePsw',
        component: updatePsw,
      },{
        path: 'updateUserInfo',
        name: 'updateUserInfo',
        component: updateUserInfo,
      }
    ]
  }
])

export {
  cmpName,
  createCmpRoute,
}

const checkLoadSystemMenus = ()=>{
  console.log('checkLoadSystemMenus');
  if(store.state.cmp.systemMenuData){
    return Promise.resolve(true)
  }
  return store.dispatch("cmp/loadSystemMenu", null, {root: true})
};

const checkLoadAuthorities = ()=>{
  console.log('checkLoadAuthorities');
  if(store.state.user.authorities){
      return Promise.resolve(true)
  }else{
      return store.dispatch('user/loadAuthorities', null, {root: true})
  }
};

const checkLoadMenuData = ()=>{
  if(store.state.menu.menuData){
    return Promise.resolve(true)
  }else{
    return store.dispatch('menu/loadMenus', null, {root: true})
  }
};

const getApiErrorHandler = (to, next)=>(e)=>{
  store.commit('decLoading')
  if(e && e.errorCode == 401){
    //token过期，重新登录
    console.log('token过期，重新登录');
    store.dispatch('clear')
    const query = {}
    if(to.path != '/'){
      query.redirect = to.fullPath
    }
    next({name: 'login', query: query})
  }else{
    //其它错误，禁止访问
    next(false)
  }
};

export default function dynamic(router){
  if(router._dynamic_)return;
  router._dynamic_ = true;
  router.beforeEach((to, from, next) => {
    store.commit('incLoading')

    console.log(`route before ${from.name || from.path} => ${to.name || to.path}`);

    const localTk = store.state.login.token.value;

    if (localTk) {//已经登录

      if(to.name == 'login'){//不能再次进入登录路由，外部来的 进入根，否则滚回去
        store.commit('decLoading')
        if(from.name){
          next(false)
        }else{
          next({name: 'root'})
        }
        return
      }

      checkLoadSystemMenus().then(checkLoadAuthorities).then(function(){
        console.log('after checkLoadAuthorities');
        if (to.matched.length > 0) {
          if(to.name == 'root'){
            store.commit('decLoading')
            const redirect = to.query.redirect
            if(redirect){
              console.log('redirect to > ', redirect);
              next({path: redirect})
            }else{
              next({name: cmpName})
            }
          }else{
            next()
          }
        } else {
          let hasLoadCmpRoute = store.state.hasLoadCmpRoute
          // let menuData = store.state.menu.menuData
          if(!hasLoadCmpRoute){
            store.dispatch('setMainRoutes')
          }

          store.commit('decLoading')
          if(to.name){
            next({name: to.name, query: to.query})//? next()
            // debugger
          }else{
            if(!store.state.menu.menuData){
              let code = to.path.split("/")[1]
              store.dispatch('cmp/setCurrentSystemAndLoadMenus',{code},{root: true}).then(function(){
                next({path: to.fullPath})
              }).catch(getApiErrorHandler(to, next))
            }else{
              next({name: cmpName, query: {redirect: to.fullPath}})
            }

            // if(hasLoadCmpRoute){
            //   if(store.state.menu.menuData){
            //     next({path: to.fullPath})
            //   }else{
            //     next({name: cmpName, query: {redirect: to.fullPath}})
            //   }
            // }else{
            //   next({path: to.fullPath})
            // }
          }
        }
      }).catch(getApiErrorHandler(to, next));

    } else {
      //未登录（无token）
      if (to.matched.length > 0 && !to.matched.some(record => record.meta.requiresAuth)) {//访问不需要登录的路由
        console.log('自由访问',to.path);
        next()
      } else {
        console.log('访问受限', to.path);
        store.commit('decLoading')
        const query = {}
        if(to.path != '/'){
          query.redirect = to.fullPath
        }
        next({ name: 'login', query: query })
      }
    }
  })

  router.afterEach((to, from, next) => {
    console.log(`route after ${from.name || from.path} => ${to.name || to.path}`);
    // var routerList = to.matched
    // store.commit('menu/setCrumbList', routerList, {root: true})
    store.commit('menu/updateCurrentMenu', {menu: to.meta}, {root: true})
    store.commit('decLoading')
  })

  return router
}
