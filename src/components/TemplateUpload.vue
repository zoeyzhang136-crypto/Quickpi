<template>
  <div class="template-upload">
    <h3>上传 Excel 模板</h3>
    <p class="subtitle">支持 .xlsx .xls .csv 格式</p>

    <div class="upload-box">
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls,.csv"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <button @click="$refs.fileInput.click()" class="upload-btn-main">
        📁 选择 Excel 文件
      </button>

      <div v-if="selectedFile" class="file-info">
        <p>📄 {{ selectedFile.name }}</p>
      </div>

      <button v-if="selectedFile" @click="handleParse" :disabled="parsing" class="parse-btn">
        {{ parsing ? '解析中...' : '解析模板' }}
      </button>
    </div>

    <div v-if="previewData" class="preview-box">
      <h4>✓ 模板预览（共 {{ previewData.length }} 行）</h4>
      <div class="table-scroll">
        <table>
          <tbody>
            <tr v-for="(row, i) in previewData" :key="i">
              <td class="row-num">{{ i + 1 }}</td>
              <td v-for="(cell, j) in row" :key="j" class="cell">
                {{ cell || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button @click="confirmTemplate" class="confirm-btn">✓ 确认模板</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import XLSX from 'xlsx'

export default {
  data() {
    return {
      selectedFile: null,
      parsing: false,
      previewData: null,
      error: '',
    }
  },
  methods: {
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0]
      this.error = ''
    },
    handleParse() {
      if (!this.selectedFile) return

      this.parsing = true
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
          
          this.previewData = data
          this.parsing = false
        } catch (err) {
          this.error = '解析失败：' + err.message
          this.parsing = false
        }
      }

      reader.readAsBinaryString(this.selectedFile)
    },
    confirmTemplate() {
      this.$emit('uploaded', {
        file: this.selectedFile,
        data: this.previewData,
      })
    },
  },
}
</script>

<style scoped>
.template-upload {
  max-width: 1000px;
}

h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1A202C;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.upload-box {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
}

.upload-btn-main {
  background: #8B5CF6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
}

.upload-btn-main:hover {
  background: #7C3AED;
}

.file-info {
  margin-top: 12px;
  color: #059669;
  font-weight: 500;
}

.parse-btn {
  width: 100%;
  padding: 10px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 12px;
  cursor: pointer;
  font-weight: bold;
}

.parse-btn:hover:not(:disabled) {
  background: #059669;
}

.parse-btn:disabled {
  opacity: 0.6;
}

.preview-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.preview-box h4 {
  margin-bottom: 12px;
  color: #1A202C;
}

.table-scroll {
  overflow-x: auto;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.row-num {
  background: #f1f5f9;
  font-weight: 600;
  width: 40px;
  padding: 6px;
  text-align: center;
}

.cell {
  border: 1px solid #e2e8f0;
  padding: 6px;
  min-width: 80px;
}

.confirm-btn {
  width: 100%;
  padding: 12px;
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.confirm-btn:hover {
  background: #7C3AED;
}

.error {
  color: #ef4444;
  padding: 12px;
  background: #fee2e2;
  border-radius: 4px;
  margin-top: 12px;
}
</style>
