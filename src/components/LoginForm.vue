<template>
  <div class="login-form">
    <div class="form-card">
      <h2>登录 QuickPI</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email</label>
         <input 
  v-model="phone" 
  type="email" 
  placeholder="type your email..."
  required
/>
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="type your password..."
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <div class="toggle-signup">
          <span v-if="!isSignup">没有账号？</span>
          <span v-else>已有账号？</span>
          <button type="button" @click="isSignup = !isSignup" class="toggle-btn">
            {{ isSignup ? '登录' : '注册' }}
          </button>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import { userAPI } from '../api'

export default {
  data() {
    return {
      phone: '',
      password: '',
      isSignup: false,
      loading: false,
      error: '',
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      this.error = ''

      try {
        const result = this.isSignup
          ? await userAPI.register(this.phone, this.password)
          : await userAPI.login(this.phone, this.password)

        if (result.data.code === 0) {
          localStorage.setItem('token', result.data.data.token)
          this.$emit('login', { phone: this.phone })
        } else {
          this.error = result.data.message || '登录失败'
        }
      } catch (err) {
        this.error = err.response?.data?.message || '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
}

.form-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-card h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
  color: #1A202C;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 24px;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-signup {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.toggle-btn {
  background: none;
  border: none;
  color: #8B5CF6;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
  padding: 0;
  margin-left: 4px;
}

.toggle-btn:hover {
  color: #7C3AED;
}

.error-message {
  color: #ef4444;
  margin-top: 12px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 4px;
  font-size: 14px;
}
</style>
