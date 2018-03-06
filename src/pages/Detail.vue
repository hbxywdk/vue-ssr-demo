<template>
	<div>
		<div class="article_box">
			<div class="article_tit">{{ article.title }}</div>
			<div class="content" v-html="article.content"></div>
		</div>
		<div class="reply_box">
			<div class="reply_tit">回复</div>
			<ul class="reply_ul">
				<li v-for="(item, index) in article.replies">
					<div class="userimg">
						<img class="img" :src="item.author.avatar_url" alt="">
					</div>
					<div class="reply_content">
						<div class="username">{{ item.author.loginname }}</div>
						<div v-html="item.content"></div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>
<script>
	import axios from 'axios'
	export default {
		asyncData (store, route) {
			let articleId = route.query.id // 文章id
			console.log(articleId)
			return store.dispatch('fetchDetail', { id: articleId }) // 服务端渲染执行
		},
		name: "detail",
		// 数据
		data() {
			return {
				// article: {} // 文章
			}
		},
		// 计算属性
		computed: {
	      article () {
	        return this.$store.getters.getDetail // 文章详情
	      },
		},
		beforeMount () {
			// 已经渲染过，走客户端渲染
			// if (this.$root._isMounted) {
			// 	this.fetchDetail()
			// }
		},
		mounted() {
			// code...
		},
		// 方法
		methods: {
			// fetchDetail() {
			// 	let articleId = this.$route.query.id // 文章id
			// 	this.$store.dispatch('fetchDetail', { id: articleId }) // 服务端渲染触发
			// }
		},
		// 子组件
		components: {
		}
	}
</script>
<style>
.article_box{
	border-bottom: 1px solid #ccc;
}
.article_tit{
	font-size: 30px;
	height: 50px;
	line-height: 50px;
	padding: 10px 50px;
}
/* 重置html样式 */
.content{
	padding: 50px;
}
.content img, .reply_ul .reply_content img{
	display: block;
	margin: 50px auto;
	max-width: 100%;
}
.content a, .reply_ul a{
	color: #08c;
	text-decoration: none;
}
.content p, .content li, .reply_ul p, .reply_ul li{
	line-height: 35px;
	font-size: 16px;
}
.reply_tit{
	font-size: 20px;
	height: 40px;
	line-height: 40px;
	padding-left: 20px;
	font-weight: 700;
}
.reply_ul li{
	overflow: hidden;
	border-bottom: 1px solid #eee;
	padding: 20px 0;
}
.userimg{
	width: 100px;
	height: 100%;
	float: left;
}
.userimg img.img{
	width: 40px;
	height: 40px;
	display: block;
	margin: 0 auto;
}
.reply_content{
	margin-left: 100px;
}
</style>