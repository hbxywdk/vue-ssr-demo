# vue-ssr-demo
###### 运行
```
// 安装依赖包
npm install 
// 开发模式
npm run dev
// 生产模式
npm run build
npm run start
// 注意：vue 与 vue-server-renderer版本必须 一致。
```
###### 什么是单页面应用（SPA）
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;随着React、Vue等框架的流行，越来越多的网站开始使用这些框架编写，React、Vue都有自己的路由，使用了路由制作的网站其实就是单页面应用。
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;单页面项目打包出来只有一个html文件，看似各个页面之间无刷新切换，其实是通过hash，或者history api来进行路由的显隐，并通过ajax拉取数据来实现响应功能。因为整个webapp就一个html，所以叫单页面。
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;单页面应用虽然带来了一部分用户体验的提升，但也带来了新的问题：
1.首页白屏问题
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因为SPA所有的内容都是由客户端js渲染出的来，就会导致js体积过大，客户端渲染也需要一定的时间，这两者的时间在浏览器上所带来的就是一段时间的白屏等待。
2.SEO问题
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;由于SPA所有的内容都是由js渲染出来的，html中其实算是空白一片，对于爬虫来说无论爬什么地址爬到的就是一片空白，就像下面这样。
```
<!DOCTYPE html>
<html lang="en">
     
    <head>
        <meta charset="utf-8">
        <title>title</title>
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="theme-color" content="#f60">
        <link rel="manifest" href="/manifest.json">
    </head>
     
    <body>
        <div id="app"></div>
        <script type="text/javascript" src="vendor.47aa0e2edff8ccb2c503.js"></script>
        <script type="text/javascript" src="app.47aa0e2edff8ccb2c503.js"></script>
    </body>
 
</html>
```
###### 什么是服务端渲染
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;这里说的服务端渲染并不是指传统的jsp那种，而是服务器根据请求的路径，直接读取Vue代码，将需要首屏展示的数据直接由服务端请求并将其注入到HTML中返回给前端，这样前端拿到的就不再是空白一片的页面。

先以Vue官方例子简单了解一下：
```
// app.js
const Vue = require('vue')
const server = require('express')()
const renderer = require('vue-server-renderer').createRenderer()
server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })
  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error')
      return
    }
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>${html}</body>
      </html>
    `)
  })
})
server.listen(8080)
```
使用express对所有的get请求都做同样的处理，new一个Vue，使用vue-server-renderer的renderToString的方法传入Vue实例，回调函数中的html就是最终得到的DOM结构。
当然我们也可以使用外部html模板：
```
<!DOCTYPE html>
<html lang="en">
  <head><title>Hello</title></head>
  <body>
    <!--vue-ssr-outlet--><!--会在这里插入内容-->
  </body>
</html>
```
###### 下面我们先建一个最基本的项目
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;一个文章列表页，一个文章详情页。
```
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
```
两个页面文件都差不多：
```
<template>
	<div>
	</div>
</template>
<script>
	import axios from 'axios'
	export default {
		name: "home",
		// 数据
		data() {
			return {
				page: 1, // 页码
				lists: [] // 列表
			}
		},
		// 计算属性
		computed: {
		},
		// 创建
		created() {
		},
		mounted() {
		},
		// 方法
		methods: {
		},
		// 子组件
		components: {
		}
	}
</script>
<!--当前组件的样式 -->
<style scoped>
</style>
```
具体方法就不写了，获取文章列表，点击跳转详情，这里没什么难度。

---

要使用Vue服务端渲染，我们就得引入Vuex，使用Vuex的目的，就是将我们平时写在组件里的首屏请求方法移到Vuex中，比如有一个名为fetchLists的action：
```
// store中的actions部分
let actions = {
  // 获取文章列表
  fetchLists ({ commit }, data) {
    return axios.get('https://cnodejs.org/api/v1/topics?page=' + data.page)
    .then((res) => {
      if (res.data.success) {
        commit('setLists', res.data.data)
      }
    })
  }
```
我们为首页组件加上一个名为asyncData的方法
```
export default {
	asyncData (store, route) { // 两个参数为store和当前路由信息，此函数会在组件实例化之前调用，所以无法访问this
		return store.dispatch('fetchLists', { page: 1 })
	},
	name: "home",
	// 数据
	data() {
		return {
			page: 1 // 页码
		}
	},
	// 计算属性
	computed: {
      lists () {
        return this.$store.getters.getLists // 文章列表
      },
	},
	mounted() {
	},
	// 方法
	methods: {
	},
	// 子组件
	components: {

	}
}
```
当一个页面请求进入，会根据路径找到对应组件，拿到它的asyncData方法，执行asyncData方法，触发对应的action，从服务端获取数据并注入HTML中返回给前端。

---

###### server.js
根据不同的访问路径，返回不同的内容
```
app.get('*', (req, res) => {
  // 未渲染好返回
  if (!renderer) {
    return res.end('waiting for a moment.')
  }
  res.setHeader("Content-Type", "text/html")
  // 错误处理
  const errorHandler = err => {
    if (err && err.code === 404) {
      res.status(404).end('404 | Page Not Found')
    } else {
      res.status(500).end('500 | Internal Server Error')
    }
  }
  // 将 Vue 实例渲染为一个 Node.js 流 (stream)
  renderer.renderToStream({ url: req.url }) 
    .on('error', errorHandler)
    .on('end', () => console.log(`ok`))
    .pipe(res)
})
app.listen(3002, () => {
  console.log(`server started at localhost:${port}`)
})
```
###### 入口文件
这里会有两个入口文件：
`entry-client.js 客户端使用的入口文件。`
```
import Vue from 'vue'
import { app, store, router } from './app'
// 上面有说过，服务端获取到的数据会以DOM的形式插入HTML中，同时，还会将获取到的数据写入到window.__INITIAL_STATE__中
// 客户端使用 window.__INITIAL_STATE__ 中的数据替换store中的数据
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}
router.onReady(() => {
  // 将Vue实例挂载在#app上
  app.$mount('#app')
})

```
`entry-server.js 服务端入口文件`
```

import { app, router, store } from './app'

export default context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，
  // 就已经准备就绪。
  return new Promise((resolve, reject) => {
    // push对应访问路径
    router.push(context.url)

    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents() // 返回当前路径匹配到的组件

      // 匹配不到的路由，reject()，返回 404
      if (!matchedComponents.length) { 
        reject({ code: 404 })
      }

      // 执行组件的 asyncData 方法 拿数据 全部数据返回后 为window.__INITIAL_STATE__赋值
      Promise.all(matchedComponents.map(component => {
        return component.asyncData && component.asyncData(store, router.currentRoute) // 调用组件asyncData方法 传入store与当前路由信息
      }))
      .then(() => {
        // 为window.__INITIAL_STATE__ 赋值 (可理解为window.__INITIAL_STATE__ = store.state)
        context.state = store.state
        resolve(app)
      }).catch(reject)
    })
  })
}
```
上面这段代码根据路由信息获取组件的 asyncData 方法拉取数据。

---

然后是两个webpack配置文件：
webpack.client.config.js   用于打包文件到dist目录下，
[webpack.server.config.js](https://ssr.vuejs.org/zh/build-config.html) 用于生成传递给 createBundleRenderer 的 server bundle

###### 不需要服务端渲染的数据处理
对于不需要服务端渲染的数据，我们可以将其写在mounted钩子函数中，写法和我们的平时写法相同。
```
mounted() {
	axios.get('http://www.test.com')
	.then((res) => {
		this.test = res.data.RESULT_DATA
	})
}
```
###### 路由切换后的数据获取
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当我们把代码运行起来后，点击文章详情，会发现文章详情的对应请求并没有发出，这是因为服务器在收到第一次请求后就已经把所有代码给了客户端，客户端的路由切换，服务端并不会收到请求，所以对应组件的 asyncData 方法并不会被执行。
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;这里的解决方法就是注册全局mixin.
`全局mixin，beforeRouteEnter，切换路由时，调用asyncData方法拉取数据进行客户端渲染（注意beforeRouteEnter无法直接获取到当前组件this，需使用next((vm)=>{ vm即为this }) 获取）`
```
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
```
最终运行后，查看网页源代码，可以看到网站不再是空白一片了。
![1.png](https://github.com/hbxywdk/vue-ssr-demo/blob/master/1.png)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;讲到这里差不多就讲完了，从头搭建一个服务端渲染的应用是比较复杂的，其实我自己也不能说完全明白，这里我仅把我自己的理解写出来，或许我的描述并不是很好，但是希望对大家能有所帮助。












