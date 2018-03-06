// router.js
import Vue from 'vue'
import Router from 'vue-router'

import Home from '../pages/Home.vue'
import Detail from '../pages/Detail.vue'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history', // SSR必须使用history模式
    scrollBehavior: () => ({y: 0}),
    routes: [
      // 主页
  		{ path: '/', component: Home },
  		// 详情
  		{ path: '/detail', component: Detail },
    ]
  })
}