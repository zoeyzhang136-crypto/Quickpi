<template>
  <div class="template-upload">
    <h3>上传你的 Excel 模板</h3>
    <p class="subtitle">选择你的标准 PI 模板（.xlsx 格式）</p>

    <div class="upload-area" @dragover.prevent @drop="handleDrop">
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <div v-if="!selectedFile" class="upload-prompt" @click="$refs.fileInput.click()">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>拖拽文件到这里或点击选择</p>
        <p class="hint">支持 .xlsx 格式</p>
      </div>

      <div v-else class="file-preview">
        <div class="file-info">
          <p class="file-name">📄 {{ selectedFile.name }}</p>
          <p class="file-size">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
        </div>
        <button type="button" @click="clearFile" class="clear-btn">✕</button>
      </div>
    </div>

    <button 
      v-if="selectedFile"
      @click="handleUpload" 
      :disabled="uploading"
      class="upload-btn"
    >
      {{ uploading ? '上传中...' : '上传模板' }}
    </button>

    <div v-if="loading && !uploading" class="loading">
      <p>解析模板中...</p>
    </div>

    <div v-if="templateData" class="preview-section">
      <h4>模板预览</h4>
      <div class="preview-table">
        <table>
          <thead>
            <tr>
              <td v-for="(cell, idx) in templateData.preview_data[0]" :key="idx">
                {{ cell || '' }}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIdx) in templateData.preview_data.slice(1, 4)" :key="rowIdx">
              <td v-for="(cell, cellIdx) in row" :key="cellIdx">
                {{ cell || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="preview-hint">（预览前 3 行数据）</p>

      <button @click="confirmUpload" class="confirm-btn">确认模板并继续</button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { templateAPI } from '../api'

export default {
  data() {
    return {
      selectedFile: null,
      uploading: false,
      loading: false,
      templateData: null,
      error: '',
    }
  },
  methods: {
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0]
      this.error = ''
    },
    handleDrop(event) {
      event.preventDefault()
      const files = event.dataTransfer.files
      if (files.length) {
        this.selectedFile = files[0]
      }
    },
    clearFile() {
      this.selectedFile = null
      this.templateData = null
    },
    async handleUpload() {
      if (!this.selectedFile) return

      this.uploading = true
      this.loading = true
      this.error = ''

      try {
        const response = await templateAPI.upload(this.selectedFile)
        
        if (response.data.code === 0) {
          this.templateData = response.data.data
        } else {
          this.error = response.data.message || '上传失败'
        }
      } catch (err) {
        this.error = err.response?.data?.message || '上传失败，请检查文件格式'
      } finally {
        this.uploading = false
        this.loading = false
      }
    },
    confirmUpload() {
      this.$emit('uploaded', {
        file: this.selectedFile,
        data: this.templateData,
      })
    },
  },
}
</script>

<style scoped>
.template-upload {
  max-width: 800px;
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

.clear-btn:hover {
  color: #ef4444;
}

.upload-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s;
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #8B5CF6;
}

.preview-section {
  margin-top: 32px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 8px;
}

.preview-section h4 {
  margin-bottom: 16px;
  color: #1A202C;
}

.preview-table {
  overflow-x: auto;
  margin-bottom: 12px;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.preview-table th,
.preview-table td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: left;
  background: white;
}

.preview-table thead {
  background: #f1f5f9;
}

.preview-hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
}

.confirm-btn {
  width: 100%;
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
  transform: translateY(-2px);
}

.error-message {
  color: #ef4444;
  margin-top: 16px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 4px;
  font-size: 14px;
}
</style>
