<template>
  <div id="app">
    <Head></Head>
    <transition name="fade" mode="out-in">
    	<main id="main">
        	<router-view class="view"></router-view>
    	</main>
    </transition>
  </div>
</template>
<script>
  import Head from './components/head.vue'

	export default {
		name: "app",
		// 数据
		data() {
			return {
			}
		},
		// 计算属性
		computed: {

		},
		mounted() {

		},
		// 方法
		methods: {
			test () {

			}
		},
		// 子组件
	    components: {
	      Head
	    }
	}
</script>
<!--样式 -->
<style>
	*{
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	body{
		background: #eee;
	}
	#main{
		width: 1200px;
		margin: 0 auto;
		background: #fff;
	}
	li{
		list-style: none;
	}
</style>