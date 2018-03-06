const fs = require('fs')
const path = require('path')
const express = require('express')
// const favicon = require('serve-favicon') // icon图标
const compression = require('compression') // 开启gzip压缩
const resolve = file => path.resolve(__dirname, file)
// const proxy = require('http-proxy-middleware');//引入代理中间件

const isProd = process.env.NODE_ENV === 'production'
const serverInfo = `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

const app = express()

function createRenderer (bundle, template) {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return require('vue-server-renderer').createBundleRenderer(bundle, {
    template,
    // 缓存
    cache: require('lru-cache')({
      max: 1000,
      maxAge: 1000 * 60 * 15
    })
  })
}

let renderer
if (isProd) {

  // 生产创建服务端渲染使用 server bundle 和 html
  // server bundle的生成依赖于 vue-ssr-webpack-plugin 插件
  const bundle = require('./dist/vue-ssr-bundle.json')

  // html模板由 html-webpack-plugin 插件注入资源并输出 'dist/index.html'
  const template = fs.readFileSync(resolve('./dist/index.html'), 'utf-8')
  renderer = createRenderer(bundle, template)

} else {

  // 开发模式需要设置 dev-server 和 hot-reload
  // 创建一个新renderer更新模板
  require('./build/setup-dev-server')(app, (bundle, template) => {
    renderer = createRenderer(bundle, template)
  })

}

const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0 // 静态资源设置缓存
})

app.use(compression({ threshold: 0 })) // gzip压缩
// app.use(favicon('./public/logo-48.png')) // icon
app.use('/dist', serve('./dist', true)) // 静态资源
app.use('/public', serve('./public', true)) // 静态资源 （如：http://localhost:8080/public/logo-120.png）
app.use('/manifest.json', serve('./manifest.json', true))
app.use('/service-worker.js', serve('./dist/service-worker.js'))

app.get('*', (req, res) => {
  // 未渲染好返回
  if (!renderer) {
    return res.end('waiting for compilation... refresh in a moment.')
  }

  const s = Date.now()

  res.setHeader("Content-Type", "text/html")
  res.setHeader("Server", serverInfo)

  const errorHandler = err => {
    if (err && err.code === 404) {
      console.log(404)
      res.status(404).end('404 | Page Not Found')
    } else {
      // Render Error Page or Redirect
      res.status(500).end('500 | Internal Server Error')
      console.error(`error during render : ${req.url}`)
      console.error(err)
    }
  }

  var title = 'cnodeJs' // 自定义变量（此处用于title）

  renderer.renderToStream({ title, url: req.url }) // 可传参数来渲染模板页 url: req.url 必传 其为entry-server.js入参 context
    .on('error', errorHandler)
    .on('end', () => console.log(`whole request: ${Date.now() - s}ms`))
    .pipe(res)
})

const port = process.env.PORT || 3002

app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})


