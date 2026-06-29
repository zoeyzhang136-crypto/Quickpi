<template>
  <div class="container">
    <h3>上传 Excel 模板</h3>
    <div class="upload-box">
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls,.csv"
        @change="selectFile"
        style="display: none"
      />
      <button @click="$refs.fileInput.click()" class="btn-primary">选择文件</button>
      <p v-if="file" class="file-name">{{ file.name }}</p>
    </div>

    <button v-if="file" @click="parseFile" :disabled="loading" class="btn-parse">
      {{ loading ? '解析中...' : '解析模板' }}
    </button>

    <div v-if="data" class="preview">
      <h4>✓ 预览（{{ data.length }} 行）</h4>
      <div class="table-wrapper">
        <table>
          <tr v-for="(row, i) in data" :key="i">
            <td class="row-idx">{{ i + 1 }}</td>
            <td v-for="(cell, j) in row" :key="j" class="cell">{{ cell || '-' }}</td>
          </tr>
        </table>
      </div>
      <button @click="confirm" class="btn-confirm">确认</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import XLSX from 'xlsx'

export default {
  data() {
    return {
      file: null,
      data: null,
      loading: false,
      error: '',
    }
  },
  methods: {
    selectFile(e) {
      this.file = e.target.files[0]
      this.error = ''
    },
   parseFile() {
  if (!this.file) return
  this.loading = true
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]

      // ✅ 修复：加 blankrows:true 保留空行，raw:false 让日期/数字显示可读
      this.data = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: '',
        blankrows: true,   // ← 关键！不跳过空行
        raw: false         // ← 日期/数字转字符串，视觉上更完整
      })

      this.loading = false
    } catch (err) {
      this.error = '解析失败：' + err.message
      this.loading = false
    }
  }
  reader.readAsBinaryString(this.file)
},
    confirm() {
      this.$emit('uploaded', { file: this.file, data: this.data })
    },
  },
}
</script>

<style scoped>
.container { max-width: 1000px; }
h3 { font-size: 20px; margin-bottom: 16px; color: #1A202C; }
.upload-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 16px; }
.file-name { color: #059669; font-weight: 500; margin-top: 12px; }
.btn-primary, .btn-parse, .btn-confirm { padding: 10px 20px; background: #8B5CF6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-parse { width: 100%; margin-bottom: 20px; }
.btn-parse:disabled { opacity: 0.6; }
.btn-confirm { width: 100%; background: #10b981; }
.preview { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px; }
.preview h4 { margin-bottom: 12px; }
.table-wrapper { overflow: auto; border: 1px solid #e2e8f0; border-radius: 4px; max-height: 400px; margin-bottom: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
td { border: 1px solid #e2e8f0; padding: 6px; }
.row-idx { background: #f1f5f9; font-weight: 600; width: 40px; text-align: center; }
.error { color: #ef4444; background: #fee2e2; padding: 12px; border-radius: 4px; margin-top: 16px; }
</style>
