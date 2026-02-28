<template>
  <div class="logout-page">
    <a-card class="logout-card">
      <a-result
        status="success"
        title="已成功退出登录"
        sub-title="感谢使用开发者服务平台"
      >
        <template #extra>
          <a-button type="primary" @click="goToLogin">
            返回登录
          </a-button>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 清除登录信息
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('username')
})

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.logout-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.logout-card {
  width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
