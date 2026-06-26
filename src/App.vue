<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1>QuickPI</h1>
        <p>AI 智能单证生成系统</p>
      </div>
      <div class="user-info">
        <span v-if="isLoggedIn">{{ userName }}</span>
        <button v-if="!isLoggedIn" @click="showLogin = true">登录</button>
        <button v-else @click="logout">退出</button>
      </div>
    </header>

    <div class="app-content">
      <div v-if="!isLoggedIn" class="login-section">
        <LoginForm @login="handleLogin" />
      </div>

      <div v-else class="main-section">
        <nav class="nav-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab"
            :class="['nav-tab', { active: currentTab === tab }]"
            @click="currentTab = tab"
          >
            {{ tabLabels[tab] }}
          </button>
        </nav>

        <div class="tab-content">
       <div v-if="currentTab === 'upload'" style="padding: 40px; text-align: center; color: #999;">
  <p>模板上传功能调试中...</p>
</div>
<div v-if="currentTab === 'mapping'" style="padding: 40px; text-align: center; color: #999;">
  <p>字段映射功能调试中...</p>
</div>
          <ContractExtract 
            v-if="currentTab === 'extract'"
            @extracted="onContractExtracted"
          />
          <InvoiceGenerate 
            v-if="currentTab === 'generate'"
            :extractedData="extractedData"
          />
          <History v-if="currentTab === 'history'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from './components/LoginForm.vue'
import TemplateUpload from './components/TemplateUpload.vue'
import TemplateMapping from './components/TemplateMapping.vue'
import ContractExtract from './components/ContractExtract.vue'
import InvoiceGenerate from './components/InvoiceGenerate.vue'
import History from './components/History.vue'

export default {
components: {
  LoginForm,
  ContractExtract,
  InvoiceGenerate,
  History,
},
  data() {
    return {
      isLoggedIn: false,
      userName: '',
      currentTab: 'upload',
      tabs: ['upload', 'mapping', 'extract', 'generate', 'history'],
      tabLabels: {
        upload: '上传模板',
        mapping: '字段映射',
        extract: '合同识别',
        generate: '生成单证',
        history: '历史记录',
      },
      // 全局数据，贯穿整个流程
      templateData: null,
      mappingConfig: null,
      extractedData: null,
    }
  },
  methods: {
    handleLogin(data) {
      this.isLoggedIn = true
      this.userName = data.phone
      localStorage.setItem('user', JSON.stringify(data))
    },
    logout() {
      this.isLoggedIn = false
      this.userName = ''
      this.templateData = null
      this.mappingConfig = null
      this.extractedData = null
      localStorage.removeItem('user')
    },
    // Step 1: 上传模板
    onTemplateUploaded(template) {
      console.log('Template uploaded:', template)
      this.templateData = template
      this.currentTab = 'mapping'
    },
    // Step 2: 保存映射配置
    onMappingSaved(config) {
      console.log('Mapping saved:', config)
      this.mappingConfig = config
      this.currentTab = 'extract'
    },
    // Step 3: 识别合同
    onContractExtracted(data) {
      console.log('Contract extracted:', data)
      this.extractedData = data
      this.currentTab = 'generate'
    },
  },
  mounted() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      this.isLoggedIn = true
      this.userName = user.phone
    }
  },
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.header-content p {
  font-size: 14px;
  opacity: 0.8;
}

.user-info button {
  background: #8B5CF6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.user-info button:hover {
  background: #7C3AED;
}

.app-content {
  flex: 1;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
}

.nav-tab {
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.nav-tab.active {
  color: #8B5CF6;
  border-bottom-color: #8B5CF6;
}

.nav-tab:hover {
  color: #8B5CF6;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
