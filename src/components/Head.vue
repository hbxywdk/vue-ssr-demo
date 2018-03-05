<template>
	<header>
		<img src="https://o4j806krb.qnssl.com/public/images/cnodejs_light.svg" alt="cnodeJs" @click="goHome">
	</header>
</template>
<script>
	export default {
		name: "Head",
		// 数据
		data() {
			return {
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
			goHome () {
				window.location.href = '/'
			}
		},
		// 子组件
		components: {
		}
	}
</script>
<!--当前页面的样式 -->
<style scoped>
	header{
		height: 70px;
		background: #444;
		position: relative;
	}
	header img{
		width: 150px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate3d(-50%, -50%, 0);

	}
</style>