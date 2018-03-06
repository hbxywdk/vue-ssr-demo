// entry-client.js 客户端渲染入口文件
import Vue from 'vue'
import { app, store, router } from './app'

/*Vue-SSR 根据访问的路由会调用当前路由组件中的asyncData方法由服务端调用相关接口，根据数据
生成首屏对应的html，并在返回的html中写入 window.__INITIAL_STATE__ = {服务端请求到的数据}
不需要服务端渲染的数据则在 mounted 中请求接口。*/

/*路由切换时组件的asyncData方法并不会被调用，若该组件存在服务端渲染方法asyncData，可通过下面
三种方式客户端调用，并进行客户端渲染*/

//（1）
// 全局mixin，beforeRouteEnter，切换路由时，调用asyncData方法拉取数据进行客户端渲染
// 注意beforeRouteEnter无法直接获取到当前组件this，需使用next((vm)=>{ vm即为this }) 获取
Vue.mixin({
  beforeRouteEnter (to, from, next) {
    console.log('beforeRouteEnter')
	next((vm)=>{
	    const { asyncData } = vm.$options
	    if (asyncData) {
			asyncData(vm.$store, vm.$route).then(next).catch(next)
	    } else {
			next()
	    }
	})

  }
})

//（2）
// 全局mixin，beforeRouteUpdate，切换路由时，调用asyncData方法拉取数据进行客户端渲染
// beforeRouteUpdate可直接获取到this对象（2.2版本以上）
/*Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    console.log('beforeRouteUpdate')
    const { asyncData } = this.$options
    if (asyncData) {
		// 传入store与route
		asyncData(this.$store, this.$route).then(next).catch(next)
    } else {
		next()
    }
  }
})*/

// （3）
// 注册全局mixin，所有组件beforeMount时，如果根组件_isMounted为真（即根实例已mounte，该钩子函数是由路由跳转触发的）
// 调用asyncData方法拉取数据进行客户端渲染
/*Vue.mixin({
  beforeMount () {
    console.log('beforeMount')
	const { asyncData } = this.$options
	if (this.$root._isMounted) {
  		console.log('HasMounted')
  		// 传入store与route
		asyncData(this.$store, this.$route)
	}
  }
})
*/

// 使用 window.__INITIAL_STATE__ 中的数据替换store中的数据
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
  app.$mount('#app')
})

