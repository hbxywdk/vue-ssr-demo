// entry-server.js
import { app, router, store } from './app'

const isDev = process.env.NODE_ENV !== 'production' // 开发模式 || 生产模式

export default context => {
  const s = isDev && Date.now()

  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，
  // 就已经准备就绪。
  return new Promise((resolve, reject) => {
    console.log(context)

    // push对应访问路径
    router.push(context.url)

    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents() // 返回当前路径匹配到的组件

      // 匹配不到的路由，reject()，返回 404
      if (!matchedComponents.length) { 
        reject({ code: 404 })
      }

      // Promise.all 组件的 asyncData 方法 拿数据 全部数据返回后 为window.__INITIAL_STATE__赋值并 resolve(app)
      Promise.all(matchedComponents.map(component => {
        return component.asyncData && component.asyncData(store, router.currentRoute) // 调用组件asyncData方法 传入store与当前路由信息
      }))
      .then(() => {
        isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)

        // 为window.__INITIAL_STATE__ 赋值 (可理解为window.__INITIAL_STATE__ = store.state)
        context.state = store.state
        
        resolve(app)
      }).catch(reject)
    })

  })
}