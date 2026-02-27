<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">开发者服务平台</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-item">
          <label>用户名</label>
          <input 
            v-model="formState.username" 
            type="text" 
            placeholder="请输入用户名"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-item">
          <label>密码</label>
          <input 
            v-model="formState.password" 
            type="password" 
            placeholder="请输入密码"
            required
            class="form-input"
          />
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="divider">测试账号</div>
      <div class="test-accounts">
        <div>用户端: user / 123456</div>
        <div>服务提供者: provider / 123456</div>
        <div>管理员: admin / 123456</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: ''
})

// 模拟账号数据
const accounts = {
  user: { password: '123456', role: 'user', redirect: '/user/home' },
  provider: { password: '123456', role: 'provider', redirect: '/provider' },
  admin: { password: '123456', role: 'admin', redirect: '/admin' }
}

const handleLogin = () => {
  loading.value = true
  
  // 模拟登录延迟
  setTimeout(() => {
    const account = accounts[formState.username]
    
    if (!account) {
      alert('用户名不存在')
      loading.value = false
      return
    }
    
    if (account.password !== formState.password) {
      alert('密码错误')
      loading.value = false
      return
    }
    
    // 登录成功，保存用户信息
    localStorage.setItem('token', 'mock-token-' + Date.now())
    localStorage.setItem('userRole', account.role)
    localStorage.setItem('username', formState.username)
    
    alert('登录成功')
    
    // 跳转到对应页面
    router.push(account.redirect)
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.login-form {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #5568d3;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  margin: 20px 0;
  color: #999;
  font-size: 12px;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e8e8e8;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.test-accounts {
  font-size: 12px;
  color: #999;
  text-align: center;
  line-height: 2;
}

.test-accounts div {
  margin: 4px 0;
}
</style>
