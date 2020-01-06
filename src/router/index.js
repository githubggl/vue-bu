import Vue from 'vue'
import Router from 'vue-router'

import store from '@/store/store'

// import {getMenuRoutes, findByCode} from '@/menus'

import dynamic, { createCmpRoute, cmpName } from './dynamic'
import getExceptions from './exceptions'

Vue.use(Router)

const staticRoutes = [{
        path: '/',
        name: 'root', //在dynamic中处理
        // redirect: {name: 'cmp'},
        // component: resolve => require(['@/views/Transformation.vue'], resolve),
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/about',
        name: 'about',
        component: () =>
            import ( /* webpackChunkName: "about" */ '@/views/About.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () =>
            import ( /* webpackChunkName: "about" */ '@/views/login/Login.vue')
    },
    {
        path: '/map',
        name: 'map',
        // meta: {requiresAuth: true},
        component: resolve => require(['@/views/onemap/Map.vue'], resolve),
        beforeEnter: (to, from, next) => {
            if (to.query.tk) {
                next({ path: to.path })
            } else {
                next();
            }
        },
    },
    {
        path: '/regist',
        name: 'regist',
        component: resolve => require(['@/views/cmp/unit/unitManager/AddUnitInterior.vue'], resolve),
        props: { isRoute: true, unitType: "3" }
    },
];

const router = dynamic(new Router({
    mode: 'history',
    routes: staticRoutes
}));

const resetRouter = () => {
    const newRouter = new Router({
        mode: 'history',
        routes: staticRoutes
    });
    router.matcher = newRouter.matcher
    console.log('resetRouter');
};

export default router;
export {
    cmpName,
    resetRouter,
    createCmpRoute,
    getExceptions
}