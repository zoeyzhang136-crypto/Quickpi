<template>
  <div class="contract-extract">
    <h3>上传合同进行 AI 识别</h3>
    <p class="subtitle">支持 PDF 和 Excel 格式的采购订单</p>

    <div class="extract-container">
      <div class="upload-section">
        <div class="upload-area" @dragover.prevent @drop="handleDrop">
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.xlsx"
            @change="handleFileSelect"
            style="display: none"
          />
          
          <div v-if="!contractFile" class="upload-prompt" @click="$refs.fileInput.click()">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>拖拽合同文件到这里或点击选择</p>
            <p class="hint">支持 .pdf 和 .xlsx 格式</p>
          </div>

          <div v-else class="file-preview">
            <div class="file-info">
              <p class="file-name">📄 {{ contractFile.name }}</p>
              <p class="file-size">{{ (contractFile.size / 1024).toFixed(2) }} KB</p>
            </div>
            <button type="button" @click="clearFile" class="clear-btn">✕</button>
          </div>
        </div>

        <button 
          v-if="contractFile"
          @click="handleExtract" 
          :disabled="extracting"
          class="extract-btn"
        >
          {{ extracting ? 'AI 识别中...' : '开始 AI 识别' }}
        </button>
      </div>

      <div v-if="extractedData" class="results-section">
        <h4>识别结果</h4>
        <div class="results-grid">
          <div class="result-item">
            <label>客户名称</label>
            <input v-model="extractedData.buyer" class="result-input" />
          </div>
          <div class="result-item">
            <label>PO 号</label>
            <input v-model="extractedData.contract_no" class="result-input" />
          </div>
          <div class="result-item">
            <label>日期</label>
            <input v-model="extractedData.date" class="result-input" />
          </div>
        </div>

        <div class="products-section">
          <h5>产品明细</h5>
          <div class="products-table">
            <table>
              <thead>
                <tr>
                  <th>产品编码</th>
                  <th>品名</th>
                  <th>数量</th>
                  <th>单价</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in extractedData.items" :key="idx">
                  <td><input v-model="item.code" class="table-input" /></td>
                  <td><input v-model="item.name" class="table-input" /></td>
                  <td><input v-model.number="item.qty" class="table-input" /></td>
                  <td><input v-model.number="item.unit_price" class="table-input" /></td>
                  <td>
                    <button @click="removeItem(idx)" class="delete-btn">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button @click="addItem" class="add-item-btn">+ 添加产品行</button>
        </div>

        <div class="action-buttons">
          <button @click="confirmExtract" class="confirm-btn">确认数据</button>
          <button @click="clearResults" class="cancel-btn">重新上传</button>
        </div>
      </div>
    </div>

    <div v-if="loading && !extracting" class="loading">
      <p>处理中...</p>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { contractAPI } from '../api'

export default {
  data() {
    return {
      contractFile: null,
      extractedData: null,
      extracting: false,
      loading: false,
      error: '',
    }
  },
  methods: {
    handleFileSelect(event) {
      this.contractFile = event.target.files[0]
      this.error = ''
    },
    handleDrop(event) {
      event.preventDefault()
      const files = event.dataTransfer.files
      if (files.length) {
        this.contractFile = files[0]
      }
    },
    clearFile() {
      this.contractFile = null
      this.extractedData = null
    },
    clearResults() {
      this.extractedData = null
      this.contractFile = null
    },
    async handleExtract() {
      if (!this.contractFile) return

      this.extracting = true
      this.error = ''

      try {
        const response = await contractAPI.extract(this.contractFile)

        if (response.data.code === 0) {
          this.extractedData = response.data.data
          // 确保 items 是数组
          if (!Array.isArray(this.extractedData.items)) {
            this.extractedData.items = []
          }
        } else {
          this.error = response.data.message || 'AI 识别失败'
        }
      } catch (err) {
        this.error = '识别失败：' + (err.response?.data?.message || '请检查文件格式是否正确')
      } finally {
        this.extracting = false
      }
    },
    removeItem(index) {
      this.extractedData.items.splice(index, 1)
    },
    addItem() {
      this.extractedData.items.push({
        code: '',
        name: '',
        qty: 0,
        unit_price: 0,
      })
    },
    confirmExtract() {
      this.$emit('extracted', this.extractedData)
      alert('数据已确认！')
    },
  },
}
</script>

<style scoped>
.contract-extract {
  max-width: 900px;
}

h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1A202C;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
  font-size: 14px;
}

.extract-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8fafc;
}

.upload-area:hover {
  border-color: #8B5CF6;
  background: #faf5ff;
}

.upload-prompt svg {
  color: #8B5CF6;
  margin-bottom: 16px;
}

.upload-prompt p {
  margin: 8px 0;
  color: #333;
}

.upload-prompt .hint {
  font-size: 12px;
  color: #999;
}

.file-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 4px;
}

.file-info .file-name {
  font-weight: 500;
  color: #1A202C;
  margin-bottom: 4px;
}

.file-info .file-size {
  font-size: 12px;
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.extract-btn {
  padding: 12px;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.extract-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
}

.extract-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.results-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.results-section h4 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #1A202C;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.result-item {
  display: flex;
  flex-direction: column;
}

.result-item label {
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
  font-size: 13px;
}

.result-input {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
}

.result-input:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.products-section {
  margin-top: 24px;
}

.products-section h5 {
  font-size: 14px;
  margin-bottom: 12px;
  color: #333;
}

.products-table {
  overflow-x: auto;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.products-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.products-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.products-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.table-input {
  width: 100%;
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 3px;
  font-size: 13px;
}

.table-input:focus {
  outline: none;
  border-color: #8B5CF6;
  background: #faf5ff;
}

.delete-btn {
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #dc2626;
}

.add-item-btn {
  padding: 10px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-item-btn:hover {
  background: #059669;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.confirm-btn {
  flex: 1;
  padding: 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-btn:hover {
  background: #059669;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #e5e7eb;
  color: #333;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #d1d5db;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #8B5CF6;
}

.error-message {
  color: #ef4444;
  padding: 12px;
  background: #fee2e2;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 16px;
}
</style>
