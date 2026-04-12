<template>
  <div class="login-container">
    <div class="login-form-wrapper">
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
          {{ loading ? "登录中..." : "登录" }}
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
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { appLogin } from "@/service";

const router = useRouter();
const loading = ref(false);

const formState = reactive({
  username: "",
  password: "",
});

const handleLogin = async () => {
  loading.value = true;

  try {
    const res = await appLogin({
      username: formState.username,
      password: formState.password,
    });

    if (res.code === 0) {
      // 保存 token 和用户信息
      localStorage.setItem("token", res.data?.accessToken);
      localStorage.setItem("refreshToken", res.data?.refreshToken);
      localStorage.setItem("userId", res.data?.userId);
      localStorage.setItem("username", res.data?.nickname || formState.username);
      localStorage.setItem("userRole", res.data?.userRole || res.data?.role || "user");
      localStorage.setItem("expiresTime", res.data?.expiresTime);

      message.success("登录成功");
      const userRole = res.data?.userRole || res.data?.role || "user";
      if (userRole === "user" || userRole === "provider") {
        router.push("/user/home");
      } else if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/user/home");
      }
    } else {
      message.error(res.msg || "登录失败");
    }
  } catch (error) {
    message.error(error.msg || "登录失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&display=swap");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  padding: 1rem;
}

/* 细微网格图案（保留，增加层次） */
.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 1.5rem;
}

.form-item label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-input {
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 0; /* 无圆角 */
  font-size: 1rem;
  color: #1e293b;
  font-family: inherit;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  background-color: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #64748b;
  font-size: 0.95rem;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background-color: white;
  color: #4a6b4a; /* 深绿色，与背景渐变呼应 */
  border: none;
  border-radius: 0; /* 无圆角 */
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  background-color: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.login-btn:disabled {
  background-color: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.divider {
  text-align: center;
  margin: 2rem 0 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.3);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.test-accounts {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  padding: 1.2rem;
  border-radius: 0; /* 无圆角 */
  font-size: 0.9rem;
  color: white;
  text-align: center;
  line-height: 1.8;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.test-accounts div {
  margin: 0.25rem 0;
}
</style>
