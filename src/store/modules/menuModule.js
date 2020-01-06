import components from '@/menu/components'

import { loadMenuService, loadSystemMenuService } from '@/service/loginService'

// import menuConfig from '@/menu/menuConfig'
// import router, {dynamicRoutes} from '@/router'

const isRootMenu = item => !item.rootid;

const isRootMenu2 = (item, items) => {
    return items.every(({ id }) => id != item.parentid)
}

const sorter = (a, b) => {
    const sa = a.sort,
        sb = b.sort;
    const r = sa - sb;
    return r > 0 ? 1 : (r == 0 ? 0 : -1);
}


components["cmp/systemconfig/SystemConfig.vue"] = resolve => require(['@/views/cmp/systemconfig/SystemConfig.vue'], resolve);

components["cmp/managerRole/Role.vue"] = resolve => require(['@/views/cmp/managerRole/Role.vue'], resolve);

components["cmp/managerUser/UserInterior.vue"] = resolve => require(['@/views/cmp/managerUser/UserInterior.vue'], resolve);



// initial state
const state = {
    menuData: null, //null 表示还没有到服务器读取菜单
    currentMenu: null,

    isSidebarNavCollapse: false,
    crumbList: [],
}

// getters
const getters = {}

// actions
const actions = {

  clear({commit}){
    commit('clear')
  },

    async loadMenus({
        state, // 等同于 `store.state`，若在模块中则为局部状态
        rootState, // 等同于 `store.state`，只存在于模块中
        commit, // 等同于 `store.commit`
        dispatch, // 等同于 `store.dispatch`
        getters, // 等同于 `store.getters`
        rootGetters // 等同于 `store.getters`，只存在于模块中
    }, currentSystem) {
      const {id, code, virtual} = currentSystem
      let items = []
      if(!virtual){
        items = await loadMenuService({"systemid": id});
        // if(process.env.NODE_ENV !== 'production'){
        //   items = (code == 'cmp' || code == 'b') ? response : items
        // }
      }
      await dispatch('buildMenuTree', { items })
      return items;
    },

    async buildMenuTree({ state, commit, dispatch }, { items }) {

        const item = buildByItems(items)

        await commit('saveMenuData', { menuData: item.menuData });
        await dispatch('updateRoutes', { routes: item.routes }, { root: true })

        // dispatch('hideProgress', null, { root: true });
    },
}

// mutations
const mutations = {
    saveMenuData(state, { menuData }) {
        state.menuData = menuData;
    },

    updateCurrentMenu(state, { menu }) {
        console.log(`updateCurrentMenu id=${menu.id}`);
        state.currentMenu = menu;
    },

    toggleNavCollapse(state) {
        state.isSidebarNavCollapse = !state.isSidebarNavCollapse
    },
    setCrumbList(state, list) {
        state.crumbList = list
    },

    clear(state){
      state.menuData = null
      state.currentMenu = null
    },
}

const buildByItems = items => {
  let rootMenus = [],
      others = [];
  const routes = [];
  // const configs = menuConfig;
  const opt = Object.prototype.toString
  items.forEach(item => {
      const id = item.id
          // const code = item.menucode;
      const code = id;
      // const config = configs[code];
      let config = item.action;
      if (config) {
          if (typeof config == "string") {
              try {
                  config = JSON.parse(config)
              } catch (e) {
                  return;
              }
          }
          if (opt.call(config) != "[object Object]") {
              console.error('错误的菜单配置！', item);
              return
          }
          if (config.c) {
              config.component = components[config.c] || {};
          }
          config.icon = config.icon || item.icon
      } else {
          config = { icon: item.icon }
      }
      // if(!config){
      //   console.log(`unknown menu >>> id=${id}`);
      //   return;
      // }
      // const action = item.action;
      const action = config.action;
      const menu = {
          id,
          code,
          config,
          name: item.menuname,
          level: item.rank,
          sort: item.displayorder,
      }
      if (isRootMenu2(item, items)) {
          if (action) {
              menu.action = action;
              let route = {
                  name: id,
                  path: action,
                  component: config.component,
              }
              menu.route = route;
              route.meta = menu;
              routes.push(route);
          }
          rootMenus.push(menu);
      } else {
          // menu.parentcode = item.parentcode;
          // menu.rootcode = item.rootcode;
          menu.parentid = item.parentid;
          menu.rootid = item.rootid;
          if (action) {
              menu.action = action;
          }
          others.push(menu);
      }
  });
  rootMenus.sort(sorter)

  const buildMenuAndRoute = (parentmenu) => {
      const rest = [],
          children = [],
          routesChildren = [];
      others.forEach(menu => {
          let route;
          if (parentmenu.id == menu.parentid) {
              const action = menu.action;
              if (action) {
                  route = {
                      name: menu.id,
                      path: action,
                      component: menu.config.component,
                  }
                  menu.route = route;
                  route.meta = menu;
                  routesChildren.push(route);
              }
              children.push(menu);
              menu.parent = parentmenu;
          } else {
              rest.push(menu);
          }
      });
      others = rest;
      if (children.length) {
          children.sort(sorter)
          parentmenu.children = children;
          if (routesChildren.length) {
              if (parentmenu.route) {
                  if (parentmenu.route.children) {
                      parentmenu.route.children.push(...routesChildren)
                  } else {
                      parentmenu.route.children = routesChildren
                  }
              } else {
                  routes.push(...routesChildren)
              }
          }
          children.forEach(buildMenuAndRoute);
      }
  }
  rootMenus.forEach(buildMenuAndRoute);

  return {
    menuData: rootMenus,
    routes: routes
  }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
