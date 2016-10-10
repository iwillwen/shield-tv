import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App.vue'
import VueRouter from 'vue-router'
import VueLazyload from 'vue-lazyload'

import MainPage from './pages/Main.vue'
import RoomPage from './pages/Room.vue'
import AllCategoriesPage from './pages/AllCategories.vue'
import CategoryPage from './pages/Category.vue'
import HostApplicationPage from './pages/HostApplication.vue'
import RoomSettingPage from './pages/RoomSetting.vue'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(VueLazyload)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/category/all' 
      // component: MainPage
    },
    {
      path: '/room/:id',
      component: RoomPage
    },
    {
      path: '/category/all',
      component: AllCategoriesPage
    },
    {
      path: '/category/:name',
      component: CategoryPage
    },
    {
      path: '/host/application',
      component: HostApplicationPage
    },
    {
      path: '/host/room',
      component: RoomSettingPage
    }
  ]
})

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})

Vue.filter('toUpperCase', str => str.toUpperCase())
