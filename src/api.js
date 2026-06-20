import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
})

// 添加请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 用户API
export const userAPI = {
  register: (phone, password) => api.post('/users/register', { phone, password }),
  login: (phone, password) => api.post('/users/login', { phone, password }),
}

// 模板API
export const templateAPI = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/templates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  saveConfig: (configData) => api.post('/templates/config', configData),
  getList: () => api.get('/templates/list'),
}

// 合同API
export const contractAPI = {
  extract: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/contracts/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// 发票API
export const invoiceAPI = {
  generate: (data) => api.post('/invoices/generate', data, {
    responseType: 'blob',
  }),
}

// 历史API
export const historyAPI = {
  getList: (page = 1, size = 20) => api.get(`/history/list?page=${page}&size=${size}`),
}

export default api
